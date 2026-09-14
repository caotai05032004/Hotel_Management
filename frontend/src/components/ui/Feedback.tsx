import type { ReactNode } from 'react';
import { classNames } from '../../lib/format';

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={classNames(
        'inline-block h-5 w-5 animate-spin rounded-full border-2 border-gold-500 border-t-transparent',
        className
      )}
    />
  );
}

export function Loading({ label = 'Đang tải…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-400">
      <Spinner className="h-7 w-7" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function Alert({
  tone = 'error',
  children,
  onClose,
}: {
  tone?: 'error' | 'success' | 'info' | 'warning';
  children: ReactNode;
  onClose?: () => void;
}) {
  const tones = {
    error: 'bg-red-50 text-red-800 border-red-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    info: 'bg-sky-50 text-sky-800 border-sky-200',
    warning: 'bg-amber-50 text-amber-900 border-amber-200',
  };
  return (
    <div className={classNames('flex items-start gap-3 rounded-xl border px-4 py-3 text-sm', tones[tone])}>
      <div className="flex-1">{children}</div>
      {onClose && (
        <button onClick={onClose} aria-label="Đóng" className="opacity-60 transition hover:opacity-100">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-cream-300 bg-cream-50 py-16 text-center">
      <div className="mb-1 text-4xl">🏝️</div>
      <h4 className="text-base font-bold text-navy-900">{title}</h4>
      {description && <p className="max-w-sm text-sm text-ink-400">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
