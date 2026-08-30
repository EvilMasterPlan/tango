import { DigitReel } from '@/components/quiz/DigitReel';
import './NumberDial.scss';

// Fixed at 3 digits — comfortably covers the reward counter's realistic
// range and keeps every digit column's width constant, so the dial never
// reflows as the value crosses a power of ten.
const DIGIT_COUNT = 3;

export function NumberDial({ value }) {
  const digits = String(value).padStart(DIGIT_COUNT, '0').slice(-DIGIT_COUNT).split('').map(Number);

  return (
    <span className="number-dial">
      {digits.map((digit, index) => (
        <DigitReel key={index} digit={digit} place={digits.length - 1 - index} />
      ))}
    </span>
  );
}
