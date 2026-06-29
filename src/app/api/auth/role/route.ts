import { NextRequest } from 'next/server';
import { handle, HttpError, requireUser, signToken, setAuthCookie } from '@/server/auth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  return handle(async (db) => {
    const u = await requireUser(req);
    const { role } = await req.json();
    if (role !== 'tourist' && role !== 'business') throw new HttpError(400, 'Invalid role');
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, u.id);
    await setAuthCookie(signToken({ id: u.id, phone: u.phone, role, isAdmin: !!u.is_admin }));
    return { ok: true, role };
  });
}
