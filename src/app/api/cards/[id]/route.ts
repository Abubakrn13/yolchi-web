import { NextRequest } from 'next/server';
import { handle, HttpError, requireUser } from '@/server/auth';

export const runtime = 'nodejs';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return handle(async (db) => {
    const u = await requireUser(req);
    const row = db.prepare('SELECT user_id, is_default FROM cards WHERE id = ?').get(params.id) as { user_id: string; is_default: number } | undefined;
    if (!row) throw new HttpError(404, 'Karta topilmadi');
    if (row.user_id !== u.id) throw new HttpError(403, 'Forbidden');
    db.prepare('DELETE FROM cards WHERE id = ?').run(params.id);
    // Agar o'chirilgan karta default bo'lsa, boshqa kartani default qilamiz
    if (row.is_default) {
      const next = db.prepare('SELECT id FROM cards WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(u.id) as { id: string } | undefined;
      if (next) db.prepare('UPDATE cards SET is_default = 1 WHERE id = ?').run(next.id);
    }
    return { ok: true };
  });
}
