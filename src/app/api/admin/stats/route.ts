import { NextRequest } from 'next/server';
import { handle, HttpError, requireUser } from '@/server/auth';
import { PLATFORM_COMMISSION_RATE } from '@/server/wallet';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  return handle(async (db) => {
    const u = await requireUser(req);
    if (!u.is_admin) throw new HttpError(403, 'Admin only');

    // Umumiy
    const usersTotal = (db.prepare('SELECT COUNT(*) as n FROM users').get() as { n: number }).n;
    const placesTotal = (db.prepare("SELECT COUNT(*) as n FROM places WHERE status = 'published'").get() as { n: number }).n;
    const placesPending = (db.prepare("SELECT COUNT(*) as n FROM places WHERE status = 'pending'").get() as { n: number }).n;

    // Bronlar — faqat tasdiqlangan (bekor qilinmaganlari)
    const bookingsTotal = (db.prepare("SELECT COUNT(*) as n FROM bookings WHERE status = 'confirmed'").get() as { n: number }).n;
    const grossRow = db.prepare(`SELECT COALESCE(SUM(price), 0) as t FROM bookings WHERE status = 'confirmed'`).get() as { t: number };

    // Biznesga *aslida qolgan* summa = booking_in - bekor qilingan bronlardagi qaytarishlar (adjustment)
    // Boshqacha aytganda: net booking_in (kirim - qaytarib olinganlar)
    const netOwnerRow = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as t FROM wallet_transactions
      WHERE type IN ('booking_in', 'adjustment')
        AND reference_id IN (SELECT id FROM bookings WHERE status = 'confirmed')
    `).get() as { t: number };
    const ownerPaid = netOwnerRow.t;

    // Bron komissiyasi = tasdiqlangan bronlardan tushgan mijoz toʻlovi - biznesga qolgan
    const platformRevenue = Math.max(0, grossRow.t - ownerPaid);

    // E'lon daromadi (joy qoʻshganda ushlangan 30 000)
    const listingRow = db.prepare(`SELECT COALESCE(SUM(-amount), 0) as t FROM wallet_transactions
                                    WHERE type = 'withdrawal' AND note LIKE 'Joy eʼlon haqi:%'`).get() as { t: number };
    const listingRevenue = listingRow.t;

    // Kartaga yechilgan summa
    const withdrawnRow = db.prepare(`SELECT COALESCE(SUM(amount), 0) as t FROM withdrawals WHERE status = 'approved'`).get() as { t: number };

    const pendingWithdrawals = (db.prepare("SELECT COUNT(*) as n FROM withdrawals WHERE status = 'pending'").get() as { n: number }).n;

    // Eng faol biznes egalari (top 5) — net daromad bo'yicha
    const topOwners = db.prepare(`
      SELECT u.id, u.phone, u.name, COALESCE(SUM(w.amount), 0) as earned
      FROM users u
      JOIN wallet_transactions w ON w.user_id = u.id AND w.type = 'booking_in'
      WHERE w.reference_id IN (SELECT id FROM bookings WHERE status = 'confirmed')
      GROUP BY u.id
      ORDER BY earned DESC LIMIT 5
    `).all() as any[];

    return {
      stats: {
        usersTotal, placesTotal, placesPending, bookingsTotal,
        gross: grossRow.t, ownerPaid, withdrawn: withdrawnRow.t,
        platformRevenue, listingRevenue, totalPlatformRevenue: platformRevenue + listingRevenue,
        pendingWithdrawals,
        commissionRate: PLATFORM_COMMISSION_RATE,
      },
      topOwners: topOwners.map((r) => ({ id: r.id, phone: r.phone, name: r.name || '', earned: r.earned })),
    };
  });
}
