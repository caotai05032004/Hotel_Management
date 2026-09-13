import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { authService, clearSession, getAccessToken, getStoredUser } from '../services/authService';
import { isTokenExpired } from '../lib/jwt';
import type { CurrentUser, LoginRequest, RegisterRequest, RoleCode } from '../types';

export interface AuthContextValue {
  user: CurrentUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  /** true khi user có ít nhất 1 trong các vai trò truyền vào */
  hasRole: (...roles: RoleCode[]) => boolean;
  /** RECEPTIONIST / MANAGER / ADMIN -> được vào khu quản trị */
  isStaff: boolean;
  login: (payload: LoginRequest) => Promise<CurrentUser>;
  register: (payload: RegisterRequest) => Promise<CurrentUser>;
  logout: () => Promise<void>;
  setUser: (user: CurrentUser) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | null>(null);

const STAFF_ROLES: RoleCode[] = ['RECEPTIONIST', 'MANAGER', 'ADMIN'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Khôi phục phiên từ localStorage khi tải lại trang
  useEffect(() => {
    const token = getAccessToken();
    if (token && !isTokenExpired(token)) {
      setUserState(getStoredUser());
    } else if (token) {
      clearSession();
    }
    setLoading(false);
  }, []);

  const setUser = useCallback((next: CurrentUser) => {
    setUserState(next);
    localStorage.setItem('currentUser', JSON.stringify(next));
  }, []);

  const login = useCallback(async (payload: LoginRequest) => {
    const next = await authService.login(payload);
    setUserState(next);
    return next;
  }, []);

  const register = useCallback(async (payload: RegisterRequest) => {
    const next = await authService.register(payload);
    setUserState(next);
    return next;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUserState(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const roles = user?.roles ?? [];
    const hasRole = (...wanted: RoleCode[]) => wanted.some((r) => roles.includes(r));
    return {
      user,
      loading,
      isAuthenticated: !!user,
      hasRole,
      isStaff: STAFF_ROLES.some((r) => roles.includes(r)),
      login,
      register,
      logout,
      setUser,
    };
  }, [user, loading, login, register, logout, setUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
