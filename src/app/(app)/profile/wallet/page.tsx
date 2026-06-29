'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Wallet, CreditCard, Plus, Trash2, ArrowDownToLine, ArrowUpRight, X, Check } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { useAuth, useToasts } from '@/lib/store';
import { api, type ServerCard, type ServerWithdrawal, type WalletTx } from '@/lib/api';

const fmt = (n: number) => n.toLocaleString('en-US').replace(/,/g, ' ');

export default function WalletPage() {
  const { t } = useT();
  const user = useAuth((s) => s.user);
  const ready = useAuth((s) => s.ready);
  const pushToast = useToasts((s) => s.push);

  const [balance, setBalance] = useState(0);
  const [txs, setTxs] = useState<WalletTx[]>([]);
  const [stats, setStats] = useState<{ last7: number; last30: number; totalEarned: number } | null>(null);
  const [commissionRate, setCommissionRate] = useState(0.05);
  const [cards, setCards] = useState<ServerCard[]>([]);
  const [withdrawals, setWithdrawals] = useState<ServerWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  // Karta qo'shish modali
  const [showAddCard, setShowAddCard] = useState(false);
  const [cNumber, setCNumber] = useState('');
  const [cHolder, setCHolder] = useState('');
  const [cExpiry, setCExpiry] = useState('');

  // Pul yechish modali
  const [showWd, setShowWd] = useState(false);
  const [wdCard, setWdCard] = useState<string>('');
  const [wdAmount, setWdAmount] = useState('');

  const loadAll = async () => {
    setLoading(true);
    try {
      const [w, c, wd] = await Promise.all([api.getWallet(), api.listCards(), api.listWithdrawals()]);
      setBalance(w.balance);
      setTxs(w.transactions);
      setStats(w.stats);
      setCommissionRate(w.commissionRate);
      setCards(c.cards);
      setWithdrawals(wd.items);
      if (!wdCard && c.cards[0]) setWdCard(c.cards[0].id);
    } catch (e: any) { pushToast(e.message, 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (ready && user?.role === 'business') loadAll(); else if (ready) setLoading(false); }, [ready, user]);

  if (!ready) return <div className="container"><div className="empty">…</div></div>;
  if (!user || user.role !== 'business') {
    return (
      <div className="container">
        <div className="app-topbar">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link href="/profile" style={{ color: 'var(--text-2)', display: 'inline-flex' }}><ArrowLeft size={22} /></Link>
            {t.wallet.title}
          </h1>
        </div>
        <div className="empty" style={{ marginTop: 40, padding: '40px 20px' }}>
          <Wallet size={32} style={{ opacity: .4, marginBottom: 10 }} />
          <div style={{ fontWeight: 700, fontSize: 17 }}>{t.wallet.notReadyTitle}</div>
          <div style={{ marginTop: 6, color: 'var(--text-2)' }}>{t.wallet.notReadyDesc}</div>
        </div>
      </div>
    );
  }

  const addCard = async () => {
    try {
      await api.addCard({ number: cNumber, holder: cHolder, expiry: cExpiry || undefined });
      pushToast(t.profile.saved, 'success');
      setShowAddCard(false); setCNumber(''); setCHolder(''); setCExpiry('');
      await loadAll();
    } catch (e: any) { pushToast(e.message, 'error'); }
  };
  const delCard = async (id: string) => {
    try { await api.deleteCard(id); pushToast(t.profile.saved, 'success'); await loadAll(); }
    catch (e: any) { pushToast(e.message, 'error'); }
  };
  const submitWd = async () => {
    try {
      await api.requestWithdrawal(wdCard, Number(wdAmount));
      pushToast(t.profile.saved, 'success');
      setShowWd(false); setWdAmount('');
      await loadAll();
    } catch (e: any) { pushToast(e.message, 'error'); }
  };
  const cancelWd = async (id: string) => {
    try { await api.cancelWithdrawal(id); await loadAll(); }
    catch (e: any) { pushToast(e.message, 'error'); }
  };

  const txLabel = (type: string) => {
    if (type === 'booking_in') return t.wallet.txBookingIn;
    if (type === 'withdrawal') return t.wallet.txWithdrawal;
    return t.wallet.txAdjustment;
  };

  return (
    <div className="container">
      <div className="app-topbar">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/profile" style={{ color: 'var(--text-2)', display: 'inline-flex' }}><ArrowLeft size={22} /></Link>
          {t.wallet.title}
        </h1>
      </div>

      {loading ? <div className="empty">…</div> : (
        <>
          {/* Balans kartochkasi */}
          <div className="wallet-hero">
            <div className="wallet-hero__label">{t.wallet.balance}</div>
            <div className="wallet-hero__amount">{fmt(balance)} <span>{t.common.soum}</span></div>
            <div className="wallet-hero__actions">
              <button className="btn" onClick={() => setShowWd(true)} disabled={cards.length === 0 || balance < 10000}>
                <ArrowDownToLine size={16} /> {t.wallet.withdraw}
              </button>
            </div>
          </div>

          {/* Statistika */}
          {stats && (
            <div className="wallet-stats">
              <div className="wallet-stat"><div className="wallet-stat__label">{t.wallet.earned7}</div><div className="wallet-stat__val">{fmt(stats.last7)}</div></div>
              <div className="wallet-stat"><div className="wallet-stat__label">{t.wallet.earned30}</div><div className="wallet-stat__val">{fmt(stats.last30)}</div></div>
              <div className="wallet-stat"><div className="wallet-stat__label">{t.wallet.totalEarned}</div><div className="wallet-stat__val">{fmt(stats.totalEarned)}</div></div>
            </div>
          )}

          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 8, marginBottom: 16 }}>
            {t.wallet.commission}: {(commissionRate * 100).toFixed(0)}%
          </div>

          {/* Kartalar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 22 }}>
            <h2 className="app-section-title" style={{ margin: 0 }}>{t.wallet.cards}</h2>
            <button className="btn btn--ghost" onClick={() => setShowAddCard(true)} style={{ padding: '7px 12px', fontSize: 13 }}>
              <Plus size={14} /> {t.wallet.addCard}
            </button>
          </div>
          {cards.length === 0 ? (
            <div className="empty" style={{ marginTop: 10 }}>{t.wallet.addFirstCard}</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
              {cards.map((c) => (
                <div key={c.id} className="card-item">
                  <div className="card-item__brand">
                    <CreditCard size={20} />
                    <span style={{ textTransform: 'uppercase', fontWeight: 700, fontSize: 12 }}>{c.brand || 'card'}</span>
                  </div>
                  <div className="card-item__body">
                    <div className="card-item__num">•••• •••• •••• {c.last4}</div>
                    <div className="card-item__holder">{c.holder}</div>
                    {c.isDefault && <span className="badge badge--verified" style={{ marginTop: 4, display: 'inline-block' }}>{t.wallet.defaultCard}</span>}
                  </div>
                  <button className="booking-card__cancel" onClick={() => delCard(c.id)} style={{ alignSelf: 'center' }}>
                    <Trash2 size={14} /> {t.wallet.delete}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Yechimlar tarixi */}
          {withdrawals.length > 0 && (
            <>
              <h2 className="app-section-title" style={{ marginTop: 22 }}>{t.wallet.withdrawalHistory}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {withdrawals.map((w) => (
                  <div key={w.id} className="booking-card">
                    <div className="booking-card__body">
                      <div className="booking-card__name">{fmt(w.amount)} {t.common.soum}</div>
                      <div className="booking-card__meta">****{w.cardLast4 || '????'} · {(w.cardBrand || '').toUpperCase()}</div>
                      <div className="booking-card__meta">{new Date(w.createdAt).toLocaleString()}</div>
                      {w.adminNote && <div className="booking-card__meta">{w.adminNote}</div>}
                      <div className="booking-card__row">
                        <span className={`booking-card__status booking-card__status--${w.status === 'approved' ? 'confirmed' : w.status === 'rejected' ? 'cancelled' : 'confirmed'}`}>
                          {w.status === 'approved' ? t.wallet.approved : w.status === 'rejected' ? t.wallet.rejected : t.wallet.pending}
                        </span>
                        {w.status === 'pending' && (
                          <button className="booking-card__cancel" onClick={() => cancelWd(w.id)}>{t.wallet.cancelReq}</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Tranzaksiyalar */}
          <h2 className="app-section-title" style={{ marginTop: 22 }}>{t.wallet.history}</h2>
          {txs.length === 0 ? <div className="empty">{t.wallet.noTx}</div> : (
            <div className="tx-list">
              {txs.map((tx) => {
                const pos = tx.amount >= 0;
                return (
                  <div key={tx.id} className="tx-item">
                    <div className={`tx-item__icon ${pos ? 'tx-item__icon--in' : 'tx-item__icon--out'}`}>
                      {pos ? <ArrowDownToLine size={16} /> : <ArrowUpRight size={16} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="tx-item__title">{txLabel(tx.type)}</div>
                      {tx.note && <div className="tx-item__note">{tx.note}</div>}
                      <div className="tx-item__time">{new Date(tx.createdAt).toLocaleString()}</div>
                    </div>
                    <div className={`tx-item__amount ${pos ? 'tx-item__amount--in' : 'tx-item__amount--out'}`}>
                      {pos ? '+' : ''}{fmt(tx.amount)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Karta qo'shish modali */}
      {showAddCard && (
        <div className="modal__overlay" onClick={() => setShowAddCard(false)}>
          <div className="modal__card" onClick={(e) => e.stopPropagation()}>
            <div className="modal__title">{t.wallet.addCard}</div>
            <div className="field"><label>{t.wallet.cardNumber}</label>
              <input value={cNumber} onChange={(e) => setCNumber(e.target.value)} placeholder={t.wallet.cardNumberPh} inputMode="numeric" maxLength={23} />
            </div>
            <div className="field"><label>{t.wallet.cardHolder}</label>
              <input value={cHolder} onChange={(e) => setCHolder(e.target.value.toUpperCase())} placeholder={t.wallet.cardHolderPh} />
            </div>
            <div className="field"><label>{t.wallet.cardExpiry}</label>
              <input value={cExpiry} onChange={(e) => setCExpiry(e.target.value)} placeholder="MM/YY" maxLength={5} />
            </div>
            <button className="btn btn--block" onClick={addCard} disabled={!cNumber || !cHolder}>
              <Check size={15} /> {t.wallet.saveCard}
            </button>
            <button className="btn btn--ghost btn--block" onClick={() => setShowAddCard(false)} style={{ marginTop: 10 }}>
              <X size={15} /> {t.booking.close}
            </button>
          </div>
        </div>
      )}

      {/* Pul yechish modali */}
      {showWd && (
        <div className="modal__overlay" onClick={() => setShowWd(false)}>
          <div className="modal__card" onClick={(e) => e.stopPropagation()}>
            <div className="modal__title">{t.wallet.withdrawTitle}</div>
            <div className="modal__place">{t.wallet.balance}: {fmt(balance)} {t.common.soum}</div>
            <div className="field"><label>{t.wallet.pickCard}</label>
              <select value={wdCard} onChange={(e) => setWdCard(e.target.value)}>
                {cards.map((c) => <option key={c.id} value={c.id}>{(c.brand || '').toUpperCase()} ****{c.last4} · {c.holder}</option>)}
              </select>
            </div>
            <div className="field"><label>{t.wallet.amount}</label>
              <input inputMode="numeric" value={wdAmount} onChange={(e) => setWdAmount(e.target.value.replace(/\D/g, ''))} placeholder={t.wallet.amountPh} />
              <div className="char-count">{t.wallet.min}</div>
            </div>
            <button className="btn btn--block" onClick={submitWd} disabled={!wdCard || Number(wdAmount) < 10000 || Number(wdAmount) > balance}>
              <ArrowDownToLine size={15} /> {t.wallet.submit}
            </button>
            <button className="btn btn--ghost btn--block" onClick={() => setShowWd(false)} style={{ marginTop: 10 }}>{t.booking.close}</button>
          </div>
        </div>
      )}
    </div>
  );
}
