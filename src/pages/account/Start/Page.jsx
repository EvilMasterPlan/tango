import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AccountLayout from '@/pages/account/components/AccountLayout';
import { TextField } from '@/components/shared/TextField';
import { Button } from '@/components/shared/Button';
import { authApi } from '@/utils/api/auth';
import { isValidEmail } from '@/utils/auth';

function StartPage() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const next = searchParams.get('next');
  const nextQueryParam = next ? `&next=${encodeURIComponent(next)}` : '';

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
      navigate(`/account/signup?email=${encodeURIComponent(email)}${nextQueryParam}`);
    } catch (apiError) {
      if (apiError?.response?.status === 409) {
        navigate(`/account/login?email=${encodeURIComponent(email)}${nextQueryParam}`);
        return;
      }
      navigate(`/account/signup?email=${encodeURIComponent(email)}${nextQueryParam}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AccountLayout title="Tango account" subtitle="Sign in or create an account to get started.">
      <form className="account-form" onSubmit={handleSubmit}>
        <TextField
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isLoading}
        />
        {error ? <p className="account-error">{error}</p> : null}
        <Button type="submit" disabled={isLoading || !email.trim()}>
          Continue
        </Button>
      </form>
    </AccountLayout>
  );
}

export default StartPage;
