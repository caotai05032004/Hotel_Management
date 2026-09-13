import { useEffect, useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Field';
import { Alert, Loading } from '../../../components/ui/Feedback';
import { hangPhongService } from '../../../services/hangPhongService';
import { getErrorMessage } from '../../../services/http';
import type { AnhHangPhongResponse, HangPhongResponse } from '../../../types';

interface Props {
  open: boolean;
  hangPhong: HangPhongResponse | null;
  onClose: () => void;
  onChanged: (msg: string) => void;
}

/** Quản lý ảnh của hạng phòng: POST /{id}/anh và DELETE /{id}/anh/{anhId} */
export default function HangPhongImageModal({ open, hangPhong, onClose, onChanged }: Props) {
  const [images, setImages] = useState<AnhHangPhongResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ imageUrl: '', caption: '', sortOrder: '' });

  useEffect(() => {
    if (!open || !hangPhong) return;
    setError(null);
    setForm({ imageUrl: '', caption: '', sortOrder: '' });
    setLoading(true);
    hangPhongService
      .getById(hangPhong.id)
      .then((data) => setImages(data.images ?? []))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [open, hangPhong]);

  const reload = async () => {
    if (!hangPhong) return;
    const data = await hangPhongService.getById(hangPhong.id);
    setImages(data.images ?? []);
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hangPhong) return;
    if (!form.imageUrl.trim()) {
      setError('URL ảnh không được để trống');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await hangPhongService.addImage(hangPhong.id, {
        imageUrl: form.imageUrl.trim(),
        caption: form.caption.trim() || undefined,
        sortOrder: form.sortOrder ? Number(form.sortOrder) : undefined,
      });
      setForm({ imageUrl: '', caption: '', sortOrder: '' });
      await reload();
      onChanged('Đã thêm ảnh');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (anhId: string) => {
    if (!hangPhong) return;
    setError(null);
    try {
      await hangPhongService.removeImage(hangPhong.id, anhId);
      await reload();
      onChanged('Đã xoá ảnh');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Thư viện ảnh"
      subtitle={hangPhong ? `${hangPhong.code} — ${hangPhong.name}` : ''}
      footer={
        <Button variant="outline" onClick={onClose}>
          Đóng
        </Button>
      }
    >
      {error && (
        <div className="mb-4">
          <Alert tone="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </div>
      )}

      <form onSubmit={add} className="grid gap-3 rounded-xl bg-cream-50 p-4 ring-1 ring-cream-200 sm:grid-cols-[2fr_1fr_auto]">
        <Input
          label="URL ảnh"
          placeholder="https://…/deluxe-1.jpg"
          value={form.imageUrl}
          onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
          required
        />
        <Input
          label="Chú thích"
          placeholder="Ban công hướng biển"
          value={form.caption}
          onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))}
        />
        <div className="flex items-end">
          <Button type="submit" loading={saving}>
            Thêm ảnh
          </Button>
        </div>
      </form>

      <div className="mt-5">
        {loading ? (
          <Loading label="Đang tải ảnh…" />
        ) : images.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-400">Hạng phòng này chưa có ảnh nào.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {images.map((img) => (
              <figure key={img.id} className="overflow-hidden rounded-xl ring-1 ring-cream-200">
                <img src={img.imageUrl} alt={img.caption ?? ''} className="aspect-[4/3] w-full object-cover" />
                <figcaption className="flex items-center justify-between gap-2 bg-white px-3 py-2">
                  <span className="truncate text-xs text-ink-600">{img.caption || '—'}</span>
                  <button
                    onClick={() => remove(img.id)}
                    className="shrink-0 rounded-md px-2 py-1 text-xs font-bold text-red-600 transition hover:bg-red-50"
                  >
                    Xoá
                  </button>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
