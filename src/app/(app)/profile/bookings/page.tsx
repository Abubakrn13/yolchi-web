'use client';

import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { useBookings, useToasts } from '@/lib/store';

const fmt = (n: number) => n.toLocaleString('en-US').replace(/,/g, ' ');
const CANCEL_WINDOW_MS = 10 * 60 * 1000;

export default function BookingsPage() {
  const { t } = useT();
  const items = useBookings((s) => s.items);
  const ready = useBookings((s) => s.ready);
  const cancel = useBookings((s) => s.cancel);
  const pushToast = useToasts((s) => s.push);

  const onCancel = async (id: string) => {
    try { await cancel(id); pushToast(t.book2.cancelDone, 'info'); }
    catch (e: any) { pushToast(e.message, 'error'); }
  };

  const canCancel = (createdAt: string) => {
    return Date.now() - new Date(createdAt).getTime() < CANCEL_WINDOW_MS;
  };
  const minutesLeft = (createdAt: string) => {
    const left = CANCEL_WINDOW_MS - (Date.now() - new Date(createdAt).getTime());
    return Math.max(0, Math.ceil(left / 60000));
  };

  return (
    <div className="container">
      <div className="app-topbar">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/profile" style={{ color: 'var(--text-2)', display: 'inline-flex' }}><ArrowLeft size={22} /></Link>
          {t.bookings.title}
        </h1>
      </div>
      {!ready ? <div className="empty">…</div> : items.length === 0 ? <div className="empty">{t.bookings.empty}</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((b) => {
            const showCancel = b.status === 'confirmed' && canCancel(b.createdAt);
            const mins = showCancel ? minutesLeft(b.createdAt) : 0;
            return (
              <div key={b.id} className="booking-card">
                {b.placePhoto && /* eslint-disable-next-line @next/next/no-img-element */ <img src={b.placePhoto} alt="" />}
                <div className="booking-card__body">
                  <div className="booking-card__name">{b.placeName}</div>
                  <div className="booking-card__meta">{b.city} · {b.date} {b.time} · {b.guests} {t.bookings.guests}</div>
                  <div className="booking-card__meta">{fmt(b.price)} {t.common.soum} · {b.method === 'payme' ? 'Payme' : 'Click'}</div>
                  <div className="booking-card__row">
                    <span className={`booking-card__status booking-card__status--${b.status}`}>
                      {b.status === 'cancelled' ? t.book2.cancelled : t.book2.confirmed}
                    </span>
                    {b.ref && <span className="booking-card__ref">{t.book2.ref}: {b.ref}</span>}
                    {showCancel && (
                      <button className="booking-card__cancel" onClick={() => onCancel(b.id)}>
                        <Clock size={12} /> {t.book2.cancel} · {mins} {t.route.min}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
