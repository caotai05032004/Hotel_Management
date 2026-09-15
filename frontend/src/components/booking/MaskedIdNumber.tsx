import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface MaskedIdNumberProps {
  value: string | null | undefined;
  className?: string;
}

/**
 * CCCD do server trả về (đã che hoặc đầy đủ tuỳ quyền xem của người gọi API);
 * bấm vào để ẩn/hiện chuỗi này. Nếu chưa có CCCD (đặt online không bắt buộc nhập),
 * hiển thị trạng thái "Chưa cung cấp" thay vì giả lập một chuỗi che.
 */
export default function MaskedIdNumber({ value, className }: MaskedIdNumberProps) {
  const [visible, setVisible] = useState(false);

  if (!value) {
    return <span className={`italic text-gray-400 ${className || ''}`}>Chưa cung cấp</span>;
  }

  return (
    <button
      type="button"
      onClick={() => setVisible((v) => !v)}
      className={`inline-flex items-center gap-1 font-mono cursor-pointer ${className || ''}`}
      title={visible ? 'Bấm để ẩn số CCCD' : 'Bấm để xem số CCCD'}
    >
      <span>{visible ? value : '•'.repeat(Math.min(value.length, 12))}</span>
      {visible ? <EyeOff size={12} className="text-gray-400 shrink-0" /> : <Eye size={12} className="text-gray-400 shrink-0" />}
    </button>
  );
}
