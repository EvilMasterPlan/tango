import { useEffect, useRef, useState } from 'react';
import { IoChevronUp, IoChevronDown } from 'react-icons/io5';
import { fireCoinConfetti, originForElement } from '@/components/quiz/coinConfetti';
import { cx } from '@/utils/cx';
import './WordWheel.scss';

function mod(n, m) {
  return ((n % m) + m) % m;
}

// The word as currently slotted on the wheel — a fixed position's own
// character for `null` entries, otherwise whichever option that position's
// reel is currently showing. Grading (Quiz.jsx) and the confetti trigger
// below both compare this whole, actually-displayed string against
// `correctAnswer` rather than checking each position's index in isolation
// — the index is just implementation detail for which option a reel
// happens to be on; what actually needs to match is the character it's
// showing.
export function getWheelDisplayedWord(positions, selections, correctAnswer) {
  return positions.map((position, i) => (position ? position.options[selections[i]] : correctAnswer[i])).join('');
}

// Fast start, gentle stop — same spin easing as DigitReel.
const REEL_EASE = 'cubic-bezier(0.15, 0.85, 0.3, 1)';
const REEL_DURATION_MS = 220;

// One wheel position: the up/down step buttons plus the character reel
// between them. `ticks` is this reel's own net step count since mount —
// unlike DigitReel (which can leap several digits to land on an arbitrary
// result) every press here is exactly one step. `lo`/`hi` are the range of
// ticks currently rendered as rows, and only ever grow to cover wherever
// `ticks` moves to — never shrink back down while a transition might still
// be reading from them; that shrink only happens once a step actually
// settles (transitionend), applied `instant` so it's invisible.
//
// Each row positions itself via its own *absolute* tick value — `top:
// calc((t - ticks) * rowH)`, not a window-relative index like `t - lo` —
// so its motion depends only on `ticks` actually changing, never on how
// `lo`/`hi` happen to have shifted to fit it into the rendered window. An
// earlier version keyed each row's position off `t - lo` instead: for a
// step backward, `lo` drops by the same 1 tick as `ticks` (extending the
// window on that side), so `t - lo` for the target row landed on the same
// value it started at — same transform in and out, no transition fires,
// and the new row just appears with the text already swapped. Absolute
// positioning has no such cancellation.
function WordWheelReel({ options, selection, correctChar, revealed, onChange }) {
  const length = options.length;
  const [{ ticks, lo, hi, instant }, setState] = useState(() => ({
    ticks: selection,
    lo: selection - 1,
    hi: selection + 1,
    instant: true,
  }));
  const centerRowRef = useRef(null);

  useEffect(() => {
    const centerRow = centerRowRef.current;
    if (!centerRow || instant) return;

    // Once a step actually finishes, re-anchor `ticks` (and the window
    // around it) to the small (0..length-1) equivalent, applied with no
    // transition — same character, so it's an invisible snap. Keeps
    // `ticks` from growing without bound over a long lesson (see DigitReel
    // for the identical reasoning).
    function handleTransitionEnd(e) {
      if (e.target !== centerRow || e.propertyName !== 'transform') return;
      setState((s) => {
        const t = mod(s.ticks, length);
        return { ticks: t, lo: t - 1, hi: t + 1, instant: true };
      });
    }
    centerRow.addEventListener('transitionend', handleTransitionEnd);
    return () => centerRow.removeEventListener('transitionend', handleTransitionEnd);
  }, [instant, length]);

  function step(delta) {
    if (revealed) return;
    setState((s) => {
      const newTicks = s.ticks + delta;
      return {
        ticks: newTicks,
        lo: Math.min(s.lo, newTicks - 1),
        hi: Math.max(s.hi, newTicks + 1),
        instant: false,
      };
    });
    onChange(mod(selection + delta, length));
  }

  const char = options[selection];
  const variant = revealed ? (char === correctChar ? 'success' : 'fail') : 'default';
  const label = variant === 'success' ? `${char}, correct` : variant === 'fail' ? `${char}, incorrect` : undefined;

  const rows = [];
  for (let t = lo; t <= hi; t += 1) rows.push(t);

  return (
    <div className={cx('word-wheel__reel', variant !== 'default' && `word-wheel__reel--${variant}`)}>
      <button
        type="button"
        className="word-wheel__step"
        aria-label="Previous character"
        onClick={() => step(-1)}
        disabled={revealed}
      >
        <IoChevronUp />
      </button>
      <div className="word-wheel__tile" aria-label={label}>
        <span className="word-wheel__viewport" aria-hidden="true">
          {rows.map((t) => (
            <span
              ref={t === ticks ? centerRowRef : undefined}
              className="word-wheel__row"
              key={t}
              style={{
                transform: `translateY(calc(var(--reel-peek) + ${t - ticks} * var(--reel-row-h)))`,
                transitionDuration: instant ? '0ms' : `${REEL_DURATION_MS}ms`,
                transitionTimingFunction: REEL_EASE,
              }}
            >
              {options[mod(t, length)]}
            </span>
          ))}
        </span>
        {/* Siblings of .word-wheel__viewport, not children of it, for the
            same reason as DigitReel's fades: their own overhang can then
            cover the clip edge rather than being clipped identically
            alongside the spinning rows. */}
        <span className="word-wheel__fade word-wheel__fade--top" aria-hidden="true" />
        <span className="word-wheel__fade word-wheel__fade--bottom" aria-hidden="true" />
      </div>
      <button
        type="button"
        className="word-wheel__step"
        aria-label="Next character"
        onClick={() => step(1)}
        disabled={revealed}
      >
        <IoChevronDown />
      </button>
    </div>
  );
}

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
    if (getWheelDisplayedWord(positions, selections, correctAnswer) !== correctAnswer) return;

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

        return (
          <WordWheelReel
            key={i}
            options={position.options}
            selection={selections[i]}
            correctChar={correctAnswer[i]}
            revealed={revealed}
            onChange={(newIndex) => onChange(i, newIndex)}
          />
        );
      })}
    </div>
  );
}
