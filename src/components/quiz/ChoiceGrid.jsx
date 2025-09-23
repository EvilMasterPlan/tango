import { useState, useEffect, useLayoutEffect } from 'react';
import { ChoiceButton } from '@/components/quiz/ChoiceButton';
import './ChoiceGrid.scss';

export function ChoiceGrid({ 
  choices, 
  disabled = false, 
  hasCheckedAnswer = false, 
  isAnswerCorrect = false, 
  correctAnswer = '',
  onCompleteChange,
  onCorrectnessChange
}) {
  const [selectedIndex, setSelectedIndex] = useState(null);

  const handleChoiceSelect = (choice, index) => {
    if (disabled) return;
    
    setSelectedIndex(index);
    
    // Choice questions are complete as soon as a choice is selected
    onCompleteChange?.(true);
    
    // Evaluate correctness immediately when answer is checked
    if (hasCheckedAnswer) {
      const isCorrect = choice === correctAnswer;
      onCorrectnessChange?.(isCorrect);
    }
  };

  // Evaluate correctness when answers are checked - use useLayoutEffect for synchronous execution
  useLayoutEffect(() => {
    if (hasCheckedAnswer && selectedIndex !== null) {
      const selectedChoice = choices[selectedIndex];
      const isCorrect = selectedChoice === correctAnswer;
      onCorrectnessChange?.(isCorrect);
    }
  }, [hasCheckedAnswer, selectedIndex, choices, correctAnswer, onCorrectnessChange]);

  return (
    <div className="choices-grid">
      {choices.map((choice, index) => (
        <ChoiceButton
          key={index}
          choice={{ text: choice }}
          index={index}
          isSelected={selectedIndex === index}
          onSelect={disabled ? () => {} : handleChoiceSelect}
          disabled={disabled}
          hasCheckedAnswer={hasCheckedAnswer}
          isAnswerCorrect={isAnswerCorrect}
          correctAnswer={correctAnswer}
        />
      ))}
    </div>
  );
}
