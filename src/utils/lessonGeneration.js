import { vocab } from '@/data/vocab';
import { 
  generateMatchingQuestion, 
  generateSpellingQuestion 
} from '@/utils/questionGeneration';

/**
 * Generates a complete lesson with mixed question types
 * @param {Object} options - Lesson generation options
 * @param {number} options.numWords - Number of vocab words to use (default: 5)
 * @param {number} options.numMatchingQuestions - Number of matching questions (default: 2)
 * @param {number} options.numSpellingQuestions - Number of spelling questions (default: 5)
 * @returns {Array} Array of question objects for the lesson
 */
export function generateLesson(options = {}) {
  const {
    numWords = 5,
    numMatchingQuestions = 2,
    numSpellingQuestions = 5
  } = options;

  // Pick random words from vocab
  const shuffledVocab = [...vocab].sort(() => Math.random() - 0.5);
  const selectedWords = shuffledVocab.slice(0, numWords);

  const questions = [];

  // Generate matching questions
  const matchingSubtypes = ["word to meaning", "word to reading", "meaning to word"];
  for (let i = 0; i < numMatchingQuestions; i++) {
    // Pick a random subtype
    const randomSubtype = matchingSubtypes[Math.floor(Math.random() * matchingSubtypes.length)];
    
    // Generate matching question using all selected words
    const matchingQuestion = generateMatchingQuestion(selectedWords, randomSubtype);
    if (matchingQuestion) {
      questions.push(matchingQuestion);
    }
  }

  // Generate spelling questions (one per word, up to numSpellingQuestions)
  const wordsForSpelling = selectedWords.slice(0, numSpellingQuestions);
  for (const word of wordsForSpelling) {
    const spellingQuestion = generateSpellingQuestion(word);
    if (spellingQuestion) {
      questions.push(spellingQuestion);
    }
  }

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

  for (const questionType of questionTypes) {
    const { type, subtype, count = 1 } = questionType;
    
    for (let i = 0; i < count; i++) {
      let question = null;
      
      if (type === 'matching') {
        question = generateMatchingQuestion(selectedWords, subtype);
      } else if (type === 'spelling') {
        // For spelling, pick a random word from selected words
        const randomWord = selectedWords[Math.floor(Math.random() * selectedWords.length)];
        question = generateSpellingQuestion(randomWord);
      }
      
      if (question) {
        questions.push(question);
      }
    }
  }

  // Shuffle the final questions array
  return questions.sort(() => Math.random() - 0.5);
}
