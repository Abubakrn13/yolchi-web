'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, X, BarChart3, Store, ArrowDownToLine, Users, Wallet, ShoppingBag, TrendingUp } from 'lucide-react';
import { useAuth, useToasts } from '@/lib/store';
import { api, type ServerPlace, type AdminStats, type AdminTopOwner, type AdminWithdrawalItem } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useT } from '@/lib/i18n';

const fmt = (n: number) => n.toLocaleString('en-US').replace(/,/g, ' ');
type Tab = 'stats' | 'places' | 'withdrawals';

export default function AdminPage() {
  const { t } = useT();
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const ready = useAuth((s) => s.ready);
  const pushToast = useToasts((s) => s.push);
  const [tab, setTab] = useState<Tab>('stats');

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [topOwners, setTopOwners] = useState<AdminTopOwner[]>([]);
  const [places, setPlaces] = useState<ServerPlace[] | null>(null);
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawalItem[] | null>(null);

  useEffect(() => { if (ready && (!user || !user.isAdmin)) router.replace('/home'); }, [ready, user, router]);

  const loadStats = async () => {
    try { const d = await api.adminStats(); setStats(d.stats); setTopOwners(d.topOwners); }
    catch (e: any) { pushToast(e.message, 'error'); }
  };
  const loadPlaces = async () => {
    try { const d = await api.adminPending(); setPlaces(d.places); }
    catch (e: any) { pushToast(e.message, 'error'); setPlaces([]); }
  };
  const loadWithdrawals = async () => {
    try { const d = await api.adminWithdrawals('pending'); setWithdrawals(d.items); }
    catch (e: any) { pushToast(e.message, 'error'); setWithdrawals([]); }
  };

  useEffect(() => {
    if (!user?.isAdmin) return;
    if (tab === 'stats') loadStats();
    else if (tab === 'places') loadPlaces();
    else if (tab === 'withdrawals') loadWithdrawals();
  }, [tab, user]);

  const actPlace = async (id: string, action: 'approve' | 'reject') => {
    try { await api.adminVerify(id, action); pushToast(action === 'approve' ? t.admin.approve : t.admin.reject, 'success'); loadPlaces(); loadStats(); }
    catch (e: any) { pushToast(e.message, 'error'); }
  };
  const actWd = async (id: string, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') await api.adminApproveWithdrawal(id);
      else await api.adminRejectWithdrawal(id);
      pushToast(action === 'approve' ? t.admin.approve : t.admin.reject, 'success');
      loadWithdrawals(); loadStats();
    } catch (e: any) { pushToast(e.message, 'error'); }
  };

  if (!ready || !user?.isAdmin) return <div className="container"><div className="empty">…</div></div>;

  return (
    <div className="container">
      <div className="app-topbar">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/profile" style={{ color: 'var(--text-2)', display: 'inline-flex' }}><ArrowLeft size={22} /></Link>
          {t.admin.title}
        </h1>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'stats' ? 'admin-tab--on' : ''}`} onClick={() => setTab('stats')}>
          <BarChart3 size={16} /> {t.admin.statsTab}
        </button>
        <button className={`admin-tab ${tab === 'places' ? 'admin-tab--on' : ''}`} onClick={() => setTab('places')}>
          <Store size={16} /> {t.admin.pendingPlacesTab}
          {stats && stats.placesPending > 0 && <span className="admin-tab__count">{stats.placesPending}</span>}
        </button>
        <button className={`admin-tab ${tab === 'withdrawals' ? 'admin-tab--on' : ''}`} onClick={() => setTab('withdrawals')}>
          <ArrowDownToLine size={16} /> {t.admin.pendingWithdrawalsTab}
          {stats && stats.pendingWithdrawals > 0 && <span className="admin-tab__count">{stats.pendingWithdrawals}</span>}
        </button>
      </div>

      {tab === 'stats' && (
        <>
          {!stats ? <div className="empty">…</div> : (
            <>
              <div className="admin-grid">
                <div className="admin-card"><div className="admin-card__icon"><Users size={20} /></div>
                  <div><div className="admin-card__label">{t.admin.users}</div><div className="admin-card__val">{stats.usersTotal}</div></div>
                </div>
                <div className="admin-card"><div className="admin-card__icon"><Store size={20} /></div>
                  <div><div className="admin-card__label">{t.admin.places}</div><div className="admin-card__val">{stats.placesTotal}</div></div>
                </div>
                <div className="admin-card"><div className="admin-card__icon"><ShoppingBag size={20} /></div>
                  <div><div className="admin-card__label">{t.admin.bookings}</div><div className="admin-card__val">{stats.bookingsTotal}</div></div>
                </div>
                <div className="admin-card"><div className="admin-card__icon"><TrendingUp size={20} /></div>
                  <div><div className="admin-card__label">{t.admin.gross}</div><div className="admin-card__val">{fmt(stats.gross)}</div></div>
                </div>
                <div className="admin-card"><div className="admin-card__icon"><Wallet size={20} /></div>
                  <div><div className="admin-card__label">{t.admin.ownerPaid}</div><div className="admin-card__val">{fmt(stats.ownerPaid)}</div></div>
                </div>
                <div className="admin-card"><div className="admin-card__icon"><TrendingUp size={20} /></div>
                  <div><div className="admin-card__label">{t.admin.platformRevenue}</div><div className="admin-card__val">{fmt(stats.platformRevenue)}</div></div>
                </div>
                <div className="admin-card"><div className="admin-card__icon"><Store size={20} /></div>
                  <div><div className="admin-card__label">{t.admin.listingRevenue}</div><div className="admin-card__val">{fmt(stats.listingRevenue)}</div></div>
                </div>
                <div className="admin-card admin-card--accent"><div className="admin-card__icon"><TrendingUp size={20} /></div>
                  <div><div className="admin-card__label">{t.admin.totalRevenue}</div><div className="admin-card__val">{fmt(stats.totalPlatformRevenue)}</div></div>
                </div>
                <div className="admin-card"><div className="admin-card__icon"><ArrowDownToLine size={20} /></div>
                  <div><div className="admin-card__label">{t.admin.withdrawn}</div><div className="admin-card__val">{fmt(stats.withdrawn)}</div></div>
                </div>
              </div>

              {topOwners.length > 0 && (
                <>
                  <h2 className="app-section-title" style={{ marginTop: 24 }}>{t.admin.topOwners}</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {topOwners.map((o, i) => (
                      <div key={o.id} className="top-owner">
                        <div className="top-owner__rank">#{i + 1}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700 }}>{o.name || o.phone}</div>
                          <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{o.phone}</div>
                        </div>
                        <div className="top-owner__earned">{fmt(o.earned)} {t.common.soum}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}

      {tab === 'places' && (
        <>
          {!places ? <div className="empty">…</div> : places.length === 0 ? (
            <div className="empty">Tekshiruv navbati boʻsh.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {places.map((p) => (
                <div key={p.id} className="booking-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.photos[0] && <img src={p.photos[0]} alt="" />}
                  <div className="booking-card__body">
                    <div className="booking-card__name">{p.name}</div>
                    <div className="booking-card__meta">{p.categoryName} · {p.city || '—'} · {p.phone || '—'}</div>
                    <div className="booking-card__meta">{p.description.slice(0, 100)}{p.description.length > 100 ? '…' : ''}</div>
                    <div className="booking-card__row" style={{ marginTop: 8 }}>
                      <button className="btn" style={{ padding: '7px 14px', fontSize: 13 }} onClick={() => actPlace(p.id, 'approve')}><Check size={14} /> {t.admin.approve}</button>
                      <button className="booking-card__cancel" onClick={() => actPlace(p.id, 'reject')}><X size={14} /> {t.admin.reject}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'withdrawals' && (
        <>
          {!withdrawals ? <div className="empty">…</div> : withdrawals.length === 0 ? (
            <div className="empty">Tekshiruv navbati boʻsh.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {withdrawals.map((w) => (
                <div key={w.id} className="booking-card">
                  <div className="booking-card__body">
                    <div className="booking-card__name">{fmt(w.amount)} {t.common.soum}</div>
                    <div className="booking-card__meta">{t.admin.for}: {w.userName || w.userPhone} · {w.userPhone}</div>
                    <div className="booking-card__meta">{t.admin.card}: {(w.cardBrand || '').toUpperCase()} ****{w.cardLast4} · {w.cardHolder}</div>
                    <div className="booking-card__meta">{new Date(w.createdAt).toLocaleString()}</div>
                    <div className="booking-card__row" style={{ marginTop: 8 }}>
                      <button className="btn" style={{ padding: '7px 14px', fontSize: 13 }} onClick={() => actWd(w.id, 'approve')}><Check size={14} /> {t.admin.approve}</button>
                      <button className="booking-card__cancel" onClick={() => actWd(w.id, 'reject')}><X size={14} /> {t.admin.reject}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
