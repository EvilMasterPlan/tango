import './FeedbackDisplay.scss';

export function FeedbackDisplay({ isCorrect, correctAnswer, questionType }) {
  if (isCorrect) {
    return (
      <div className="feedback-display correct">
        <div className="feedback-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#22c55e" stroke="#16a34a" strokeWidth="2"/>
            <path d="M7 12l3 3 7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="feedback-text">Great!</div>
      </div>
    );
  }

  return (
    <div className="feedback-display incorrect">
        <div className="feedback-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#ef4444" stroke="#dc2626" strokeWidth="2"/>
            <path d="M8 8l8 8M16 8l-8 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      <div className="feedback-content">
        <div className="feedback-label">Correct answer:</div>
        <div className="feedback-answer">{correctAnswer}</div>
      </div>
    </div>
  );
}
