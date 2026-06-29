import { NextRequest } from 'next/server';
import { handle, requireUser } from '@/server/auth';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  return handle(async (db) => {
    const u = await requireUser(req);
    const rows = db.prepare('SELECT id, type, title, body, place_id as placeId, read, created_at as createdAt FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(u.id) as any[];
    return { items: rows.map((r) => ({ ...r, read: !!r.read })) };
  });
}
