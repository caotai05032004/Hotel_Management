import { useCallback, useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import Badge, { HOUSEKEEPING_LABEL, OCCUPANCY_LABEL, SERVICE_LABEL } from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import { EmptyState, Loading } from '../../components/ui/Feedback';
import { toast } from 'sonner';
import PhongFormModal from './components/PhongFormModal';
import PhongStatusModal from './components/PhongStatusModal';
import { phongService } from '../../services/phongService';
import { hangPhongService } from '../../services/hangPhongService';
import { getErrorMessage } from '../../services/http';
import { formatDateTime, formatNumber } from '../../lib/format';
import { useAuth } from '../../context/useAuth';
import { HOUSEKEEPING_STATUS, OCCUPANCY_STATUS, SERVICE_STATUS } from '../../types';
import type { FilterCriteria, HangPhongResponse, PhongResponse } from '../../types';

const PAGE_SIZE = 10;

export default function PhongPage() {
  const { hasRole } = useAuth();
  const canEdit = hasRole('MANAGER', 'ADMIN');

  const [rows, setRows] = useState<PhongResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const [hangPhongOptions, setHangPhongOptions] = useState<HangPhongResponse[]>([]);

  const [roomNumber, setRoomNumber] = useState('');
  const [appliedRoomNumber, setAppliedRoomNumber] = useState('');
  const [hangPhongId, setHangPhongId] = useState('');
  const [occupancy, setOccupancy] = useState('');
  const [housekeeping, setHousekeeping] = useState('');
  const [service, setService] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PhongResponse | null>(null);
  const [statusTarget, setStatusTarget] = useState<PhongResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PhongResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* Danh sách hạng phòng cho dropdown (form + bộ lọc) */
  useEffect(() => {
    hangPhongService
      .filter({ page: 0, size: 200, sorts: [{ fieldName: 'code', direction: 'ASC' }] })
      .then((res) => setHangPhongOptions(res.data ?? []))
      .catch(() => setHangPhongOptions([]));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const filters: FilterCriteria[] = [];
      if (appliedRoomNumber)
        filters.push({ fieldName: 'roomNumber', operation: 'LIKE', value: appliedRoomNumber, logicType: 'AND' });
      if (hangPhongId)
        filters.push({ fieldName: 'hangPhong', operation: 'EQUALS', value: hangPhongId, logicType: 'AND' });
      if (occupancy)
        filters.push({ fieldName: 'occupancyStatus', operation: 'EQUALS', value: occupancy, logicType: 'AND' });
      if (housekeeping)
        filters.push({ fieldName: 'housekeepingStatus', operation: 'EQUALS', value: housekeeping, logicType: 'AND' });
      if (service)
        filters.push({ fieldName: 'serviceStatus', operation: 'EQUALS', value: service, logicType: 'AND' });

      const res = await phongService.filter({
        filters,
        sorts: [
          { fieldName: 'floorNo', direction: 'ASC' },
          { fieldName: 'roomNumber', direction: 'ASC' },
        ],
        page,
        size: PAGE_SIZE,
      });
      setRows(res.data ?? []);
      setTotal(res.total ?? 0);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [appliedRoomNumber, hangPhongId, occupancy, housekeeping, service, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const onSaved = (msg: string) => {
    toast.success(msg);
    void load();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await phongService.remove(deleteTarget.id);
      toast.success(`Đã xoá phòng ${deleteTarget.roomNumber}`);
      setDeleteTarget(null);
      void load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-900">Phòng</h1>
          <p className="mt-1 text-sm text-ink-400">
            Phòng vật lý · {formatNumber(total)} bản ghi
          </p>
        </div>
        {canEdit && (
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            + Thêm phòng
          </Button>
        )}
      </div>

      {/* Bộ lọc */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setAppliedRoomNumber(roomNumber.trim());
          setPage(0);
        }}
        className="grid gap-3 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-cream-200 md:grid-cols-3 xl:grid-cols-6"
      >
        <FilterField label="Số phòng">
          <input
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            placeholder="101"
            className="w-full rounded-xl border border-cream-300 px-3 py-2.5 text-sm focus:border-gold-500 focus:outline-none"
          />
        </FilterField>

        <FilterField label="Hạng phòng">
          <select
            value={hangPhongId}
            onChange={(e) => {
              setHangPhongId(e.target.value);
              setPage(0);
            }}
            className="w-full rounded-xl border border-cream-300 px-3 py-2.5 text-sm focus:border-gold-500 focus:outline-none"
          >
            <option value="">Tất cả</option>
            {hangPhongOptions.map((h) => (
              <option key={h.id} value={h.id}>
                {h.code}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Lưu trú">
          <select
            value={occupancy}
            onChange={(e) => {
              setOccupancy(e.target.value);
              setPage(0);
            }}
            className="w-full rounded-xl border border-cream-300 px-3 py-2.5 text-sm focus:border-gold-500 focus:outline-none"
          >
            <option value="">Tất cả</option>
            {OCCUPANCY_STATUS.map((s) => (
              <option key={s} value={s}>
                {OCCUPANCY_LABEL[s].text}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Vệ sinh">
          <select
            value={housekeeping}
            onChange={(e) => {
              setHousekeeping(e.target.value);
              setPage(0);
            }}
            className="w-full rounded-xl border border-cream-300 px-3 py-2.5 text-sm focus:border-gold-500 focus:outline-none"
          >
            <option value="">Tất cả</option>
            {HOUSEKEEPING_STATUS.map((s) => (
              <option key={s} value={s}>
                {HOUSEKEEPING_LABEL[s].text}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Trạng thái vận hành">
          <select
            value={service}
            onChange={(e) => {
              setService(e.target.value);
              setPage(0);
            }}
            className="w-full rounded-xl border border-cream-300 px-3 py-2.5 text-sm focus:border-gold-500 focus:outline-none"
          >
            <option value="">Tất cả</option>
            {SERVICE_STATUS.map((s) => (
              <option key={s} value={s}>
                {SERVICE_LABEL[s].text}
              </option>
            ))}
          </select>
        </FilterField>

        <div className="flex items-end">
          <Button type="submit" variant="dark" className="w-full">
            Lọc
          </Button>
        </div>
      </form>

      {loading ? (
        <Loading />
      ) : rows.length === 0 ? (
        <EmptyState title="Không có phòng nào" description="Thử bỏ bớt bộ lọc hoặc thêm phòng mới." />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-cream-200">
          <div className="scroll-thin overflow-x-auto">
            <table className="w-full min-w-4xl text-left text-sm">
              <thead className="bg-cream-100 text-[11px] uppercase tracking-wider text-ink-400">
                <tr>
                  <th className="px-4 py-3 font-bold">Phòng</th>
                  <th className="px-4 py-3 font-bold">Hạng phòng</th>
                  <th className="px-4 py-3 font-bold">Tầng</th>
                  <th className="px-4 py-3 font-bold">Lưu trú</th>
                  <th className="px-4 py-3 font-bold">Vệ sinh</th>
                  <th className="px-4 py-3 font-bold">Vận hành</th>
                  <th className="px-4 py-3 font-bold">Cập nhật</th>
                  <th className="px-4 py-3 text-right font-bold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {rows.map((row) => (
                  <tr key={row.id} className="transition hover:bg-cream-50">
                    <td className="px-4 py-3">
                      <p className="font-black text-navy-900">{row.roomNumber}</p>
                      {row.note && (
                        <p className="max-w-40 truncate text-xs text-ink-400" title={row.note}>
                          {row.note}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-600">
                      <p className="font-semibold text-navy-900">{row.hangPhongCode}</p>
                      <p className="truncate text-xs text-ink-400">{row.hangPhongName}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-600">{row.floorNo}</td>
                    <td className="px-4 py-3">
                      <Badge tone={OCCUPANCY_LABEL[row.occupancyStatus].tone}>
                        {OCCUPANCY_LABEL[row.occupancyStatus].text}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={HOUSEKEEPING_LABEL[row.housekeepingStatus].tone}>
                        {HOUSEKEEPING_LABEL[row.housekeepingStatus].text}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={SERVICE_LABEL[row.serviceStatus].tone}>
                        {SERVICE_LABEL[row.serviceStatus].text}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-ink-400">
                      {formatDateTime(row.updatedAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setStatusTarget(row)}
                          className="rounded-lg border border-cream-300 px-2.5 py-1.5 text-xs font-bold text-ink-600 transition hover:border-gold-400 hover:text-navy-900"
                        >
                          Trạng thái
                        </button>
                        {canEdit && (
                          <>
                            <button
                              onClick={() => {
                                setEditing(row);
                                setFormOpen(true);
                              }}
                              className="rounded-lg border border-cream-300 px-2.5 py-1.5 text-xs font-bold text-ink-600 transition hover:border-gold-400 hover:text-navy-900"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => setDeleteTarget(row)}
                              className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50"
                            >
                              Xoá
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 pb-4">
            <Pagination page={page} size={PAGE_SIZE} total={total} onChange={setPage} />
          </div>
        </div>
      )}

      <PhongFormModal
        open={formOpen}
        editing={editing}
        hangPhongOptions={hangPhongOptions}
        onClose={() => setFormOpen(false)}
        onSaved={onSaved}
      />

      <PhongStatusModal
        open={!!statusTarget}
        phong={statusTarget}
        onClose={() => setStatusTarget(null)}
        onSaved={onSaved}
      />

      <Modal
        open={!!deleteTarget}
        size="sm"
        title="Xoá phòng"
        onClose={() => setDeleteTarget(null)}
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Hủy
            </Button>
            <Button variant="danger" onClick={confirmDelete} loading={deleting}>
              Xoá phòng
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-600">
          Bạn chắc chắn muốn xoá phòng <b className="text-navy-900">{deleteTarget?.roomNumber}</b>?
          Backend chỉ cho xoá khi phòng chưa có lịch sử lưu trú.
        </p>
      </Modal>
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-ink-400">
        {label}
      </label>
      {children}
    </div>
  );
}
