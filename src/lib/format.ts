export function priceLevel(level: number): string {
  const n = Math.min(Math.max(level, 1), 4);
  return '$'.repeat(n);
}

export function formatPriceUzs(value: number): string {
  return value.toLocaleString('en-US').replace(/,/g, ' ') + ' soʻm';
}

export function formatDate(iso: string, locale = 'uz'): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const bcp = locale === 'uz' ? 'uz-UZ' : locale === 'ru' ? 'ru-RU' : 'en-US';
  try {
    return new Intl.DateTimeFormat(bcp, { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}
