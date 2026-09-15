import { LogIn, ShieldCheck, CheckCircle2, ArrowLeftRight, LogOut, UserX, FileText } from 'lucide-react';
import Button from '../../ui/Button';
import type { DatPhongResponse } from '../../../types';
import { BOOKING_STATUS_CONFIG } from '../../../constants/datPhong.constant';
import MaskedIdNumber from '../../booking/MaskedIdNumber';

interface BookingTableProps {
  bookings: DatPhongResponse[];
  onOpenCheckIn: (b: DatPhongResponse) => void;
  onConfirmBooking: (id: string) => void;
  onRoomTransfer: (b: DatPhongResponse) => void;
  onCheckOutBooking: (id: string) => void;
  onNoShowBooking: (id: string) => void;
  onViewDetail: (b: DatPhongResponse) => void;
  onCancelBooking: (id: string) => void;
}

export default function BookingTable({
  bookings,
  onOpenCheckIn,
  onConfirmBooking,
  onRoomTransfer,
  onCheckOutBooking,
  onNoShowBooking,
  onViewDetail,
  onCancelBooking,
}: BookingTableProps) {
  const renderStatusBadge = (status: string) => {
    const cfg = BOOKING_STATUS_CONFIG[status] || {
      label: status,
      color: 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${cfg.color}`}>
        {cfg.label}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-3 py-2.5">Mã Đơn</th>
              <th className="px-3 py-2.5">Khách hàng</th>
              <th className="px-3 py-2.5">Số CCCD</th>
              <th className="px-3 py-2.5">Hạng phòng</th>
              <th className="px-3 py-2.5">Phòng</th>
              <th className="px-3 py-2.5">Trạng thái</th>
              <th className="px-3 py-2.5 text-right">Thao tác Lễ tân</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">
                  Chưa có đơn đặt phòng nào phù hợp.
                </td>
              </tr>
            ) : (
              bookings.map((b) => {
                return (
                  <tr key={b.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => onViewDetail(b)}
                        className="hover:bg-emerald-100 flex items-center gap-1 font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 transition text-xs"
                        title="Bấm để xem chi tiết đơn đặt phòng"
                      >
                        <FileText size={13} className="text-emerald-600" /> #{b.bookingCode}
                      </button>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-gray-900">{b.contactName}</div>
                      <div className="text-xs text-gray-600">{b.contactPhone}</div>
                      {b.contactEmail && (
                        <div className="text-[11px] text-gray-400 max-w-37.5 truncate">{b.contactEmail}</div>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="inline-flex items-center gap-1.5 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
                        <ShieldCheck size={13} className="text-emerald-600" />
                        <MaskedIdNumber value={b.idNumberMasked} className="text-xs font-bold text-gray-700" />
                      </div>
                    </td>
                    <td className="px-3 py-2.5 font-medium text-gray-900">{b.hangPhongName || 'Chưa chọn'}</td>
                    <td className="px-3 py-2.5">
                      {b.roomNumber ? (
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-xs">
                          Phòng {b.roomNumber}
                        </span>
                      ) : (
                        <span className="text-xs text-amber-600 italic bg-amber-50 px-2 py-0.5 rounded">
                          Chưa gán
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">{renderStatusBadge(b.status)}</td>
                    <td className="px-3 py-2.5 text-right whitespace-nowrap">
                      <div className="flex justify-end items-center gap-2">
                        {/* Status PENDING */}
                        {b.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => onConfirmBooking(b.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
                            >
                              <CheckCircle2 size={13} /> Xác nhận
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onCancelBooking(b.id)}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              Hủy
                            </Button>
                          </>
                        )}

                        {/* Status CONFIRMED */}
                        {b.status === 'CONFIRMED' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => onOpenCheckIn(b)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1"
                            >
                              <LogIn size={13} /> Check-in
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onNoShowBooking(b.id)}
                              className="text-slate-600 border-slate-300 hover:bg-slate-50 flex items-center gap-1"
                            >
                              <UserX size={13} /> No Show
                            </Button>
                          </>
                        )}

                        {/* Status CHECKED_IN */}
                        {b.status === 'CHECKED_IN' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => onRoomTransfer(b)}
                              className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1"
                            >
                              <ArrowLeftRight size={13} /> Đổi phòng
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => onCheckOutBooking(b.id)}
                              className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1"
                            >
                              <LogOut size={13} /> Check-out
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
