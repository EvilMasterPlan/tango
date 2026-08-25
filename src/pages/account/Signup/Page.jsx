import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AccountLayout from '@/pages/account/components/AccountLayout';
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
      navigate('/account/rampart');
    } catch (apiError) {
      if (apiError?.response?.status === 409) {
        navigate(`/account/login?email=${encodeURIComponent(email)}`);
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
      footerHref={`/account/login${email ? `?email=${encodeURIComponent(email)}` : ''}`}
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
        <label className="account-label" htmlFor="confirmPassword">
          Confirm password
          <input
            id="confirmPassword"
            className="account-input"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            disabled={isLoading}
          />
        </label>
        {error ? <p className="account-error">{error}</p> : null}
        <button className="btn btn-primary" disabled={isLoading} type="submit">
          Sign up
        </button>
      </form>
    </AccountLayout>
  );
}

export default SignupPage;
