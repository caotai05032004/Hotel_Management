import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { Input, Select, Textarea } from '../../../components/ui/Field';
import { phongService } from '../../../services/phongService';
import { getErrorMessage, getFieldErrors } from '../../../services/http';
import type { HangPhongResponse, PhongRequest, PhongResponse } from '../../../types';

interface Props {
  open: boolean;
  editing: PhongResponse | null;
  hangPhongOptions: HangPhongResponse[];
  onClose: () => void;
  onSaved: (msg: string) => void;
}

const EMPTY = { hangPhongId: '', roomNumber: '', floorNo: '1', note: '' };

export default function PhongFormModal({ open, editing, hangPhongOptions, onClose, onSaved }: Props) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(
      editing
        ? {
            hangPhongId: editing.hangPhongId ?? '',
            roomNumber: editing.roomNumber ?? '',
            floorNo: String(editing.floorNo ?? 1),
            note: editing.note ?? '',
          }
        : { ...EMPTY, hangPhongId: hangPhongOptions[0]?.id ?? '' }
    );
  }, [open, editing, hangPhongOptions]);

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();

    const next: Record<string, string> = {};
    if (!form.hangPhongId) next.hangPhongId = 'Hạng phòng không được để trống';
    if (!form.roomNumber.trim()) next.roomNumber = 'Số phòng không được để trống';
    else if (form.roomNumber.trim().length > 10) next.roomNumber = 'Tối đa 10 ký tự';
    if (form.floorNo === '') next.floorNo = 'Tầng không được để trống';
    if (form.note.length > 255) next.note = 'Tối đa 255 ký tự';
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    const payload: PhongRequest = {
      hangPhongId: form.hangPhongId,
      roomNumber: form.roomNumber.trim(),
      floorNo: Number(form.floorNo),
      note: form.note.trim() || undefined,
    };

    setSaving(true);
    try {
      if (editing) {
        await phongService.update(editing.id, payload);
        onSaved('Cập nhật phòng thành công');
      } else {
        await phongService.create(payload);
        onSaved('Tạo phòng thành công');
      }
      onClose();
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (Object.keys(fieldErrors).length) setErrors(fieldErrors);
      else toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? `Cập nhật phòng ${editing.roomNumber}` : 'Thêm phòng'}
      subtitle={editing ? 'PUT /api/phong/{id}' : 'POST /api/phong'}
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={submit} loading={saving}>
            {editing ? 'Lưu thay đổi' : 'Tạo mới'}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
        <div className="sm:col-span-2">
          <Select
            label="Hạng phòng"
            value={form.hangPhongId}
            onChange={(e) => setForm((f) => ({ ...f, hangPhongId: e.target.value }))}
            error={errors.hangPhongId}
            required
          >
            <option value="">— Chọn hạng phòng —</option>
            {hangPhongOptions.map((h) => (
              <option key={h.id} value={h.id}>
                {h.code} — {h.name}
              </option>
            ))}
          </Select>
        </div>

        <Input
          label="Số phòng"
          placeholder="101"
          value={form.roomNumber}
          onChange={(e) => setForm((f) => ({ ...f, roomNumber: e.target.value }))}
          error={errors.roomNumber}
          required
        />
        <Input
          label="Tầng"
          type="number"
          value={form.floorNo}
          onChange={(e) => setForm((f) => ({ ...f, floorNo: e.target.value }))}
          error={errors.floorNo}
          required
        />

        <div className="sm:col-span-2">
          <Textarea
            label="Ghi chú"
            placeholder="Phòng góc, view biển…"
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            error={errors.note}
          />
        </div>
      </form>
    </Modal>
  );
}
