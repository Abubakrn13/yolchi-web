import { NextRequest } from 'next/server';
import { handle, HttpError, requireUser } from '@/server/auth';
import { addTransaction, getBalance } from '@/server/wallet';
import { genId } from '@/server/ids';

export const runtime = 'nodejs';

const CANCEL_WINDOW_MS = 10 * 60 * 1000; // 10 daqiqa

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return handle(async (db) => {
    const u = await requireUser(req);
    const row = db.prepare('SELECT * FROM bookings WHERE id = ?').get(params.id) as any | undefined;
    if (!row) throw new HttpError(404, 'Booking not found');
    if (row.user_id !== u.id && !u.is_admin) throw new HttpError(403, 'Forbidden');
    if (row.status === 'cancelled') return { ok: true, status: 'cancelled' };

    // 10 daqiqalik bekor qilish oynasi (admin uchun cheklov yoʻq)
    if (!u.is_admin) {
      const elapsed = Date.now() - new Date(row.created_at).getTime();
      if (elapsed > CANCEL_WINDOW_MS) {
        throw new HttpError(400, 'Bekor qilish vaqti tugadi (10 daqiqa)');
      }
    }

    db.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?").run(params.id);

    // Biznes egasining hamyonidan ham qaytarib olamiz (agar bron tushgan boʻlsa)
    const place = db.prepare('SELECT owner_id, booking_price FROM places WHERE id = ?').get(row.place_id) as { owner_id: string | null; booking_price: number | null } | undefined;
    if (place?.owner_id) {
      // Bu bron uchun qancha tushgan edi? Tranzaksiya tarixidan topamiz
      const tx = db.prepare(`SELECT amount FROM wallet_transactions WHERE user_id = ? AND reference_id = ? AND type = 'booking_in'`).get(place.owner_id, params.id) as { amount: number } | undefined;
      if (tx && tx.amount > 0) {
        const ownerBalance = getBalance(db, place.owner_id);
        // Agar biznes egasining balansi yetarli boʻlsa, qaytarib olamiz
        if (ownerBalance >= tx.amount) {
          addTransaction(db, place.owner_id, 'adjustment', -tx.amount, {
            referenceId: params.id,
            note: 'Bron bekor qilindi (qaytarib olindi)',
          });
        }
        // Biznes egasiga bildirishnoma
        db.prepare('INSERT INTO notifications (id, user_id, type, title, body, place_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
          genId('n'), place.owner_id, 'booking', 'Bron bekor qilindi',
          `${row.ref}`, row.place_id, new Date().toISOString());
      }
    }

    return { ok: true, status: 'cancelled' };
  });
}
