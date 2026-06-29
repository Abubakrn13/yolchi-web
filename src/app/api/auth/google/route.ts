import { handle, setAuthCookie, signToken, type DbUser } from '@/server/auth';
import { genId } from '@/server/ids';

export const runtime = 'nodejs';

export async function POST() {
  return handle(async (db) => {
    const fakePhone = '+google_' + Math.random().toString(36).slice(2, 8);
    const id = genId('u');
    const now = new Date().toISOString();
    db.prepare(`INSERT INTO users (id, phone, provider, name, photo, role, is_admin, created_at) VALUES (?, ?, 'google', 'Google User', NULL, NULL, 0, ?)`).run(id, fakePhone, now);
    const u = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as DbUser;
    await setAuthCookie(signToken({ id: u.id, phone: u.phone, role: u.role, isAdmin: false }));
    return { user: { id: u.id, phone: u.phone, provider: u.provider, name: u.name, photo: u.photo, role: u.role, isAdmin: false } };
  });
}
