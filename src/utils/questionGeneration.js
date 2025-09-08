// Import choice generation functions
import { generateAnswerChoices } from './choiceGeneration.js';

/**
 * Generates spelling question from vocab object
 * @param {Object} vocab - Vocab object with word, reading, etc.
 * @returns {Object} Spelling question object
 */
export function generateSpellingQuestion(vocab) {
  // Skip words without reading (hiragana/katakana only words)
  if (!vocab.reading) {
    return null;
  }

  const reading = vocab.reading;
  
  // Split reading into individual characters
  const readingChars = reading.split('');
  
  // Create a pool of hiragana characters for distractors
  const hiraganaPool = [
    'あ', 'い', 'う', 'え', 'お',
    'か', 'き', 'く', 'け', 'こ',
    'が', 'ぎ', 'ぐ', 'げ', 'ご',
    'さ', 'し', 'す', 'せ', 'そ',
    'ざ', 'じ', 'ず', 'ぜ', 'ぞ',
    'た', 'ち', 'つ', 'て', 'と',
    'だ', 'ぢ', 'づ', 'で', 'ど',
    'な', 'に', 'ぬ', 'ね', 'の',
    'は', 'ひ', 'ふ', 'へ', 'ほ',
    'ば', 'び', 'ぶ', 'べ', 'ぼ',
    'ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ',
    'ま', 'み', 'む', 'め', 'も',
    'や', 'ゆ', 'よ',
    'ら', 'り', 'る', 'れ', 'ろ',
    'わ', 'を', 'ん'
  ];

  // Generate distractors by selecting random characters not in the reading
  const distractors = [];
  const usedChars = new Set(readingChars);
  
  while (distractors.length < 3) {
    const randomChar = hiraganaPool[Math.floor(Math.random() * hiraganaPool.length)];
    if (!usedChars.has(randomChar) && !distractors.includes(randomChar)) {
      distractors.push(randomChar);
    }
  }

  // Combine correct characters with distractors and shuffle
  const allChoices = [...readingChars, ...distractors];
  const shuffledChoices = allChoices.sort(() => Math.random() - 0.5);

  return {
    word_id: vocab.id || vocab.word_id,
    type: "spelling",
    subtype: "word to spelling",
    question: vocab.word,
    answer: reading,
    choices: shuffledChoices
  };
}

/**
 * Generates multiple spelling questions from an array of vocab objects
 * @param {Array} vocabArray - Array of vocab objects
 * @returns {Array} Array of spelling question objects (filtered out nulls)
 */
export function generateSpellingQuestions(vocabArray) {
  return vocabArray
    .map(generateSpellingQuestion)
    .filter(question => question !== null);
}

/**
 * Generates a matching question from an array of vocab objects
 * @param {Array} vocabArray - Array of vocab objects (minimum 3, maximum 8)
 * @param {string} subtype - Type of matching ("word to meaning", "word to reading", "meaning to word")
 * @returns {Object} Matching question object
 */
export function generateMatchingQuestion(vocabArray, subtype = "word to meaning") {
  // Filter out words without the required data for the subtype
  let validVocab = vocabArray;
  
  if (subtype === "word to reading") {
    validVocab = vocabArray.filter(vocab => vocab.reading);
  } else if (subtype === "word to meaning" || subtype === "meaning to word") {
    validVocab = vocabArray.filter(vocab => vocab.definition && vocab.definition.length > 0);
  }
  
  // Ensure we have at least 3 items, maximum 8
  const numItems = Math.min(Math.max(validVocab.length, 3), 8);
  const selectedVocab = validVocab.slice(0, numItems);
  
  if (selectedVocab.length < 3) {
    return null;
  }
  
  let sources, destinations, answers;
  
  switch (subtype) {
    case "word to meaning":
      sources = selectedVocab.map(vocab => vocab.word);
      destinations = selectedVocab.map(vocab => vocab.definition[0]); // Use first definition
      answers = Array.from({ length: numItems }, (_, i) => i);
      break;
      
    case "word to reading":
      sources = selectedVocab.map(vocab => vocab.word);
      destinations = selectedVocab.map(vocab => vocab.reading);
      answers = Array.from({ length: numItems }, (_, i) => i);
      break;
      
    case "meaning to word":
      sources = selectedVocab.map(vocab => vocab.definition[0]); // Use first definition
      destinations = selectedVocab.map(vocab => vocab.word);
      answers = Array.from({ length: numItems }, (_, i) => i);
      break;
      
    default:
      return null;
  }
  
  // Shuffle the destinations and update answers accordingly
  const shuffledIndices = Array.from({ length: numItems }, (_, i) => i)
    .sort(() => Math.random() - 0.5);
  
  const shuffledDestinations = shuffledIndices.map(i => destinations[i]);
  
  // Create correct answers mapping: source index -> shuffled destination index
  const shuffledAnswers = Array.from({ length: numItems }, (_, sourceIndex) => {
    // Find where this source's original destination ended up after shuffling
    return shuffledIndices.findIndex(shuffledIndex => shuffledIndex === sourceIndex);
  });
  
  return {
    type: "matching",
    subtype: subtype,
    answers: shuffledAnswers,
    choices: {
      sources: sources,
      destinations: shuffledDestinations
    }
  };
}

/**
 * Generates multiple matching questions from an array of vocab objects
 * @param {Array} vocabArray - Array of vocab objects
 * @param {Array} subtypes - Array of subtypes to generate (default: ["word to meaning"])
 * @returns {Array} Array of matching question objects (filtered out nulls)
 */
export function generateMatchingQuestions(vocabArray, subtypes = ["word to meaning"]) {
  return subtypes
    .map(subtype => generateMatchingQuestion(vocabArray, subtype))
    .filter(question => question !== null);
}

/**
 * Generates a choice question from a vocab object
 * @param {Object} vocab - Vocab object with word, reading, definition, etc.
 * @param {string} subtype - Type of choice question ("word to reading", "word to meaning", "meaning to word")
 * @param {Array} allReadings - Array of all readings from vocab for generating similar options
 * @returns {Object} Choice question object
 */
export function generateChoiceQuestion(vocab, subtype = "word to reading", allReadings = []) {
  let question, answer, choices;
  
  switch (subtype) {
    case "word to reading":
      if (!vocab.reading) return null;
      question = vocab.word;
      answer = vocab.reading;
      
      // Generate proper answer choices with mutations
      const choiceObjects = generateAnswerChoices(vocab.reading, allReadings, {
        originalWord: vocab.word
      });
      choices = choiceObjects.map(choice => choice.text);
      break;
      
    case "word to meaning":
      if (!vocab.definition || vocab.definition.length === 0) return null;
      question = vocab.word;
      answer = vocab.definition[0]; // Use first definition
      // For now, all choices are the same (correct answer)
      choices = [vocab.definition[0], vocab.definition[0], vocab.definition[0], vocab.definition[0]];
      break;
      
    case "meaning to word":
      if (!vocab.definition || vocab.definition.length === 0) return null;
      question = vocab.definition[0]; // Use first definition
      answer = vocab.word;
      // For now, all choices are the same (correct answer)
      choices = [vocab.word, vocab.word, vocab.word, vocab.word];
      break;
      
    default:
      return null;
  }
  
  return {
    word_id: vocab.id || vocab.word_id,
    type: "choice",
    subtype: subtype,
    question: question,
    answer: answer,
    choices: choices
  };
}

/**
 * Generates multiple choice questions from an array of vocab objects
 * @param {Array} vocabArray - Array of vocab objects
 * @param {Array} subtypes - Array of subtypes to generate (default: ["word to reading"])
 * @returns {Array} Array of choice question objects (filtered out nulls)
 */
export function generateChoiceQuestions(vocabArray, subtypes = ["word to reading"]) {
  // Extract all readings for generating similar options
  const allReadings = vocabArray
    .map(vocab => vocab.reading)
    .filter(reading => reading); // Remove null/undefined readings
  
  return vocabArray
    .map(vocab => subtypes.map(subtype => generateChoiceQuestion(vocab, subtype, allReadings)))
    .flat()
    .filter(question => question !== null);
}
