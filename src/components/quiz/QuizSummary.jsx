import './QuizSummary.scss';

export function QuizSummary({ results, total }) {
  const correct = results.filter((result) => result === 'success').length;
  const incorrect = results.filter((result) => result === 'fail').length;

  return (
    <div className="quiz-summary">
      <h2 className="quiz-summary__title">Set Complete!</h2>
      <dl className="quiz-summary__stats">
        <div className="quiz-summary__stat">
          <dt>Answered</dt>
          <dd>{total}</dd>
        </div>
        <div className="quiz-summary__stat quiz-summary__stat--success">
          <dt>Correct</dt>
          <dd>{correct}</dd>
        </div>
        <div className="quiz-summary__stat quiz-summary__stat--fail">
          <dt>Incorrect</dt>
          <dd>{incorrect}</dd>
        </div>
      </dl>
    </div>
  );
}
