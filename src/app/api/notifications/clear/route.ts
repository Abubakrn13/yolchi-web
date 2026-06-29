import { NextRequest } from 'next/server';
import { handle, requireUser } from '@/server/auth';
export const runtime = 'nodejs';
export async function POST(req: NextRequest) {
  return handle(async (db) => {
    const u = await requireUser(req);
    db.prepare('DELETE FROM notifications WHERE user_id = ?').run(u.id);
    return { ok: true };
  });
}
