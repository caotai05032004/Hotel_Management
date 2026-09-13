import SectionHeading from './SectionHeading';

/** Backend chưa có MonAnController / DatBanController — nội dung bám template. */
const DISHES = [
  { tag: "Chef's Pick", name: 'Pan-seared Salmon', desc: 'Sốt chanh dây, rau củ nướng', price: 285_000 },
  { tag: 'Premium', name: 'Wagyu Tenderloin', desc: 'Sốt truffle, khoai tây nghiền', price: 580_000 },
];

const SERVICES = [
  { icon: '🍽️', title: 'Gọi đồ ăn tận phòng', sub: '24/7 Room Service' },
  { icon: '🪑', title: 'Đặt bàn nhà hàng', sub: 'Online Reservation' },
  { icon: '💳', title: 'Tính vào hóa đơn phòng', sub: 'Charge to Room' },
];

export default function DiningSection() {
  return (
    <section id="dining" className="bg-navy-900 py-20">
      <div className="container-page">
        <SectionHeading
          light
          eyebrow="Nhà hàng & F&B"
          title="Ẩm Thực Đẳng Cấp 5 Sao"
          description="Đặt bàn, gọi đồ ăn tận phòng — menu tươi mới mỗi ngày với nguyên liệu địa phương"
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {DISHES.map((d) => (
            <div
              key={d.name}
              className="flex flex-col gap-3 rounded-2xl bg-ink-900 p-6 ring-1 ring-white/5 transition hover:ring-gold-500/40"
            >
              <span className="w-fit rounded-md bg-gold-500/15 px-2.5 py-1 text-[11px] font-bold text-gold-400">
                {d.tag}
              </span>
              <h3 className="text-lg font-extrabold text-white">{d.name}</h3>
              <p className="text-sm text-cream-200/60">{d.desc}</p>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xl font-black text-gold-500">{d.price.toLocaleString('vi-VN')} ₫</p>
                <button
                  className="rounded-xl border border-white/15 px-4 py-2 text-xs font-bold text-white transition hover:border-gold-500 hover:text-gold-400"
                  title="Chức năng gọi món sẽ mở khi backend có API F&B"
                >
                  Gọi món
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {SERVICES.map((s) => (
            <div key={s.title} className="rounded-2xl bg-ink-900 p-6 text-center ring-1 ring-white/5">
              <div className="text-2xl">{s.icon}</div>
              <p className="mt-3 text-sm font-bold text-white">{s.title}</p>
              <p className="mt-0.5 text-xs text-cream-200/45">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
