import { NextRequest } from 'next/server';
import { handle, HttpError, requireUser } from '@/server/auth';

export const runtime = 'nodejs';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return handle(async (db) => {
    const u = await requireUser(req);
    const row = db.prepare('SELECT user_id, status FROM withdrawals WHERE id = ?').get(params.id) as { user_id: string; status: string } | undefined;
    if (!row) throw new HttpError(404, 'Topilmadi');
    if (row.user_id !== u.id) throw new HttpError(403, 'Forbidden');
    if (row.status !== 'pending') throw new HttpError(400, 'Faqat kutilayotgan soʻrovlarni bekor qilish mumkin');
    db.prepare("UPDATE withdrawals SET status = 'rejected', admin_note = 'Foydalanuvchi bekor qildi', processed_at = ? WHERE id = ?").run(new Date().toISOString(), params.id);
    return { ok: true };
  });
}
