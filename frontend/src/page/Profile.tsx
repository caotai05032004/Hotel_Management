import { useEffect, useState } from 'react';
import { useAuth } from '../context/useAuth';
import { nguoiDungService } from '../services/nguoiDungService';
import { getErrorMessage, getFieldErrors } from '../services/http';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Field';
import { Alert, Loading } from '../components/ui/Feedback';
import Badge from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import { formatDateTime } from '../lib/format';
import type { NguoiDungResponse } from '../types';

export default function Profile() {
  const { user, setUser } = useAuth();
  const toast = useToast();

  const [profile, setProfile] = useState<NguoiDungResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({ fullName: '', phone: '', password: '' });

  /* GET /api/user/user/{id} — id lấy từ claim "uid" của access token */
  useEffect(() => {
    let alive = true;
    if (!user?.id) {
      setForm({ fullName: user?.fullName ?? '', phone: user?.phone ?? '', password: '' });
      setLoading(false);
      return;
    }
    nguoiDungService
      .getById(user.id)
      .then((data) => {
        if (!alive) return;
        setProfile(data);
        setForm({ fullName: data.fullName ?? '', phone: data.phone ?? '', password: '' });
      })
      .catch((err) => alive && setError(getErrorMessage(err)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [user?.id, user?.fullName, user?.phone]);

  /* POST /api/user/update — backend tìm người dùng theo email và mã hoá lại mật khẩu */
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrors({});

    const next: Record<string, string> = {};
    if (!form.fullName.trim()) next.fullName = 'Họ tên không được để trống';
    if (form.phone && !/^(0|\+84)\d{9,10}$/.test(form.phone)) next.phone = 'Số điện thoại không hợp lệ';
    if (!form.password) next.password = 'Backend luôn mã hoá lại mật khẩu, vui lòng nhập mật khẩu mới';
    else if (form.password.length < 6) next.password = 'Mật khẩu phải từ 6 ký tự';
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    setSaving(true);
    try {
      const updated = await nguoiDungService.update({
        email: user?.email ?? profile?.email ?? '',
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });
      setProfile(updated);
      if (user) {
        setUser({ ...user, fullName: updated.fullName, phone: updated.phone });
      }
      setForm((f) => ({ ...f, password: '' }));
      toast.success('Cập nhật thông tin thành công');
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (Object.keys(fieldErrors).length) setErrors(fieldErrors);
      else setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading label="Đang tải hồ sơ…" />;

  return (
    <div className="container-page py-12">
      {toast.view}

      <h1 className="text-3xl font-black text-navy-900">Tài khoản của tôi</h1>
      <p className="mt-2 text-sm text-ink-400">Quản lý thông tin cá nhân và mật khẩu đăng nhập</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* Thẻ thông tin */}
        <div className="h-fit rounded-2xl bg-white p-6 shadow-card ring-1 ring-cream-200">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-navy-900 text-xl font-black text-gold-500">
              {(profile?.fullName ?? user?.fullName ?? '?').charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-lg font-extrabold text-navy-900">
                {profile?.fullName ?? user?.fullName}
              </p>
              <p className="truncate text-sm text-ink-400">{profile?.email ?? user?.email}</p>
            </div>
          </div>

          <dl className="mt-6 space-y-3 border-t border-cream-200 pt-5 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-ink-400">Vai trò</dt>
              <dd className="flex flex-wrap justify-end gap-1.5">
                {(profile?.roles ?? user?.roles ?? []).map((r) => (
                  <Badge key={r} tone="gold">
                    {r}
                  </Badge>
                ))}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-ink-400">Trạng thái</dt>
              <dd>
                <Badge tone={profile?.status === 'ACTIVE' ? 'green' : 'amber'}>
                  {profile?.status ?? '—'}
                </Badge>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-ink-400">Số điện thoại</dt>
              <dd className="font-semibold text-navy-900">{profile?.phone ?? user?.phone ?? '—'}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-ink-400">Ngày tạo</dt>
              <dd className="font-semibold text-navy-900">{formatDateTime(profile?.createdAt)}</dd>
            </div>
          </dl>
        </div>

        {/* Form cập nhật */}
        <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-cream-200">
          <h2 className="text-lg font-extrabold text-navy-900">Cập nhật thông tin</h2>
          <p className="mt-1 text-sm text-ink-400">
            Endpoint <code className="rounded bg-cream-100 px-1.5 py-0.5 text-xs">POST /api/user/update</code>{' '}
            xác định người dùng theo email nên email không thể thay đổi ở đây.
          </p>

          {error && (
            <div className="mt-5">
              <Alert tone="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
            <Input label="Email" value={profile?.email ?? user?.email ?? ''} disabled />
            <Input
              label="Họ và tên"
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              error={errors.fullName}
              required
            />
            <Input
              label="Số điện thoại"
              placeholder="0912345678"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              error={errors.phone}
            />
            <Input
              label="Mật khẩu mới"
              type="password"
              autoComplete="new-password"
              placeholder="Tối thiểu 6 ký tự"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              error={errors.password}
              required
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button type="submit" loading={saving}>
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
