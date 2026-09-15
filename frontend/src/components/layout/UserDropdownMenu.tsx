import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, CalendarCheck, ShieldCheck, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import PATH from '../../configs/path';

export default function UserDropdownMenu() {
  const { user, isStaff, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate('/');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Avatar Button Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 rounded-full border border-cream-300 bg-white py-1 pl-1 pr-3 transition-all hover:border-gold-400 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-navy-900 text-xs font-bold text-gold-500 shadow-xs">
          {(user?.fullName ?? '?').charAt(0).toUpperCase()}
        </span>
        <span className="max-w-32 truncate text-sm font-semibold text-navy-900">
          {user?.fullName || 'Tài khoản'}
        </span>
        <ChevronDown size={16} className={`text-ink-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Shadcn-style Dropdown Menu Content */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black/5 focus:outline-none z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* User Header */}
          <div className="px-3 py-2.5 border-b border-cream-200">
            <p className="text-sm font-bold text-navy-900 truncate">{user?.fullName}</p>
            <p className="text-xs text-ink-400 truncate">{user?.email}</p>
            {isStaff && (
              <span className="mt-1 inline-block rounded bg-gold-100 px-2 py-0.5 text-[10px] font-extrabold text-gold-800 uppercase tracking-wider">
                Nhân viên hệ thống
              </span>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-1 space-y-0.5">
            {/* 1. Thông tin cá nhân */}
            <Link
              to={PATH.PROFILE}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-ink-600 hover:bg-cream-100 hover:text-navy-900 transition-colors"
            >
              <User size={18} className="text-gold-600" />
              <span>Thông tin cá nhân</span>
            </Link>

            {/* 2. Dịch vụ đã đặt */}
            <Link
              to={PATH.MY_BOOKINGS}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-ink-600 hover:bg-cream-100 hover:text-navy-900 transition-colors"
            >
              <CalendarCheck size={18} className="text-emerald-600" />
              <span>Dịch vụ đã đặt</span>
            </Link>

            {/* 3. Quản trị (nếu là staff) */}
            {isStaff && (
              <Link
                to={PATH.ADMIN}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-ink-600 hover:bg-cream-100 hover:text-navy-900 transition-colors"
              >
                <ShieldCheck size={18} className="text-blue-600" />
                <span>Bảng điều khiển Quản trị</span>
              </Link>
            )}
          </div>

          <div className="my-1 border-t border-cream-200" />

          {/* 4. Đăng xuất */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      )}
    </div>
  );
}
