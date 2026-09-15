import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Copy, Check, QrCode, Landmark } from 'lucide-react';
import Button from '../ui/Button';
import { computeBookingEstimate } from '../../utils/bookingEstimate';
import type { DatPhongCreateRequest, HangPhongResponse } from '../../types';

interface BookingDepositStepProps {
  payload: DatPhongCreateRequest;
  hangPhong: HangPhongResponse;
  onBack: () => void;
  onConfirmPaid: () => void;
  loading: boolean;
}

// Demo/mẫu - sẽ được thay bằng dữ liệu thật khi tích hợp cổng SePay
const DEMO_BANK_INFO = {
  bankName: 'Vietcombank - CN Hồ Chí Minh',
  accountNumber: '1023456789',
  accountHolder: 'KHACH SAN GRANDEUR',
};

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Trình duyệt không hỗ trợ Clipboard API - bỏ qua, người dùng tự copy thủ công
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2">
      <div className="min-w-0">
        <p className="text-[11px] text-gray-500">{label}</p>
        <p className="truncate font-mono text-sm font-semibold text-gray-900">{value}</p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
        title="Sao chép"
      >
        {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
      </button>
    </div>
  );
}

export default function BookingDepositStep({
  payload,
  hangPhong,
  onBack,
  onConfirmPaid,
  loading,
}: BookingDepositStepProps) {
  const { depositAmount } = computeBookingEstimate(hangPhong.basePrice, payload.checkInDate, payload.checkOutDate);
  const depositText = Math.round(depositAmount).toLocaleString('vi-VN');
  const transferContent = `DAT PHONG ${payload.contactPhone}`;

  return (
    <div className="mt-3 space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Thanh toán tiền cọc</h2>
        <p className="text-sm text-gray-500">
          Vui lòng chuyển khoản số tiền cọc bên dưới để giữ phòng.
        </p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-2 text-center">
        <p className="text-xs text-amber-800">Số tiền cần chuyển khoản</p>
        <p className="text-2xl font-black text-amber-700">{depositText} VNĐ</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Quét mã QR */}
        <div className="rounded-xl border border-gray-200 p-4 text-center space-y-2">
          <h3 className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-600">
            <QrCode size={14} /> Quét mã QR
          </h3>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=SEPAY_DEMO_${encodeURIComponent(
              payload.contactPhone
            )}_${Math.round(depositAmount)}`}
            alt="VietQR demo"
            className="mx-auto h-40 w-40 rounded-lg border border-gray-100"
          />
          <p className="text-[11px] text-gray-400">Quét bằng app ngân hàng / Mobile Banking</p>
        </div>

        {/* Thông tin ngân hàng để copy (dùng khi truy cập trên mobile) */}
        <div className="rounded-xl border border-gray-200 p-4 space-y-2">
          <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-600">
            <Landmark size={14} /> Hoặc chuyển khoản thủ công
          </h3>
          <CopyRow label="Ngân hàng" value={DEMO_BANK_INFO.bankName} />
          <CopyRow label="Số tài khoản" value={DEMO_BANK_INFO.accountNumber} />
          <CopyRow label="Chủ tài khoản" value={DEMO_BANK_INFO.accountHolder} />
          <CopyRow label="Số tiền" value={depositText} />
          <CopyRow label="Nội dung chuyển khoản" value={transferContent} />
        </div>
      </div>

      <div className="pt-2 flex justify-between gap-3">
        <Button type="button" variant="outline" onClick={onBack} disabled={loading} className="flex items-center gap-1.5">
          <ArrowLeft size={16} /> Quay lại
        </Button>
        <Button
          type="button"
          onClick={onConfirmPaid}
          loading={loading}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700"
        >
          <CheckCircle2 size={16} /> Thanh toán đã hoàn tất
        </Button>
      </div>
    </div>
  );
}
