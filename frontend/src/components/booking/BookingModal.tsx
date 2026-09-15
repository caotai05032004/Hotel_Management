import { useState } from 'react';
import { X } from 'lucide-react';
import BookingForm from './BookingForm';
import BookingReviewStep from './BookingReviewStep';
import BookingDepositStep from './BookingDepositStep';
import BookingSuccessView from './BookingSuccessView';
import { toast } from 'sonner';
import { datPhongService } from '../../services';
import { getErrorMessage } from '../../services/http';
import type { DatPhongFormData } from '../../validations/datPhongValidation';
import type { DatPhongCreateRequest, DatPhongResponse, HangPhongResponse } from '../../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  hangPhong: HangPhongResponse | null;
}

type Step = 'form' | 'review' | 'deposit' | 'success';

export default function BookingModal({ isOpen, onClose, hangPhong }: BookingModalProps) {
  const [step, setStep] = useState<Step>('form');
  const [formSnapshot, setFormSnapshot] = useState<DatPhongFormData | undefined>(undefined);
  const [payload, setPayload] = useState<DatPhongCreateRequest | null>(null);
  const [successBooking, setSuccessBooking] = useState<DatPhongResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !hangPhong) return null;

  // Reset dữ liệu đã điền khi thực sự đóng Modal
  const handleClose = () => {
    setStep('form');
    setFormSnapshot(undefined);
    setPayload(null);
    setSuccessBooking(null);
    onClose();
  };

  const handleConfirmPaid = async () => {
    if (!payload) return;
    try {
      setSubmitting(true);
      // Đơn luôn tạo ở trạng thái PENDING - lễ tân xác nhận đã nhận cọc thì mới chuyển sang CONFIRMED.
      // Chưa tích hợp SePay thật nên bước "Thanh toán đã hoàn tất" chỉ là khách tự khai đã chuyển khoản,
      const created = await datPhongService.taoDatPhong(payload);
      setSuccessBooking(created);
      setStep('success');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl transition-all">
        {/* Nút đóng */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        {step === 'form' && (
          <div>
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Đặt phòng {hangPhong.name}</h2>
              <p className="text-sm text-gray-500">Vui lòng điền thông tin để giữ phòng của bạn tại Grandeur Hotel.</p>
            </div>

            <BookingForm
              hangPhong={hangPhong}
              initialValues={formSnapshot}
              onSubmit={(fd, p) => {
                setFormSnapshot(fd);
                setPayload(p);
                setStep('review');
              }}
              onCancel={handleClose}
            />
          </div>
        )}

        {step === 'review' && payload && (
          <BookingReviewStep
            payload={payload}
            hangPhong={hangPhong}
            onBack={() => setStep('form')}
            onProceedToPayment={() => setStep('deposit')}
          />
        )}

        {step === 'deposit' && payload && (
          <BookingDepositStep
            payload={payload}
            hangPhong={hangPhong}
            onBack={() => setStep('review')}
            onConfirmPaid={handleConfirmPaid}
            loading={submitting}
          />
        )}

        {step === 'success' && successBooking && (
          <BookingSuccessView booking={successBooking} onClose={handleClose} />
        )}
      </div>
    </div>
  );
}
