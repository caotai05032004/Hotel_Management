import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { Input, Textarea } from '../../../components/ui/Field';
import { hangPhongService } from '../../../services/hangPhongService';
import { getErrorMessage, getFieldErrors } from '../../../services/http';
import { parseAmenities, stringifyAmenities } from '../../../lib/format';
import type { HangPhongRequest, HangPhongResponse } from '../../../types';

interface Props {
  open: boolean;
  /** null = tạo mới */
  editing: HangPhongResponse | null;
  onClose: () => void;
  onSaved: (msg: string) => void;
}

interface FormState {
  code: string;
  name: string;
  description: string;
  basePrice: string;
  maxAdults: string;
  maxChildren: string;
  bedType: string;
  areaSqm: string;
  amenities: string;
}

const EMPTY: FormState = {
  code: '',
  name: '',
  description: '',
  basePrice: '',
  maxAdults: '2',
  maxChildren: '1',
  bedType: '',
  areaSqm: '',
  amenities: '',
};

export default function HangPhongFormModal({ open, editing, onClose, onSaved }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(
      editing
        ? {
            code: editing.code ?? '',
            name: editing.name ?? '',
            description: editing.description ?? '',
            basePrice: editing.basePrice != null ? String(editing.basePrice) : '',
            maxAdults: String(editing.maxAdults ?? 2),
            maxChildren: String(editing.maxChildren ?? 1),
            bedType: editing.bedType ?? '',
            areaSqm: editing.areaSqm != null ? String(editing.areaSqm) : '',
            amenities: parseAmenities(editing.amenities).join(', '),
          }
        : EMPTY
    );
  }, [open, editing]);

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((s) => ({ ...s, [key]: '' }));
  };

  /** Validate khớp annotation của HangPhongRequest ở backend */
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.code.trim()) e.code = 'Mã hạng phòng không được để trống';
    else if (form.code.trim().length > 20) e.code = 'Tối đa 20 ký tự';
    if (!form.name.trim()) e.name = 'Tên hạng phòng không được để trống';
    else if (form.name.trim().length > 120) e.name = 'Tối đa 120 ký tự';
    if (!form.basePrice) e.basePrice = 'Giá cơ bản không được để trống';
    else if (Number(form.basePrice) < 0) e.basePrice = 'Giá không được âm';
    const adults = Number(form.maxAdults);
    if (form.maxAdults && (adults < 1 || adults > 10)) e.maxAdults = 'Từ 1 đến 10';
    const children = Number(form.maxChildren);
    if (form.maxChildren && (children < 0 || children > 10)) e.maxChildren = 'Từ 0 đến 10';
    if (form.bedType.length > 60) e.bedType = 'Tối đa 60 ký tự';
    return e;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const next = validate();
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    const payload: HangPhongRequest = {
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      basePrice: Number(form.basePrice),
      maxAdults: form.maxAdults ? Number(form.maxAdults) : undefined,
      maxChildren: form.maxChildren ? Number(form.maxChildren) : undefined,
      bedType: form.bedType.trim() || undefined,
      areaSqm: form.areaSqm ? Number(form.areaSqm) : undefined,
      amenities: form.amenities.trim()
        ? stringifyAmenities(form.amenities.split(','))
        : undefined,
    };

    setSaving(true);
    try {
      if (editing) {
        await hangPhongService.update(editing.id, payload);
        onSaved('Cập nhật hạng phòng thành công');
      } else {
        await hangPhongService.create(payload);
        onSaved('Tạo hạng phòng thành công');
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
      title={editing ? 'Cập nhật hạng phòng' : 'Thêm hạng phòng'}
      subtitle={editing ? editing.code : 'POST /api/hang-phong'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} type="button">
            Hủy
          </Button>
          <Button onClick={submit} loading={saving}>
            {editing ? 'Lưu thay đổi' : 'Tạo mới'}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
        <Input label="Mã hạng phòng" placeholder="DLX" value={form.code} onChange={set('code')} error={errors.code} required />
        <Input label="Tên hạng phòng" placeholder="Deluxe Ocean View" value={form.name} onChange={set('name')} error={errors.name} required />

        <Input
          label="Giá cơ bản (VNĐ/đêm)"
          type="number"
          min={0}
          step={1000}
          placeholder="2800000"
          value={form.basePrice}
          onChange={set('basePrice')}
          error={errors.basePrice}
          required
        />
        <Input label="Loại giường" placeholder="King Bed" value={form.bedType} onChange={set('bedType')} error={errors.bedType} />

        <Input label="Tối đa người lớn" type="number" min={1} max={10} value={form.maxAdults} onChange={set('maxAdults')} error={errors.maxAdults} />
        <Input label="Tối đa trẻ em" type="number" min={0} max={10} value={form.maxChildren} onChange={set('maxChildren')} error={errors.maxChildren} />

        <Input label="Diện tích (m²)" type="number" min={0} step={0.5} placeholder="45" value={form.areaSqm} onChange={set('areaSqm')} error={errors.areaSqm} />
        <Input
          label="Tiện nghi (phân cách bởi dấu phẩy)"
          placeholder="wifi, tv, minibar"
          value={form.amenities}
          onChange={set('amenities')}
          error={errors.amenities}
        />

        <div className="sm:col-span-2">
          <Textarea label="Mô tả" placeholder="Mô tả chi tiết hạng phòng…" value={form.description} onChange={set('description')} error={errors.description} />
        </div>
      </form>
    </Modal>
  );
}
