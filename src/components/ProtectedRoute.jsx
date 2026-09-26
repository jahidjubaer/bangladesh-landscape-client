import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

// Wrap routes that need login; pass roles to also require a role:
// <ProtectedRoute roles={['admin']} />
export default function ProtectedRoute({ roles }) {
  const { user, loading, hasRole } = useAuth();
  const location = useLocation();

  if (loading) return <Loader fullScreen />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (roles && roles.length > 0 && !hasRole(...roles)) return <Navigate to="/" replace />;

  return <Outlet />;
}
