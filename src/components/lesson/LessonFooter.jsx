import '@/components/lesson/LessonFooter.scss';

export function LessonFooter({ onSkip, onCheck, skipDisabled = false, checkDisabled = false, hasCheckedAnswer = false, isAnswerIncorrect = false, correctAnswer = '', questionType = '', isMatchingQuestion = false }) {
  return (
    <footer className="lesson-footer">
      {!hasCheckedAnswer && (
        <button 
          className="action-button skip-button"
          onClick={onSkip}
          disabled={skipDisabled}
        >
          Skip
        </button>
      )}
      <button 
        className={`action-button check-button ${isAnswerIncorrect ? 'incorrect' : ''}`}
        onClick={onCheck}
        disabled={checkDisabled}
      >
        {isMatchingQuestion ? 'Continue' : (hasCheckedAnswer ? 'Continue' : 'Check')}
      </button>
    </footer>
  );
}
