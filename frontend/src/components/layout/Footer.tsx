import { Link } from 'react-router-dom';

const COLUMNS = [
  {
    title: 'Dịch vụ',
    links: [
      { label: 'Đặt phòng', to: '/rooms' },
      { label: 'Nhà hàng', to: '/#dining' },
      { label: 'Room Service', to: '/#dining' },
      { label: 'Tour & Hoạt động', to: '/#tours' },
    ],
  },
  {
    title: 'Hỗ trợ',
    links: [
      { label: 'Chính sách hủy', to: '/#about' },
      { label: 'Quyền xóa dữ liệu', to: '/#about' },
      { label: 'Liên hệ', to: '/#about' },
      { label: 'FAQ', to: '/#about' },
    ],
  },
  {
    title: 'Pháp lý',
    links: [
      { label: 'Decree 356/2025', to: '/#about' },
      { label: 'Điều khoản dịch vụ', to: '/#about' },
      { label: 'Bảo mật dữ liệu', to: '/#about' },
      { label: 'Cookie Policy', to: '/#about' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-cream-200">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-gold-500 text-lg font-black text-navy-900">
              P
            </span>
            <span className="text-base font-extrabold text-white">PhucNguyen Resort</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream-200/60">
            Hệ thống quản lý nghỉ dưỡng tích hợp. Dự án SWP391-HOS-02 — FPT University.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-gold-500">{col.title}</h4>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm text-cream-200/70 transition hover:text-gold-400">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-cream-200/50 sm:flex-row">
          <p>© 2026 PhucNguyen Resort &amp; Tour Hub. All rights reserved.</p>
          <p>Thanh toán: 💳 VNPay · Stripe · Tiền mặt</p>
        </div>
      </div>
    </footer>
  );
}
