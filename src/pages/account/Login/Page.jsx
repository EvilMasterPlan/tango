import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AccountLayout from '@/pages/account/components/AccountLayout';
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
      navigate('/account/rampart');
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
      footerHref={`/account/signup${email ? `?email=${encodeURIComponent(email)}` : ''}`}
    >
      <form className="account-form" onSubmit={handleSubmit}>
        <label className="account-label" htmlFor="email">
          Email
          <input
            id="email"
            className="account-input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isLoading}
          />
        </label>
        <label className="account-label" htmlFor="password">
          Password
          <input
            id="password"
            className="account-input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isLoading}
          />
        </label>
        {error ? <p className="account-error">{error}</p> : null}
        <button className="btn btn-primary" disabled={isLoading} type="submit">
          Sign in
        </button>
        <p className="account-inline-note">
          Forgot it? <Link className="account-link" to={`/account/reset/request?email=${encodeURIComponent(email)}`}>Reset password</Link>
        </p>
      </form>
    </AccountLayout>
  );
}

export default LoginPage;
