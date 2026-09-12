import './PasswordRequirements.scss';

// Ported from otter/overmind-ui's identical component of the same name —
// same live strength label/requirement checklist on both apps' Signup and
// Reset/Confirm pages, brought over here for the same reuse rather than
// inventing a new one. isValidPassword (utils/auth.js) enforces the same
// 12-character minimum this assumes.
//
// Always mounted regardless of `password` — callers shouldn't conditionally
// render this (unlike the ported original) since that would let its height
// come and go with it, shifting whatever sits below every time the field
// gains or loses its first/last character. Fading via the `visible` class
// instead keeps the space reserved at all times; only the visibility (and,
// for screen readers, aria-hidden) toggles.
export function PasswordRequirements({ password }) {
  const isVisible = password.length > 0;
  const isLongEnough = password.length >= 12;

  const getStrengthInfo = () => {
    if (password.length < 12) return { text: 'Poor', icon: '❌' };
    if (password.length < 16) return { text: 'Fair', icon: '✅' };
    return { text: 'Strong', icon: '✅' };
  };

  const strength = getStrengthInfo();

  return (
    <div className={`password-requirements ${isVisible ? 'visible' : ''}`} aria-hidden={!isVisible}>
      <p className="requirement">
        {strength.icon} Password strength: {strength.text}
      </p>
      <p className={`requirement ${isLongEnough ? 'met' : ''}`}>
        {isLongEnough ? '✅' : '❌'} At least 12 characters
      </p>
    </div>
  );
}
