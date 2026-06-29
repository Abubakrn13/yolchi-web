import { NextRequest } from 'next/server';
import { getCurrentUser, handle } from '@/server/auth';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  return handle(async () => {
    const u = await getCurrentUser(req);
    if (!u) return { user: null };
    return { user: { id: u.id, phone: u.phone, provider: u.provider, name: u.name, photo: u.photo, role: u.role, isAdmin: !!u.is_admin } };
  });
}
