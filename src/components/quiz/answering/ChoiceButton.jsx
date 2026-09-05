import { cx } from '@/utils/cx';
import './ChoiceButton.scss';

// variant: 'default' | 'selected' | 'success' | 'fail'
// emphasized: true for word choices — slightly bigger text since subtle
// kanji differences are easy to miss at the normal size.
// japanese: true when the choice text itself is Japanese (word or reading
// choices) rather than an English definition — renders in the user's
// chosen Japanese font instead of the default one.
// success/fail are otherwise conveyed by color alone (the CSS variant
// classes above) — this appends a plain-text status so screen readers and
// colorblind users get the same "correct"/"your answer, incorrect" signal
// as everyone else, without changing what's visually shown.
function statusLabel(text, variant) {
  if (variant === 'success') return `${text} — correct answer`;
  if (variant === 'fail') return `${text} — your answer, incorrect`;
  return undefined;
}

export function ChoiceButton({ text, index, variant = 'default', emphasized = false, japanese = false, onSelect, disabled = false, labelRef }) {
  return (
    <button
      type="button"
      className={cx(
        'modern-choice-button',
        variant !== 'default' && `modern-choice-button--${variant}`,
        emphasized && 'modern-choice-button--emphasized',
        japanese && 'modern-choice-button--japanese',
      )}
      onClick={() => onSelect(index)}
      disabled={disabled}
      aria-label={statusLabel(text, variant)}
    >
      <span ref={labelRef} className="modern-choice-button__label">
        {text}
      </span>
    </button>
  );
}
