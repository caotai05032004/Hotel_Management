import type { ReactNode } from 'react';
import Logo from './Logo';

/** Bố cục 2 cột dùng chung cho trang Đăng nhập / Đăng ký. */
export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1505142468610-359e7d316be0?auto=format&fit=crop&w=1200&q=75"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950/85 to-navy-900/60" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-gold-500 text-lg font-black text-navy-900">
              P
            </span>
            <span className="text-base font-extrabold text-white">PhucNguyen Resort</span>
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.35em] text-gold-400">
              ✦ LUXURY · HOSPITALITY ✦
            </p>
            <h2 className="mt-4 max-w-sm text-4xl font-black leading-tight text-white">
              Thiên đường nghỉ dưỡng
              <span className="block text-gold-500">chỉ một chạm</span>
            </h2>
            <p className="mt-4 max-w-sm text-sm text-cream-200/70">
              Một tài khoản cho tất cả dịch vụ: phòng, nhà hàng, tour và hóa đơn tổng hợp.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center bg-cream-50 px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-3xl font-black text-navy-900">{title}</h1>
          <p className="mt-2 text-sm text-ink-400">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-8 text-center text-sm text-ink-400">{footer}</p>
        </div>
      </div>
    </div>
  );
}
