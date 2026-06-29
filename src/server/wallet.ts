// Virtual hamyon — biznes egalari uchun balans va tranzaksiyalar.
import type { DbWrapper } from './db';
import { genId } from './ids';

// Yo'lchining xizmat haqi — bron summasidan ushlab qoladigan komissiya
export const PLATFORM_COMMISSION_RATE = 0.05; // 5%

export type TxType = 'booking_in' | 'withdrawal' | 'adjustment' | 'commission';

export interface WalletTx {
  id: string;
  userId: string;
  type: TxType;
  amount: number;
  balanceAfter: number;
  referenceId: string | null;
  note: string | null;
  createdAt: string;
}

export function getBalance(db: DbWrapper, userId: string): number {
  const row = db.prepare('SELECT balance_after FROM wallet_transactions WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT 1').get(userId) as { balance_after: number } | undefined;
  return row?.balance_after ?? 0;
}

export function addTransaction(
  db: DbWrapper,
  userId: string,
  type: TxType,
  amount: number,
  opts: { referenceId?: string | null; note?: string | null } = {},
): WalletTx {
  const current = getBalance(db, userId);
  const next = current + amount;
  const now = new Date().toISOString();
  const id = genId('tx');
  db.prepare(`INSERT INTO wallet_transactions (id, user_id, type, amount, balance_after, reference_id, note, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, userId, type, amount, next, opts.referenceId ?? null, opts.note ?? null, now);
  return { id, userId, type, amount, balanceAfter: next, referenceId: opts.referenceId ?? null, note: opts.note ?? null, createdAt: now };
}

// Bron yopilganda: mijozdan tushgan summadan komissiya ushlab biznes egasiga qo'shamiz
// total = mijoz to'lagan summa (joy narxi + 3% xizmat haqi)
// biznesga: joy narxining (1 - 5%) qismi tushadi.
export function distributeBookingPayment(
  db: DbWrapper,
  bookingId: string,
  ownerId: string,
  placePrice: number,   // joy narxi (xizmat haqisiz)
): { ownerCredit: number; commission: number } {
  const commission = Math.round(placePrice * PLATFORM_COMMISSION_RATE);
  const ownerCredit = placePrice - commission;
  addTransaction(db, ownerId, 'booking_in', ownerCredit, { referenceId: bookingId, note: 'Bron uchun toʻlov' });
  return { ownerCredit, commission };
}

export function listTransactions(db: DbWrapper, userId: string, limit = 50): WalletTx[] {
  const rows = db.prepare(`SELECT id, user_id as userId, type, amount, balance_after as balanceAfter,
                                  reference_id as referenceId, note, created_at as createdAt
                           FROM wallet_transactions WHERE user_id = ?
                           ORDER BY created_at DESC, id DESC LIMIT ?`).all(userId, limit) as WalletTx[];
  return rows;
}

// Davr (sana) bo'yicha jami daromad
export function periodEarnings(db: DbWrapper, userId: string, sinceISO: string): number {
  const row = db.prepare(`SELECT COALESCE(SUM(amount), 0) as total
                          FROM wallet_transactions
                          WHERE user_id = ? AND type = 'booking_in' AND created_at >= ?`).get(userId, sinceISO) as { total: number };
  return row?.total ?? 0;
}
