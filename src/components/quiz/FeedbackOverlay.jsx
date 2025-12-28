import './FeedbackOverlay.scss';
import { FeedbackDisplay } from '@/components/quiz/FeedbackDisplay';

export function FeedbackOverlay({ isCorrect, correctAnswer, questionType, vocab, vocabId, api }) {
  return (
    <div className="feedback-overlay">
      <FeedbackDisplay 
        isCorrect={isCorrect}
        correctAnswer={correctAnswer}
        questionType={questionType}
        vocab={vocab}
        vocabId={vocabId}
        api={api}
      />
    </div>
  );
}
