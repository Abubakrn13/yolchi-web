import { clearAuthCookie, handle } from '@/server/auth';
export const runtime = 'nodejs';
export async function POST() { return handle(async () => { await clearAuthCookie(); return { ok: true }; }); }
