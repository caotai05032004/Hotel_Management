import { useState } from 'react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Input } from '../../components/ui/Field';
import { EmptyState, Spinner } from '../../components/ui/Feedback';
import { toast } from 'sonner';
import { nguoiDungService } from '../../services/nguoiDungService';
import { getErrorMessage, getFieldErrors } from '../../services/http';
import { formatDateTime } from '../../lib/format';
import type { NguoiDungResponse } from '../../types';

/**
 * Backend hiện chỉ có 2 endpoint cho người dùng:
 *   GET  /api/user/user/{id}
 *   POST /api/user/update   (tìm theo email, luôn mã hoá lại mật khẩu)
 * Chưa có API liệt kê người dùng nên trang này là màn hình tra cứu theo ID.
 */
export default function TaiKhoanPage() {

  const [userId, setUserId] = useState('');
  const [user, setUser] = useState<NguoiDungResponse | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({ fullName: '', phone: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const data = await nguoiDungService.getById(userId.trim());
      setUser(data);
      setForm({ fullName: data.fullName ?? '', phone: data.phone ?? '', password: '' });
    } catch (err) {
      setUser(null);
      setError(getErrorMessage(err));
      toast.error(getErrorMessage(err));
    } finally {
      setSearching(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErrors({});

    const next: Record<string, string> = {};
    if (!form.fullName.trim()) next.fullName = 'Họ tên không được để trống';
    if (form.phone && !/^(0|\+84)\d{9,10}$/.test(form.phone)) next.phone = 'Số điện thoại không hợp lệ';
    if (!form.password) next.password = 'Backend luôn mã hoá lại mật khẩu — bắt buộc nhập';
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    setSaving(true);
    try {
      const updated = await nguoiDungService.update({
        email: user.email,
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });
      setUser(updated);
      setForm((f) => ({ ...f, password: '' }));
      toast.success('Cập nhật người dùng thành công');
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (Object.keys(fieldErrors).length) setErrors(fieldErrors);
      else toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-black text-navy-900">Tài khoản</h1>
        <p className="mt-1 text-sm text-ink-400">
          Tra cứu và cập nhật người dùng theo ID (UUID trong bảng <code>nguoi_dung</code>)
        </p>
      </div>

      <form
        onSubmit={search}
        className="flex flex-wrap items-end gap-3 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-cream-200"
      >
        <div className="min-w-72 flex-1">
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-ink-400">
            ID người dùng
          </label>
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="ví dụ: 3f9a1c2e-5b7d-4a8e-9c10-1b2c3d4e5f60"
            className="w-full rounded-xl border border-cream-300 px-4 py-2.5 font-mono text-sm focus:border-gold-500 focus:outline-none focus:ring-4 focus:ring-gold-500/15"
          />
        </div>
        <Button type="submit" variant="dark" loading={searching}>
          Tra cứu
        </Button>
      </form>

      {searching && (
        <div className="flex justify-center py-10">
          <Spinner className="h-7 w-7" />
        </div>
      )}

      {!searching && !user && !error && (
        <EmptyState
          title="Chưa tra cứu người dùng nào"
          description="Nhập ID người dùng để xem hồ sơ và cập nhật thông tin."
        />
      )}

      {user && (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          <div className="h-fit rounded-2xl bg-white p-6 shadow-soft ring-1 ring-cream-200">
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-navy-900 text-xl font-black text-gold-500">
                {user.fullName.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-lg font-extrabold text-navy-900">{user.fullName}</p>
                <p className="truncate text-sm text-ink-400">{user.email}</p>
              </div>
            </div>

            <dl className="mt-6 space-y-3 border-t border-cream-200 pt-5 text-sm">
              <div className="flex items-start justify-between gap-3">
                <dt className="text-ink-400">ID</dt>
                <dd className="break-all text-right font-mono text-xs text-navy-900">{user.id}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-400">Vai trò</dt>
                <dd className="flex flex-wrap justify-end gap-1.5">
                  {user.roles.map((r) => (
                    <Badge key={r} tone="gold">
                      {r}
                    </Badge>
                  ))}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-400">Trạng thái</dt>
                <dd>
                  <Badge tone={user.status === 'ACTIVE' ? 'green' : 'amber'}>{user.status}</Badge>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-400">Ngày tạo</dt>
                <dd className="font-semibold text-navy-900">{formatDateTime(user.createdAt)}</dd>
              </div>
            </dl>
          </div>

          <form onSubmit={save} className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-cream-200" noValidate>
            <h2 className="text-lg font-extrabold text-navy-900">Cập nhật người dùng</h2>
            <p className="mt-1 text-sm text-ink-400">POST /api/user/update</p>

            <div className="mt-6 space-y-4">
              <Input label="Email" value={user.email} disabled />
              <Input
                label="Họ và tên"
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                error={errors.fullName}
                required
              />
              <Input
                label="Số điện thoại"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                error={errors.phone}
              />
              <Input
                label="Mật khẩu mới"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                error={errors.password}
                required
              />
            </div>

            <div className="mt-6 flex justify-end">
              <Button type="submit" loading={saving}>
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
