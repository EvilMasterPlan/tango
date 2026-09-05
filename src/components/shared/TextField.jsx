import './TextField.scss';

// Labeled text input styled to match the quiz's input treatment — thick
// border, inset shadow, accent focus ring — just left-aligned and sized
// for ordinary form text instead of a single centered kana answer.
export function TextField({ label, id, type = 'text', value, onChange, disabled = false, placeholder, autoFocus = false }) {
  return (
    <label className="shared-field" htmlFor={id}>
      <span className="shared-field__label">{label}</span>
      <input
        id={id}
        className="shared-field__input"
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
    </label>
  );
}
