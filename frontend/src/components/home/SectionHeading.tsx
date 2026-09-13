import { classNames } from '../../lib/format';

export default function SectionHeading({
  eyebrow,
  title,
  description,
  light = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  light?: boolean;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-500">{eyebrow}</p>
      <h2
        className={classNames(
          'mt-3 text-3xl font-black sm:text-4xl lg:text-[2.75rem]',
          light ? 'text-white' : 'text-navy-900'
        )}
      >
        {title}
      </h2>
      {description && (
        <p className={classNames('mt-4 text-base leading-relaxed', light ? 'text-cream-200/70' : 'text-ink-400')}>
          {description}
        </p>
      )}
    </div>
  );
}
