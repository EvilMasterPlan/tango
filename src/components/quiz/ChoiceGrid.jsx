import { ChoiceButton } from '@/components/quiz/ChoiceButton';
import './ChoiceGrid.scss';

export function ChoiceGrid({ choices, selectedIndex, onChoiceSelect, disabled = false, hasCheckedAnswer = false, isAnswerCorrect = false, correctAnswer = '' }) {
  return (
    <div className="choices-grid">
      {choices.map((choice, index) => (
        <ChoiceButton
          key={index}
          choice={{ text: choice }}
          index={index}
          isSelected={selectedIndex === index}
          onSelect={disabled ? () => {} : onChoiceSelect}
          disabled={disabled}
          hasCheckedAnswer={hasCheckedAnswer}
          isAnswerCorrect={isAnswerCorrect}
          correctAnswer={correctAnswer}
        />
      ))}
    </div>
  );
}
