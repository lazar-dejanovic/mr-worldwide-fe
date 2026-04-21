import { Navigate, Outlet } from 'react-router';
import { useApp } from '../context/AppContext';

export function AuthGuard() {
  const { isAuthenticated } = useApp();
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return <Outlet />;
}
