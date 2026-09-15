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
