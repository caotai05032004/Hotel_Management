import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import RoomCard from '../components/room/RoomCard';
import Pagination from '../components/ui/Pagination';
import { Alert, EmptyState, Loading } from '../components/ui/Feedback';
import Button from '../components/ui/Button';
import { hangPhongService } from '../services/hangPhongService';
import { getErrorMessage } from '../services/http';
import type { FilterCriteria, HangPhongResponse, SortDirection } from '../types';

const PAGE_SIZE = 9;

export default function Rooms() {
  const [params, setParams] = useSearchParams();
  const guests = Number(params.get('guests') ?? 0);

  const [keyword, setKeyword] = useState(params.get('q') ?? '');
  const [sort, setSort] = useState<SortDirection>('ASC');
  const [page, setPage] = useState(0);

  const [rooms, setRooms] = useState<HangPhongResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: FilterCriteria[] = [
        { fieldName: 'isActive', operation: 'EQUALS', value: true, logicType: 'AND' },
      ];
      if (guests > 0) {
        filters.push({
          fieldName: 'maxAdults',
          operation: 'GREATER_THAN_OR_EQUAL',
          value: guests,
          logicType: 'AND',
        });
      }
      const q = params.get('q');
      if (q) {
        filters.push({ fieldName: 'name', operation: 'LIKE', value: q, logicType: 'AND' });
      }

      const res = await hangPhongService.filter({
        filters,
        sorts: [{ fieldName: 'basePrice', direction: sort }],
        page,
        size: PAGE_SIZE,
      });
      setRooms(res.data ?? []);
      setTotal(res.total ?? 0);
    } catch (err) {
      setError(getErrorMessage(err));
      setRooms([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [guests, page, sort, params]);

  useEffect(() => {
    void load();
  }, [load]);

  const applySearch = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(params);
    if (keyword.trim()) next.set('q', keyword.trim());
    else next.delete('q');
    setParams(next);
    setPage(0);
  };

  const checkIn = params.get('checkIn');
  const checkOut = params.get('checkOut');

  return (
    <>
      {/* Banner đầu trang */}
      <section className="relative isolate overflow-hidden bg-navy-900 py-20">
        <img
          src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=70"
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-25"
        />
        <div className="container-page text-center">
          <p className="eyebrow text-gold-500">Lưu trú</p>
          <h1 className="mt-3 text-4xl font-black text-white sm:text-5xl">Phòng &amp; Villa Cao Cấp</h1>
          <p className="mx-auto mt-4 max-w-xl text-cream-200/70">
            {guests > 0
              ? `Hạng phòng phù hợp cho ${guests} khách`
              : 'Toàn bộ hạng phòng đang kinh doanh tại PhucNguyen Resort'}
          </p>
          {checkIn && checkOut && (
            <p className="mt-2 text-sm font-semibold text-gold-400">
              {checkIn} → {checkOut}
            </p>
          )}
        </div>
      </section>

      <section className="container-page py-12">
        {/* Thanh lọc */}
        <form
          onSubmit={applySearch}
          className="mb-8 flex flex-wrap items-end gap-3 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-cream-200"
        >
          <div className="min-w-56 flex-1">
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-ink-400">
              Tìm theo tên hạng phòng
            </label>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Deluxe, Villa, Suite…"
              className="w-full rounded-xl border border-cream-300 px-4 py-2.5 text-sm focus:border-gold-500 focus:outline-none focus:ring-4 focus:ring-gold-500/15"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-ink-400">
              Sắp xếp giá
            </label>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as SortDirection);
                setPage(0);
              }}
              className="rounded-xl border border-cream-300 px-4 py-2.5 text-sm font-semibold focus:border-gold-500 focus:outline-none"
            >
              <option value="ASC">Thấp → cao</option>
              <option value="DESC">Cao → thấp</option>
            </select>
          </div>

          <Button type="submit">Lọc</Button>
        </form>

        {loading && <Loading label="Đang tải hạng phòng…" />}

        {!loading && error && <Alert tone="error">{error}</Alert>}

        {!loading && !error && rooms.length === 0 && (
          <EmptyState
            title="Không tìm thấy hạng phòng phù hợp"
            description="Thử bỏ bớt điều kiện lọc hoặc chọn số khách ít hơn."
          />
        )}

        {!loading && rooms.length > 0 && (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map((r, i) => (
                <RoomCard key={r.id} room={r} index={i} />
              ))}
            </div>
            <Pagination page={page} size={PAGE_SIZE} total={total} onChange={setPage} />
          </>
        )}
      </section>
    </>
  );
}
