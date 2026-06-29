import { NextRequest } from 'next/server';
import { handle, HttpError, requireUser } from '@/server/auth';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  return handle(async (db) => {
    const u = await requireUser(req);
    const rows = db.prepare('SELECT place_id FROM favorites WHERE user_id = ?').all(u.id) as { place_id: string }[];
    return { ids: rows.map((r) => r.place_id) };
  });
}

export async function POST(req: NextRequest) {
  return handle(async (db) => {
    const u = await requireUser(req);
    const { placeId } = await req.json();
    if (!placeId) throw new HttpError(400, 'placeId required');
    const existing = db.prepare('SELECT 1 FROM favorites WHERE user_id = ? AND place_id = ?').get(u.id, placeId);
    if (existing) {
      db.prepare('DELETE FROM favorites WHERE user_id = ? AND place_id = ?').run(u.id, placeId);
      return { favorite: false };
    }
    db.prepare('INSERT INTO favorites (user_id, place_id, created_at) VALUES (?, ?, ?)').run(u.id, placeId, new Date().toISOString());
    return { favorite: true };
  });
}
