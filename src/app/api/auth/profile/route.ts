import { NextRequest } from 'next/server';
import { handle, HttpError, requireUser } from '@/server/auth';

export const runtime = 'nodejs';

export async function PATCH(req: NextRequest) {
  return handle(async (db) => {
    const u = await requireUser(req);
    const { name, photo } = await req.json();
    if (name !== undefined && typeof name !== 'string') throw new HttpError(400, 'name must be string');
    if (photo !== undefined && photo !== null && typeof photo !== 'string') throw new HttpError(400, 'photo must be string or null');
    if (name !== undefined) db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name.slice(0, 80), u.id);
    if (photo !== undefined) db.prepare('UPDATE users SET photo = ? WHERE id = ?').run(photo, u.id);
    return { ok: true };
  });
}
