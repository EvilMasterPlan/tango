import { ChoiceButton } from '@/components/quiz/ChoiceButton';
import './ChoiceGrid.scss';

export function ChoiceGrid({ choices, selectedIndex, onChoiceSelect }) {
  return (
    <div className="choices-grid">
      {choices.map((choice, index) => (
        <ChoiceButton
          key={index}
          choice={choice}
          index={index}
          isSelected={selectedIndex === index}
          onSelect={onChoiceSelect}
        />
      ))}
    </div>
  );
}
