import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { formatVnd, parseAmenities } from '../../lib/format';
import type { HangPhongResponse } from '../../types';

/** Ảnh dự phòng khi hạng phòng chưa có ảnh trong bảng anh_hang_phong */
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=70',
  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=900&q=70',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=70',
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=70',
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=900&q=70',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=70',
];

interface Props {
  room: HangPhongResponse;
  index?: number;
}

export default function RoomCard({ room, index = 0 }: Props) {
  const image = room.images?.[0]?.imageUrl || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
  const amenities = parseAmenities(room.amenities).slice(0, 3);
  const guests = (room.maxAdults ?? 2) + (room.maxChildren ?? 0);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-cream-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden bg-cream-200">
        <img
          src={image}
          alt={room.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {room.areaSqm != null && (
          <span className="absolute left-3 top-3 rounded-lg bg-navy-900/85 px-2.5 py-1 text-[11px] font-bold text-gold-400 backdrop-blur-sm">
            {Number(room.areaSqm)} m²
          </span>
        )}
        <span className="absolute right-3 top-3 rounded-lg bg-gold-500 px-2.5 py-1 text-[11px] font-black uppercase text-navy-900">
          {room.code}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-lg font-extrabold text-navy-900">{room.name}</h3>
          <p className="mt-1 text-sm text-ink-400">
            👥 Tối đa {guests} khách
            {room.bedType ? ` · ${room.bedType}` : ''}
          </p>
        </div>

        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {amenities.map((a) => (
              <span
                key={a}
                className="rounded-md bg-cream-100 px-2 py-1 text-[11px] font-semibold text-ink-600"
              >
                {a}
              </span>
            ))}
          </div>
        )}

        {room.description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-ink-400">{room.description}</p>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-cream-200 pt-4">
          <div>
            <p className="text-xl font-black text-gold-700">{formatVnd(room.basePrice)}</p>
            <p className="text-xs text-ink-400">/đêm</p>
          </div>
          <Link to={`/rooms/${room.id}`}>
            <Button size="sm">Đặt phòng</Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
