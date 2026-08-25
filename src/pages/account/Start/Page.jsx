import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AccountLayout from '@/pages/account/components/AccountLayout';
import { authApi } from '@/utils/api/auth';
import { isValidEmail } from '@/utils/auth';

function StartPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.checkEmail(email);
      navigate(`/account/signup?email=${encodeURIComponent(email)}`);
    } catch (apiError) {
      if (apiError?.response?.status === 409) {
        navigate(`/account/login?email=${encodeURIComponent(email)}`);
        return;
      }
      navigate(`/account/signup?email=${encodeURIComponent(email)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AccountLayout title="Tango account" subtitle="Sign in or create an account to get started.">
      <form className="account-form" onSubmit={handleSubmit}>
        <label className="account-label" htmlFor="email">
          Email
          <input
            id="email"
            className="account-input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isLoading}
          />
        </label>
        {error ? <p className="account-error">{error}</p> : null}
        <button className="btn btn-primary" disabled={isLoading || !email.trim()} type="submit">
          Continue
        </button>
      </form>
    </AccountLayout>
  );
}

export default StartPage;
