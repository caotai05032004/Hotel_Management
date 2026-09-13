import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Loading } from './ui/Feedback';
import type { RoleCode } from '../types';

/**
 * Chặn route theo trạng thái đăng nhập và vai trò.
 * Vai trò khớp với @PreAuthorize ở controller backend.
 */
export default function RequireAuth({ roles }: { roles?: RoleCode[] }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) return <Loading label="Đang kiểm tra phiên đăng nhập…" />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && roles.length > 0) {
    const ok = roles.some((r) => user?.roles.includes(r));
    if (!ok) return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
