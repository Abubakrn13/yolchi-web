import { NextRequest } from 'next/server';
import { generateOtp, handle, HttpError } from '@/server/auth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  return handle(async () => {
    const { phone } = await req.json();
    if (!phone || typeof phone !== 'string' || phone.trim().length < 7) throw new HttpError(400, 'Invalid phone');
    await generateOtp(phone.trim());
    return { sent: true, demo: true };
  });
}
