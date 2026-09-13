import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-6xl font-black text-gold-500">404</p>
      <h1 className="mt-4 text-2xl font-extrabold text-navy-900">Không tìm thấy trang</h1>
      <p className="mt-2 text-sm text-ink-400">Đường dẫn bạn truy cập không tồn tại.</p>
      <Link
        to="/"
        className="mt-8 rounded-xl bg-navy-900 px-7 py-3 text-sm font-bold text-white transition hover:bg-gold-500 hover:text-navy-900"
      >
        Về trang chủ
      </Link>
    </div>
  );
}
