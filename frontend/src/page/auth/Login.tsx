import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../context/useAuth';
import { getErrorMessage, getFieldErrors } from '../../services/http';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import AuthShell from '../../components/layout/AuthShell';
import type { LoginRequest } from '../../types';
import { Eye, EyeOff } from 'lucide-react';
import { RESORT_NAME } from '@/constants/system.constant';

const STAFF = ['RECEPTIONIST', 'MANAGER', 'ADMIN'];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const expired = new URLSearchParams(location.search).get('expired') === '1';

  const [values, setValues] = useState<LoginRequest>({ email: '', password: '123456' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (expired) toast.warning('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (key: keyof LoginRequest) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setErrors((s) => ({ ...s, [key]: '' }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const next: Record<string, string> = {};
    if (!values.email.trim()) next.email = 'Vui lòng nhập email';
    if (!values.password) next.password = 'Vui lòng nhập mật khẩu';
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    setLoading(true);
    try {
      const user = await login(values);
      const from = (location.state as { from?: string } | null)?.from;
      const isStaff = STAFF.some((r) => user.roles.includes(r));
      navigate(from ?? (isStaff ? '/admin' : '/'), { replace: true });
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (Object.keys(fieldErrors).length) setErrors(fieldErrors);
      else toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const onShowPassword = () => {
    setShowPassword((s) => !s);
  }

  return (
    <AuthShell
      title="Đăng nhập"
      subtitle={`Chào mừng trở lại ${RESORT_NAME}`}
      footer={
        <>
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-bold text-gold-700 hover:underline">
            Đăng ký miễn phí
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="email@example.com"
          value={values.email}
          onChange={onChange('email')}
          error={errors.email}
          required
        />
        <div className='relative'>
          <Input
            label="Mật khẩu"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            value={values.password}
            onChange={onChange('password')}
            error={errors.password}
            required
          />
          <button type="button" onClick={onShowPassword} className='absolute right-3 top-1/2'>
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Đăng nhập
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-ink-400">
        <Link to="/" className="hover:text-navy-900">
          ← Về trang chủ
        </Link>
      </p>
    </AuthShell>
  );
}
