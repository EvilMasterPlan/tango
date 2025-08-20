export interface KanjiQuestion {
  question: {
    id: string;
    text: string;
    highlight: {
      start: number;
      end: number;
    };
  };
  choices: {
    [key: string]: {
      text: string;
      correct: boolean;
    };
  };
} 