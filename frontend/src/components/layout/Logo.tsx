import { Link } from 'react-router-dom';
import { classNames } from '../../lib/format';

export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-navy-900 text-lg font-black text-gold-500 ring-2 ring-gold-500/40">
        P
      </span>
      <span className="leading-tight">
        <span className={classNames('block text-base font-extrabold', light ? 'text-white' : 'text-navy-900')}>
          PhucNguyen
        </span>
        <span className="block text-[11px] font-semibold tracking-wide text-gold-600">
          Resort &amp; Tour Hub
        </span>
      </span>
    </Link>
  );
}
