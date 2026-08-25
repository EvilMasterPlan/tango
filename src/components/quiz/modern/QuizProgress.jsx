import './QuizProgress.scss';

// One dot per question in the set: grey/small while unexplored, green and
// largest for the question currently on screen, or gold/black (correct/
// wrong) as soon as that question's answer is revealed — including the
// current question itself, the moment Check is pressed, rather than
// waiting for Next to move on.
export function QuizProgress({ results, currentIndex, total }) {
  return (
    <div className="quiz-progress">
      {Array.from({ length: total }, (_, index) => {
        const variant = results[index] || (index === currentIndex ? 'current' : 'unexplored');
        return (
          // Fixed-size slot around each dot so a dot growing/shrinking
          // between variants never shifts the other dots or the section's
          // overall width — only the dot inside the slot changes size.
          <span key={index} className="quiz-progress__slot">
            <span className={`quiz-progress__dot quiz-progress__dot--${variant}`} />
          </span>
        );
      })}
    </div>
  );
}
