import './ChoiceButton.scss';

export function ChoiceButton({ choice, index, onSelect, isSelected, disabled = false, hasCheckedAnswer = false, isAnswerCorrect = false, correctAnswer = '' }) {
  // Determine feedback state after checking
  const isThisChoiceCorrect = hasCheckedAnswer && choice.text === correctAnswer;
  const isThisChoiceIncorrect = hasCheckedAnswer && isSelected && !isAnswerCorrect;
  
  return (
    <button 
      className={`choice-button ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''} ${isThisChoiceCorrect ? 'correct' : ''} ${isThisChoiceIncorrect ? 'incorrect' : ''}`}
      onClick={() => onSelect(choice, index)}
      disabled={disabled}
    >
      <span className="choice-number">{index + 1}</span>
      <span className="choice-text">{choice.text}</span>
    </button>
  );
}
