import { cx } from '@/utils/cx';
import './Button.scss';

// Shared button with the quiz's pressable, thick-bordered look (see
// quiz/ChoiceButton.scss) — 'primary' is what the quiz's own footer action
// button uses; 'secondary' matches ChoiceButton's resting/hover face, for a
// lower-emphasis action alongside a primary one. `square`, combined with
// either variant, shrinks it to a fixed-size square (icon-only) button
// instead of the full-width text pill — for a compact action that sits
// alongside a primary button rather than replacing it.
export function Button({ children, onClick, disabled = false, type = 'button', variant = 'primary', square = false, label, className }) {
  return (
    <button
      type={type}
      className={cx('shared-button', `shared-button--${variant}`, square && 'shared-button--square', className)}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      {children}
    </button>
  );
}
