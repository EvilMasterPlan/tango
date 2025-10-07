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
  // Initialize match objects - one for each source
  const [matches, setMatches] = useState(() => 
    sources.map(() => ({ source: null, destination: null }))
  );
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [incorrectMatches, setIncorrectMatches] = useState(new Set());

  // Reset state when sources change (new question)
  useEffect(() => {
    setMatches(sources.map(() => ({ source: null, destination: null })));
    setSelectedSource(null);
    setSelectedDestination(null);
    setIncorrectMatches(new Set());
  }, [sources]);

  const handleMatchingSelect = (type, index) => {
    if (disabled) return;
    
    if (type === 'source') {
      // Check if this source is already matched
      const isAlreadyMatched = matches.some(match => match.source === index && match.destination !== null);
      if (isAlreadyMatched) return;
      
      if (selectedSource === index) {
        // Clicking same source - deselect it
        setSelectedSource(null);
      } else {
        // Select new source
        setSelectedSource(index);
        
        // If we have both source and destination selected, create match
        if (selectedDestination !== null) {
          createMatch(index, selectedDestination);
        }
      }
    } else if (type === 'destination') {
      // Check if this destination is already matched
      const isAlreadyMatched = matches.some(match => match.destination === index && match.source !== null);
      if (isAlreadyMatched) return;
      
      if (selectedDestination === index) {
        // Clicking same destination - deselect it
        setSelectedDestination(null);
      } else {
        // Select new destination
        setSelectedDestination(index);
        
        // If we have both source and destination selected, create match
        if (selectedSource !== null) {
          createMatch(selectedSource, index);
        }
      }
    }
  };

  const createMatch = (sourceIndex, destinationIndex) => {
    // Check if this match is correct
    const isCorrect = correctAnswers[sourceIndex] === destinationIndex;
    
    setMatches(prevMatches => {
      const newMatches = [...prevMatches];
      
      // Find the first incomplete match to fill
      const incompleteMatchIndex = newMatches.findIndex(match => 
        match.source === null && match.destination === null
      );
      
      if (incompleteMatchIndex !== -1) {
        newMatches[incompleteMatchIndex] = { source: sourceIndex, destination: destinationIndex };
      }
      
      // Check completion status immediately
      const allMatchesComplete = newMatches.every(match => 
        match.source !== null && match.destination !== null
      );
      
      // Always call onCompleteChange with completion status (not correctness)
      onCompleteChange?.(allMatchesComplete);
      
      return newMatches;
    });
    
    if (!isCorrect) {
      // Add to incorrect matches for animation
      const matchKey = `${sourceIndex}-${destinationIndex}`;
      setIncorrectMatches(prev => new Set([...prev, matchKey]));
      
      // Remove from incorrect matches and reset the match after animation
      setTimeout(() => {
        setIncorrectMatches(prev => {
          const newSet = new Set(prev);
          newSet.delete(matchKey);
          return newSet;
        });
        
        // Remove the incorrect match and check completion again
        setMatches(prevMatches => {
          const newMatches = [...prevMatches];
          const matchIndex = newMatches.findIndex(match => 
            match.source === sourceIndex && match.destination === destinationIndex
          );
          if (matchIndex !== -1) {
            newMatches[matchIndex] = { source: null, destination: null };
          }
          
          // Check completion status after removing incorrect match
          const allMatchesComplete = newMatches.every(match => 
            match.source !== null && match.destination !== null
          );
          
          // Always call onCompleteChange with completion status (not correctness)
          onCompleteChange?.(allMatchesComplete);
          
          return newMatches;
        });
      }, 500);
    }
    
    // Always reset selections after making a match
    setSelectedSource(null);
    setSelectedDestination(null);
  };

  // Evaluate correctness when answers are checked - use useLayoutEffect for synchronous execution
  useLayoutEffect(() => {
    if (hasCheckedAnswer) {
      // Convert matches to the format expected by correctAnswers (array indexed by source)
      const currentAnswers = new Array(sources.length);
      matches.forEach(match => {
        if (match.source !== null && match.destination !== null) {
          currentAnswers[match.source] = match.destination;
        }
      });
      
      const isCorrect = JSON.stringify(currentAnswers) === JSON.stringify(correctAnswers);
      onCorrectnessChange?.(isCorrect);
    }
  }, [hasCheckedAnswer, matches, correctAnswers, onCorrectnessChange, sources.length]);
  return (
    <div className="matching-question-block">
      <div className="matching-container">
        <div className="matching-column">
          <div className="matching-items">
            {sources.map((source, index) => {
              // Find if this source is matched
              const matchedMatch = matches.find(match => match.source === index && match.destination !== null);
              const isMatched = !!matchedMatch;
              const matchedDestinationIndex = matchedMatch?.destination;
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
              // Find if this destination is matched
              const matchedMatch = matches.find(match => match.destination === index && match.source !== null);
              const isMatched = !!matchedMatch;
              const matchedSourceIndex = matchedMatch?.source;
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
