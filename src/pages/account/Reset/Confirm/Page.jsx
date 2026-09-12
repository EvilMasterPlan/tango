import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AccountLayout from '@/pages/account/components/AccountLayout';
import { TextField } from '@/components/shared/TextField';
import { Button } from '@/components/shared/Button';
import { PasswordRequirements } from '@/pages/account/components/PasswordRequirements';
import { PasswordMatch } from '@/pages/account/components/PasswordMatch';
import { authApi } from '@/utils/api/auth';
import { isValidPassword } from '@/utils/auth';
import { useUserContext } from '@/contexts/UserContext';

function ResetConfirmPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useUserContext();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isConfirmPasswordBlurred, setIsConfirmPasswordBlurred] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const token = searchParams.get('token');
  // The reset email link only ever carries `token` (see OvermindAPI's
  // account.reset URL builder) — userID isn't something we can trust from
  // the URL itself, so it's resolved server-side from the token via
  // checkRecoveryToken (POST /authentication/recovery/verify) rather than
  // read out of searchParams. isVerifying gates rendering the actual form
  // until that resolution finishes, one way or the other.
  const [userID, setUserID] = useState(null);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link.');
      setIsVerifying(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const result = await authApi.checkRecoveryToken(token);
        if (!cancelled) {
          setUserID(result.userID);
        }
      } catch {
        if (!cancelled) {
          setError('Invalid reset link.');
        }
      } finally {
        if (!cancelled) {
          setIsVerifying(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!isValidPassword(password)) {
      setError('Password must be at least 12 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords must match.');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword(token, userID, password);
      await refreshUser();
      navigate('/account/rampart');
    } catch (apiError) {
      // The API's error middleware sends { error: message } (see app.js's
      // global error handler) — every account page reads this field now.
      setError(apiError?.response?.data?.error || 'Could not reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return <AccountLayout title="Create a new password" subtitle="Checking your reset link..." />;
  }

  if (!userID) {
    return (
      <AccountLayout title="Create a new password">
        <p className="account-error">{error || 'Invalid reset link.'}</p>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout title="Create a new password">
      <form className="account-form" onSubmit={handleSubmit}>
        <TextField
          id="password"
          label="New password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isLoading}
        />
        <TextField
          id="confirmPassword"
          label="Confirm new password"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          onBlur={() => setIsConfirmPasswordBlurred(true)}
          disabled={isLoading}
        />
        <PasswordRequirements password={password} />
        <PasswordMatch password={password} confirmPassword={confirmPassword} isBlurred={isConfirmPasswordBlurred} />
        {error ? <p className="account-error">{error}</p> : null}
        <Button type="submit" disabled={isLoading}>
          Save password
        </Button>
      </form>
    </AccountLayout>
  );
}

export default ResetConfirmPage;
