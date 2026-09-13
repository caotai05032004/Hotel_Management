import { formatNumber } from '../../lib/format';

interface Props {
  /** tổng số phòng lấy từ API /api/phong/filter (nếu đăng nhập được) */
  totalRooms?: number | null;
  /** tổng số hạng phòng lấy từ API /api/hang-phong/filter */
  totalRoomTypes?: number | null;
}

export default function Stats({ totalRooms, totalRoomTypes }: Props) {
  const items = [
    {
      value: totalRooms ? formatNumber(totalRooms) + '+' : totalRoomTypes ? formatNumber(totalRoomTypes) + '+' : '120+',
      label: 'Phòng & Villa',
    },
    { value: '40+', label: 'Tour trải nghiệm' },
    { value: '5.000+', label: 'Lượt khách' },
    { value: '4.9★', label: 'Đánh giá TB' },
  ];

  return (
    <section className="container-page py-16">
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.label} className="text-center">
            <p className="text-3xl font-black text-navy-900 sm:text-4xl">{it.value}</p>
            <p className="mt-1 text-sm font-semibold text-ink-400">{it.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
