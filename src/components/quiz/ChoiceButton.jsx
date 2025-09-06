import './ChoiceButton.scss';

export function ChoiceButton({ choice, index, onSelect, isSelected, disabled = false }) {
  return (
    <button 
      className={`choice-button ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={() => onSelect(choice, index)}
      disabled={disabled}
    >
      <span className="choice-number">{index + 1}</span>
      <span className="choice-text">{choice.text}</span>
    </button>
  );
}
