import { useEffect, useRef } from 'react';
import { IoChevronUp, IoChevronDown } from 'react-icons/io5';
import { IconButton } from '@/components/shared/IconButton';
import { fireCoinConfetti, originForElement } from '@/components/quiz/coinConfetti';
import { cx } from '@/utils/cx';
import './WordWheel.scss';

// One reel per character of the word. `positions[i]` is either `null` (a
// kana character with no similar-kanji pool — rendered as plain fixed text)
// or `{ options }`, a kanji's candidate pool including the real character —
// `selections[i]` indexes into it. Up/down loops seamlessly via modulo
// arithmetic (no dead ends at either end of the pool). Once `revealed`,
// each wheel position compares its currently-showing character against
// `correctAnswer` at that index.
export function WordWheel({ positions, selections, correctAnswer, revealed = false, onChange }) {
  const containerRef = useRef(null);

  // Coin confetti bursts from the wheel row as a whole once every reel is
  // showing the correct character — same "no single button to center on"
  // reasoning as SpellingSlots.
  useEffect(() => {
    if (!revealed || !containerRef.current) return;
    const isFullyCorrect = positions.every(
      (position, i) => !position || position.options[selections[i]] === correctAnswer[i]
    );
    if (!isFullyCorrect) return;

    fireCoinConfetti(originForElement(containerRef.current));
  }, [revealed, positions, selections, correctAnswer]);

  return (
    <div className="word-wheel" ref={containerRef}>
      {positions.map((position, i) => {
        if (!position) {
          return (
            <span key={i} className="word-wheel__fixed">
              {correctAnswer[i]}
            </span>
          );
        }

        const { options } = position;
        const char = options[selections[i]];
        const variant = revealed ? (char === correctAnswer[i] ? 'success' : 'fail') : 'default';
        const label = variant === 'success' ? `${char}, correct` : variant === 'fail' ? `${char}, incorrect` : undefined;

        return (
          <div key={i} className={cx('word-wheel__reel', variant !== 'default' && `word-wheel__reel--${variant}`)}>
            <IconButton
              size="sm"
              label="Previous character"
              onClick={() => onChange(i, (selections[i] - 1 + options.length) % options.length)}
              disabled={revealed}
            >
              <IoChevronUp />
            </IconButton>
            <span className="word-wheel__char" aria-label={label}>
              {char}
            </span>
            <IconButton
              size="sm"
              label="Next character"
              onClick={() => onChange(i, (selections[i] + 1) % options.length)}
              disabled={revealed}
            >
              <IoChevronDown />
            </IconButton>
          </div>
        );
      })}
    </div>
  );
}
