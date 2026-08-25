import './ChoiceButton.scss';

// variant: 'default' | 'selected' | 'success' | 'fail'
// emphasized: true for word choices — slightly bigger text since subtle
// kanji differences are easy to miss at the normal size.
export function ChoiceButton({ text, index, variant = 'default', emphasized = false, onSelect, disabled = false, labelRef }) {
  return (
    <button
      type="button"
      className={[
        'modern-choice-button',
        variant !== 'default' && `modern-choice-button--${variant}`,
        emphasized && 'modern-choice-button--emphasized',
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
