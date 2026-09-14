import { http, request, unwrap, TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY, toApiError } from './http';
import { decodeJwt } from '../lib/jwt';
import type {
  AuthResponse,
  BaseResponse,
  CurrentUser,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from '../types';

/* =========================================================================
 * AuthController — /api/auth  (đã permitAll trong SecurityConfig)
 *   POST /api/auth/register -> BaseResponse<AuthResponse>
 *   POST /api/auth/login    -> BaseResponse<LoginResponse>
 *   POST /api/auth/logout   -> BaseResponse<Void>   (gửi header Authorization)
 * ======================================================================= */

function saveSession(accessToken: string, refreshToken: string, user: CurrentUser) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): CurrentUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CurrentUser;
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export const authService = {
  /** Đăng ký tài khoản khách (vai trò mặc định GUEST). */
  async register(payload: RegisterRequest): Promise<CurrentUser> {
    const data = await request<AuthResponse>({
      url: '/auth/register',
      method: 'POST',
      data: payload,
    });
    const user: CurrentUser = {
      id: data.user?.id ?? decodeJwt(data.accessToken)?.uid ?? null,
      email: data.user?.email ?? payload.email,
      fullName: data.user?.fullName ?? payload.fullName,
      phone: data.user?.phone ?? payload.phone ?? null,
      roles: data.user?.roles ?? [],
    };
    saveSession(data.accessToken, data.refreshToken, user);
    return user;
  },

  /**
   * Đăng nhập. LoginResponse không có id nên lấy uid từ claim của access token.
   * Backend trả HTTP 200 kèm code 400/403 khi sai mật khẩu -> unwrap() sẽ ném ApiError.
   */
  async login(payload: LoginRequest): Promise<CurrentUser> {
    let body: BaseResponse<LoginResponse>;
    try {
      const res = await http.post<BaseResponse<LoginResponse>>('/auth/login', payload);
      body = res.data;
    } catch (err) {
      throw toApiError(err);
    }
    const data = unwrap<LoginResponse>(body);

    const user: CurrentUser = {
      id: decodeJwt(data.accessToken)?.uid ?? null,
      email: data.email,
      fullName: data.fullName,
      phone: data.phone,
      roles: data.vaiTro ?? [],
    };
    saveSession(data.accessToken, data.refreshToken, user);
    return user;
  },

  /** Đăng xuất: backend đưa token vào blacklist, sau đó xoá localStorage. */
  async logout(): Promise<void> {
    try {
      if (getAccessToken()) {
        await http.post('/auth/logout');
      }
    } catch {
      /* token hết hạn / mất mạng: vẫn xoá phiên phía client */
    } finally {
      clearSession();
    }
  },
};

export default authService;
