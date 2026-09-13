import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { classNames } from '../../lib/format';

const MENU = [
  { to: '/admin', end: true, label: 'Tổng quan', icon: '📊' },
  { to: '/admin/hang-phong', label: 'Hạng phòng', icon: '🏷️' },
  { to: '/admin/phong', label: 'Phòng', icon: '🛏️' },
  { to: '/admin/tai-khoan', label: 'Tài khoản', icon: '👤' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-cream-100">
      {/* Sidebar */}
      <aside
        className={classNames(
          'fixed inset-y-0 left-0 z-40 w-64 shrink-0 bg-navy-900 text-cream-200 transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center gap-3 px-5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gold-500 text-base font-black text-navy-900">
            P
          </span>
          <div className="leading-tight">
            <p className="text-sm font-extrabold text-white">PhucNguyen</p>
            <p className="text-[10px] font-semibold tracking-wider text-gold-500">BẢNG ĐIỀU KHIỂN</p>
          </div>
        </div>

        <nav className="mt-4 space-y-1 px-3">
          {MENU.map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              end={m.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                classNames(
                  'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition',
                  isActive
                    ? 'bg-gold-500 text-navy-900'
                    : 'text-cream-200/70 hover:bg-white/5 hover:text-white'
                )
              }
            >
              <span>{m.icon}</span>
              {m.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute inset-x-0 bottom-0 border-t border-white/10 p-4">
          <Link to="/" className="block text-xs font-semibold text-cream-200/60 transition hover:text-gold-400">
            ← Về trang khách
          </Link>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-30 bg-navy-950/50 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Nội dung */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-cream-300 bg-white px-4 sm:px-6">
          <button
            className="rounded-lg p-2 text-navy-900 lg:hidden"
            aria-label="Mở menu"
            onClick={() => setOpen(true)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>

          <div className="ml-auto flex items-center gap-4">
            <div className="text-right leading-tight">
              <p className="text-sm font-bold text-navy-900">{user?.fullName}</p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gold-600">
                {user?.roles.join(' · ') || 'STAFF'}
              </p>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-navy-900 text-sm font-bold text-gold-500">
              {(user?.fullName ?? '?').charAt(0).toUpperCase()}
            </span>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-cream-300 px-3 py-1.5 text-xs font-bold text-ink-600 transition hover:border-red-300 hover:text-red-600"
            >
              Đăng xuất
            </button>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
