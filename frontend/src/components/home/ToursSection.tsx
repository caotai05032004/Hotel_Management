import SectionHeading from './SectionHeading';

/**
 * Backend chưa có TourController — dữ liệu dưới đây bám theo template.
 * Khi có API /api/tours, chỉ cần thay mảng TOURS bằng tourService.filter().
 */
const TOURS = [
  {
    tag: 'Bestseller',
    name: 'Ha Long Bay Cruise',
    duration: '2 ngày 1 đêm',
    rating: 4.9,
    reviews: 128,
    price: 1_200_000,
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=70',
  },
  {
    tag: 'Nature',
    name: 'Sapa Mountain Trek',
    duration: 'Cả ngày',
    rating: 4.8,
    reviews: 94,
    price: 650_000,
    image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=900&q=70',
  },
  {
    tag: 'Culture',
    name: 'Mekong River Delta',
    duration: 'Nửa ngày',
    rating: 4.7,
    reviews: 76,
    price: 450_000,
    image: 'https://images.unsplash.com/photo-1509233725247-49e657c54213?auto=format&fit=crop&w=900&q=70',
  },
];

export default function ToursSection() {
  return (
    <section id="tours" className="bg-cream-100 py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow="Tour & Trải nghiệm"
          title="Khám Phá Địa Danh Nổi Tiếng"
          description="Các tour được thiết kế riêng bởi đội ngũ hướng dẫn chuyên nghiệp, tích hợp dự báo thời tiết thực tế"
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TOURS.map((t) => (
            <article
              key={t.name}
              className="group overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-cream-200 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={t.image}
                  alt={t.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/10 to-transparent" />
                <span className="absolute left-3 top-3 rounded-lg bg-gold-500 px-2.5 py-1 text-[11px] font-black uppercase text-navy-900">
                  {t.tag}
                </span>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-lg font-extrabold text-white">{t.name}</h3>
                  <p className="text-xs text-cream-200/80">⏱ {t.duration}</p>
                </div>
              </div>

              <div className="flex items-end justify-between gap-3 p-5">
                <div>
                  <p className="text-xs font-semibold text-ink-400">
                    ⭐ {t.rating} ({t.reviews} đánh giá)
                  </p>
                  <p className="mt-1 text-lg font-black text-gold-700">
                    {t.price.toLocaleString('vi-VN')} ₫
                    <span className="text-xs font-semibold text-ink-400">/người</span>
                  </p>
                </div>
                <button
                  className="rounded-xl bg-cream-100 px-4 py-2 text-xs font-bold text-navy-900 transition hover:bg-gold-500"
                  title="Chức năng đặt tour sẽ mở khi backend có TourController"
                >
                  Đặt tour
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
