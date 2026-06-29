import { NextRequest } from 'next/server';
import { getPlace } from '@/server/places';
import { handle, HttpError, requireUser } from '@/server/auth';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  return handle(async (db) => {
    const p = getPlace(db, params.id);
    if (!p) throw new HttpError(404, 'Place not found');
    const reviews = db.prepare('SELECT id, user_id as userId, author_name as authorName, rating, comment, created_at as createdAt FROM reviews WHERE place_id = ? ORDER BY created_at DESC').all(params.id);
    return { place: p, reviews };
  });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return handle(async (db) => {
    const u = await requireUser(req);
    const p = getPlace(db, params.id);
    if (!p) throw new HttpError(404, 'Not found');
    if (p.ownerId !== u.id && !u.is_admin) throw new HttpError(403, 'Forbidden');
    db.prepare('DELETE FROM places WHERE id = ?').run(params.id);
    return { ok: true };
  });
}
