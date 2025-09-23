import './FeedbackOverlay.scss';
import { FeedbackDisplay } from '@/components/quiz/FeedbackDisplay';

export function FeedbackOverlay({ isCorrect, correctAnswer, questionType }) {
  return (
    <div className="feedback-overlay">
      <FeedbackDisplay 
        isCorrect={isCorrect}
        correctAnswer={correctAnswer}
        questionType={questionType}
      />
    </div>
  );
}
