import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

export default function CtaSection() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="bg-navy-900 py-20">
      <div className="container-page text-center">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-gold-500">
          Bắt đầu ngay hôm nay
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-black leading-tight text-white sm:text-4xl">
          Sẵn sàng cho kỳ nghỉ
          <br />
          hoàn hảo của bạn?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-cream-200/70">
          Tạo tài khoản miễn phí, khám phá phòng và đặt tour chỉ trong vài phút.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          {isAuthenticated ? (
            <Link
              to="/rooms"
              className="rounded-xl bg-gold-500 px-8 py-3.5 text-sm font-bold text-navy-900 transition hover:bg-gold-400"
            >
              Xem danh sách phòng
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="rounded-xl bg-gold-500 px-8 py-3.5 text-sm font-bold text-navy-900 transition hover:bg-gold-400"
              >
                Đăng ký miễn phí
              </Link>
              <Link
                to="/login"
                className="rounded-xl border-2 border-white/30 px-8 py-3.5 text-sm font-bold text-white transition hover:border-gold-500 hover:text-gold-400"
              >
                Đăng nhập
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
