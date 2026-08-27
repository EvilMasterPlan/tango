import './QuizFooter.scss';

// Locks the action button to the bottom of the viewport, mirroring
// QuizHeader — the caller decides which button (Check/Next/Next Lesson)
// to render as children, this just owns the footer's own positioning.
export function QuizFooter({ children }) {
  return <footer className="quiz-footer">{children}</footer>;
}
