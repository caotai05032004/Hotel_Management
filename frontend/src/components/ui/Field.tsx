import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { classNames } from '../../lib/format';

const BASE =
  'w-full rounded-xl border border-cream-300 bg-white px-4 py-2.5 text-sm text-navy-900 ' +
  'placeholder:text-ink-400/70 transition focus:border-gold-500 focus:outline-none ' +
  'focus:ring-4 focus:ring-gold-500/15 disabled:bg-cream-100 disabled:text-ink-400';

export function Label({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-600">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

export function ErrorText({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="mt-1.5 text-xs font-medium text-red-600">{children}</p>;
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export function Input({ label, error, icon, className, required, ...rest }: InputProps) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">
            {icon}
          </span>
        )}
        <input
          {...rest}
          className={classNames(BASE, icon ? 'pl-10' : '', error && 'border-red-400 focus:border-red-500 focus:ring-red-500/15', className)}
        />
      </div>
      <ErrorText>{error}</ErrorText>
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({ label, error, className, required, children, ...rest }: SelectProps) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      <select {...rest} className={classNames(BASE, 'pr-9', error && 'border-red-400', className)}>
        {children}
      </select>
      <ErrorText>{error}</ErrorText>
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, required, ...rest }: TextareaProps) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      <textarea {...rest} className={classNames(BASE, 'min-h-24 resize-y', error && 'border-red-400', className)} />
      <ErrorText>{error}</ErrorText>
    </div>
  );
}
