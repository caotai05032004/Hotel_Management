import React from 'react';
import { AlertCircle } from 'lucide-react';
import Badge from '../ui/Badge';

export const DiningBookingsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900 flex items-center gap-2">
        <AlertCircle size={20} className="text-amber-600 shrink-0" />
        <span>
          <strong>Giao diện thử nghiệm Phase 1:</strong> Tính năng Đặt bàn Nhà hàng & Thức uống sẽ được kết nối API ở Phase tiếp theo. Dưới đây là dữ liệu xem trước.
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-cream-200 bg-white p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="font-mono text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
              DN-20260905
            </span>
            <Badge tone="green">Đã xác nhận bàn</Badge>
          </div>
          <h3 className="text-lg font-bold text-navy-900 mt-2">Nhà hàng Hải sản Bờ biển Le Mirage</h3>
          <p className="text-xs text-ink-400 mt-1">Thời gian: 19:00 - Ngày 15/09/2026 · Bàn 4 người ngoài trời</p>
          <div className="mt-4 pt-4 border-t border-cream-100 flex justify-between items-center text-sm">
            <span className="text-ink-400">Đặt cọc giữ bàn:</span>
            <span className="font-bold text-gold-700">500.000 đ</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiningBookingsTab;
