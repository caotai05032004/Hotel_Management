import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { getErrorMessage, getFieldErrors } from '../../services/http';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { Alert } from '../../components/ui/Feedback';
import AuthShell from '../../components/layout/AuthShell';
import type { LoginRequest } from '../../types';

const STAFF = ['RECEPTIONIST', 'MANAGER', 'ADMIN'];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const expired = new URLSearchParams(location.search).get('expired') === '1';

  const [values, setValues] = useState<LoginRequest>({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onChange = (key: keyof LoginRequest) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setErrors((s) => ({ ...s, [key]: '' }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
      else setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Đăng nhập"
      subtitle="Chào mừng trở lại PhucNguyen Resort"
      footer={
        <>
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-bold text-gold-700 hover:underline">
            Đăng ký miễn phí
          </Link>
        </>
      }
    >
      {expired && (
        <div className="mb-5">
          <Alert tone="warning">Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.</Alert>
        </div>
      )}
      {error && (
        <div className="mb-5">
          <Alert tone="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </div>
      )}

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
        <Input
          label="Mật khẩu"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={values.password}
          onChange={onChange('password')}
          error={errors.password}
          required
        />
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
