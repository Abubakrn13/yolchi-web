import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { ensureDb, type DbWrapper } from './db';

const SECRET = process.env.JWT_SECRET || 'dev-secret-please-change';
const COOKIE = 'yolchi_token';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 kun

export interface JwtPayload { id: string; phone: string; role: string | null; isAdmin: boolean }

export function signToken(p: JwtPayload): string {
  return jwt.sign(p, SECRET, { expiresIn: '30d' });
}
export function verifyToken(token: string): JwtPayload | null {
  try { return jwt.verify(token, SECRET) as JwtPayload; } catch { return null; }
}

export async function setAuthCookie(token: string) {
  cookies().set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: MAX_AGE });
}
export async function clearAuthCookie() { cookies().delete(COOKIE); }

export function readTokenFromCookies(req?: NextRequest): JwtPayload | null {
  const raw = req ? req.cookies.get(COOKIE)?.value : cookies().get(COOKIE)?.value;
  return raw ? verifyToken(raw) : null;
}

export interface DbUser { id: string; phone: string; provider: string; name: string; photo: string | null; role: string | null; is_admin: number; created_at: string }

export async function getCurrentUser(req?: NextRequest): Promise<DbUser | null> {
  const payload = readTokenFromCookies(req);
  if (!payload) return null;
  const db = await ensureDb();
  const u = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.id) as DbUser | undefined;
  return u ?? null;
}

export async function requireUser(req?: NextRequest): Promise<DbUser> {
  const u = await getCurrentUser(req);
  if (!u) throw new HttpError(401, 'Authentication required');
  return u;
}

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function ok<T>(data: T, init: number = 200) {
  return new Response(JSON.stringify(data), { status: init, headers: { 'content-type': 'application/json' } });
}
export function err(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), { status, headers: { 'content-type': 'application/json' } });
}
export function handle<T>(fn: (db: DbWrapper) => Promise<T> | T): Promise<Response> {
  return ensureDb()
    .then((db) => Promise.resolve(fn(db)))
    .then((d) => ok(d))
    .catch((e: unknown) => {
      if (e instanceof HttpError) return err(e.status, e.message);
      console.error(e);
      return err(500, e instanceof Error ? e.message : 'Internal error');
    });
}

// OTP yordamchilari
const DEMO_OTP = process.env.DEMO_OTP || '123456';
const OTP_TTL_MIN = 5;

export async function generateOtp(phone: string): Promise<string> {
  const code = DEMO_OTP;
  const expires = new Date(Date.now() + OTP_TTL_MIN * 60_000).toISOString();
  const db = await ensureDb();
  db.prepare('INSERT INTO otps (phone, code, expires_at, attempts) VALUES (?, ?, ?, 0) ON CONFLICT(phone) DO UPDATE SET code=excluded.code, expires_at=excluded.expires_at, attempts=0').run(phone, code, expires);
  return code;
}
export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const db = await ensureDb();
  const row = db.prepare('SELECT * FROM otps WHERE phone = ?').get(phone) as { code: string; expires_at: string; attempts: number } | undefined;
  if (!row) return false;
  if (new Date(row.expires_at).getTime() < Date.now()) return false;
  if (row.attempts >= 5) return false;
  if (row.code !== code) {
    db.prepare('UPDATE otps SET attempts = attempts + 1 WHERE phone = ?').run(phone);
    return false;
  }
  db.prepare('DELETE FROM otps WHERE phone = ?').run(phone);
  return true;
}

export const COOKIE_NAME = COOKIE;
