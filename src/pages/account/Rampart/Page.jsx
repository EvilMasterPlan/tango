import { Navigate, useSearchParams } from 'react-router-dom';
import AccountLayout from '@/pages/account/components/AccountLayout';
import { useUserContext } from '@/contexts/UserContext';
import { isAccountVerified } from '@/utils/auth';

function RampartPage() {
  const { user, isLoading } = useUserContext();
  const [searchParams] = useSearchParams();
  const next = searchParams.get('next');
  const nextQueryParam = next ? `?next=${encodeURIComponent(next)}` : '';

  if (isLoading) {
    return <AccountLayout title="Rampart" subtitle="Loading account..." />;
  }

  if (!user) {
    return <Navigate to={`/account/start${nextQueryParam}`} replace />;
  }

  if (!isAccountVerified(user)) {
    return <Navigate to={`/account/verify${nextQueryParam}`} replace />;
  }

  return <Navigate to={next || '/'} replace />;
}

export default RampartPage;
