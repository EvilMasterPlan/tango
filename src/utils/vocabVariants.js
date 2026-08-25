import { similarKanji } from '@/data/similarKanji';
import vocabData from '@/data/distilled_vocab.min.json';
import { generateReadingMutation, findSimilarReadings, levenshteinDistance } from '@/utils/japaneseUtils';

const MAX_SWAP_ATTEMPTS = 50;
const MAX_MUTATION_ATTEMPTS = 20;
const SIMILAR_READING_POOL_SIZE = 5;
const GENERIC_DEFINITION_FALLBACKS = ['something', 'nothing', 'everything', 'anything'];
const GENERIC_VERB_DEFINITION_FALLBACKS = ['to do something', 'to happen', 'to occur', 'to be'];
const KANJI_REGEX = /[一-鿿㐀-䶿]/;

const ALL_VOCAB = vocabData.vocab;
const ALL_READINGS = ALL_VOCAB.map((v) => v.reading).filter(Boolean);

// Indexes every vocab entry by each kanji character in its word, so we can
// quickly find other words that share a kanji with a given entry.
function buildKanjiIndex(vocab) {
  const index = new Map();
  for (const entry of vocab) {
    const kanjiChars = new Set([...entry.word].filter((char) => KANJI_REGEX.test(char)));
    for (const char of kanjiChars) {
      if (!index.has(char)) {
        index.set(char, []);
      }
      index.get(char).push(entry);
    }
  }
  return index;
}

const KANJI_INDEX = buildKanjiIndex(ALL_VOCAB);

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function shuffle(list) {
  return [...list].sort(() => Math.random() - 0.5);
}

// Swaps the kanji at `index` in `word` for a visually-similar alternative.
function swapKanjiAt(word, index) {
  const chars = [...word];
  const alternatives = similarKanji[chars[index]];
  chars[index] = pickRandom(alternatives);
  return chars.join('');
}

// Generates 3 unique wrong variants by swapping the same character position
// across all of them — mixing swap positions would let players spot the
// correct answer just by seeing which character appears in a majority of options.
export function getWordVariants(entry) {
  const { word } = entry;
  const swappableIndices = [...word]
    .map((char, index) => (similarKanji[char] ? index : -1))
    .filter((index) => index !== -1);

  if (swappableIndices.length === 0) {
    return ['---', '---', '---'];
  }

  for (const index of shuffle(swappableIndices)) {
    const variants = new Set();
    let attempts = 0;

    while (variants.size < 3 && attempts < MAX_SWAP_ATTEMPTS) {
      const candidate = swapKanjiAt(word, index);
      if (candidate !== word) {
        variants.add(candidate);
      }
      attempts += 1;
    }

    if (variants.size === 3) {
      return [...variants];
    }
  }

  return ['---', '---', '---'];
}

// Generates 3 wrong readings by mutating one character at a time into a
// phonetically-similar kana, falling back to real (but unrelated) readings
// from the vocab pool if mutation alone can't produce enough unique options.
export function getReadingVariants(entry) {
  const { word, reading } = entry;

  const mutations = new Set();
  let attempts = 0;

  while (mutations.size < 3 && attempts < MAX_MUTATION_ATTEMPTS) {
    const mutation = generateReadingMutation(reading, word);
    if (mutation !== reading) {
      mutations.add(mutation);
    }
    attempts += 1;
  }

  const variants = [...mutations];

  if (variants.length < 3) {
    const similarReadings = findSimilarReadings(reading, ALL_READINGS, 3);
    for (const candidate of similarReadings) {
      if (variants.length >= 3) break;
      if (candidate !== reading && !variants.includes(candidate)) {
        variants.push(candidate);
      }
    }
  }

  while (variants.length < 3) {
    variants.push('---');
  }

  return variants;
}

function isVerbEntry(entry) {
  return (entry.morphology || []).includes('verb');
}

function isToDefinition(definition) {
  return definition.startsWith('to ');
}

// Definitions of other words sharing a kanji with `entry.word` — plausible if
// you half-remember one kanji in the word but not the whole meaning.
function getSharedKanjiDefinitions(entry, isValidCandidate) {
  const kanjiChars = [...new Set([...entry.word])].filter((char) => KANJI_REGEX.test(char));
  const definitions = [];

  for (const char of shuffle(kanjiChars)) {
    const matches = KANJI_INDEX.get(char) || [];
    for (const match of shuffle(matches)) {
      if (
        match.id !== entry.id &&
        match.definition &&
        match.definition !== entry.definition &&
        isValidCandidate(match)
      ) {
        definitions.push(match.definition);
      }
    }
  }

  return definitions;
}

// Definitions of words with a similar reading — plausible if you know the
// sound but confuse it with a near-homophone.
function getSimilarReadingDefinitions(entry, isValidCandidate) {
  if (!entry.reading) return [];

  return ALL_VOCAB
    .filter(
      (v) =>
        v.id !== entry.id &&
        v.reading &&
        v.definition &&
        v.definition !== entry.definition &&
        isValidCandidate(v)
    )
    .map((v) => ({ definition: v.definition, distance: levenshteinDistance(entry.reading, v.reading) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, SIMILAR_READING_POOL_SIZE)
    .map((item) => item.definition);
}

export function getDefinitionVariants(entry) {
  // Verb definitions read as "to *". Mixing that phrasing into either side of
  // a question would be an instant giveaway — a "to *" distractor next to a
  // noun/adjective answer, or a non-"to *" distractor next to a verb answer —
  // so keep the whole pool on the same side of that line as the correct answer.
  const isVerbAnswer = isVerbEntry(entry) && isToDefinition(entry.definition);
  const isValidCandidate = isVerbAnswer
    ? (candidate) => isVerbEntry(candidate) && isToDefinition(candidate.definition)
    : (candidate) => !isToDefinition(candidate.definition);

  const seen = new Set([entry.definition]);
  const variants = [];

  const candidatePool = shuffle([
    ...getSharedKanjiDefinitions(entry, isValidCandidate),
    ...getSimilarReadingDefinitions(entry, isValidCandidate),
  ]);

  for (const definition of candidatePool) {
    if (variants.length >= 3) break;
    if (!seen.has(definition)) {
      seen.add(definition);
      variants.push(definition);
    }
  }

  // Fall back to unrelated real definitions, then generic placeholders, if the
  // word has too few kanji/reading neighbors to fill all 3 slots.
  if (variants.length < 3) {
    const fallbackDefinitions = ALL_VOCAB.filter(isValidCandidate).map((v) => v.definition);

    for (const definition of shuffle(fallbackDefinitions)) {
      if (variants.length >= 3) break;
      if (!seen.has(definition)) {
        seen.add(definition);
        variants.push(definition);
      }
    }
  }

  const genericFallbacks = isVerbAnswer ? GENERIC_VERB_DEFINITION_FALLBACKS : GENERIC_DEFINITION_FALLBACKS;
  for (const definition of genericFallbacks) {
    if (variants.length >= 3) break;
    if (!seen.has(definition)) {
      seen.add(definition);
      variants.push(definition);
    }
  }

  while (variants.length < 3) {
    variants.push('---');
  }

  return variants;
}

export const VARIANT_GENERATORS = {
  word: getWordVariants,
  reading: getReadingVariants,
  definition: getDefinitionVariants,
};
