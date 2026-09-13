import { useCallback, useState } from 'react';
import { classNames } from '../../lib/format';

export interface ToastItem {
  id: number;
  text: string;
  tone: 'success' | 'error' | 'info';
}

/** Toast tối giản, dùng cục bộ trong từng trang — không cần provider toàn cục. */
export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((text: string, tone: ToastItem['tone'] = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, text, tone }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const success = useCallback((text: string) => push(text, 'success'), [push]);
  const error = useCallback((text: string) => push(text, 'error'), [push]);

  const view = (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[60] flex w-80 flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={classNames(
            'animate-fade-up pointer-events-auto rounded-xl px-4 py-3 text-sm font-semibold shadow-lg',
            t.tone === 'success' && 'bg-navy-900 text-white',
            t.tone === 'error' && 'bg-red-600 text-white',
            t.tone === 'info' && 'bg-white text-navy-900 ring-1 ring-cream-300'
          )}
        >
          {t.text}
        </div>
      ))}
    </div>
  );

  return { push, success, error, view };
}
