import SectionHeading from './SectionHeading';

const FEATURES = [
  {
    icon: '🏨',
    title: 'Đặt phòng thông minh',
    desc: 'Chống double-booking, xác nhận tức thì, hoàn tiền minh bạch theo chính sách 48h',
  },
  {
    icon: '🍜',
    title: 'F&B tích hợp',
    desc: 'KOT real-time, giao đồ ăn tận phòng, tự động cộng vào hóa đơn phòng',
  },
  {
    icon: '🗺️',
    title: 'Tour & Thời tiết',
    desc: 'Xem dự báo thời tiết trực tiếp, đặt tour, manifest rõ ràng theo ngày',
  },
  {
    icon: '📋',
    title: 'Hóa đơn tổng hợp',
    desc: 'Check-out một lần, thanh toán tất cả dịch vụ qua VNPay hoặc Stripe',
  },
];

export default function FeaturesSection() {
  return (
    <section id="about" className="container-page py-20">
      <SectionHeading
        eyebrow="Tại sao chọn chúng tôi"
        title="Nền Tảng All-in-One Duy Nhất"
        description="Một đăng nhập, mọi dịch vụ — hóa đơn tổng hợp minh bạch khi check-out"
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-cream-200 transition hover:ring-gold-400"
          >
            <div className="text-3xl">{f.icon}</div>
            <h3 className="mt-4 text-base font-extrabold text-navy-900">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-400">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
