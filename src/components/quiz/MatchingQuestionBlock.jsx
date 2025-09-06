import classNames from 'classnames';
import './MatchingQuestionBlock.scss';

export function MatchingQuestionBlock({ 
  question, 
  sources, 
  destinations, 
  disabled = false, 
  hasCheckedAnswer = false, 
  isAnswerCorrect = false,
  showNumbers = false,
  matchingAnswers = [],
  onMatchingSelect,
  correctAnswers = [],
  selectedSource = null,
  selectedDestination = null
}) {
  const handleItemClick = (type, index) => {
    if (disabled || !onMatchingSelect) return;
    onMatchingSelect(type, index);
  };
  return (
    <div className="matching-question-block">
      <div className="matching-container">
        <div className="matching-column">
          <div className="matching-items">
            {sources.map((source, index) => {
              const isMatched = matchingAnswers[index] !== undefined;
              const matchedDestinationIndex = matchingAnswers[index];
              const isCorrectMatch = hasCheckedAnswer && isMatched && correctAnswers[index] === matchedDestinationIndex;
              const isIncorrectMatch = hasCheckedAnswer && isMatched && correctAnswers[index] !== matchedDestinationIndex;
              const isSelected = selectedSource === index;
              const isClickable = !isMatched || !hasCheckedAnswer;
              
              return (
                <div 
                  key={index} 
                  className={classNames('matching-item', { 
                    'no-numbers': !showNumbers,
                    'matched': isMatched,
                    'correct': isCorrectMatch,
                    'incorrect': isIncorrectMatch,
                    'selected': isSelected,
                    'non-interactive': !isClickable
                  })}
                  onClick={isClickable ? () => handleItemClick('source', index) : undefined}
                >
                  {showNumbers && <span className="item-number">{index + 1}</span>}
                  <span className="item-text">{source}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="matching-column">
          <div className="matching-items">
            {destinations.map((destination, index) => {
              const isMatched = matchingAnswers.some((answer, sourceIndex) => answer === index);
              const matchedSourceIndex = matchingAnswers.findIndex(answer => answer === index);
              const isCorrectMatch = hasCheckedAnswer && isMatched && correctAnswers[matchedSourceIndex] === index;
              const isIncorrectMatch = hasCheckedAnswer && isMatched && correctAnswers[matchedSourceIndex] !== index;
              const isSelected = selectedDestination === index;
              const isClickable = !isMatched || !hasCheckedAnswer;
              
              return (
                <div 
                  key={index} 
                  className={classNames('matching-item', { 
                    'no-numbers': !showNumbers,
                    'matched': isMatched,
                    'correct': isCorrectMatch,
                    'incorrect': isIncorrectMatch,
                    'selected': isSelected,
                    'non-interactive': !isClickable
                  })}
                  onClick={isClickable ? () => handleItemClick('destination', index) : undefined}
                >
                  {showNumbers && <span className="item-number">{index + 1}</span>}
                  <span className="item-text">{destination}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
