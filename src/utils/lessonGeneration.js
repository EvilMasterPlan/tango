import { vocab } from '@/data/vocab';
import { 
  generateMatchingQuestion, 
  generateSpellingQuestion,
  generateChoiceQuestions
} from '@/utils/questionGeneration';

/**
 * Generates a complete lesson with mixed question types
 * @param {Object} options - Lesson generation options
 * @param {number} options.numWords - Number of vocab words to use (default: 5)
 * @param {number} options.numMatchingQuestions - Number of matching questions (default: 2)
 * @param {number} options.numSpellingQuestions - Number of spelling questions (default: 5)
 * @param {number} options.numChoiceQuestions - Number of choice questions (default: 3)
 * @returns {Array} Array of question objects for the lesson
 */
export function generateLesson(options = {}) {
  const {
    numWords = 5,
    numMatchingQuestions = 2,
    numSpellingQuestions = 5,
    numChoiceQuestions = 3
  } = options;

  // Pick random words from vocab
  const shuffledVocab = [...vocab].sort(() => Math.random() - 0.5);
  const selectedWords = shuffledVocab.slice(0, numWords);

  const questions = [];

  // Generate matching questions
  const matchingSubtypes = ["word to meaning", "word to reading", "meaning to word"];
  const matchingQuestions = Array.from({ length: numMatchingQuestions }, () => {
    const randomSubtype = matchingSubtypes[Math.floor(Math.random() * matchingSubtypes.length)];
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
  const choiceQuestions = generateChoiceQuestions(wordsForChoice, ["word to reading"]);
  questions.push(...choiceQuestions);

  // Shuffle the final questions array
  return questions.sort(() => Math.random() - 0.5);
}

/**
 * Generates a lesson with specific question types
 * @param {Object} options - Lesson generation options
 * @param {Array} options.questionTypes - Array of question type configs
 * @returns {Array} Array of question objects for the lesson
 */
export function generateCustomLesson(options = {}) {
  const { questionTypes = [] } = options;
  
  if (questionTypes.length === 0) {
    return generateLesson();
  }

  // Pick random words from vocab
  const shuffledVocab = [...vocab].sort(() => Math.random() - 0.5);
  const selectedWords = shuffledVocab.slice(0, 5); // Default to 5 words

  const questions = [];

  const generatedQuestions = questionTypes.flatMap(questionType => {
    const { type, subtype, count = 1 } = questionType;
    
    return Array.from({ length: count }, () => {
      if (type === 'matching') {
        return generateMatchingQuestion(selectedWords, subtype);
      } else if (type === 'spelling') {
        const randomWord = selectedWords[Math.floor(Math.random() * selectedWords.length)];
        return generateSpellingQuestion(randomWord);
      } else if (type === 'choice') {
        const randomWord = selectedWords[Math.floor(Math.random() * selectedWords.length)];
        const choiceQuestions = generateChoiceQuestions([randomWord], [subtype || "word to reading"]);
        return choiceQuestions[0];
      }
      return null;
    }).filter(Boolean);
  });
  
  questions.push(...generatedQuestions);

  // Shuffle the final questions array
  return questions.sort(() => Math.random() - 0.5);
}
