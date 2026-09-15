/* ==========================================================================
 * Kiểu dữ liệu ánh xạ 1-1 với DTO / enum của backend (Phòng)
 * ========================================================================== */

export const OCCUPANCY_STATUS = ['VACANT', 'OCCUPIED'] as const;
export type OccupancyStatus = (typeof OCCUPANCY_STATUS)[number];

export const HOUSEKEEPING_STATUS = ['CLEAN', 'DIRTY', 'INSPECTED'] as const;
export type HousekeepingStatus = (typeof HOUSEKEEPING_STATUS)[number];

export const SERVICE_STATUS = ['IN_SERVICE', 'OUT_OF_ORDER', 'OUT_OF_SERVICE'] as const;
export type ServiceStatus = (typeof SERVICE_STATUS)[number];

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
