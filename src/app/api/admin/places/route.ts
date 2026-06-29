import { NextRequest } from 'next/server';
import { handle, HttpError, requireUser } from '@/server/auth';
import { rowToPlace, type DbPlace } from '@/server/places';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  return handle(async (db) => {
    const u = await requireUser(req);
    if (!u.is_admin) throw new HttpError(403, 'Admin only');
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || 'pending';
    const rows = db.prepare('SELECT * FROM places WHERE status = ? ORDER BY created_at DESC').all(status) as DbPlace[];
    return { places: rows.map(rowToPlace) };
  });
}
