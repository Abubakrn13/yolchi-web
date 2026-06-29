import { NextRequest } from 'next/server';
import { handle, HttpError, requireUser } from '@/server/auth';
import { genId } from '@/server/ids';
import { getBalance } from '@/server/wallet';

export const runtime = 'nodejs';

const MIN_WITHDRAW = 10000; // 10 000 so'm

interface DbWithdrawal {
  id: string; user_id: string; card_id: string; amount: number;
  status: string; admin_note: string | null; created_at: string; processed_at: string | null;
}

function toWithdrawal(r: any) {
  return {
    id: r.id, cardId: r.card_id, amount: r.amount, status: r.status,
    adminNote: r.admin_note, createdAt: r.created_at, processedAt: r.processed_at,
    cardLast4: r.last4 ?? null, cardBrand: r.brand ?? null,
  };
}

export async function GET(req: NextRequest) {
  return handle(async (db) => {
    const u = await requireUser(req);
    const rows = db.prepare(`SELECT w.*, c.last4, c.brand FROM withdrawals w
                             LEFT JOIN cards c ON c.id = w.card_id
                             WHERE w.user_id = ? ORDER BY w.created_at DESC`).all(u.id) as any[];
    return { items: rows.map(toWithdrawal) };
  });
}

export async function POST(req: NextRequest) {
  return handle(async (db) => {
    const u = await requireUser(req);
    const { cardId, amount } = await req.json();
    const amt = Number(amount);
    if (!cardId) throw new HttpError(400, 'Karta tanlanmagan');
    if (!Number.isFinite(amt) || amt < MIN_WITHDRAW) throw new HttpError(400, `Minimal summa: ${MIN_WITHDRAW.toLocaleString('en-US').replace(/,/g,' ')} soʻm`);

    const card = db.prepare('SELECT id FROM cards WHERE id = ? AND user_id = ?').get(cardId, u.id);
    if (!card) throw new HttpError(404, 'Karta topilmadi');

    const balance = getBalance(db, u.id);
    if (amt > balance) throw new HttpError(400, 'Hamyon balansidan koʻp');

    // Pending withdraw'lar ham hisobga olinadi - ikki marta yechmaslik uchun
    const pending = db.prepare(`SELECT COALESCE(SUM(amount), 0) as t FROM withdrawals WHERE user_id = ? AND status = 'pending'`).get(u.id) as { t: number };
    if (amt + pending.t > balance) throw new HttpError(400, 'Kutilayotgan yechimlardan keyin balans yetmaydi');

    const id = genId('wd');
    const now = new Date().toISOString();
    db.prepare(`INSERT INTO withdrawals (id, user_id, card_id, amount, status, created_at)
                VALUES (?, ?, ?, ?, 'pending', ?)`).run(id, u.id, cardId, Math.floor(amt), now);

    // Admin'larga xabar
    const admins = db.prepare("SELECT id FROM users WHERE is_admin = 1").all() as { id: string }[];
    for (const a of admins) {
      db.prepare('INSERT INTO notifications (id, user_id, type, title, body, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
        genId('n'), a.id, 'system', 'Yangi pul yechish soʻrovi', `${Math.floor(amt).toLocaleString('en-US').replace(/,/g,' ')} soʻm`, now);
    }

    const row = db.prepare(`SELECT w.*, c.last4, c.brand FROM withdrawals w LEFT JOIN cards c ON c.id = w.card_id WHERE w.id = ?`).get(id) as any;
    return { withdrawal: toWithdrawal(row) };
  });
}
