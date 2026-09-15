import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../context/useAuth';
import { getErrorMessage, getFieldErrors } from '../../services/http';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import AuthShell from '../../components/layout/AuthShell';

interface FormValues {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const EMPTY: FormValues = { fullName: '', email: '', phone: '', password: '', confirmPassword: '' };

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const onChange = (key: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setErrors((s) => ({ ...s, [key]: '' }));
  };

  /** Validate trùng khớp với annotation của RegisterRequest ở backend */
  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!values.fullName.trim()) e.fullName = 'Họ tên không được để trống';
    if (!values.email.trim()) e.email = 'Email không được để trống';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) e.email = 'Email không đúng định dạng';
    if (values.phone && !/^(0|\+84)\d{9,10}$/.test(values.phone)) e.phone = 'Số điện thoại không hợp lệ';
    if (!values.password) e.password = 'Mật khẩu không được để trống';
    else if (values.password.length < 6 || values.password.length > 64)
      e.password = 'Mật khẩu phải từ 6 đến 64 ký tự';
    if (values.confirmPassword !== values.password)
      e.confirmPassword = 'Mật khẩu xác nhận không khớp';
    return e;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();

    const next = validate();
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    setLoading(true);
    try {
      await register({
        email: values.email.trim(),
        password: values.password,
        fullName: values.fullName.trim(),
        phone: values.phone.trim() || undefined,
      });
      navigate('/', { replace: true });
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (Object.keys(fieldErrors).length) setErrors(fieldErrors);
      else toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Đăng ký tài khoản"
      subtitle="Miễn phí — dùng cho phòng, nhà hàng và tour"
      footer={
        <>
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-bold text-gold-700 hover:underline">
            Đăng nhập
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input
          label="Họ và tên"
          placeholder="Nguyễn Văn A"
          value={values.fullName}
          onChange={onChange('fullName')}
          error={errors.fullName}
          required
        />
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
          label="Số điện thoại"
          placeholder="0912345678"
          value={values.phone}
          onChange={onChange('phone')}
          error={errors.phone}
        />
        <Input
          label="Mật khẩu"
          type="password"
          autoComplete="new-password"
          placeholder="Tối thiểu 6 ký tự"
          value={values.password}
          onChange={onChange('password')}
          error={errors.password}
          required
        />
        <Input
          label="Xác nhận mật khẩu"
          type="password"
          autoComplete="new-password"
          placeholder="Nhập lại mật khẩu"
          value={values.confirmPassword}
          onChange={onChange('confirmPassword')}
          error={errors.confirmPassword}
          required
        />
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Đăng ký miễn phí
        </Button>
      </form>
    </AuthShell>
  );
}
