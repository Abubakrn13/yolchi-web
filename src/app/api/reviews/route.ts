import { NextRequest } from 'next/server';
import { handle, HttpError, requireUser } from '@/server/auth';
import { genId } from '@/server/ids';
import { recomputeRating } from '@/server/places';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  return handle(async (db) => {
    const u = await requireUser(req);
    const { placeId, rating, comment } = await req.json();
    if (!placeId) throw new HttpError(400, 'placeId required');
    const r = Number(rating);
    if (!Number.isFinite(r) || r < 1 || r > 5) throw new HttpError(400, 'rating must be 1..5');
    const c = String(comment || '').trim().slice(0, 500);
    const id = genId('r');
    const authorName = u.name || u.phone;
    const now = new Date().toISOString();
    db.prepare('INSERT INTO reviews (id, user_id, place_id, author_name, rating, comment, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(id, u.id, placeId, authorName, Math.round(r), c, now);
    recomputeRating(db, placeId);
    // Yangilangan reytingni o'qib qaytaramiz
    const updated = db.prepare('SELECT rating_avg as ratingAvg, rating_count as ratingCount FROM places WHERE id = ?').get(placeId) as { ratingAvg: number; ratingCount: number } | undefined;
    return {
      review: { id, userId: u.id, authorName, rating: Math.round(r), comment: c, createdAt: now },
      rating: updated ? { ratingAvg: updated.ratingAvg, ratingCount: updated.ratingCount } : null,
    };
  });
}
