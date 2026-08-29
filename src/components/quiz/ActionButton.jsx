import './ActionButton.scss';

export function ActionButton({ label, onClick, disabled = false }) {
  return (
    <button
      type="button"
      className="modern-action-button"
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}
