import { Search } from 'lucide-react';

interface BookingFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
}

export default function BookingFilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: BookingFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Tìm theo Mã đặt phòng, Tên khách, Số điện thoại..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <select
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value)}
        className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <option value="ALL">Tất cả trạng thái</option>
        <option value="PENDING">Chờ xác nhận</option>
        <option value="CONFIRMED">Đã xác nhận</option>
        <option value="CHECKED_IN">Đã Check-in</option>
        <option value="CHECKED_OUT">Đã Check-out</option>
        <option value="CANCELLED">Đã hủy</option>
      </select>
    </div>
  );
}
