import React from 'react';

interface ChoiceButtonProps {
  choiceId: string;
  choiceText: string;
  choiceNumber: number;
  isSelected: boolean;
  isDisabled?: boolean;
  onClick: (choiceId: string) => void;
}

export function ChoiceButton({
  choiceId,
  choiceText,
  choiceNumber,
  isSelected,
  isDisabled = false,
  onClick
}: ChoiceButtonProps) {
  const buttonClasses = ['choice-btn'];
  
  if (isSelected) {
    buttonClasses.push('choice-btn-selected');
  }

  return (
    <button
      className={buttonClasses.join(' ')}
      onClick={() => onClick(choiceId)}
      disabled={isDisabled}
    >
      <span className="choice-letter">{choiceNumber}</span>
      <span className="choice-text">{choiceText}</span>
    </button>
  );
} 