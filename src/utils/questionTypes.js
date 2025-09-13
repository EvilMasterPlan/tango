export const QuestionType = {
  SPELLING: "spelling",
  MATCHING: "matching", 
  CHOICE: "choice"
};

export const QuestionSubtype = {
  WORD_TO_SPELLING: "word to spelling",
  WORD_TO_MEANING: "word to meaning",
  WORD_TO_READING: "word to reading", 
  MEANING_TO_WORD: "meaning to word"
};

export const MATCHING_SUBTYPES = [
  QuestionSubtype.WORD_TO_MEANING,
  QuestionSubtype.WORD_TO_READING,
  QuestionSubtype.MEANING_TO_WORD
];

export const CHOICE_SUBTYPES = [
  QuestionSubtype.WORD_TO_MEANING,
  QuestionSubtype.WORD_TO_READING,
  QuestionSubtype.MEANING_TO_WORD
];
