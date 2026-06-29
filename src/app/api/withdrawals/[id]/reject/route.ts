import { NextRequest } from 'next/server';
import { handle, HttpError, requireUser } from '@/server/auth';
import { genId } from '@/server/ids';

export const runtime = 'nodejs';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return handle(async (db) => {
    const u = await requireUser(req);
    if (!u.is_admin) throw new HttpError(403, 'Admin only');
    const { note } = await req.json().catch(() => ({}));
    const row = db.prepare('SELECT user_id, amount, status FROM withdrawals WHERE id = ?').get(params.id) as { user_id: string; amount: number; status: string } | undefined;
    if (!row) throw new HttpError(404, 'Topilmadi');
    if (row.status !== 'pending') throw new HttpError(400, 'Soʻrov allaqachon qayta ishlanan');
    const now = new Date().toISOString();
    db.prepare("UPDATE withdrawals SET status = 'rejected', admin_note = ?, processed_at = ? WHERE id = ?").run(note || null, now, params.id);
    db.prepare('INSERT INTO notifications (id, user_id, type, title, body, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
      genId('n'), row.user_id, 'system', 'Pul yechish rad etildi',
      `${row.amount.toLocaleString('en-US').replace(/,/g,' ')} soʻm${note ? ' · ' + note : ''}`, now);
    return { ok: true };
  });
}
