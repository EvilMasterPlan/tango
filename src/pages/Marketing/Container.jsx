import { Navigate } from 'react-router-dom';
import { useUserContext } from '@/contexts/UserContext';
import { MarketingPage } from '@/pages/Marketing/Page';

export function MarketingContainer() {
  const { user, isLoading } = useUserContext();

  if (isLoading) return null;
  if (user) return <Navigate to="/home" replace />;

  return <MarketingPage />;
}
