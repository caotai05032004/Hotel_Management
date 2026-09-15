import React, { useEffect, useState } from 'react';
import { BedDouble, Compass, Utensils, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../components/ui/Button';
import { Loading } from '../components/ui/Feedback';
import { toast } from 'sonner';
import { datPhongService } from '../services';
import { getErrorMessage } from '../services/http';
import yeuCauDuLieuService from '../services/yeuCauDuLieuService';
import type { DatPhongResponse } from '../types';
import BookingDetailModal from '../components/booking/BookingDetailModal';
import DepositPaymentModal from '../components/booking/DepositPaymentModal';
import MyBookingCard from '../components/booking/MyBookingCard';
import TourBookingsTab from '../components/booking/TourBookingsTab';
import DiningBookingsTab from '../components/booking/DiningBookingsTab';
import { RESORT_NAME } from '@/constants/system.constant';

type ServiceTab = 'ROOMS' | 'TOURS' | 'DINING';

export const MyBookings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ServiceTab>('ROOMS');
  const [roomBookings, setRoomBookings] = useState<DatPhongResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 4; // 2 booking/hàng, 2 hàng = 4 booking/trang

  // Modals & Request state
  const [detailBooking, setDetailBooking] = useState<DatPhongResponse | null>(null);
  const [depositBooking, setDepositBooking] = useState<DatPhongResponse | null>(null);
  const [requestingErasureId, setRequestingErasureId] = useState<string | null>(null);
  const [requestedErasureIds, setRequestedErasureIds] = useState<string[]>([]);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const res = await datPhongService.layDanhSachCuaToi();
      setRoomBookings(res);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMyBookings();
  }, []);

  const handleGuestCheckOut = async (id: string) => {
    if (!window.confirm('Xác nhận trả phòng (Check-out)?')) return;
    try {
      await datPhongService.checkOutGuest(id);
      toast.success('Đã trả phòng thành công');
      await fetchMyBookings();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleRequestErasure = async (bookingId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn gửi Yêu cầu Xóa Dữ liệu Cá nhân theo Nghị định 356/2025/NĐ-CP?')) {
      return;
    }
    try {
      setRequestingErasureId(bookingId);
      await yeuCauDuLieuService.guiYeuCauXoa('Khách hàng tự yêu cầu xóa dữ liệu cá nhân sau chuyến đi');
      setRequestedErasureIds((prev) => [...prev, bookingId]);
      toast.success('Đã gửi Yêu cầu Xóa Dữ liệu Cá nhân thành công! Trang Admin sẽ tiếp nhận và xử lý.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setRequestingErasureId(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (
      !window.confirm(
        'Bạn có chắc chắn muốn hủy đơn đặt phòng này? (Áp dụng chính sách hủy 48h: >48h hoàn 100% cọc, <=48h phạt 100% cọc)'
      )
    )
      return;
    try {
      await datPhongService.huyDatPhong(id);
      toast.success('Đã hủy đơn đặt phòng');
      await fetchMyBookings();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(roomBookings.length / pageSize) || 1;
  const paginatedBookings = roomBookings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="container-page py-10 min-h-screen">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-navy-900 sm:text-4xl">Dịch vụ đã đặt của tôi</h1>
        <p className="mt-2 text-sm text-ink-600">
          Theo dõi và quản trị toàn bộ lịch trình chuyến đi (Chỗ ở, Tour trải nghiệm, Đặt bàn nhà hàng).
        </p>
      </div>

      {/* Service Tabs */}
      <div className="flex border-b border-cream-300 gap-2 overflow-x-auto mb-8">
        <button
          type="button"
          onClick={() => {
            setActiveTab('ROOMS');
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeTab === 'ROOMS'
            ? 'border-gold-500 text-gold-700 bg-gold-50/50 rounded-t-xl'
            : 'border-transparent text-ink-400 hover:text-navy-900'
            }`}
        >
          <BedDouble size={18} /> Chỗ ở (Phòng nghỉ)
          {roomBookings.length > 0 && (
            <span className="ml-1 rounded-full bg-gold-200 px-2 py-0.5 text-xs text-gold-800">
              {roomBookings.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('TOURS')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeTab === 'TOURS'
            ? 'border-gold-500 text-gold-700 bg-gold-50/50 rounded-t-xl'
            : 'border-transparent text-ink-400 hover:text-navy-900'
            }`}
        >
          <Compass size={18} /> Tour du lịch
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('DINING')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeTab === 'DINING'
            ? 'border-gold-500 text-gold-700 bg-gold-50/50 rounded-t-xl'
            : 'border-transparent text-ink-400 hover:text-navy-900'
            }`}
        >
          <Utensils size={18} /> Nhà hàng & Thức uống
        </button>
      </div>

      {/* Tab 1: ROOMS */}
      {activeTab === 'ROOMS' && (
        <div className="space-y-6">
          {loading ? (
            <Loading label="Đang tải danh sách phòng nghỉ đã đặt…" />
          ) : roomBookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-cream-300 bg-white p-12 text-center">
              <BedDouble size={48} className="mx-auto text-ink-300 mb-3" />
              <h3 className="text-lg font-bold text-navy-900">Bạn chưa có đơn đặt phòng nào</h3>
              <p className="text-sm text-ink-400 mt-1 max-w-md mx-auto">
                Khám phá danh sách các hạng phòng cao cấp 5 sao tại {RESORT_NAME} và đặt phòng ngay hôm nay.
              </p>
            </div>
          ) : (
            <>
              {/* 2 Booking / hàng */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paginatedBookings.map((booking) => (
                  <MyBookingCard
                    key={booking.id}
                    booking={booking}
                    isRequestedErasure={requestedErasureIds.includes(booking.id)}
                    isRequestingErasure={requestingErasureId === booking.id}
                    onOpenDetail={(b) => setDetailBooking(b)}
                    onOpenDeposit={(b) => setDepositBooking(b)}
                    onCancel={handleCancel}
                    onCheckOut={handleGuestCheckOut}
                    onRequestErasure={handleRequestErasure}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 pt-6">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft size={16} /> Trang trước
                  </Button>
                  <span className="text-sm font-semibold text-gray-700">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="flex items-center gap-1"
                  >
                    Trang sau <ChevronRight size={16} />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Tab 2: TOURS */}
      {activeTab === 'TOURS' && <TourBookingsTab />}

      {/* Tab 3: DINING */}
      {activeTab === 'DINING' && <DiningBookingsTab />}

      {/* Modals */}
      {detailBooking && (
        <BookingDetailModal booking={detailBooking} onClose={() => setDetailBooking(null)} />
      )}

      {depositBooking && (
        <DepositPaymentModal
          booking={depositBooking}
          onClose={() => setDepositBooking(null)}
          onSuccess={() => {
            setDepositBooking(null);
            fetchMyBookings();
          }}
        />
      )}
    </div>
  );
};

export default MyBookings;
