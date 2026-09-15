/* ==========================================================================
 * Kiểu dữ liệu ánh xạ 1-1 với DTO / enum của backend (Đặt phòng & Check-in)
 * ========================================================================== */

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface DatPhongCreateRequest {
  hangPhongId: string;
  contactName: string;
  contactEmail?: string;
  contactPhone: string;
  /** Không bắt buộc khi đặt online — lễ tân sẽ xác minh & bổ sung khi check-in */
  idNumber?: string;
  idType?: 'CCCD' | 'PASSPORT';
  checkInDate: string;
  checkOutDate: string;
  numAdults: number;
  numChildren: number;
  specialRequest?: string;
  consentAccepted: boolean;
}

export interface GuestDeclarationDto {
  fullName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  idType?: 'CCCD' | 'PASSPORT';
  idNumber: string;
  nationality?: string;
  permanentAddress?: string;
  isPrimaryGuest?: boolean;
}

export interface CheckInRequest {
  chiTietDatPhongId: string;
  phongId: string;
  /** CCCD/Hộ chiếu của người đặt phòng — chỉ cần gửi khi đơn online chưa có sẵn số này */
  contactIdNumber?: string;
  danhSachKhach: GuestDeclarationDto[];
}

export interface DatPhongResponse {
  id: string;
  bookingCode: string;
  contactName: string;
  contactEmail: string | null;
  contactPhone: string | null;
  idNumberMasked: string | null;
  checkInDate: string;
  checkOutDate: string;
  numAdults: number;
  numChildren: number;
  status: BookingStatus;
  depositAmount: number;
  estimatedTotal: number;
  specialRequest: string | null;
  createdAt: string;
  hangPhongId: string | null;
  hangPhongName: string | null;
  chiTietDatPhongId: string | null;
  phongId: string | null;
  roomNumber: string | null;
}
