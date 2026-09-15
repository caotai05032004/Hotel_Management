import { useState } from 'react';
import { X, QrCode, CheckCircle2 } from 'lucide-react';
import type { DatPhongResponse } from '../../types';
import datPhongService from '../../services/datPhongService';
import { getErrorMessage } from '../../services/http';
import Button from '../ui/Button';
import { toast } from 'sonner';

interface DepositPaymentModalProps {
  booking: DatPhongResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DepositPaymentModal({ booking, onClose, onSuccess }: DepositPaymentModalProps) {
  const [loading, setLoading] = useState(false);

  if (!booking) return null;

  const total = booking.estimatedTotal || 0;
  const deposit = booking.depositAmount || total * 0.3;

  const handleSimulatePayment = async () => {
    try {
      setLoading(true);
      await datPhongService.thanhToanCoc(booking.id);
      toast.success('Đã xác nhận thanh toán cọc');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 bg-gray-900 text-white">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <QrCode size={20} className="text-gold-400" /> Thanh toán Cọc (SePay VietQR)
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 text-center space-y-4">
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 text-xs font-medium">
            Mã đơn: <span className="font-bold font-mono">#{booking.bookingCode}</span> | Khách: <span className="font-bold">{booking.contactName}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 inline-block shadow-soft">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=SEPAY_DATPHONG_${booking.bookingCode}`}
              alt="VietQR SePay"
              className="w-44 h-44 mx-auto"
            />
            <p className="text-[11px] text-gray-500 mt-2 font-mono">Cú pháp: DatPhong_{booking.bookingCode}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-gray-500">Số tiền cọc cần chuyển khoản (30%):</p>
            <p className="text-2xl font-black text-amber-600">
              {deposit.toLocaleString('vi-VN')} VNĐ
            </p>
          </div>

          <p className="text-xs text-gray-500 italic">
            Quét mã QR để chuyển khoản. Sau khi nhận được tiền cọc, SePay sẽ gửi Webhook xác nhận tự động.
          </p>

          <div className="pt-2">
            <Button
              onClick={handleSimulatePayment}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 py-3"
            >
              <CheckCircle2 size={18} />
              {loading ? 'Đang xử lý cọc...' : 'Giả lập SePay Webhook (Xác nhận cọc)'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
