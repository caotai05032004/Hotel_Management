import { Link } from 'react-router-dom';
import SectionHeading from './SectionHeading';
import RoomCard from '../room/RoomCard';
import { Loading } from '../ui/Feedback';
import type { HangPhongResponse } from '../../types';

interface Props {
  rooms: HangPhongResponse[];
  loading: boolean;
}

/** Section "Phòng & Villa Cao Cấp" — dữ liệu lấy từ POST /api/hang-phong/filter */
export default function RoomsSection({ rooms, loading }: Props) {
  return (
    <section id="rooms" className="container-page py-20">
      <SectionHeading
        eyebrow="Lưu trú"
        title="Phòng & Villa Cao Cấp"
        description="Không gian nghỉ dưỡng sang trọng với tầm nhìn tuyệt đẹp ra biển và vườn nhiệt đới"
      />

      <div className="mt-12">
        {loading && <Loading label="Đang tải hạng phòng…" />}

        {!loading && rooms.length === 0 && (
          <p className="text-center text-sm text-ink-400">
            Chưa có hạng phòng nào được đăng. Hãy thêm hạng phòng trong khu quản trị.
          </p>
        )}

        {!loading && rooms.length > 0 && (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map((r, i) => (
                <RoomCard key={r.id} room={r} index={i} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                to="/rooms"
                className="inline-block rounded-xl border-2 border-navy-900/15 px-8 py-3 text-sm font-bold text-navy-900 transition hover:border-gold-500 hover:text-gold-700"
              >
                Xem tất cả hạng phòng →
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
