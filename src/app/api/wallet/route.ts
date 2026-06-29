import { NextRequest } from 'next/server';
import { handle, requireUser } from '@/server/auth';
import { getBalance, listTransactions, periodEarnings, PLATFORM_COMMISSION_RATE } from '@/server/wallet';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  return handle(async (db) => {
    const u = await requireUser(req);
    const balance = getBalance(db, u.id);
    const txs = listTransactions(db, u.id, 50);
    const now = Date.now();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
    const last7 = periodEarnings(db, u.id, sevenDaysAgo);
    const last30 = periodEarnings(db, u.id, thirtyDaysAgo);
    // Jami daromad
    const totalRow = db.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM wallet_transactions WHERE user_id = ? AND type = 'booking_in'`).get(u.id) as { total: number };
    return {
      balance,
      transactions: txs,
      stats: { last7, last30, totalEarned: totalRow.total },
      commissionRate: PLATFORM_COMMISSION_RATE,
    };
  });
}
