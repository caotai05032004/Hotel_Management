/** Giải mã payload JWT phía client (chỉ để đọc uid / roles — KHÔNG dùng để xác thực). */
export interface JwtPayload {
  sub?: string;
  uid?: string;
  roles?: string[];
  exp?: number;
  iat?: number;
}

export function decodeJwt(token: string | null): JwtPayload | null {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json))) as JwtPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string | null): boolean {
  const payload = decodeJwt(token);
  if (!payload?.exp) return false;
  return payload.exp * 1000 <= Date.now();
}
