import React from 'react';

export function ChoiceButton({
  choiceId,
  choiceText,
  choiceNumber,
  isSelected,
  isDisabled = false,
  onClick
}) {
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
