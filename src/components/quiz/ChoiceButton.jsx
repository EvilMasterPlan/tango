import './ChoiceButton.scss';

// variant: 'default' | 'selected' | 'success' | 'fail'
// emphasized: true for word choices — slightly bigger text since subtle
// kanji differences are easy to miss at the normal size.
// japanese: true when the choice text itself is Japanese (word or reading
// choices) rather than an English definition — renders in the user's
// chosen Japanese font (see SettingsContext) instead of the default one.
export function ChoiceButton({ text, index, variant = 'default', emphasized = false, japanese = false, onSelect, disabled = false, labelRef }) {
  return (
    <button
      type="button"
      className={[
        'modern-choice-button',
        variant !== 'default' && `modern-choice-button--${variant}`,
        emphasized && 'modern-choice-button--emphasized',
        japanese && 'modern-choice-button--japanese',
      ].filter(Boolean).join(' ')}
      onClick={() => onSelect(index)}
      disabled={disabled}
    >
      <span ref={labelRef} className="modern-choice-button__label">
        {text}
      </span>
    </button>
  );
}
