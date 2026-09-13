import type { ReactNode } from 'react';
import { classNames } from '../../lib/format';
import type { HousekeepingStatus, OccupancyStatus, ServiceStatus } from '../../types';

type Tone = 'gold' | 'green' | 'red' | 'amber' | 'slate' | 'blue';

const TONES: Record<Tone, string> = {
  gold: 'bg-gold-500/15 text-gold-700 ring-gold-500/30',
  green: 'bg-emerald-500/12 text-emerald-700 ring-emerald-500/25',
  red: 'bg-red-500/12 text-red-700 ring-red-500/25',
  amber: 'bg-amber-500/15 text-amber-700 ring-amber-500/30',
  slate: 'bg-ink-400/12 text-ink-600 ring-ink-400/25',
  blue: 'bg-sky-500/12 text-sky-700 ring-sky-500/25',
};

export default function Badge({
  tone = 'slate',
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={classNames(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset',
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/* ------- Nhãn tiếng Việt + màu cho các enum trạng thái phòng ------------- */
export const OCCUPANCY_LABEL: Record<OccupancyStatus, { text: string; tone: Tone }> = {
  VACANT: { text: 'Phòng trống', tone: 'green' },
  OCCUPIED: { text: 'Đang ở', tone: 'blue' },
};

export const HOUSEKEEPING_LABEL: Record<HousekeepingStatus, { text: string; tone: Tone }> = {
  CLEAN: { text: 'Đã dọn', tone: 'green' },
  DIRTY: { text: 'Chưa dọn', tone: 'amber' },
  INSPECTED: { text: 'Đã kiểm tra', tone: 'gold' },
};

export const SERVICE_LABEL: Record<ServiceStatus, { text: string; tone: Tone }> = {
  IN_SERVICE: { text: 'Đang khai thác', tone: 'green' },
  OUT_OF_ORDER: { text: 'Hỏng hóc', tone: 'red' },
  OUT_OF_SERVICE: { text: 'Ngừng khai thác', tone: 'slate' },
};
