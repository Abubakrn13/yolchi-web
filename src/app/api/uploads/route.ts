import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { handle, HttpError, requireUser } from '@/server/auth';

export const runtime = 'nodejs';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(req: NextRequest) {
  return handle(async () => {
    await requireUser(req);
    const form = await req.formData();
    const files = form.getAll('files');
    if (files.length === 0) throw new HttpError(400, 'No files');
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    const urls: string[] = [];
    for (const f of files.slice(0, 10)) {
      if (!(f instanceof File)) continue;
      if (!ALLOWED.includes(f.type)) throw new HttpError(400, `Bad type: ${f.type}`);
      if (f.size > MAX_SIZE) throw new HttpError(400, 'File too large (max 5 MB)');
      const buf = Buffer.from(await f.arrayBuffer());
      const ext = (f.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
      const name = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
      fs.writeFileSync(path.join(UPLOAD_DIR, name), buf);
      urls.push(`/uploads/${name}`);
    }
    return { urls };
  });
}
