import { classNames } from '../../lib/format';

interface Props {
  page: number;   // 0-based như backend
  size: number;
  total: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, size, total, onChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / Math.max(size, 1)));
  if (total === 0) return null;

  const from = page * size + 1;
  const to = Math.min((page + 1) * size, total);

  const pages: number[] = [];
  const start = Math.max(0, Math.min(page - 2, totalPages - 5));
  for (let i = start; i < Math.min(totalPages, start + 5); i++) pages.push(i);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
      <p className="text-sm text-ink-400">
        Hiển thị <b className="text-navy-900">{from}</b>–<b className="text-navy-900">{to}</b> trên{' '}
        <b className="text-navy-900">{total}</b> bản ghi
      </p>
      <div className="flex items-center gap-1">
        <PageBtn disabled={page === 0} onClick={() => onChange(page - 1)}>
          ‹
        </PageBtn>
        {pages.map((p) => (
          <PageBtn key={p} active={p === page} onClick={() => onChange(p)}>
            {p + 1}
          </PageBtn>
        ))}
        <PageBtn disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)}>
          ›
        </PageBtn>
      </div>
    </div>
  );
}

function PageBtn({
  children,
  active,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={classNames(
        'min-w-9 rounded-lg border px-3 py-1.5 text-sm font-semibold transition',
        active
          ? 'border-gold-500 bg-gold-500 text-navy-900'
          : 'border-cream-300 bg-white text-ink-600 hover:border-gold-400 hover:text-navy-900',
        disabled && 'cursor-not-allowed opacity-40 hover:border-cream-300'
      )}
    >
      {children}
    </button>
  );
}
