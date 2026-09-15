/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { UserCheck, RefreshCw } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Loading } from '../../components/ui/Feedback';
import { toast } from 'sonner';
import BookingFilterBar from '../../components/admin/booking/BookingFilterBar';
import BookingTable from '../../components/admin/booking/BookingTable';
import CheckInDrawer from '../../components/admin/booking/CheckInDrawer';
import BookingDetailModal from '../../components/booking/BookingDetailModal';
import RoomTransferModal from '../../components/admin/booking/RoomTransferModal';
import { datPhongService, phongService } from '../../services';
import { getErrorMessage } from '../../services/http';
import type { DatPhongResponse, PhongResponse } from '../../types';

export default function DatPhongPage() {
  const [bookings, setBookings] = useState<DatPhongResponse[]>([]);
  const [rooms, setRooms] = useState<PhongResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [checkInBooking, setCheckInBooking] = useState<DatPhongResponse | null>(null);
  const [detailBooking, setDetailBooking] = useState<DatPhongResponse | null>(null);
  const [transferBooking, setTransferBooking] = useState<DatPhongResponse | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bookingData, roomPaging] = await Promise.all([
        datPhongService.layTatCaDatPhongAdmin(),
        phongService.filter({ size: 100 }),
      ]);
      setBookings(bookingData);
      setRooms(roomPaging.data);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConfirmBooking = async (id: string) => {
    if (!window.confirm('Xác nhận đơn đặt phòng này? (Chuyển trạng thái sang CONFIRMED)')) return;
    try {
      await datPhongService.xacNhanDatPhong(id);
      toast.success('Đã xác nhận đơn đặt phòng');
      await loadData();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleCheckOutBooking = async (id: string) => {
    if (!window.confirm('Xác nhận hoàn tất Check-out và thanh toán cho đơn này?')) return;
    try {
      await datPhongService.checkOutAdmin(id);
      toast.success('Đã hoàn tất Check-out');
      await loadData();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleNoShowBooking = async (id: string) => {
    if (!window.confirm('Đánh dấu khách NO SHOW (Không đến nhận phòng)?')) return;
    try {
      await datPhongService.danhDauNoShow(id);
      toast.success('Đã đánh dấu No Show');
      await loadData();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleCancelBooking = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn đặt phòng này? (Áp dụng chính sách hủy 48h)')) return;
    try {
      await datPhongService.huyDatPhong(id);
      toast.success('Đã hủy đơn đặt phòng');
      await loadData();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  };

  // Filter logic
  const filteredBookings = bookings.filter((b) => {
    const matchSearch =
      b.bookingCode.toLowerCase().includes(search.toLowerCase()) ||
      b.contactName.toLowerCase().includes(search.toLowerCase()) ||
      (b.contactPhone && b.contactPhone.includes(search));

    const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <Loading label="Đang tải danh sách đặt phòng & lễ tân…" />;

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserCheck className="text-emerald-600" size={28} /> Quản lý Đặt phòng & Check-in Lễ tân
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tiếp nhận đơn từ khách hàng, gán phòng thực tế và lưu khai báo lưu trú theo Luật Cư trú & Nghị định 356/2025.
          </p>
        </div>
        <Button onClick={loadData} variant="outline" className="flex items-center gap-2">
          <RefreshCw size={14} /> Tải lại
        </Button>
      </div>

      {/* Filter Bar Component */}
      <BookingFilterBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Table Component */}
      <BookingTable
        bookings={filteredBookings}
        onOpenCheckIn={(b) => setCheckInBooking(b)}
        onConfirmBooking={handleConfirmBooking}
        onRoomTransfer={(b) => setTransferBooking(b)}
        onCheckOutBooking={handleCheckOutBooking}
        onNoShowBooking={handleNoShowBooking}
        onViewDetail={(b) => setDetailBooking(b)}
        onCancelBooking={handleCancelBooking}
      />

      {/* Modal / Drawer Check-in Component */}
      {checkInBooking && (
        <CheckInDrawer
          booking={checkInBooking}
          rooms={rooms}
          onClose={() => setCheckInBooking(null)}
          onSuccess={() => {
            setCheckInBooking(null);
            loadData();
          }}
        />
      )}

      {/* Detail Modal */}
      {detailBooking && (
        <BookingDetailModal
          booking={detailBooking}
          onClose={() => setDetailBooking(null)}
        />
      )}

      {/* Room Transfer Modal */}
      {transferBooking && (
        <RoomTransferModal
          booking={transferBooking}
          onClose={() => setTransferBooking(null)}
          onSuccess={() => {
            setTransferBooking(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}
