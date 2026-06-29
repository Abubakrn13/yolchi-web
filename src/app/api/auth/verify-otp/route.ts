import { NextRequest } from 'next/server';
import { handle, HttpError, setAuthCookie, signToken, verifyOtp, type DbUser } from '@/server/auth';
import { genId } from '@/server/ids';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  return handle(async (db) => {
    const { phone, code } = await req.json();
    if (!phone || !code) throw new HttpError(400, 'Phone and code required');
    if (!(await verifyOtp(phone, code))) throw new HttpError(401, 'Invalid or expired code');
    let u = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone) as DbUser | undefined;
    if (!u) {
      const id = genId('u');
      db.prepare(`INSERT INTO users (id, phone, provider, name, photo, role, is_admin, created_at) VALUES (?, ?, 'phone', '', NULL, NULL, 0, ?)`).run(id, phone, new Date().toISOString());
      u = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as DbUser;
    }
    await setAuthCookie(signToken({ id: u.id, phone: u.phone, role: u.role, isAdmin: !!u.is_admin }));
    return { user: { id: u.id, phone: u.phone, provider: u.provider, name: u.name, photo: u.photo, role: u.role, isAdmin: !!u.is_admin } };
  });
}
