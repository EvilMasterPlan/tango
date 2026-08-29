import { useEffect, useRef } from 'react';
import * as wanakana from 'wanakana';
import { fireCoinConfetti, originForElement } from '@/components/quiz/coinConfetti';
import './ReadingInput.scss';

// A free-text answer field for typing out a reading. Romaji is converted to
// hiragana live via wanakana as you type (kana typed directly, e.g. via an
// IME, passes through unchanged) — no autocomplete or word suggestions,
// just character-level romaji-to-kana spelling.
//
// Uncontrolled by design: wanakana.bind() owns the input's DOM value and
// cursor directly as the user types, converting in place. Binding that same
// value to React state and feeding it back in as a controlled `value` would
// fight wanakana for the cursor and also breaks conversion itself — e.g.
// "konnichiwa" typed a letter at a time needs the *raw* romaji history to
// resolve the doubled "n" correctly once "i" arrives; re-deriving from an
// already-converted running value prematurely locks "n" in as "ん" too
// early. `typedAnswer` is a read-only mirror of the live value, lifted to
// the parent purely for grading and enabling Check — never written back.
export function ReadingInput({ typedAnswer, correctAnswer, revealed = false, onChange }) {
  const inputRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    // Attaching our own listener after bind() means wanakana's conversion
    // runs first on each native 'input' event, so onChange always sees the
    // already-converted value.
    wanakana.bind(input, { IMEMode: true });
    function handleInput() {
      onChange(input.value);
    }
    input.addEventListener('input', handleInput);

    return () => {
      input.removeEventListener('input', handleInput);
      wanakana.unbind(input);
    };
  }, [onChange]);

  const isCorrect = revealed ? typedAnswer.trim() === correctAnswer : null;
  const variant = isCorrect === true ? 'success' : isCorrect === false ? 'fail' : null;

  // Coin confetti bursts from the field itself — there's no meaningful
  // "correct spot" for a free-text answer, so the input's own position is
  // as good a center as any.
  useEffect(() => {
    if (variant !== 'success' || !wrapRef.current) return;
    fireCoinConfetti(originForElement(wrapRef.current));
  }, [variant]);

  return (
    // <input> is a replaced element and can't host ::before/::after itself,
    // so the success shine/flash (matching ChoiceButton's) lives on this
    // wrapper instead, layered on top of the input beneath it. That in turn
    // means the shine would paint over the input's own native text — so on
    // success the input's text is made transparent and a second, crisp
    // label above the shine (higher z-index) duplicates it instead.
    <span ref={wrapRef} className={`modern-reading-input-wrap${variant === 'success' ? ' modern-reading-input-wrap--success' : ''}`}>
      <input
        ref={inputRef}
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        autoFocus
        disabled={revealed}
        placeholder="type the reading…"
        className={`modern-reading-input${variant ? ` modern-reading-input--${variant}` : ''}`}
      />
      {variant === 'success' && (
        <span className="modern-reading-input__success-label" aria-hidden="true">
          {correctAnswer}
        </span>
      )}
    </span>
  );
}
