import { useState, useEffect } from 'react';
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
    
    // Evaluate correctness when answer is checked
    if (hasCheckedAnswer) {
      const isCorrect = choice.text === correctAnswer;
      onCorrectnessChange?.(isCorrect);
    }
  };

  // Evaluate correctness when answers are checked - moved to useEffect to avoid setState during render
  useEffect(() => {
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
