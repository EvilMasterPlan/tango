import { useEffect, useRef } from 'react';
import { fireCoinConfetti, originForElement } from '@/components/quiz/coinConfetti';
import { cx } from '@/utils/cx';
import './SpellingSlots.scss';

// One button per character of the answer. `slots[i]` is either `null`
// (empty, unclickable) or a tile index into `tiles` — indexing by tile
// rather than by character so removing a slot frees exactly the tile that
// filled it, even when the answer repeats a kana. Clicking a filled slot
// clears it; Quiz.jsx handles shifting the remaining tiles left. Once
// `revealed`, each slot compares its placed character against
// `correctAnswer` at that position.
export function SpellingSlots({ tiles, slots, correctAnswer, revealed = false, onRemove }) {
  const containerRef = useRef(null);

  // Coin confetti bursts from the slots row as a whole when every letter's
  // correct — unlike ChoiceGrid, there's no single "the right answer" button
  // to center it on, so which exact spot it bursts from matters much less.
  useEffect(() => {
    if (!revealed || !containerRef.current) return;
    const isFullyCorrect = slots.every((tileIndex, i) => tileIndex !== null && tiles[tileIndex] === correctAnswer[i]);
    if (!isFullyCorrect) return;

    fireCoinConfetti(originForElement(containerRef.current));
  }, [revealed, slots, tiles, correctAnswer]);

  return (
    <div className="modern-spelling-slots" ref={containerRef}>
      {slots.map((tileIndex, slotIndex) => {
        const filled = tileIndex !== null;
        const char = filled ? tiles[tileIndex] : null;
        const variant = revealed ? (char === correctAnswer[slotIndex] ? 'success' : 'fail') : 'default';
        // Correctness is otherwise color-only (the variant classes below) —
        // this gives screen readers/colorblind users the same signal.
        const label = variant === 'success' ? `${char}, correct` : variant === 'fail' ? `${char}, incorrect` : undefined;
        return (
          <button
            type="button"
            key={slotIndex}
            className={cx(
              'modern-spelling-slot',
              filled && 'modern-spelling-slot--filled',
              variant !== 'default' && `modern-spelling-slot--${variant}`,
            )}
            onClick={() => onRemove(slotIndex)}
            disabled={revealed || !filled}
            aria-label={label}
          >
            <span className="modern-spelling-slot__char">{char ?? ''}</span>
          </button>
        );
      })}
    </div>
  );
}
