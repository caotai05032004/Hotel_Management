import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Gắn token vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface NguoiDung {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  status: string;
  roles: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: NguoiDung;
}

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

export const authService = {
  register: async (data: RegisterRequest) => {
    const res = await api.post<AuthResponse>('/auth/register', data);
    saveToken(res.data);
    return res.data;
  },

  login: async (data: LoginRequest) => {
    const res = await api.post<AuthResponse>('/auth/login', data);
    saveToken(res.data);
    return res.data;
  },

  me: async () => {
    const res = await api.get<NguoiDung>('/auth/me');
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};

function saveToken(data: AuthResponse) {
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
}

// Lấy thông báo lỗi từ backend
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'Không kết nối được máy chủ';
    return error.response.data?.message ?? 'Có lỗi xảy ra';
  }
  return 'Có lỗi xảy ra';
}

// Lấy lỗi validation theo từng trường
export function getFieldErrors(error: unknown): Record<string, string> {
  if (axios.isAxiosError(error)) return error.response?.data?.errors ?? {};
  return {};
}

export default api;