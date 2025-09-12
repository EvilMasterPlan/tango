// Import choice generation functions
import { generateAnswerChoices } from './choiceGeneration.js';
import { QuestionType, QuestionSubtype } from './questionTypes.js';

/**
 * Generates random choices for word/definition questions
 * @param {string} correctAnswer - The correct answer
 * @param {Array} allOptions - Array of all possible options (words or definitions)
 * @param {number} numChoices - Number of choices to generate (default: 3)
 * @returns {Array} Array of choice strings
 */
function generateRandomChoices(correctAnswer, allOptions, numChoices = 3) {
  // Filter out the correct answer and get unique options
  const availableOptions = [...new Set(allOptions.filter(option => option !== correctAnswer))];
  
  // If we don't have enough unique options, we can't generate the requested number
  if (availableOptions.length < numChoices) {
    // Return all available options (less than requested)
    return availableOptions;
  }
  
  // Shuffle and take the requested number of unique choices
  const shuffledOptions = [...availableOptions].sort(() => Math.random() - 0.5);
  return shuffledOptions.slice(0, numChoices);
}

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
    type: QuestionType.SPELLING,
    subtype: QuestionSubtype.WORD_TO_SPELLING,
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
 * @param {string} subtype - Type of matching (QuestionSubtype.WORD_TO_MEANING, QuestionSubtype.WORD_TO_READING, QuestionSubtype.MEANING_TO_WORD)
 * @returns {Object} Matching question object
 */
export function generateMatchingQuestion(vocabArray, subtype = QuestionSubtype.WORD_TO_MEANING) {
  // Filter out words without the required data for the subtype
  let validVocab = vocabArray;
  
  if (subtype === QuestionSubtype.WORD_TO_READING) {
    validVocab = vocabArray.filter(vocab => vocab.reading);
  } else if (subtype === QuestionSubtype.WORD_TO_MEANING || subtype === QuestionSubtype.MEANING_TO_WORD) {
    validVocab = vocabArray.filter(vocab => vocab.definition && vocab.definition.trim().length > 0);
  }
  
  // Ensure we have at least 3 items, maximum 5 for matching questions
  const numItems = Math.min(Math.max(validVocab.length, 3), 5);
  const selectedVocab = validVocab.slice(0, numItems);
  
  if (selectedVocab.length < 3) {
    return null;
  }
  
  let sources, destinations, answers;
  
  switch (subtype) {
    case QuestionSubtype.WORD_TO_MEANING:
      sources = selectedVocab.map(vocab => vocab.word);
      destinations = selectedVocab.map(vocab => vocab.definition);
      answers = Array.from({ length: numItems }, (_, i) => i);
      break;
      
    case QuestionSubtype.WORD_TO_READING:
      sources = selectedVocab.map(vocab => vocab.word);
      destinations = selectedVocab.map(vocab => vocab.reading);
      answers = Array.from({ length: numItems }, (_, i) => i);
      break;
      
    case QuestionSubtype.MEANING_TO_WORD:
      sources = selectedVocab.map(vocab => vocab.definition);
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
    type: QuestionType.MATCHING,
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
 * @param {Array} subtypes - Array of subtypes to generate (default: [QuestionSubtype.WORD_TO_MEANING])
 * @returns {Array} Array of matching question objects (filtered out nulls)
 */
export function generateMatchingQuestions(vocabArray, subtypes = [QuestionSubtype.WORD_TO_MEANING]) {
  return subtypes
    .map(subtype => generateMatchingQuestion(vocabArray, subtype))
    .filter(question => question !== null);
}

/**
 * Generates a choice question from a vocab object
 * @param {Object} vocab - Vocab object with word, reading, definition, etc.
 * @param {string} subtype - Type of choice question (QuestionSubtype.WORD_TO_READING, QuestionSubtype.WORD_TO_MEANING, QuestionSubtype.MEANING_TO_WORD)
 * @param {Array} allReadings - Array of all readings from vocab for generating similar options
 * @param {Array} allWords - Array of all words from vocab for generating random word choices
 * @param {Array} allDefinitions - Array of all definitions from vocab for generating random definition choices
 * @returns {Object} Choice question object
 */
export function generateChoiceQuestion(vocab, subtype = QuestionSubtype.WORD_TO_READING, allReadings = [], allWords = [], allDefinitions = []) {
  let question, answer, choices;
  
  switch (subtype) {
    case QuestionSubtype.WORD_TO_READING:
      if (!vocab.reading) return null;
      question = vocab.word;
      answer = vocab.reading;
      
      // Generate proper answer choices with mutations
      const choiceObjects = generateAnswerChoices(vocab.reading, allReadings, {
        originalWord: vocab.word
      });
      choices = choiceObjects.map(choice => choice.text);
      break;
      
    case QuestionSubtype.WORD_TO_MEANING:
      if (!vocab.definition || vocab.definition.trim().length === 0) return null;
      question = vocab.word;
      answer = vocab.definition;
      
      // Generate random definition choices (excluding the correct answer)
      const randomDefinitions = generateRandomChoices(answer, allDefinitions, 3);
      choices = [answer, ...randomDefinitions];
      break;
      
    case QuestionSubtype.MEANING_TO_WORD:
      if (!vocab.definition || vocab.definition.trim().length === 0) return null;
      question = vocab.definition;
      answer = vocab.word;
      
      // Generate random word choices (excluding the correct answer)
      const randomWords = generateRandomChoices(answer, allWords, 3);
      choices = [answer, ...randomWords];
      break;
      
    default:
      return null;
  }
  
  // Shuffle the choices array so the correct answer isn't always first
  const shuffledChoices = [...choices].sort(() => Math.random() - 0.5);
  
  return {
    word_id: vocab.id || vocab.word_id,
    type: QuestionType.CHOICE,
    subtype: subtype,
    question: question,
    answer: answer,
    choices: shuffledChoices
  };
}

/**
 * Generates multiple choice questions from an array of vocab objects
 * @param {Array} vocabArray - Array of vocab objects
 * @param {Array} subtypes - Array of subtypes to generate (default: [QuestionSubtype.WORD_TO_READING])
 * @returns {Array} Array of choice question objects (filtered out nulls)
 */
export function generateChoiceQuestions(vocabArray, subtypes = [QuestionSubtype.WORD_TO_READING]) {
  // Extract all readings for generating similar options
  const allReadings = vocabArray
    .map(vocab => vocab.reading)
    .filter(reading => reading); // Remove null/undefined readings
  
  // Extract all words for generating random word choices
  const allWords = vocabArray
    .map(vocab => vocab.word)
    .filter(word => word); // Remove null/undefined words
  
  // Extract all definitions for generating random definition choices
  const allDefinitions = vocabArray
    .map(vocab => vocab.definition)
    .filter(definition => definition); // Remove null/undefined definitions
  
  return vocabArray
    .map(vocab => subtypes.map(subtype => generateChoiceQuestion(vocab, subtype, allReadings, allWords, allDefinitions)))
    .flat()
    .filter(question => question !== null);
}
