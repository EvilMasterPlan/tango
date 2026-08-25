import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AccountLayout from '@/pages/account/components/AccountLayout';
import { authApi } from '@/utils/api/auth';
import { isValidEmail } from '@/utils/auth';

function ResetRequestPage() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!isValidEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.sendRecoveryRequest(email);
      setMessage(`Reset instructions sent to ${email}.`);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Could not send reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AccountLayout
      title="Reset password"
      subtitle="We will email a reset link."
      footerText="Back to sign in"
      footerHref="/account/login"
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
        {error ? <p className="account-error">{error}</p> : null}
        {message ? <p className="account-success">{message}</p> : null}
        <button className="btn btn-primary" disabled={isLoading} type="submit">
          Send reset email
        </button>
      </form>
    </AccountLayout>
  );
}

export default ResetRequestPage;
