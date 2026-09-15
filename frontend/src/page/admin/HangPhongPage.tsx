import { useCallback, useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import { EmptyState, Loading } from '../../components/ui/Feedback';
import { toast } from 'sonner';
import HangPhongFormModal from './components/HangPhongFormModal';
import HangPhongImageModal from './components/HangPhongImageModal';
import { hangPhongService } from '../../services/hangPhongService';
import { getErrorMessage } from '../../services/http';
import { formatNumber, formatVnd, parseAmenities } from '../../lib/format';
import { useAuth } from '../../context/useAuth';
import type { FilterCriteria, HangPhongResponse } from '../../types';

const PAGE_SIZE = 10;

export default function HangPhongPage() {
  const { hasRole } = useAuth();
  const canEdit = hasRole('MANAGER', 'ADMIN');

  const [rows, setRows] = useState<HangPhongResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<HangPhongResponse | null>(null);
  const [imageTarget, setImageTarget] = useState<HangPhongResponse | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const filters: FilterCriteria[] = [];
      if (appliedKeyword) {
        filters.push({ fieldName: 'name', operation: 'LIKE', value: appliedKeyword, logicType: 'AND' });
      }
      if (statusFilter !== 'ALL') {
        filters.push({
          fieldName: 'isActive',
          operation: 'EQUALS',
          value: statusFilter === 'ACTIVE',
          logicType: 'AND',
        });
      }
      const res = await hangPhongService.filter({
        filters,
        sorts: [{ fieldName: 'code', direction: 'ASC' }],
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
  }, [appliedKeyword, statusFilter, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const onSaved = (msg: string) => {
    toast.success(msg);
    void load();
  };

  const toggleActive = async (row: HangPhongResponse) => {
    try {
      await hangPhongService.setActive(row.id, !row.isActive);
      toast.success(row.isActive ? 'Đã ngừng kinh doanh hạng phòng' : 'Đã kích hoạt hạng phòng');
      void load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-900">Hạng phòng</h1>
          <p className="mt-1 text-sm text-ink-400">
            Danh mục hạng phòng · {formatNumber(total)} bản ghi
          </p>
        </div>
        {canEdit && (
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            + Thêm hạng phòng
          </Button>
        )}
      </div>

      {/* Bộ lọc */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setAppliedKeyword(keyword.trim());
          setPage(0);
        }}
        className="flex flex-wrap items-end gap-3 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-cream-200"
      >
        <div className="min-w-56 flex-1">
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-ink-400">
            Tên hạng phòng
          </label>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Deluxe, Villa…"
            className="w-full rounded-xl border border-cream-300 px-4 py-2.5 text-sm focus:border-gold-500 focus:outline-none focus:ring-4 focus:ring-gold-500/15"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-ink-400">
            Trạng thái
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as typeof statusFilter);
              setPage(0);
            }}
            className="rounded-xl border border-cream-300 px-4 py-2.5 text-sm font-semibold focus:border-gold-500 focus:outline-none"
          >
            <option value="ALL">Tất cả</option>
            <option value="ACTIVE">Đang kinh doanh</option>
            <option value="INACTIVE">Ngừng kinh doanh</option>
          </select>
        </div>
        <Button type="submit" variant="dark">
          Lọc
        </Button>
      </form>

      {loading ? (
        <Loading />
      ) : rows.length === 0 ? (
        <EmptyState title="Chưa có hạng phòng nào" description="Nhấn “Thêm hạng phòng” để tạo mới." />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-cream-200">
          <div className="scroll-thin overflow-x-auto">
            <table className="w-full min-w-4xl text-left text-sm">
              <thead className="bg-cream-100 text-[11px] uppercase tracking-wider text-ink-400">
                <tr>
                  <Th>Mã</Th>
                  <Th>Tên hạng phòng</Th>
                  <Th>Giá / đêm</Th>
                  <Th>Sức chứa</Th>
                  <Th>Diện tích</Th>
                  <Th>Số phòng</Th>
                  <Th>Trạng thái</Th>
                  <Th className="text-right">Thao tác</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {rows.map((row) => (
                  <tr key={row.id} className="transition hover:bg-cream-50">
                    <Td>
                      <span className="font-black text-navy-900">{row.code}</span>
                    </Td>
                    <Td>
                      <p className="font-bold text-navy-900">{row.name}</p>
                      {parseAmenities(row.amenities).length > 0 && (
                        <p className="mt-0.5 truncate text-xs text-ink-400">
                          {parseAmenities(row.amenities).slice(0, 4).join(' · ')}
                        </p>
                      )}
                    </Td>
                    <Td>
                      <span className="font-bold text-gold-700">{formatVnd(row.basePrice)}</span>
                    </Td>
                    <Td>
                      {row.maxAdults ?? 2} NL · {row.maxChildren ?? 0} TE
                    </Td>
                    <Td>{row.areaSqm ? `${Number(row.areaSqm)} m²` : '—'}</Td>
                    <Td>{row.soPhong ?? 0}</Td>
                    <Td>
                      {row.isActive ? (
                        <Badge tone="green">Đang KD</Badge>
                      ) : (
                        <Badge tone="slate">Ngừng KD</Badge>
                      )}
                    </Td>
                    <Td className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <TableBtn onClick={() => setImageTarget(row)}>Ảnh</TableBtn>
                        {canEdit && (
                          <>
                            <TableBtn
                              onClick={() => {
                                setEditing(row);
                                setFormOpen(true);
                              }}
                            >
                              Sửa
                            </TableBtn>
                            <TableBtn tone={row.isActive ? 'danger' : 'success'} onClick={() => toggleActive(row)}>
                              {row.isActive ? 'Ngừng' : 'Bật'}
                            </TableBtn>
                          </>
                        )}
                      </div>
                    </Td>
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

      <HangPhongFormModal
        open={formOpen}
        editing={editing}
        onClose={() => setFormOpen(false)}
        onSaved={onSaved}
      />
      <HangPhongImageModal
        open={!!imageTarget}
        hangPhong={imageTarget}
        onClose={() => setImageTarget(null)}
        onChanged={onSaved}
      />
    </div>
  );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`whitespace-nowrap px-4 py-3 font-bold ${className}`}>{children}</th>;
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-middle text-ink-600 ${className}`}>{children}</td>;
}

function TableBtn({
  children,
  onClick,
  tone = 'default',
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone?: 'default' | 'danger' | 'success';
}) {
  const tones = {
    default: 'border-cream-300 text-ink-600 hover:border-gold-400 hover:text-navy-900',
    danger: 'border-red-200 text-red-600 hover:bg-red-50',
    success: 'border-emerald-200 text-emerald-700 hover:bg-emerald-50',
  };
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold transition ${tones[tone]}`}
    >
      {children}
    </button>
  );
}
