import { Navigate } from 'react-router-dom';
import { useUserContext } from '@/contexts/UserContext';
import { isAdmin } from '@/utils/adminAccess';

// Goes inside RequireAuth (relies on `user` already being resolved) — a
// signed-in non-admin is bounced to /home rather than the login flow
// RequireAuth itself sends an unauthenticated visitor to, since they're not
// being asked to sign in, they just don't have access.
export default function RequireAdmin({ children }) {
  const { user } = useUserContext();

  if (!isAdmin(user)) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
