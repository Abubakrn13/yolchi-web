import { NextRequest } from 'next/server';
import { handle, HttpError, requireUser } from '@/server/auth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  return handle(async (db) => {
    const u = await requireUser(req);
    const { placeId } = await req.json();
    if (!placeId) throw new HttpError(400, 'placeId required');
    // Joy mavjudligini tekshirish
    const exists = db.prepare('SELECT id FROM places WHERE id = ? AND status = "published"').get(placeId);
    if (!exists) throw new HttpError(404, 'Place not found');
    // O'z joyini ko'rishni belgilamaymiz
    const own = db.prepare('SELECT 1 FROM places WHERE id = ? AND owner_id = ?').get(placeId, u.id);
    if (own) return { ok: true, skipped: 'own' };

    const now = new Date().toISOString();
    db.prepare(`INSERT INTO visits (user_id, place_id, visited_at, reminded) VALUES (?, ?, ?, 0)
                ON CONFLICT(user_id, place_id) DO UPDATE SET visited_at = excluded.visited_at`)
      .run(u.id, placeId, now);
    return { ok: true };
  });
}
