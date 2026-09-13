import axios from 'axios';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import type { BaseResponse } from '../types';

export const TOKEN_KEY = 'accessToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';
export const USER_KEY = 'currentUser';

/**
 * baseURL '/api' -> vite proxy chuyển tiếp sang http://localhost:8080/api
 * (xem server.proxy trong vite.config.ts). Khi build production, đặt
 * VITE_API_BASE_URL=https://domain-that/api trong file .env
 */
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

/* ------------- Request: tự động gắn Authorization: Bearer <token> -------- */
http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ------------- Response: 401 -> xoá phiên và đẩy về /login --------------- */
http.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url ?? '';
    const isAuthCall = url.includes('/auth/login') || url.includes('/auth/register');

    if (status === 401 && !isAuthCall) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?expired=1';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Lỗi nghiệp vụ của backend: HTTP vẫn 200 nhưng BaseResponse.code != 2xx
 * (ví dụ login sai mật khẩu trả code 400 trong body).
 */
export class ApiError extends Error {
  code: number;
  fieldErrors: Record<string, string>;

  constructor(message: string, code: number, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

/** Bóc BaseResponse<T> -> T, ném ApiError nếu code không phải 2xx. */
export function unwrap<T>(body: BaseResponse<T>): T {
  if (body == null) throw new ApiError('Máy chủ không trả về dữ liệu', 500);
  if (body.code >= 200 && body.code < 300) return body.data;
  throw new ApiError(body.msg || 'Có lỗi xảy ra', body.code);
}

/** Gọi API và bóc luôn BaseResponse. */
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const res = await http.request<BaseResponse<T>>(config);
    return unwrap<T>(res.data);
  } catch (err) {
    throw toApiError(err);
  }
}

/* --------------------------- Xử lý lỗi chung ---------------------------- */
interface ValidationErrorBody {
  status?: number;
  message?: string;
  msg?: string;
  errors?: Record<string, string>;
}

export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;

  if (axios.isAxiosError(err)) {
    if (!err.response) {
      return new ApiError('Không kết nối được máy chủ. Kiểm tra backend đã chạy ở cổng 8080 chưa.', 0);
    }
    const status = err.response.status;
    const body = err.response.data as ValidationErrorBody | undefined;
    const message =
      body?.message ??
      body?.msg ??
      (status === 403
        ? 'Bạn không có quyền thực hiện thao tác này'
        : status === 401
          ? 'Phiên đăng nhập đã hết hạn'
          : 'Có lỗi xảy ra');
    return new ApiError(message, status, body?.errors ?? {});
  }

  if (err instanceof Error) return new ApiError(err.message, 500);
  return new ApiError('Có lỗi xảy ra', 500);
}

/** Lấy message để hiển thị cho người dùng. */
export function getErrorMessage(err: unknown): string {
  return toApiError(err).message;
}

/** Lấy lỗi validation theo từng trường (từ GlobalExceptionHandler). */
export function getFieldErrors(err: unknown): Record<string, string> {
  return toApiError(err).fieldErrors;
}

export default http;
