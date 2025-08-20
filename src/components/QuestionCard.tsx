import type { KanjiQuestion } from '@/types/kanji';
import './shared/card-styles.scss';
import { ChoiceButton } from './shared/ChoiceButton';

interface QuestionCardProps {
  question: KanjiQuestion;
  questionNumber: number;
  selectedAnswer: string | null;
  onAnswerSelect: (choiceId: string) => void;
}

export function QuestionCard({ question, questionNumber, selectedAnswer, onAnswerSelect }: QuestionCardProps) {
  const { text, highlight } = question.question;
  
  // Split the text into parts for highlighting
  const beforeHighlight = text.slice(0, highlight.start);
  const highlightedText = text.slice(highlight.start, highlight.end);
  const afterHighlight = text.slice(highlight.end);

  // Convert choices object to array and add choice numbers
  const choiceEntries = Object.entries(question.choices);

  return (
    <div className="question-card card-base">
      <div className="question-header">
        <span className="question-number">Question {questionNumber}</span>
      </div>
      
      <div className="question-text">
        <span>{beforeHighlight}</span>
        <span className="highlighted-text">{highlightedText}</span>
        <span>{afterHighlight}</span>
      </div>
      
      <div className="choices">
        {choiceEntries.map(([choiceId, choice], index) => (
          <ChoiceButton
            key={choiceId}
            choiceId={choiceId}
            choiceText={choice.text}
            choiceNumber={index + 1}
            isSelected={selectedAnswer === choiceId}
            onClick={onAnswerSelect}
          />
        ))}
      </div>
    </div>
  );
} 