import { useState, useEffect, useLayoutEffect } from 'react';
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
  correctAnswers = [],
  onCompleteChange,
  onCorrectnessChange
}) {
  const [matchingAnswers, setMatchingAnswers] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [incorrectMatches, setIncorrectMatches] = useState(new Set());

  // Reset state when sources change (new question)
  useEffect(() => {
    setMatchingAnswers([]);
    setSelectedSource(null);
    setSelectedDestination(null);
    setIncorrectMatches(new Set());
  }, [sources]);

  const handleMatchingSelect = (type, index) => {
    if (disabled) return;
    
    // Don't allow selection of already matched items
    if (type === 'source' && matchingAnswers[index] !== undefined) return;
    if (type === 'destination' && matchingAnswers.some(answer => answer === index)) return;
    
    if (type === 'source') {
      if (selectedSource === index) {
        // Clicking same source - deselect it
        setSelectedSource(null);
      } else {
        // Select new source
        setSelectedSource(index);
        
        // If we have both source and destination selected, create match
        if (selectedDestination !== null) {
          const newAnswers = [...matchingAnswers];
          newAnswers[index] = selectedDestination;
          setMatchingAnswers(newAnswers);
          
          // Check if this match is correct
          const isCorrect = correctAnswers[index] === selectedDestination;
          
          if (!isCorrect) {
            // Add to incorrect matches for animation
            const matchKey = `${index}-${selectedDestination}`;
            setIncorrectMatches(prev => new Set([...prev, matchKey]));
            
            // Remove from incorrect matches and reset the match after animation
            setTimeout(() => {
              setIncorrectMatches(prev => {
                const newSet = new Set(prev);
                newSet.delete(matchKey);
                return newSet;
              });
              
              // Remove the incorrect match from answers
              setMatchingAnswers(prev => {
                const newAnswers = [...prev];
                newAnswers[index] = undefined;
                return newAnswers;
              });
            }, 500);
          }
          
          // Always reset selections after making a match
          setSelectedSource(null);
          setSelectedDestination(null);
          
          // Check if ready to submit
          const isReady = newAnswers.length === sources.length && !newAnswers.some(answer => answer === undefined);
          setTimeout(() => onCompleteChange?.(isReady), 0);
        }
      }
    } else if (type === 'destination') {
      if (selectedDestination === index) {
        // Clicking same destination - deselect it
        setSelectedDestination(null);
      } else {
        // Select new destination
        setSelectedDestination(index);
        
        // If we have both source and destination selected, create match
        if (selectedSource !== null) {
          const newAnswers = [...matchingAnswers];
          newAnswers[selectedSource] = index;
          setMatchingAnswers(newAnswers);
          
          // Check if this match is correct
          const isCorrect = correctAnswers[selectedSource] === index;
          
          if (!isCorrect) {
            // Add to incorrect matches for animation
            const matchKey = `${selectedSource}-${index}`;
            setIncorrectMatches(prev => new Set([...prev, matchKey]));
            
            // Remove from incorrect matches and reset the match after animation
            setTimeout(() => {
              setIncorrectMatches(prev => {
                const newSet = new Set(prev);
                newSet.delete(matchKey);
                return newSet;
              });
              
              // Remove the incorrect match from answers
              setMatchingAnswers(prev => {
                const newAnswers = [...prev];
                newAnswers[selectedSource] = undefined;
                return newAnswers;
              });
            }, 500);
          }
          
          // Always reset selections after making a match
          setSelectedSource(null);
          setSelectedDestination(null);
          
          // Check if ready to submit
          const isReady = newAnswers.length === sources.length && !newAnswers.some(answer => answer === undefined);
          setTimeout(() => onCompleteChange?.(isReady), 0);
        }
      }
    }
  };

  // Evaluate correctness when answers are checked - use useLayoutEffect for synchronous execution
  useLayoutEffect(() => {
    if (hasCheckedAnswer) {
      const isCorrect = JSON.stringify(matchingAnswers) === JSON.stringify(correctAnswers);
      onCorrectnessChange?.(isCorrect);
    }
  }, [hasCheckedAnswer, matchingAnswers, correctAnswers, onCorrectnessChange]);
  return (
    <div className="matching-question-block">
      <div className="matching-container">
        <div className="matching-column">
          <div className="matching-items">
            {sources.map((source, index) => {
              const isMatched = matchingAnswers[index] !== undefined;
              const matchedDestinationIndex = matchingAnswers[index];
              const isCorrectMatch = isMatched && correctAnswers[index] === matchedDestinationIndex;
              const isIncorrectMatch = hasCheckedAnswer && isMatched && correctAnswers[index] !== matchedDestinationIndex;
              const isCurrentlyIncorrect = isMatched && incorrectMatches.has(`${index}-${matchedDestinationIndex}`);
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
                    'incorrect-animation': isCurrentlyIncorrect,
                    'selected': isSelected,
                    'non-interactive': !isClickable
                  })}
                  onClick={isClickable ? () => handleMatchingSelect('source', index) : undefined}
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
              const isCorrectMatch = isMatched && correctAnswers[matchedSourceIndex] === index;
              const isIncorrectMatch = hasCheckedAnswer && isMatched && correctAnswers[matchedSourceIndex] !== index;
              const isCurrentlyIncorrect = isMatched && incorrectMatches.has(`${matchedSourceIndex}-${index}`);
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
                    'incorrect-animation': isCurrentlyIncorrect,
                    'selected': isSelected,
                    'non-interactive': !isClickable
                  })}
                  onClick={isClickable ? () => handleMatchingSelect('destination', index) : undefined}
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
