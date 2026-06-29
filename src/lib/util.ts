export function openStatus(hours?: string): { open: boolean; known: boolean } {
  if (!hours) return { open: false, known: false };
  if (hours.includes('24/7') || /круглосуточно/i.test(hours)) return { open: true, known: true };
  const m = hours.match(/(\d{1,2}):(\d{2})\D+(\d{1,2}):(\d{2})/);
  if (!m) return { open: false, known: false };
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const start = +m[1] * 60 + +m[2];
  const end = +m[3] * 60 + +m[4];
  const open = start <= end ? cur >= start && cur < end : cur >= start || cur < end;
  return { open, known: true };
}

export function bookingRef(): string {
  const s = (Date.now().toString(36) + Math.random().toString(36).slice(2)).toUpperCase();
  return `YO-${s.slice(-6)}`;
}

export function isVerified(p: { verified?: boolean; ownerAdded?: boolean }): boolean {
  return p.verified ?? !p.ownerAdded;
}
