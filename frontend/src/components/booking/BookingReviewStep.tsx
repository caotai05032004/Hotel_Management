import { ArrowLeft, CreditCard } from 'lucide-react';
import Button from '../ui/Button';
import { computeBookingEstimate } from '../../utils/bookingEstimate';
import type { DatPhongCreateRequest, HangPhongResponse } from '../../types';

interface BookingReviewStepProps {
  payload: DatPhongCreateRequest;
  hangPhong: HangPhongResponse;
  onBack: () => void;
  onProceedToPayment: () => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

export default function BookingReviewStep({ payload, hangPhong, onBack, onProceedToPayment }: BookingReviewStepProps) {
  const { nights, estimatedTotal, depositAmount } = computeBookingEstimate(
    hangPhong.basePrice,
    payload.checkInDate,
    payload.checkOutDate
  );

  return (
    <div className="mt-3 space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Xác nhận thông tin đặt phòng</h2>
        <p className="text-sm text-gray-500">Vui lòng kiểm tra lại thông tin trước khi tiến hành thanh toán cọc.</p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2 text-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Thông tin người đặt</h3>
        <div className="flex justify-between">
          <span className="text-gray-500">Họ và tên:</span>
          <span className="font-semibold text-gray-900">{payload.contactName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Số điện thoại:</span>
          <span className="font-semibold text-gray-900">{payload.contactPhone}</span>
        </div>
        {payload.contactEmail && (
          <div className="flex justify-between">
            <span className="text-gray-500">Email:</span>
            <span className="font-semibold text-gray-900">{payload.contactEmail}</span>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2 text-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Dịch vụ đã chọn</h3>
        <div className="flex justify-between">
          <span className="text-gray-500">Hạng phòng:</span>
          <span className="font-semibold text-gray-900">{hangPhong.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Thời gian lưu trú:</span>
          <span className="font-semibold text-gray-900">
            {payload.checkInDate} → {payload.checkOutDate} ({nights} đêm)
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Số khách:</span>
          <span className="font-semibold text-gray-900">
            {payload.numAdults} người lớn{payload.numChildren ? `, ${payload.numChildren} trẻ em` : ''}
          </span>
        </div>
        {payload.specialRequest && (
          <div className="flex justify-between gap-4">
            <span className="text-gray-500 shrink-0">Ghi chú:</span>
            <span className="font-semibold text-gray-900 text-right">{payload.specialRequest}</span>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Giá phòng / đêm:</span>
          <span className="font-semibold text-gray-900">{formatCurrency(hangPhong.basePrice)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Tổng tiền dự kiến ({nights} đêm):</span>
          <span className="font-semibold text-gray-900">{formatCurrency(estimatedTotal)}</span>
        </div>
        <div className="flex justify-between border-t border-emerald-200 pt-2 font-bold">
          <span className="text-emerald-800">Tiền cọc cần thanh toán (30%):</span>
          <span className="text-emerald-800">{formatCurrency(depositAmount)}</span>
        </div>
      </div>

      <div className="pt-2 flex justify-between gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex items-center gap-1.5">
          <ArrowLeft size={16} /> Quay lại
        </Button>
        <Button type="button" onClick={onProceedToPayment} className="flex items-center gap-1.5">
          <CreditCard size={16} /> Xử lý thanh toán
        </Button>
      </div>
    </div>
  );
}
