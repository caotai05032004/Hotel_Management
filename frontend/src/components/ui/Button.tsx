import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { classNames } from '../../lib/format';

type Variant = 'primary' | 'outline' | 'ghost' | 'dark' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-gold-500 text-navy-900 hover:bg-gold-400 shadow-soft',
  outline: 'border-2 border-navy-900/20 text-navy-900 hover:border-gold-500 hover:text-gold-700 bg-white/70',
  ghost: 'text-navy-900 hover:bg-navy-900/5',
  dark: 'bg-navy-900 text-white hover:bg-navy-800',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

const SIZES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children?: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={classNames(
        'inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-200',
        'disabled:cursor-not-allowed disabled:opacity-55',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
