import { cx } from '@/utils/cx';
import './Button.scss';

// Shared button with the quiz's pressable, thick-bordered look (see
// quiz/ChoiceButton.scss) — 'primary' is what the quiz's own footer action
// button uses; 'secondary' matches ChoiceButton's resting/hover face, for a
// lower-emphasis action alongside a primary one.
export function Button({ children, onClick, disabled = false, type = 'button', variant = 'primary', className }) {
  return (
    <button
      type={type}
      className={cx('shared-button', `shared-button--${variant}`, className)}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
