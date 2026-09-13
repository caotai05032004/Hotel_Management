/** Định dạng tiền VND giống template: "2.800.000 ₫" */
export function formatVnd(value: number | string | null | undefined): string {
  const n = typeof value === 'string' ? Number(value) : value;
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return new Intl.NumberFormat('vi-VN').format(n) + ' ₫';
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '0';
  return new Intl.NumberFormat('vi-VN').format(value);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN');
}

/** amenities lưu dưới dạng chuỗi JSON '["wifi","tv"]' -> mảng string */
export function parseAmenities(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    /* không phải JSON -> tách theo dấu phẩy */
  }
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function stringifyAmenities(list: string[]): string {
  return JSON.stringify(list.map((s) => s.trim()).filter(Boolean));
}

export function classNames(...values: unknown[]): string {
  return values.filter((v): v is string => typeof v === 'string' && v.length > 0).join(' ');
}
