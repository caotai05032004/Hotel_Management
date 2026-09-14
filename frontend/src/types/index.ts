/* ==========================================================================
 * Kiểu dữ liệu ánh xạ 1-1 với DTO / enum của backend Spring Boot
 * (com.dev.backend.dto.*, com.dev.backend.constant.enums.*)
 * ========================================================================== */

/* ----------------------------- Enum ------------------------------------- */
export const USER_STATUS = ['PENDING_VERIFICATION', 'ACTIVE', 'LOCKED', 'ANONYMIZED'] as const;
export type UserStatus = (typeof USER_STATUS)[number];

export const OCCUPANCY_STATUS = ['VACANT', 'OCCUPIED'] as const;
export type OccupancyStatus = (typeof OCCUPANCY_STATUS)[number];

export const HOUSEKEEPING_STATUS = ['CLEAN', 'DIRTY', 'INSPECTED'] as const;
export type HousekeepingStatus = (typeof HOUSEKEEPING_STATUS)[number];

export const SERVICE_STATUS = ['IN_SERVICE', 'OUT_OF_ORDER', 'OUT_OF_SERVICE'] as const;
export type ServiceStatus = (typeof SERVICE_STATUS)[number];

export type FilterOperation =
  | 'EQUALS'
  | 'LESS_THAN'
  | 'LESS_THAN_OR_EQUAL'
  | 'GREATER_THAN'
  | 'GREATER_THAN_OR_EQUAL'
  | 'LIKE'
  | 'ILIKE'
  | 'IN'
  | 'NOT_IN';

export type FilterLogicType = 'AND' | 'OR';
export type SortDirection = 'ASC' | 'DESC';

/** Mã vai trò trong bảng vai_tro */
export type RoleCode = 'GUEST' | 'RECEPTIONIST' | 'MANAGER' | 'ADMIN' | (string & {});

/* --------------------------- Bao response ------------------------------- */
/** Mọi controller đều trả BaseResponse<T> { code, msg, data } */
export interface BaseResponse<T> {
  code: number;
  msg: string;
  data: T;
}

export interface BaseResponsePaging<T> {
  data: T[];
  page: number;
  size: number;
  total: number;
}

/* ------------------------- Filter / sort chung -------------------------- */
export interface FilterCriteria {
  fieldName: string;
  operation: FilterOperation;
  value: unknown;
  logicType?: FilterLogicType;
}

export interface SortCriteria {
  fieldName: string;
  direction: SortDirection;
}

export interface BaseFilterRequest {
  filters?: FilterCriteria[];
  sorts?: SortCriteria[];
  page?: number;
  size?: number;
}

/* ------------------------------- Auth ----------------------------------- */
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

/* ----------------------------- Hạng phòng ------------------------------- */
export interface AnhHangPhongRequest {
  imageUrl: string;
  caption?: string;
  sortOrder?: number;
}

export interface AnhHangPhongResponse {
  id: string;
  imageUrl: string;
  caption: string | null;
  sortOrder: number | null;
}

export interface HangPhongRequest {
  code: string;
  name: string;
  description?: string;
  basePrice: number;
  maxAdults?: number;
  maxChildren?: number;
  bedType?: string;
  areaSqm?: number;
  /** chuỗi JSON, vd: ["wifi","tv","minibar"] */
  amenities?: string;
}

export interface HangPhongResponse {
  id: string;
  code: string;
  name: string;
  description: string | null;
  basePrice: number;
  maxAdults: number | null;
  maxChildren: number | null;
  bedType: string | null;
  areaSqm: number | null;
  amenities: string | null;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  images: AnhHangPhongResponse[] | null;
  soPhong: number | null;
}

/* ------------------------------- Phòng ---------------------------------- */
export interface PhongRequest {
  hangPhongId: string;
  roomNumber: string;
  floorNo: number;
  note?: string;
}

export interface PhongTrangThaiRequest {
  housekeepingStatus?: HousekeepingStatus | null;
  serviceStatus?: ServiceStatus | null;
  note?: string;
}

export interface PhongResponse {
  id: string;
  roomNumber: string;
  floorNo: number;
  occupancyStatus: OccupancyStatus;
  housekeepingStatus: HousekeepingStatus;
  serviceStatus: ServiceStatus;
  note: string | null;
  updatedAt: string | null;
  hangPhongId: string;
  hangPhongCode: string;
  hangPhongName: string;
}

/* ---------------------- Người dùng đang đăng nhập ------------------------ */
export interface CurrentUser {
  id: string | null;
  email: string;
  fullName: string;
  phone: string | null;
  roles: RoleCode[];
}
