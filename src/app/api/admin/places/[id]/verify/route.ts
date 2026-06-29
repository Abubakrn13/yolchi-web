import { NextRequest } from 'next/server';
import { handle, HttpError, requireUser } from '@/server/auth';
import { genId } from '@/server/ids';

export const runtime = 'nodejs';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return handle(async (db) => {
    const u = await requireUser(req);
    if (!u.is_admin) throw new HttpError(403, 'Admin only');
    const { action } = await req.json();
    const place = db.prepare('SELECT id, owner_id, name FROM places WHERE id = ?').get(params.id) as { id: string; owner_id: string | null; name: string } | undefined;
    if (!place) throw new HttpError(404, 'Place not found');
    const now = new Date().toISOString();
    if (action === 'approve') {
      db.prepare("UPDATE places SET status = 'published', verified = 1 WHERE id = ?").run(params.id);
      if (place.owner_id) db.prepare('INSERT INTO notifications (id, user_id, type, title, body, place_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(genId('n'), place.owner_id, 'place', 'Joy tasdiqlandi', place.name, params.id, now);
    } else if (action === 'reject') {
      db.prepare("UPDATE places SET status = 'rejected' WHERE id = ?").run(params.id);
      if (place.owner_id) db.prepare('INSERT INTO notifications (id, user_id, type, title, body, place_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(genId('n'), place.owner_id, 'place', 'Joy rad etildi', place.name, params.id, now);
    } else { throw new HttpError(400, 'Invalid action'); }
    return { ok: true };
  });
}
