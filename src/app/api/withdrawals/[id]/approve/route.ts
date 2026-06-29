import { NextRequest } from 'next/server';
import { handle, HttpError, requireUser } from '@/server/auth';
import { addTransaction, getBalance } from '@/server/wallet';
import { genId } from '@/server/ids';

export const runtime = 'nodejs';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return handle(async (db) => {
    const u = await requireUser(req);
    if (!u.is_admin) throw new HttpError(403, 'Admin only');
    const row = db.prepare(`SELECT w.*, c.last4 FROM withdrawals w LEFT JOIN cards c ON c.id = w.card_id WHERE w.id = ?`).get(params.id) as any;
    if (!row) throw new HttpError(404, 'Topilmadi');
    if (row.status !== 'pending') throw new HttpError(400, 'Soʻrov allaqachon qayta ishlanan');
    const balance = getBalance(db, row.user_id);
    if (row.amount > balance) throw new HttpError(400, 'Foydalanuvchi balansidan koʻp');

    addTransaction(db, row.user_id, 'withdrawal', -row.amount, { referenceId: row.id, note: `Karta ****${row.last4}` });
    const now = new Date().toISOString();
    db.prepare("UPDATE withdrawals SET status = 'approved', processed_at = ? WHERE id = ?").run(now, params.id);
    db.prepare('INSERT INTO notifications (id, user_id, type, title, body, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
      genId('n'), row.user_id, 'system', 'Pul yechish tasdiqlandi',
      `${row.amount.toLocaleString('en-US').replace(/,/g,' ')} soʻm · ****${row.last4}`, now);
    return { ok: true };
  });
}
