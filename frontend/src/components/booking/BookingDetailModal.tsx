import { X, ShieldCheck, ShieldAlert, DollarSign, Calendar, User, Home } from 'lucide-react';
import type { DatPhongResponse } from '../../types';
import { BOOKING_STATUS_CONFIG } from '../../constants/datPhong.constant';
import Button from '../ui/Button';
import MaskedIdNumber from './MaskedIdNumber';

interface BookingDetailModalProps {
  booking: DatPhongResponse | null;
  onClose: () => void;
}

export default function BookingDetailModal({ booking, onClose }: BookingDetailModalProps) {
  if (!booking) return null;

  const statusConfig = BOOKING_STATUS_CONFIG[booking.status] || {
    label: booking.status,
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    description: '',
  };

  const total = booking.estimatedTotal || 0;
  const deposit = booking.depositAmount || total * 0.3;
  const remaining = Math.max(0, total - deposit);
  const labelStyle = "text-xs text-gray-500 mr-1";
  const valueStyle = "text-[13px] font-semibold text-gray-900";


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl max-h-[90vh]">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-4 bg-gray-900 px-6 py-4 text-white">
          <div className="min-w-0">
            <span className="block font-mono text-xs uppercase tracking-widest text-gold-400">
              Chi tiết đơn đặt phòng
            </span>
            <h3 className="truncate font-mono text-xl font-bold text-white">#{booking.bookingCode}</h3>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-800 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-5 overflow-y-auto p-6">
          {/* Ngày đặt đơn */}
          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <span className="text-xs font-medium text-gray-500">Ngày đặt đơn</span>
            <span className="text-sm font-semibold text-gray-700">
              {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
            </span>
          </div>

          {/* Section 1: Customer Info */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-900">
              <User size={16} className="text-amber-600" /> Thông tin Khách hàng
            </h4>
            <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4 text-sm sm:grid-cols-2">
              <div>
                <span className={labelStyle}>Họ và tên:</span>
                <span className={valueStyle}>{booking.contactName}</span>
              </div>
              <div>
                <span className={labelStyle}>Số điện thoại:</span>
                <span className={valueStyle}>{booking.contactPhone}</span>
              </div>
              <div>
                <span className={labelStyle}>Email:</span>
                <span className={valueStyle}>{booking.contactEmail || 'Chưa cung cấp'}</span>
              </div>
              <div>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <ShieldCheck size={12} className="text-emerald-600" /> Số CCCD:
                  <MaskedIdNumber className={valueStyle} value={booking.idNumberMasked} />
                </span>
                {!booking.idNumberMasked && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-amber-600">
                    <ShieldAlert size={12} /> Sẽ được xác minh khi check-in
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Room & Dates */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-900">
              <Home size={16} className="text-amber-600" /> Thông tin Phòng lưu trú
            </h4>
            <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4 text-sm sm:grid-cols-2">
              <div>
                <span className={labelStyle}>Hạng phòng:</span>
                <span className={valueStyle}>{booking.hangPhongName || 'Chưa xác định'}</span>
              </div>
              <div>
                <span className={labelStyle}>Phòng gán thực tế:</span>
                <span className={`text-[13px] font-semibold ${booking.roomNumber ? 'text-emerald-700' : 'text-amber-600'}`}>
                  {booking.roomNumber ? `Phòng ${booking.roomNumber}` : 'Chưa gán phòng'}
                </span>
              </div>
              <div>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar size={12} /> Check-in:
                  <span className={valueStyle}>{booking.checkInDate}</span>
                </span>
              </div>
              <div>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar size={12} /> Check-out:
                  <span className={valueStyle}>{booking.checkOutDate}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Financial Transparency */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-900">
              <DollarSign size={16} className="text-amber-600" /> Chi tiết thanh toán
            </h4>
            <div className="space-y-2 rounded-xl border border-amber-200/60 bg-amber-50/50 p-4 text-sm">
              <div className="flex items-center justify-between text-gray-600">
                <span>Tổng tiền dự tính:</span>
                <span className="font-semibold text-gray-900">{total.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="flex items-center justify-between text-amber-900">
                <span>Tiền cọc quy định (30%):</span>
                <span className="font-bold">{deposit.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="flex items-center justify-between border-t border-amber-200/60 pt-2 text-base font-bold text-emerald-700">
                <span>Còn lại:</span>
                <span>{remaining.toLocaleString('vi-VN')} VNĐ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 justify-end border-t border-gray-100 bg-gray-50 px-6 py-3">
          <Button variant="dark" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div >
  );
}
