import './ChoiceButton.scss';

export function ChoiceButton({ choice, index, onSelect, isSelected }) {
  return (
    <button 
      className={`choice-button ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(choice, index)}
    >
      <span className="choice-number">{index + 1}</span>
      <span className="choice-text">{choice.text}</span>
    </button>
  );
}
