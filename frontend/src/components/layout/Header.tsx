import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import UserDropdownMenu from './UserDropdownMenu';
import Logo from './Logo';
import Button from '../ui/Button';
import { useAuth } from '../../context/useAuth';
import { classNames } from '../../lib/format';
import PATH from '../../configs/path';

const NAV = [
  { to: PATH.ROOMS, label: 'Phòng' },
  { to: '/#dining', label: 'Nhà hàng' },
  { to: '/#tours', label: 'Tour' },
  { to: PATH.ABOUT_ME, label: 'Về chúng tôi' },
];

export default function Header() {
  const { isAuthenticated, isStaff, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header
      className={classNames(
        'sticky top-0 z-40 border-b transition-all duration-300',
        scrolled
          ? 'border-cream-200 bg-cream-50/95 backdrop-blur-md shadow-soft'
          : 'border-transparent bg-cream-50'
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                classNames(
                  'text-sm font-semibold transition-colors',
                  isActive ? 'text-gold-700' : 'text-ink-600 hover:text-navy-900'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <UserDropdownMenu />
          ) : (
            <>
              <Link to="/login" className="text-sm font-bold text-navy-900 transition hover:text-gold-700">
                Đăng nhập
              </Link>
              <Button variant="dark" size="sm" onClick={() => navigate('/rooms')}>
                Đặt ngay
              </Button>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-navy-900 md:hidden"
          aria-label="Mở menu"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-cream-200 bg-cream-50 md:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 text-sm font-semibold text-ink-600 hover:bg-white hover:text-navy-900"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-cream-200 pt-3">
              {isAuthenticated ? (
                <>
                  {isStaff && (
                    <Link to="/admin" onClick={() => setOpen(false)} className="px-2 py-2 text-sm font-semibold">
                      Quản trị
                    </Link>
                  )}
                  <Link to={PATH.PROFILE} onClick={() => setOpen(false)} className="px-2 py-2 text-sm font-semibold">
                    Thông tin cá nhân
                  </Link>
                  <Link to={PATH.MY_BOOKINGS} onClick={() => setOpen(false)} className="px-2 py-2 text-sm font-semibold text-emerald-800">
                    Dịch vụ đã đặt
                  </Link>
                  <Button variant="outline" onClick={handleLogout}>
                    Đăng xuất
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => navigate('/login')}>
                    Đăng nhập
                  </Button>
                  <Button variant="dark" onClick={() => navigate('/register')}>
                    Đăng ký miễn phí
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
