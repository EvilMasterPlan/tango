import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AccountLayout from '@/pages/account/components/AccountLayout';
import { TextField } from '@/components/shared/TextField';
import { Button } from '@/components/shared/Button';
import { authApi } from '@/utils/api/auth';
import { isValidEmail } from '@/utils/auth';
import { useUserContext } from '@/contexts/UserContext';

function LoginPage() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

    if (!password) {
      setError('Enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.login(email, password);
      await refreshUser();
      navigate(`/account/rampart${next ? `?next=${encodeURIComponent(next)}` : ''}`);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AccountLayout
      title="Welcome back"
      subtitle="Sign in to your Tango account."
      footerText="Need an account? Sign up"
      footerHref={`/account/signup${email ? `?email=${encodeURIComponent(email)}` : ''}${nextQueryParam}`}
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
        {error ? <p className="account-error">{error}</p> : null}
        <Button type="submit" disabled={isLoading}>
          Sign in
        </Button>
        <p className="account-inline-note">
          Forgot it? <Link className="account-link" to={`/account/reset/request?email=${encodeURIComponent(email)}`}>Reset password</Link>
        </p>
      </form>
    </AccountLayout>
  );
}

export default LoginPage;
