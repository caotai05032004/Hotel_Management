import { Link } from 'react-router-dom';

export default function Forbidden() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-6xl font-black text-gold-500">403</p>
      <h1 className="mt-4 text-2xl font-extrabold text-navy-900">Bạn không có quyền truy cập</h1>
      <p className="mt-2 max-w-md text-sm text-ink-400">
        Khu vực này chỉ dành cho nhân viên (RECEPTIONIST / MANAGER / ADMIN). Hãy liên hệ quản trị
        viên nếu bạn cần quyền truy cập.
      </p>
      <Link
        to="/"
        className="mt-8 rounded-xl bg-navy-900 px-7 py-3 text-sm font-bold text-white transition hover:bg-gold-500 hover:text-navy-900"
      >
        Về trang chủ
      </Link>
    </div>
  );
}
