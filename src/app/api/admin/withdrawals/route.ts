import { NextRequest } from 'next/server';
import { handle, HttpError, requireUser } from '@/server/auth';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  return handle(async (db) => {
    const u = await requireUser(req);
    if (!u.is_admin) throw new HttpError(403, 'Admin only');
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || 'pending';
    const rows = db.prepare(`SELECT w.*, c.last4, c.brand, c.holder, u.phone as user_phone, u.name as user_name
                             FROM withdrawals w
                             LEFT JOIN cards c ON c.id = w.card_id
                             LEFT JOIN users u ON u.id = w.user_id
                             WHERE w.status = ?
                             ORDER BY w.created_at DESC`).all(status) as any[];
    return {
      items: rows.map((r) => ({
        id: r.id, userId: r.user_id, userPhone: r.user_phone, userName: r.user_name,
        cardLast4: r.last4, cardBrand: r.brand, cardHolder: r.holder,
        amount: r.amount, status: r.status, adminNote: r.admin_note,
        createdAt: r.created_at, processedAt: r.processed_at,
      })),
    };
  });
}
