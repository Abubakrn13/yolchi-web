import { NextRequest } from 'next/server';
import { handle, HttpError, requireUser } from '@/server/auth';
import { genId } from '@/server/ids';

export const runtime = 'nodejs';

interface DbCard { id: string; user_id: string; last4: string; holder: string; brand: string | null; is_default: number; created_at: string }

function toCard(r: DbCard) {
  return { id: r.id, last4: r.last4, holder: r.holder, brand: r.brand, isDefault: !!r.is_default, createdAt: r.created_at };
}

function detectBrand(numClean: string): string {
  if (/^9860/.test(numClean)) return 'humo';
  if (/^8600/.test(numClean) || /^5614/.test(numClean)) return 'uzcard';
  if (/^4/.test(numClean)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(numClean)) return 'mastercard';
  return 'card';
}

export async function GET(req: NextRequest) {
  return handle(async (db) => {
    const u = await requireUser(req);
    const rows = db.prepare('SELECT * FROM cards WHERE user_id = ? ORDER BY is_default DESC, created_at DESC').all(u.id) as DbCard[];
    return { cards: rows.map(toCard) };
  });
}

export async function POST(req: NextRequest) {
  return handle(async (db) => {
    const u = await requireUser(req);
    const { number, holder, expiry } = await req.json();
    const numClean = String(number || '').replace(/\D/g, '');
    if (numClean.length < 13 || numClean.length > 19) throw new HttpError(400, 'Karta raqami notoʻgʻri');
    if (!holder || !String(holder).trim()) throw new HttpError(400, 'Karta egasi ismi kerak');
    // expiry validation (MM/YY)
    if (expiry) {
      const m = String(expiry).match(/^(\d{2})\/?(\d{2})$/);
      if (!m) throw new HttpError(400, 'Amal qilish muddati notoʻgʻri (MM/YY)');
    }
    const last4 = numClean.slice(-4);
    const brand = detectBrand(numClean);
    const existing = db.prepare('SELECT COUNT(*) as n FROM cards WHERE user_id = ?').get(u.id) as { n: number };
    const isDefault = existing.n === 0 ? 1 : 0;
    const id = genId('card');
    db.prepare(`INSERT INTO cards (id, user_id, last4, holder, brand, is_default, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)`).run(id, u.id, last4, String(holder).trim().slice(0, 60), brand, isDefault, new Date().toISOString());
    const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(id) as DbCard;
    return { card: toCard(card) };
  });
}
