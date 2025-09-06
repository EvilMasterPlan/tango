import '@/components/lesson/LessonFooter.scss';

export function LessonFooter({ onSkip, onCheck, skipDisabled = false, checkDisabled = false }) {
  return (
    <footer className="lesson-footer">
      <button 
        className="action-button skip-button" 
        onClick={onSkip}
        disabled={skipDisabled}
      >
        Skip
      </button>
      <button 
        className="action-button check-button" 
        onClick={onCheck}
        disabled={checkDisabled}
      >
        Check
      </button>
    </footer>
  );
}
