import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { hangPhongService } from '../../services/hangPhongService';
import { phongService } from '../../services/phongService';
import { getErrorMessage } from '../../services/http';
import { Alert, Loading } from '../../components/ui/Feedback';
import Badge, { HOUSEKEEPING_LABEL, OCCUPANCY_LABEL, SERVICE_LABEL } from '../../components/ui/Badge';
import { formatNumber, formatVnd } from '../../lib/format';
import { useAuth } from '../../context/useAuth';
import type { HangPhongResponse, PhongResponse } from '../../types';

interface Summary {
  totalHangPhong: number;
  activeHangPhong: number;
  totalPhong: number;
  vacant: number;
  occupied: number;
  dirty: number;
  outOfOrder: number;
  topRooms: HangPhongResponse[];
  recentPhong: PhongResponse[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        /* Backend chưa có endpoint thống kê -> gom số liệu từ 2 API filter. */
        const [hangPhongPage, phongPage] = await Promise.all([
          hangPhongService.filter({ page: 0, size: 200 }),
          phongService.filter({ page: 0, size: 500 }),
        ]);

        const hp = hangPhongPage.data ?? [];
        const ph = phongPage.data ?? [];

        if (!alive) return;
        setData({
          totalHangPhong: hangPhongPage.total ?? hp.length,
          activeHangPhong: hp.filter((h) => h.isActive).length,
          totalPhong: phongPage.total ?? ph.length,
          vacant: ph.filter((p) => p.occupancyStatus === 'VACANT').length,
          occupied: ph.filter((p) => p.occupancyStatus === 'OCCUPIED').length,
          dirty: ph.filter((p) => p.housekeepingStatus === 'DIRTY').length,
          outOfOrder: ph.filter((p) => p.serviceStatus !== 'IN_SERVICE').length,
          topRooms: [...hp].sort((a, b) => Number(b.basePrice) - Number(a.basePrice)).slice(0, 5),
          recentPhong: ph.slice(0, 6),
        });
      } catch (err) {
        if (alive) setError(getErrorMessage(err));
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <Loading label="Đang tổng hợp số liệu…" />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-navy-900">Xin chào, {user?.fullName} 👋</h1>
        <p className="mt-1 text-sm text-ink-400">Tổng quan tình trạng phòng và danh mục hạng phòng</p>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Hạng phòng" value={formatNumber(data.totalHangPhong)} hint={`${data.activeHangPhong} đang kinh doanh`} icon="🏷️" />
            <StatCard label="Phòng vật lý" value={formatNumber(data.totalPhong)} hint={`${data.vacant} trống · ${data.occupied} đang ở`} icon="🛏️" />
            <StatCard label="Chưa dọn" value={formatNumber(data.dirty)} hint="Cần buồng phòng xử lý" icon="🧹" tone="amber" />
            <StatCard label="Ngừng khai thác" value={formatNumber(data.outOfOrder)} hint="Hỏng hóc / bảo trì" icon="🚧" tone="red" />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Panel title="Hạng phòng giá cao nhất" to="/admin/hang-phong">
              <ul className="divide-y divide-cream-200">
                {data.topRooms.map((h) => (
                  <li key={h.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-navy-900">{h.name}</p>
                      <p className="text-xs text-ink-400">
                        {h.code} · {h.soPhong ?? 0} phòng
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-black text-gold-700">{formatVnd(h.basePrice)}</p>
                  </li>
                ))}
                {data.topRooms.length === 0 && <li className="py-6 text-sm text-ink-400">Chưa có dữ liệu</li>}
              </ul>
            </Panel>

            <Panel title="Phòng mới cập nhật" to="/admin/phong">
              <ul className="divide-y divide-cream-200">
                {data.recentPhong.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-navy-900">
                        Phòng {p.roomNumber} · Tầng {p.floorNo}
                      </p>
                      <p className="truncate text-xs text-ink-400">{p.hangPhongName}</p>
                    </div>
                    <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                      <Badge tone={OCCUPANCY_LABEL[p.occupancyStatus].tone}>
                        {OCCUPANCY_LABEL[p.occupancyStatus].text}
                      </Badge>
                      <Badge tone={HOUSEKEEPING_LABEL[p.housekeepingStatus].tone}>
                        {HOUSEKEEPING_LABEL[p.housekeepingStatus].text}
                      </Badge>
                      <Badge tone={SERVICE_LABEL[p.serviceStatus].tone}>
                        {SERVICE_LABEL[p.serviceStatus].text}
                      </Badge>
                    </div>
                  </li>
                ))}
                {data.recentPhong.length === 0 && <li className="py-6 text-sm text-ink-400">Chưa có dữ liệu</li>}
              </ul>
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
  tone = 'navy',
}: {
  label: string;
  value: string;
  hint?: string;
  icon: string;
  tone?: 'navy' | 'amber' | 'red';
}) {
  const ring =
    tone === 'amber' ? 'ring-amber-200' : tone === 'red' ? 'ring-red-200' : 'ring-cream-200';
  return (
    <div className={`rounded-2xl bg-white p-5 shadow-soft ring-1 ${ring}`}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-ink-400">{label}</p>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-black text-navy-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
    </div>
  );
}

function Panel({ title, to, children }: { title: string; to: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-cream-200">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-base font-extrabold text-navy-900">{title}</h2>
        <Link to={to} className="text-xs font-bold text-gold-700 hover:underline">
          Xem tất cả →
        </Link>
      </div>
      {children}
    </section>
  );
}
