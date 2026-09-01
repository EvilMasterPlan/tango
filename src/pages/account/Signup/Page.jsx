import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AccountLayout from '@/pages/account/components/AccountLayout';
import { TextField } from '@/components/shared/TextField';
import { Button } from '@/components/shared/Button';
import { authApi } from '@/utils/api/auth';
import { isValidEmail, isValidPassword } from '@/utils/auth';
import { useUserContext } from '@/contexts/UserContext';

function SignupPage() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshUser } = useUserContext();

  const next = searchParams.get('next');
  const nextQueryParam = next ? `&next=${encodeURIComponent(next)}` : '';

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      setError('Enter a valid email address.');
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
      await authApi.signup(email, password);
      await refreshUser();
      navigate(`/account/rampart${next ? `?next=${encodeURIComponent(next)}` : ''}`);
    } catch (apiError) {
      if (apiError?.response?.status === 409) {
        navigate(`/account/login?email=${encodeURIComponent(email)}${nextQueryParam}`);
        return;
      }
      setError(apiError?.response?.data?.message || 'Could not create account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AccountLayout
      title="Create account"
      subtitle="Use one account per learner. No shared spaces, no extra setup."
      footerText="Already registered? Sign in"
      footerHref={`/account/login${email ? `?email=${encodeURIComponent(email)}` : ''}${nextQueryParam}`}
    >
      <form className="account-form" onSubmit={handleSubmit}>
        <TextField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isLoading}
        />
        <TextField
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isLoading}
        />
        <TextField
          id="confirmPassword"
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          disabled={isLoading}
        />
        {error ? <p className="account-error">{error}</p> : null}
        <Button type="submit" disabled={isLoading}>
          Sign up
        </Button>
      </form>
    </AccountLayout>
  );
}

export default SignupPage;
