import crypto from 'crypto';
export function genId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(3).toString('hex')}`;
}
export function genRef(): string {
  const s = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `YO-${s}`;
}
