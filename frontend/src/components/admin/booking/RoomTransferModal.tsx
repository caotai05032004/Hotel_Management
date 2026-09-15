/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { X, ArrowLeftRight } from 'lucide-react';
import type { DatPhongResponse, PhongResponse } from '../../../types';
import phongService from '../../../services/phongService';
import datPhongService from '../../../services/datPhongService';
import Button from '../../ui/Button';

interface RoomTransferModalProps {
  booking: DatPhongResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RoomTransferModal({ booking, onClose, onSuccess }: RoomTransferModalProps) {
  const [vacantRooms, setVacantRooms] = useState<PhongResponse[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!booking || !booking.hangPhongId) return;

    setLoading(true);
    phongService
      .filter({
        hangPhongId: booking.hangPhongId,
        occupancyStatus: 'VACANT',
      })
      .then((res) => {
        setVacantRooms(res.data || []);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
        setError('Không thể tải danh sách phòng trống: ' + msg);
      })
      .finally(() => setLoading(false));
  }, [booking]);

  if (!booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId) {
      setError('Vui lòng chọn phòng trống mới để đổi');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await datPhongService.doiPhongLuuTru(booking.id, selectedRoomId);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi đổi phòng';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 bg-gray-900 text-white">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <ArrowLeftRight size={18} className="text-amber-400" /> Đổi phòng cho khách
          </h3>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-lg cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
            <p className="font-semibold">Đơn #{booking.bookingCode} - {booking.contactName}</p>
            <p>Hạng phòng: {booking.hangPhongName}</p>
            <p>
              Phòng hiện tại:{' '}
              <span className="font-bold text-red-700">
                {booking.roomNumber ? `Phòng ${booking.roomNumber}` : 'N/A'}
              </span>
            </p>
          </div>

          {error && <div className="p-3 text-xs text-red-600 bg-red-50 rounded-xl border border-red-200">{error}</div>}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Chọn phòng trống mới (Cùng hạng phòng)
            </label>
            {loading ? (
              <p className="text-xs text-gray-500 py-2">Đang tải danh sách phòng trống...</p>
            ) : vacantRooms.length === 0 ? (
              <p className="text-xs text-red-500 font-semibold py-2">
                Không có phòng trống nào cùng hạng phòng này để đổi!
              </p>
            ) : (
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-amber-500 focus:outline-none"
              >
                <option value="">-- Chọn phòng thực tế --</option>
                {vacantRooms.map((p) => (
                  <option key={p.id} value={p.id}>
                    Phòng {p.roomNumber} (Tầng {p.floorNo}) - {p.hangPhongName}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="outline" type="button" onClick={onClose}>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={submitting || vacantRooms.length === 0 || !selectedRoomId}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {submitting ? 'Đang đổi phòng...' : 'Xác nhận Đổi phòng'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
