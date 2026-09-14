import SectionHeading from './SectionHeading';

const REVIEWS = [
  {
    text: 'Resort cực kỳ đẳng cấp! Đặt phòng online rất tiện, hệ thống giao đồ ăn tận phòng nhanh chóng. Sẽ quay lại!',
    name: 'Nguyễn Minh Tuấn',
    date: 'Aug 2026',
  },
  {
    text: 'Absolutely stunning! The integrated booking system made everything seamless — room, dining, and the Ha Long tour all in one app.',
    name: 'Sarah Johnson',
    date: 'Jul 2026',
  },
  {
    text: 'Hóa đơn tổng hợp khi check-out rất rõ ràng, không lo bị tính nhầm. Nhân viên nhiệt tình, sẽ giới thiệu cho bạn bè.',
    name: 'Trần Thị Lan',
    date: 'Jun 2026',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-cream-100 py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow="Đánh giá khách hàng"
          title="Khách Hàng Nói Gì?"
          description="Hơn 5.000 lượt khách đã tin tưởng trải nghiệm"
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <figure key={r.name} className="rounded-2xl bg-cream-50 p-6 ring-1 ring-cream-300">
              <div className="text-sm tracking-widest text-gold-500">★★★★★</div>
              <blockquote className="mt-4 text-sm italic leading-relaxed text-ink-600">
                “{r.text}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-cream-300 pt-4">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-navy-900 text-xs font-bold text-gold-500">
                  {r.name.charAt(0)}
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-bold text-navy-900">{r.name}</p>
                  <p className="text-xs text-ink-400">{r.date}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
