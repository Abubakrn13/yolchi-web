import { NextRequest } from 'next/server';
import { handle, requireUser } from '@/server/auth';
import { genId } from '@/server/ids';

export const runtime = 'nodejs';

// 30 soniyadan keyin ko'rilgan-yu, hali baholanmagan joylar uchun bildirishnoma yaratamiz
const REMIND_AFTER_MS = 30 * 1000;

export async function POST(req: NextRequest) {
  return handle(async (db) => {
    const u = await requireUser(req);
    const cutoff = new Date(Date.now() - REMIND_AFTER_MS).toISOString();

    // Reminded=0 va etarli vaqt o'tgan, va sharh qoldirilmagan tashriflar
    const rows = db.prepare(`
      SELECT v.place_id, p.name as place_name
      FROM visits v
      JOIN places p ON p.id = v.place_id
      WHERE v.user_id = ?
        AND v.reminded = 0
        AND v.visited_at < ?
        AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r.user_id = v.user_id AND r.place_id = v.place_id)
      ORDER BY v.visited_at ASC
      LIMIT 10
    `).all(u.id, cutoff) as { place_id: string; place_name: string }[];

    let created = 0;
    const now = new Date().toISOString();
    for (const row of rows) {
      db.prepare(`INSERT INTO notifications (id, user_id, type, title, body, place_id, created_at)
                  VALUES (?, ?, 'review_reminder', ?, ?, ?, ?)`).run(
        genId('n'), u.id, 'Joyni baholang', row.place_name, row.place_id, now);
      db.prepare('UPDATE visits SET reminded = 1 WHERE user_id = ? AND place_id = ?').run(u.id, row.place_id);
      created++;
    }
    return { created };
  });
}
