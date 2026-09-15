import React from 'react';
import { Calendar, Clock, FileText, QrCode, LogOut, ShieldAlert, ShieldCheck } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import type { DatPhongResponse } from '../../types';

export interface MyBookingCardProps {
  booking: DatPhongResponse;
  isRequestedErasure: boolean;
  isRequestingErasure: boolean;
  onOpenDetail: (booking: DatPhongResponse) => void;
  onOpenDeposit: (booking: DatPhongResponse) => void;
  onCancel: (id: string) => void;
  onCheckOut: (id: string) => void;
  onRequestErasure: (id: string) => void;
}

const getBookingStatusBadge = (status: string) => {
  switch (status) {
    case 'PENDING':
      return <Badge tone="gold">Chờ cọc / xác nhận</Badge>;
    case 'CONFIRMED':
      return <Badge tone="blue">Đã xác nhận</Badge>;
    case 'CHECKED_IN':
      return <Badge tone="green">Đang lưu trú</Badge>;
    case 'CHECKED_OUT':
      return <Badge tone="slate">Đã hoàn thành</Badge>;
    case 'CANCELLED':
      return <Badge tone="red">Đã hủy</Badge>;
    default:
      return <Badge tone="slate">{status}</Badge>;
  }
};

export const MyBookingCard: React.FC<MyBookingCardProps> = ({
  booking,
  isRequestedErasure,
  isRequestingErasure,
  onOpenDetail,
  onOpenDeposit,
  onCancel,
  onCheckOut,
  onRequestErasure,
}) => {
  const isAnonymized =
    booking.contactPhone === '0000000000' ||
    (booking.contactEmail ? booking.contactEmail.includes('deleted.local') : false);

  return (
    <div className="rounded-2xl border border-cream-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="flex justify-between items-start border-b border-cream-100 pb-3 gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-bold text-emerald-800 text-sm">
              #{booking.bookingCode}
            </span>
            {getBookingStatusBadge(booking.status)}
          </div>

          <div className="text-right">
            <p className="text-[12px] text-ink-400 block">
              Tổng tiền: {" "}
              <span className="text-base font-black text-gold-700">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                  booking.estimatedTotal
                )}
              </span>
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid sm:grid-cols-2 gap-3 pt-3 text-xs text-ink-600">
          <div className="flex items-start gap-1.5">
            <Calendar size={15} className="text-gold-600 mt-0.5 shrink-0" />
            <div>
              <span className="text-[11px] text-ink-400 block">Lưu trú</span>
              <span className="font-semibold text-navy-900">
                {booking.checkInDate} → {booking.checkOutDate}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-1.5">
            <Clock size={15} className="text-blue-600 mt-0.5 shrink-0" />
            <div>
              <span className="text-[11px] text-ink-400 block">Phòng thực tế</span>
              <span className="font-semibold text-navy-900">
                {booking.roomNumber ? `Phòng ${booking.roomNumber}` : 'Check-in tại quầy'}
              </span>
            </div>
          </div>
        </div>

        {/* Privacy Erasure Warning Badge */}
        {isAnonymized && (
          <div className="mt-3 p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-800 flex items-center gap-1.5 font-medium">
            <ShieldCheck size={15} className="text-emerald-600 shrink-0" />
            <span>Dữ liệu cá nhân đã được xóa / ẩn danh theo Nghị định 356/2025/NĐ-CP</span>
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className="mt-4 flex flex-wrap justify-between items-center border-t border-cream-100 pt-3 gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onOpenDetail(booking)}
          className="flex items-center gap-1 text-xs"
        >
          <FileText size={13} /> Xem Chi Tiết
        </Button>

        <div className="flex items-center gap-2 flex-wrap">
          {booking.status === 'PENDING' && (
            <>
              <Button
                size="sm"
                onClick={() => onOpenDeposit(booking)}
                className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1 text-xs"
              >
                <QrCode size={13} /> Thanh toán cọc
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCancel(booking.id)}
                className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
              >
                Hủy đơn
              </Button>
            </>
          )}

          {booking.status === 'CONFIRMED' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCancel(booking.id)}
              className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
            >
              Hủy đơn
            </Button>
          )}

          {booking.status === 'CHECKED_IN' && (
            <Button
              size="sm"
              onClick={() => onCheckOut(booking.id)}
              className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1 text-xs"
            >
              <LogOut size={13} /> Check-out ngay
            </Button>
          )}

          {booking.status === 'CHECKED_OUT' && !isAnonymized && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRequestErasure(booking.id)}
              disabled={isRequestingErasure || isRequestedErasure}
              className="text-amber-700 border-amber-300 hover:bg-amber-50 flex items-center gap-1 text-xs"
            >
              <ShieldAlert size={13} />
              {isRequestingErasure
                ? 'Đang gửi...'
                : isRequestedErasure
                  ? 'Đã gửi yêu cầu xóa'
                  : 'Yêu cầu Xóa Dữ liệu (ND356)'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookingCard;
