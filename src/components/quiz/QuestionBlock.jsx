import './QuestionBlock.scss';

export function QuestionBlock({ question }) {
  return (
    <div className="question-block">
      <div className="question-text">
        {question.text}
      </div>
    </div>
  );
}
