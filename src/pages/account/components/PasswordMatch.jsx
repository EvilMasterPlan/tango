import './PasswordMatch.scss';

// Ported from otter/overmind-ui's identical component — only renders once
// the confirm-password field has actually been blurred (isBlurred) and
// still doesn't match, so a mismatch never flashes while the user is still
// mid-type on either field.
export function PasswordMatch({ password, confirmPassword, isBlurred }) {
  const doMatch = password === confirmPassword && password.length > 0;
  const shouldShow = isBlurred && !doMatch && confirmPassword.length > 0;

  if (!shouldShow) return null;

  return (
    <div className="password-match">
      <p className="requirement">❌ Passwords must match</p>
    </div>
  );
}
