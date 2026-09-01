import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { cx } from '@/utils/cx';
import './IconButton.scss';

// A circular, transparent-until-hover icon button — the shape shared by
// QuizHeader's close/settings buttons and SettingsDialog's close button.
// Renders a <Link> when `to` is given (e.g. "close the quiz" navigates
// home), otherwise a plain <button>. Icon sizing follows the button's own
// font-size (react-icons default to 1em), so just drop an icon in as
// `children` — no separate sizing class needed.
export const IconButton = forwardRef(function IconButton(
  { children, onClick, to, label, size = 'md', disabled = false, className },
  ref
) {
  const sharedProps = {
    ref,
    className: cx('shared-icon-button', `shared-icon-button--${size}`, className),
    'aria-label': label,
  };

  if (to) {
    return (
      <Link to={to} {...sharedProps}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} {...sharedProps}>
      {children}
    </button>
  );
});
