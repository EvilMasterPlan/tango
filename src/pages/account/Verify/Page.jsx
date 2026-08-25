import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import AccountLayout from '@/pages/account/components/AccountLayout';
import { accountApi } from '@/utils/api/account';
import { useUserContext } from '@/contexts/UserContext';
import { isAccountVerified } from '@/utils/auth';

function VerifyPage() {
  const { user, isLoading, refreshUser } = useUserContext();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const subtitle = useMemo(() => {
    if (!user?.email) {
      return 'Check your inbox for a verification code.';
    }
    return `Enter the verification code sent to ${user.email}.`;
  }, [user]);

  const handleSendCode = async () => {
    setError('');
    setMessage('');
    setIsProcessing(true);
    try {
      await accountApi.sendVerificationCode();
      setMessage('Verification code sent.');
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Could not send verification code.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsProcessing(true);
    try {
      await accountApi.verifyCode(code.trim());
      await refreshUser();
      navigate('/account/rampart');
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Invalid verification code.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <AccountLayout title="Verify account" subtitle="Loading account..." />;
  }

  if (!user) {
    return <Navigate to="/account/login" replace />;
  }

  if (isAccountVerified(user)) {
    return <Navigate to="/account/rampart" replace />;
  }

  return (
    <AccountLayout title="Verify account" subtitle={subtitle}>
      <form className="account-form" onSubmit={handleVerify}>
        <label className="account-label" htmlFor="code">
          Verification code
          <input
            id="code"
            className="account-input"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            disabled={isProcessing}
          />
        </label>
        {error ? <p className="account-error">{error}</p> : null}
        {message ? <p className="account-success">{message}</p> : null}
        <button className="btn btn-primary" disabled={isProcessing || code.trim().length < 4} type="submit">
          Verify
        </button>
        <button className="btn btn-secondary" disabled={isProcessing} type="button" onClick={handleSendCode}>
          Send new code
        </button>
      </form>
    </AccountLayout>
  );
}

export default VerifyPage;
