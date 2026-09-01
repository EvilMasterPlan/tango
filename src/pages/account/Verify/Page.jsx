import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import AccountLayout from '@/pages/account/components/AccountLayout';
import { TextField } from '@/components/shared/TextField';
import { Button } from '@/components/shared/Button';
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
  const [searchParams] = useSearchParams();
  const next = searchParams.get('next');
  const nextQueryParam = next ? `?next=${encodeURIComponent(next)}` : '';

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
      navigate(`/account/rampart${nextQueryParam}`);
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
    return <Navigate to={`/account/login${nextQueryParam}`} replace />;
  }

  if (isAccountVerified(user)) {
    return <Navigate to={`/account/rampart${nextQueryParam}`} replace />;
  }

  return (
    <AccountLayout title="Verify account" subtitle={subtitle}>
      <form className="account-form" onSubmit={handleVerify}>
        <TextField
          id="code"
          label="Verification code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          disabled={isProcessing}
        />
        {error ? <p className="account-error">{error}</p> : null}
        {message ? <p className="account-success">{message}</p> : null}
        <Button type="submit" disabled={isProcessing || code.trim().length < 4}>
          Verify
        </Button>
        <Button type="button" variant="secondary" disabled={isProcessing} onClick={handleSendCode}>
          Send new code
        </Button>
      </form>
    </AccountLayout>
  );
}

export default VerifyPage;
