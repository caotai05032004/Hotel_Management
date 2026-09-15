/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Loading } from '../components/ui/Feedback';
import { hangPhongService } from '../services/hangPhongService';
import { getErrorMessage } from '../services/http';
import { formatVnd, parseAmenities } from '../lib/format';
import BookingModal from '../components/booking/BookingModal';
import type { HangPhongResponse } from '../types';

const FALLBACK = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&q=75';

export default function RoomDetail() {
  const { id = '' } = useParams();

  const [room, setRoom] = useState<HangPhongResponse | null>(null);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    hangPhongService
      .getById(id)
      .then((data) => alive && setRoom(data))
      .catch((err) => alive && toast.error(getErrorMessage(err)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) return <Loading label="Đang tải thông tin hạng phòng…" />;

  if (!room) {
    return (
      <div className="container-page py-20">
        <p className="text-sm font-semibold text-red-700">Không tìm thấy hạng phòng</p>
        <Link to="/rooms" className="mt-6 inline-block text-sm font-bold text-gold-700">
          ← Quay lại danh sách phòng
        </Link>
      </div>
    );
  }

  const images = room.images?.length ? room.images.map((i) => i.imageUrl) : [FALLBACK];
  const amenities = parseAmenities(room.amenities);

  return (
    <div className="container-page py-10">
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        hangPhong={room}
      />
      <nav className="mb-6 text-sm text-ink-400">
        <Link to="/" className="hover:text-navy-900">
          Trang chủ
        </Link>
        <span className="mx-2">/</span>
        <Link to="/rooms" className="hover:text-navy-900">
          Phòng
        </Link>
        <span className="mx-2">/</span>
        <span className="font-semibold text-navy-900">{room.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        {/* Ảnh + mô tả */}
        <div>
          <div className="overflow-hidden rounded-2xl bg-cream-200 shadow-card">
            <img
              src={images[active]}
              alt={room.name}
              className="aspect-16/10 w-full object-cover"
            />
          </div>

          {images.length > 1 && (
            <div className="mt-3 flex gap-3 overflow-x-auto scroll-thin pb-1">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => setActive(i)}
                  className={
                    'h-20 w-28 shrink-0 overflow-hidden rounded-xl ring-2 transition ' +
                    (i === active ? 'ring-gold-500' : 'ring-transparent hover:ring-cream-300')
                  }
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-8">
            <h1 className="text-3xl font-black text-navy-900 sm:text-4xl">{room.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge tone="gold">{room.code}</Badge>
              {room.isActive ? (
                <Badge tone="green">Đang kinh doanh</Badge>
              ) : (
                <Badge tone="slate">Ngừng kinh doanh</Badge>
              )}
              {room.soPhong != null && <Badge tone="blue">{room.soPhong} phòng vật lý</Badge>}
            </div>

            {room.description && (
              <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-ink-600">
                {room.description}
              </p>
            )}

            {amenities.length > 0 && (
              <div className="mt-8">
                <h2 className="text-sm font-bold uppercase tracking-wider text-ink-400">Tiện nghi</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {amenities.map((a) => (
                    <span
                      key={a}
                      className="rounded-lg bg-cream-100 px-3 py-1.5 text-sm font-semibold text-ink-600 ring-1 ring-cream-300"
                    >
                      ✓ {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Thẻ đặt phòng */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-cream-200">
            <p className="text-sm text-ink-400">Giá từ</p>
            <p className="text-3xl font-black text-gold-700">{formatVnd(room.basePrice)}</p>
            <p className="text-sm text-ink-400">mỗi đêm</p>

            <dl className="mt-6 space-y-3 border-t border-cream-200 pt-5 text-sm">
              <Row label="Sức chứa">
                {room.maxAdults ?? 2} người lớn · {room.maxChildren ?? 0} trẻ em
              </Row>
              <Row label="Loại giường">{room.bedType || '—'}</Row>
              <Row label="Diện tích">{room.areaSqm ? `${Number(room.areaSqm)} m²` : '—'}</Row>
            </dl>

            <div className="mt-6">
              <Button
                className="w-full"
                size="lg"
                onClick={() => setIsBookingOpen(true)}
              >
                Đặt phòng ngay
              </Button>
              <p className="mt-3 text-center text-xs text-ink-400">
                Miễn phí hủy trong 48h theo chính sách của resort
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-ink-400">{label}</dt>
      <dd className="text-right font-semibold text-navy-900">{children}</dd>
    </div>
  );
}
