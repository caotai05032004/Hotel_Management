/* ==========================================================================
 * Kiểu dữ liệu dùng chung: BaseResponse, Filter/Sort, vai trò
 * ========================================================================== */

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
