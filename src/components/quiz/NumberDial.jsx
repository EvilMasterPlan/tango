import { DigitReel } from '@/components/quiz/DigitReel';
import './NumberDial.scss';

// Fixed at 3 digits — comfortably covers the reward counter's realistic
// range and keeps every digit column's width constant, so the dial never
// reflows as the value crosses a power of ten.
const DIGIT_COUNT = 3;

// `hideLeadingZeros`: don't dim leading zeros (the default), just don't
// render those reels at all — the dial then reads as a plain, natural-width
// number that grows a digit at a time as it crosses a power of ten, with
// the consumer free to center it in whatever space it sits, rather than a
// fixed-width odometer that always shows every padding zero.
export function NumberDial({ value, hideLeadingZeros = false }) {
  const digits = String(value).padStart(DIGIT_COUNT, '0').slice(-DIGIT_COUNT).split('').map(Number);

  // Leading zeros (the padding above, or genuinely insignificant high
  // digits like the hundreds in "003") are either dimmed or (see
  // hideLeadingZeros) skipped entirely instead of sitting there at full
  // strength — same convention as a car odometer. A digit only qualifies
  // while every digit to its left is also zero (so "300"'s trailing zeros
  // stay full-strength, they're not leading) and it's never applied to the
  // last digit — the ones place stays visible even when the whole value is
  // 0, rather than every reel dimming/disappearing at once.
  let leadingZero = true;
  const leadingZeroFlags = digits.map((digit, index) => {
    const isLast = index === digits.length - 1;
    const isLeadingZero = leadingZero && digit === 0 && !isLast;
    if (digit !== 0) leadingZero = false;
    return isLeadingZero;
  });

  return (
    // The digits themselves render as individually-animated reels (see
    // DigitReel) that are aria-hidden — this label is the one place the
    // actual value is exposed to assistive tech.
    <span className="number-dial" aria-label={String(value)}>
      {digits.map((digit, index) => {
        const isLeadingZero = leadingZeroFlags[index];
        if (hideLeadingZeros && isLeadingZero) return null;
        return (
          <DigitReel
            key={index}
            digit={digit}
            place={digits.length - 1 - index}
            dimmed={!hideLeadingZeros && isLeadingZero}
          />
        );
      })}
    </span>
  );
}
