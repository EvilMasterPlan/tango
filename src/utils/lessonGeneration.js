import { 
  generateMatchingQuestion, 
  generateSpellingQuestion,
  generateChoiceQuestions
} from '@/utils/questionGeneration';
import { MATCHING_SUBTYPES, QuestionSubtype } from '@/utils/questionTypes';

/**
 * Generates a complete lesson with mixed question types
 * @param {Array} vocab - Array of vocabulary words to use
 * @param {Object} options - Lesson generation options
 * @param {number} options.numWords - Number of vocab words to use (default: 5)
 * @param {number} options.numMatchingQuestions - Number of matching questions (default: 2)
 * @param {number} options.numSpellingQuestions - Number of spelling questions (default: 5)
 * @param {number} options.numChoiceQuestions - Number of choice questions (default: 3)
 * @returns {Array} Array of question objects for the lesson
 */
export function generateLesson(vocab, options = {}) {
  const {
    numMatchingQuestions = 2,
    numSpellingQuestions = 5,
    numChoiceQuestions = 3
  } = options;

  // Validate input
  if (!Array.isArray(vocab) || vocab.length === 0) {
    console.error('generateLesson: vocab must be a non-empty array', vocab);
    return [];
  }

  // Use all the vocab words passed in (already selected and shuffled)
  const selectedWords = vocab;

  const questions = [];

  // Generate matching questions
  const matchingQuestions = Array.from({ length: numMatchingQuestions }, () => {
    const randomSubtype = MATCHING_SUBTYPES[Math.floor(Math.random() * MATCHING_SUBTYPES.length)];
    return generateMatchingQuestion(selectedWords, randomSubtype);
  }).filter(Boolean);
  
  questions.push(...matchingQuestions);

  // Generate spelling questions (one per word, up to numSpellingQuestions)
  const wordsForSpelling = selectedWords.slice(0, numSpellingQuestions);
  const spellingQuestions = wordsForSpelling
    .map(word => generateSpellingQuestion(word))
    .filter(Boolean);
  
  questions.push(...spellingQuestions);

  // Generate choice questions (word to reading only)
  const wordsForChoice = selectedWords.slice(0, numChoiceQuestions);
  const choiceQuestions = generateChoiceQuestions(wordsForChoice, [QuestionSubtype.WORD_TO_READING, QuestionSubtype.WORD_TO_READING, QuestionSubtype.WORD_TO_MEANING]);
  questions.push(...choiceQuestions);

  // Shuffle the final questions array
  return questions.sort(() => Math.random() - 0.5);
}
