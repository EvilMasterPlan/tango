import { Navigate, useLocation } from 'react-router-dom';
import { useUserContext } from '@/contexts/UserContext';

export default function RequireAuth({ enabled, children }) {
  const location = useLocation();
  const { user, isLoading } = useUserContext();

  if (!enabled) {
    return children;
  }

  if (isLoading) {
    return null;
  }

  if (!user) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/account/start?next=${next}`} replace />;
  }

  return children;
}
