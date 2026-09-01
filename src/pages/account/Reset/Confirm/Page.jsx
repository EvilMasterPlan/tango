import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AccountLayout from '@/pages/account/components/AccountLayout';
import { TextField } from '@/components/shared/TextField';
import { Button } from '@/components/shared/Button';
import { authApi } from '@/utils/api/auth';
import { isValidPassword } from '@/utils/auth';
import { useUserContext } from '@/contexts/UserContext';

function ResetConfirmPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useUserContext();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const token = searchParams.get('token');
  const userId = searchParams.get('userId');
  const hasRequiredParams = useMemo(() => Boolean(token && userId), [token, userId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!hasRequiredParams) {
      setError('Invalid reset link.');
      return;
    }

    if (!isValidPassword(password)) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords must match.');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword(token, userId, password);
      await refreshUser();
      navigate('/account/rampart');
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Could not reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AccountLayout title="Create a new password" subtitle="This updates your account credentials.">
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
          disabled={isLoading}
        />
        {error ? <p className="account-error">{error}</p> : null}
        <Button type="submit" disabled={isLoading}>
          Save password
        </Button>
      </form>
    </AccountLayout>
  );
}

export default ResetConfirmPage;
