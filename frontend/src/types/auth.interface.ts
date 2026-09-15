/* ==========================================================================
 * Kiểu dữ liệu ánh xạ 1-1 với DTO / enum của backend Spring Boot
 * (com.dev.backend.dto.*.Nguoi Dung, AuthController, ...)
 * ========================================================================== */
import type { RoleCode } from './common.interface';

export const USER_STATUS = ['PENDING_VERIFICATION', 'ACTIVE', 'LOCKED', 'ANONYMIZED'] as const;
export type UserStatus = (typeof USER_STATUS)[number];

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface NguoiDungResponse {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  status: UserStatus;
  roles: RoleCode[];
  createdAt?: string;
}

/** POST /api/auth/register -> BaseResponse<AuthResponse> */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: NguoiDungResponse;
}

/** POST /api/auth/login -> BaseResponse<LoginResponse> (KHÔNG có field user) */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
  fullName: string;
  phone: string | null;
  lastLoginAt: string | null;
  vaiTro: RoleCode[];
  hoSoKhach: unknown | null;
}

export interface UpdateNguoiDungRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

/* ---------------------- Người dùng đang đăng nhập ------------------------ */
export interface CurrentUser {
  id: string | null;
  email: string;
  fullName: string;
  phone: string | null;
  roles: RoleCode[];
}
