import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/** Thanh tìm phòng của homepage — đẩy tham số sang /rooms để lọc qua API. */
export default function SearchBar() {
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [guests, setGuests] = useState('2');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({ checkIn, checkOut, guests });
    navigate(`/rooms?${params.toString()}`);
  };

  return (
    <section id="search" className="container-page -mt-16 relative z-10">
      <form
        onSubmit={submit}
        className="grid gap-4 rounded-2xl bg-white p-5 shadow-card ring-1 ring-cream-200 sm:p-6 lg:grid-cols-[1fr_1fr_1fr_auto]"
      >
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-ink-400">
            Nhận phòng
          </label>
          <input
            type="date"
            value={checkIn}
            min={today}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full rounded-xl border border-cream-300 px-4 py-2.5 text-sm font-semibold text-navy-900 focus:border-gold-500 focus:outline-none focus:ring-4 focus:ring-gold-500/15"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-ink-400">
            Trả phòng
          </label>
          <input
            type="date"
            value={checkOut}
            min={checkIn}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full rounded-xl border border-cream-300 px-4 py-2.5 text-sm font-semibold text-navy-900 focus:border-gold-500 focus:outline-none focus:ring-4 focus:ring-gold-500/15"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-ink-400">
            Số khách
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="w-full rounded-xl border border-cream-300 px-4 py-2.5 text-sm font-semibold text-navy-900 focus:border-gold-500 focus:outline-none focus:ring-4 focus:ring-gold-500/15"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} khách
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="self-end rounded-xl bg-navy-900 px-8 py-3 text-sm font-bold text-white transition hover:bg-gold-500 hover:text-navy-900"
        >
          🔍 Tìm phòng
        </button>
      </form>
    </section>
  );
}
