import React, { useState } from 'react';
import { LogIn, Shield, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import Button from '../../ui/Button';
import { Input } from '../../ui/Field';
import { datPhongService } from '../../../services';
import type { DatPhongResponse, PhongResponse, CheckInRequest, GuestDeclarationDto } from '../../../types';

interface CheckInDrawerProps {
  booking: DatPhongResponse;
  rooms: PhongResponse[];
  onClose: () => void;
  onSuccess: () => void;
}

const ID_NUMBER_REGEX = /^[0-9A-Za-z]{8,20}$/;

export default function CheckInDrawer({
  booking,
  rooms,
  onClose,
  onSuccess,
}: CheckInDrawerProps) {
  const [selectedPhongId, setSelectedPhongId] = useState<string>(booking.phongId || '');
  // Đơn đặt online không bắt buộc CCCD -> nếu chưa có, lễ tân phải đối chiếu giấy tờ thật và nhập bổ sung ở đây
  const contactIdNumberRequired = !booking.idNumberMasked;
  const [contactIdNumber, setContactIdNumber] = useState(booking.idNumberMasked ?? '');
  const [contactIdNumberError, setContactIdNumberError] = useState<string | null>(null);
  const [guests, setGuests] = useState<GuestDeclarationDto[]>([
    {
      fullName: booking.contactName,
      dateOfBirth: '2000-01-01',
      gender: 'MALE',
      idType: 'CCCD',
      idNumber: '',
      nationality: 'Việt Nam',
      permanentAddress: '',
      isPrimaryGuest: true,
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking.chiTietDatPhongId) {
      toast.error('Chi tiết đơn đặt phòng không hợp lệ');
      return;
    }
    if (!selectedPhongId) {
      toast.error('Vui lòng chọn số phòng thực tế để gán cho khách');
      return;
    }

    const trimmedContactId = contactIdNumber.trim();
    if (contactIdNumberRequired && !ID_NUMBER_REGEX.test(trimmedContactId)) {
      setContactIdNumberError('Số CCCD/Hộ chiếu phải từ 8 đến 20 ký tự số/chữ');
      return;
    }
    setContactIdNumberError(null);

    // Đối chiếu CCCD của người đặt phòng (đã có sẵn hoặc vừa nhập) với CCCD thực tế khách khai báo lúc check-in
    const primaryGuestIdNumber = (guests[0]?.idNumber ?? '').trim();
    if (trimmedContactId && primaryGuestIdNumber && trimmedContactId !== primaryGuestIdNumber) {
      toast.error(
        'Số CCCD của người đặt phòng không khớp với số CCCD thực tế khách khai báo lưu trú. Vui lòng kiểm tra lại giấy tờ.'
      );
      return;
    }

    try {
      setLoading(true);

      const request: CheckInRequest = {
        chiTietDatPhongId: booking.chiTietDatPhongId,
        phongId: selectedPhongId,
        contactIdNumber: trimmedContactId,
        danhSachKhach: guests,
      };

      await datPhongService.checkInLuuTru(booking.id, request);
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể thực hiện check-in';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-4 sm:p-5 shadow-2xl space-y-3 max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-start border-b border-gray-100 pb-2">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <LogIn className="text-emerald-600" size={20} />Check-in Khách sạn
            </h2>
            <p className="text-xs text-gray-500">
              Mã đơn: <span className="font-bold text-emerald-800">#{booking.bookingCode}</span> - Khách: {booking.contactName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1 cursor-pointer"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* 1. Gán phòng vật lý thực tế */}
          <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
            <label className="block text-xs font-bold text-emerald-900 mb-1">
              1. Chọn Phòng thực tế để gán cho khách *
            </label>
            {(() => {
              const matchingRooms = rooms.filter(
                (r) =>
                  (!booking.hangPhongId || r.hangPhongId === booking.hangPhongId) &&
                  (r.occupancyStatus === 'VACANT' || r.id === selectedPhongId)
              );

              return (
                <>
                  <select
                    value={selectedPhongId}
                    onChange={(e) => setSelectedPhongId(e.target.value)}
                    className="w-full p-2.5 bg-white border border-emerald-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="">-- Chọn phòng thực tế --</option>
                    {matchingRooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        Phòng {r.roomNumber} (Tầng {r.floorNo}) - {r.hangPhongName}
                      </option>
                    ))}
                  </select>
                  {matchingRooms.length === 0 && (
                    <p className="mt-1.5 text-xs font-medium text-amber-700">
                      Không có phòng trống thuộc hạng phòng{' '}
                      <span className="font-bold">{booking.hangPhongName || 'không xác định'}</span> ({rooms.length} phòng
                      đang tải, {rooms.filter((r) => r.occupancyStatus === 'VACANT').length} phòng trống tổng cộng). Kiểm
                      tra lại danh sách phòng hoặc đổi phòng phù hợp.
                    </p>
                  )}
                </>
              );
            })()}
          </div>

          {/* 2. CCCD của người đặt phòng */}
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
            <label className="text-xs font-bold text-gray-800 mb-1 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-600" />
              2. Số CCCD / Hộ chiếu của người đặt phòng {contactIdNumberRequired && '*'}
            </label>
            <Input
              placeholder={
                contactIdNumberRequired
                  ? 'Đơn online chưa có CCCD - đối chiếu giấy tờ thật và nhập tại đây'
                  : 'Đối chiếu giấy tờ thật, sửa lại nếu cần'
              }
              value={contactIdNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setContactIdNumber(e.target.value);
                if (contactIdNumberError) setContactIdNumberError(null);
              }}
              error={contactIdNumberError ?? undefined}
              required={contactIdNumberRequired}
            />
            {!contactIdNumberRequired && (
              <p className="mt-1 text-[11px] text-gray-400">
                Đơn đã có sẵn CCCD — chỉ cần sửa nếu phát hiện sai khi đối chiếu giấy tờ.
              </p>
            )}
          </div>

          {/* 3. Khai báo lưu trú theo Luật Cư trú */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
              <Shield size={16} className="text-emerald-600" /> 3. Khai báo lưu trú (Luật Cư trú & Nghị định 356/2025)
            </h3>

            {guests.map((g, idx) => (
              <div key={idx} className="p-3 border border-gray-200 rounded-xl bg-gray-50/50 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Họ tên khách lưu trú"
                    value={g.fullName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const updated = [...guests];
                      updated[idx].fullName = e.target.value;
                      setGuests(updated);
                    }}
                    required
                  />
                  <Input
                    label="Số CCCD / Hộ chiếu thực tế"
                    placeholder="Nhập số CCCD/Hộ chiếu đối chiếu với giấy tờ khách xuất trình"
                    value={g.idNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const updated = [...guests];
                      updated[idx].idNumber = e.target.value;
                      setGuests(updated);
                    }}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    label="Ngày sinh"
                    type="date"
                    value={g.dateOfBirth}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const updated = [...guests];
                      updated[idx].dateOfBirth = e.target.value;
                      setGuests(updated);
                    }}
                  />
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Giới tính</label>
                    <select
                      value={g.gender}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        const updated = [...guests];
                        updated[idx].gender = e.target.value as 'MALE' | 'FEMALE' | 'OTHER';
                        setGuests(updated);
                      }}
                      className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                    >
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  </div>
                  <Input
                    label="Quốc tịch"
                    value={g.nationality || 'Việt Nam'}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const updated = [...guests];
                      updated[idx].nationality = e.target.value;
                      setGuests(updated);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onClose}>
              Đóng
            </Button>
            <Button type="submit" loading={loading} className="bg-emerald-600 hover:bg-emerald-700">
              Xác nhận Check-in & Gán phòng
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
