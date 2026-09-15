import { CheckCircle2 } from 'lucide-react';
import Button from '../ui/Button';
import MaskedIdNumber from './MaskedIdNumber';
import type { DatPhongResponse } from '../../types';

interface BookingSuccessViewProps {
  booking: DatPhongResponse;
  onClose: () => void;
}

export default function BookingSuccessView({ booking, onClose }: BookingSuccessViewProps) {
  return (
    <div className="py-6 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <CheckCircle2 size={40} />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">Đặt phòng Thành công!</h2>
      <p className="mt-2 text-sm text-gray-600">
        Mã xác nhận đơn của bạn là: <span className="font-bold text-emerald-700">{booking.bookingCode}</span>
      </p>

      <div className="my-6 rounded-xl border border-gray-100 bg-gray-50 p-4 text-left space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Hạng phòng:</span>
          <span className="font-semibold text-gray-900">{booking.hangPhongName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Họ tên người đặt:</span>
          <span className="font-medium text-gray-900">{booking.contactName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Số CCCD:</span>
          <MaskedIdNumber value={booking.idNumberMasked} className="font-medium text-emerald-800" />
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Số điện thoại:</span>
          <span className="font-medium text-gray-900">{booking.contactPhone}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Thời gian lưu trú:</span>
          <span className="font-medium text-gray-900">
            {booking.checkInDate} đến {booking.checkOutDate}
          </span>
        </div>
        <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold">
          <span className="text-gray-700">Tổng tiền dự kiến:</span>
          <span className="text-emerald-700">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.estimatedTotal)}
          </span>
        </div>
      </div>

      <Button onClick={onClose} size="lg" className="w-full">
        Hoàn tất & Đóng
      </Button>
    </div>
  );
}
