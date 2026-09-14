import { useEffect, useState } from 'react';
import Hero from '../components/home/Hero';
import SearchBar from '../components/home/SearchBar';
import Stats from '../components/home/Stats';
import RoomsSection from '../components/home/RoomsSection';
import ToursSection from '../components/home/ToursSection';
import DiningSection from '../components/home/DiningSection';
import FeaturesSection from '../components/home/FeaturesSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import CtaSection from '../components/home/CtaSection';
import { hangPhongService } from '../services/hangPhongService';
import { ApiError } from '../services/http';
import type { HangPhongResponse } from '../types';

export default function Home() {
  const [rooms, setRooms] = useState<HangPhongResponse[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    hangPhongService
      .listActive(0, 3)
      .then((page) => {
        if (!alive) return;
        setRooms(page.data ?? []);
        setTotal(page.total ?? null);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!alive) return;
        const code = err instanceof ApiError ? err.code : 500;
        setError(
          code === 401 || code === 403
            ? 'Danh mục hạng phòng hiện yêu cầu đăng nhập (endpoint POST /api/hang-phong/filter chưa được permitAll ở backend).'
            : err instanceof ApiError
              ? err.message
              : 'Không tải được danh sách hạng phòng'
        );
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <Hero />
      <SearchBar />
      <Stats totalRoomTypes={total} />
      <RoomsSection rooms={rooms} loading={loading} error={error} />
      <ToursSection />
      <DiningSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CtaSection />
    </>
  );
}
