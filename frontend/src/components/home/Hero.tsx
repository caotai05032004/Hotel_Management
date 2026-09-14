import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="relative isolate flex min-h-[86vh] items-center justify-center overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1505142468610-359e7d316be0?auto=format&fit=crop&w=1920&q=75"
        alt="Resort biển hoàng hôn"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy-950/70 via-navy-950/45 to-navy-950/85" />

      <div className="container-page py-24 text-center">
        <p className="text-xs font-bold tracking-[0.45em] text-gold-400 sm:text-sm">
          ✦ LUXURY · HOSPITALITY · EXPERIENCE ✦
        </p>

        <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-black leading-[1.08] text-white sm:text-5xl lg:text-7xl">
          Thiên Đường Nghỉ Dưỡng
          <span className="mt-1 block text-gold-500">Chỉ Một Chạm</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-cream-200/85 sm:text-lg">
          Đặt phòng, gọi đồ ăn, khám phá tour — tất cả trong một nền tảng duy nhất. Trải nghiệm dịch
          vụ 5 sao ngay hôm nay.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/rooms"
            className="rounded-xl bg-gold-500 px-8 py-3.5 text-sm font-bold text-navy-900 shadow-lg transition hover:bg-gold-400"
          >
            Khám phá ngay
          </Link>
          <a
            href="#tours"
            className="rounded-xl border-2 border-white/40 bg-white/5 px-8 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:border-gold-400 hover:text-gold-400"
          >
            Xem tour nổi bật
          </a>
        </div>

        <a
          href="#search"
          className="mt-16 inline-flex flex-col items-center gap-1 text-[11px] font-semibold tracking-widest text-cream-200/60 transition hover:text-gold-400"
        >
          Cuộn xuống
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-bounce">
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </a>
      </div>
    </section>
  );
}
