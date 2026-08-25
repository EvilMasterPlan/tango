import { HIRAGANA_CHARS, KATAKANA_CHARS, isKatakana } from '@/utils/japaneseUtils';

const DISTRACTOR_COUNT = 3;
const MAX_DISTRACTOR_ATTEMPTS = 50;

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function shuffle(list) {
  return [...list].sort(() => Math.random() - 0.5);
}

// Builds the shuffled tile bank for a spelling round: the reading's own
// characters (as a multiset — a repeated kana becomes two separate tiles,
// which is what lets slots track a specific tile index rather than a
// character) plus 3 distractor characters from the matching syllabary
// (hiragana or katakana, based on the reading itself) that don't already
// appear in the answer.
export function getSpellingTiles(entry) {
  const correctAnswer = entry.reading;
  const pool = [...(isKatakana(correctAnswer) ? KATAKANA_CHARS : HIRAGANA_CHARS)];
  const answerChars = [...correctAnswer];
  const answerCharSet = new Set(answerChars);

  const distractors = [];
  let attempts = 0;
  while (distractors.length < DISTRACTOR_COUNT && attempts < MAX_DISTRACTOR_ATTEMPTS) {
    const candidate = pickRandom(pool);
    if (!answerCharSet.has(candidate) && !distractors.includes(candidate)) {
      distractors.push(candidate);
    }
    attempts += 1;
  }
  // Safety net for the (practically unreachable, ~80 real kana vs. at most 8
  // excluded) case the loop above can't fill: relax the no-duplicate
  // constraint rather than inventing a placeholder glyph, so the tile count
  // is always exactly answerChars.length + DISTRACTOR_COUNT.
  while (distractors.length < DISTRACTOR_COUNT) {
    const candidate = pool.find((char) => !answerCharSet.has(char));
    distractors.push(candidate ?? pickRandom(pool));
  }

  return { tiles: shuffle([...answerChars, ...distractors]), correctAnswer };
}
