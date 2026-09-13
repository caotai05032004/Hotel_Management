import { useEffect, useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { Select, Textarea } from '../../../components/ui/Field';
import { Alert } from '../../../components/ui/Feedback';
import { phongService } from '../../../services/phongService';
import { getErrorMessage } from '../../../services/http';
import { HOUSEKEEPING_LABEL, SERVICE_LABEL } from '../../../components/ui/Badge';
import { HOUSEKEEPING_STATUS, SERVICE_STATUS } from '../../../types';
import type { HousekeepingStatus, PhongResponse, ServiceStatus } from '../../../types';

interface Props {
  open: boolean;
  phong: PhongResponse | null;
  onClose: () => void;
  onSaved: (msg: string) => void;
}

/**
 * PATCH /api/phong/{id}/trang-thai
 * occupancyStatus KHÔNG đổi ở đây — backend chỉ đổi qua check-in / check-out.
 */
export default function PhongStatusModal({ open, phong, onClose, onSaved }: Props) {
  const [housekeeping, setHousekeeping] = useState<HousekeepingStatus>('CLEAN');
  const [service, setService] = useState<ServiceStatus>('IN_SERVICE');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !phong) return;
    setHousekeeping(phong.housekeepingStatus);
    setService(phong.serviceStatus);
    setNote(phong.note ?? '');
    setError(null);
  }, [open, phong]);

  const submit = async () => {
    if (!phong) return;
    setSaving(true);
    setError(null);
    try {
      await phongService.updateTrangThai(phong.id, {
        housekeepingStatus: housekeeping,
        serviceStatus: service,
        note: note.trim() || undefined,
      });
      onSaved(`Đã cập nhật trạng thái phòng ${phong.roomNumber}`);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={phong ? `Trạng thái phòng ${phong.roomNumber}` : 'Trạng thái phòng'}
      subtitle="Vệ sinh / kỹ thuật"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={submit} loading={saving}>
            Cập nhật
          </Button>
        </>
      }
    >
      {error && (
        <div className="mb-4">
          <Alert tone="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </div>
      )}

      <div className="space-y-4">
        <Select
          label="Trạng thái vệ sinh"
          value={housekeeping}
          onChange={(e) => setHousekeeping(e.target.value as HousekeepingStatus)}
        >
          {HOUSEKEEPING_STATUS.map((s) => (
            <option key={s} value={s}>
              {HOUSEKEEPING_LABEL[s].text} ({s})
            </option>
          ))}
        </Select>

        <Select
          label="Trạng thái khai thác"
          value={service}
          onChange={(e) => setService(e.target.value as ServiceStatus)}
        >
          {SERVICE_STATUS.map((s) => (
            <option key={s} value={s}>
              {SERVICE_LABEL[s].text} ({s})
            </option>
          ))}
        </Select>

        <Textarea label="Ghi chú" value={note} onChange={(e) => setNote(e.target.value)} />

        <p className="rounded-lg bg-cream-100 px-3 py-2 text-xs text-ink-400">
          Trạng thái lưu trú (VACANT / OCCUPIED) chỉ thay đổi qua nghiệp vụ check-in / check-out.
        </p>
      </div>
    </Modal>
  );
}
