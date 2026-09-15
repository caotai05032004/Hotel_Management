/* ==========================================================================
 * Kiểu dữ liệu ánh xạ 1-1 với DTO của backend (Hạng phòng)
 * ========================================================================== */

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
