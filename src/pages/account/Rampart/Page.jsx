import { Navigate } from 'react-router-dom';
import AccountLayout from '@/pages/account/components/AccountLayout';
import { useUserContext } from '@/contexts/UserContext';
import { isAccountVerified } from '@/utils/auth';

function RampartPage() {
  const { user, isLoading } = useUserContext();

  if (isLoading) {
    return <AccountLayout title="Rampart" subtitle="Loading account..." />;
  }

  if (!user) {
    return <Navigate to="/account/start" replace />;
  }

  if (!isAccountVerified(user)) {
    return <Navigate to="/account/verify" replace />;
  }

  return <Navigate to="/" replace />;
}

export default RampartPage;
