'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CalendarCheck, Check, Minus, Plus, Clock } from 'lucide-react';
import { Place } from '@/lib/types';
import { BOOKING_TAX_RATE } from '@/lib/mock-data';
import { useT } from '@/lib/i18n';
import { useAuth, useBookings, useToasts, useNotifications } from '@/lib/store';
import { api } from '@/lib/api';

const fmt = (n: number) => n.toLocaleString('en-US').replace(/,/g, ' ');
type Step = 'form' | 'pay' | 'done';

export default function BookingModal({ place }: { place: Place }) {
  const { t } = useT();
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const prepend = useBookings((s) => s.prepend);
  const loadNotif = useNotifications((s) => s.load);
  const pushToast = useToasts((s) => s.push);

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('form');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('12:00');
  const [guests, setGuests] = useState(2);
  const [method, setMethod] = useState<'payme' | 'click'>('payme');
  const [ref, setRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const base = place.bookingPrice ?? 0;
  const tax = Math.round(base * BOOKING_TAX_RATE);
  const total = base + tax;

  const openBooking = () => { if (!user) { router.push('/auth'); return; } setOpen(true); };
  const close = () => { setOpen(false); setStep('form'); setRef(''); setErr(''); };

  const pay = async () => {
    setLoading(true); setErr('');
    try {
      const { booking } = await api.createBooking({ placeId: place.id, date, time, guests, method });
      setRef(booking.ref);
      prepend(booking);
      loadNotif();
      pushToast(t.notif.bookingTitle, 'success');
      setStep('done');
    } catch (e: any) {
      setErr(e.message);
      pushToast(e.message, 'error');
    } finally { setLoading(false); }
  };

  const row = (label: string, value: string, strong = false) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontWeight: strong ? 800 : 500, fontSize: strong ? 16 : 14 }}>
      <span style={{ color: strong ? 'var(--text)' : 'var(--text-2)' }}>{label}</span><span>{value}</span>
    </div>
  );

  const payBtn = (m: 'payme' | 'click', label: string) => (
    <button onClick={() => setMethod(m)} style={{
      flex: 1, padding: '14px', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700,
      border: `2px solid ${method === m ? 'var(--turq)' : 'var(--border)'}`,
      background: method === m ? 'rgba(24,178,198,.08)' : 'var(--card)', color: 'var(--text)',
    }}>{label}</button>
  );

  return (
    <>
      <div className="book-bar">
        <div className="book-bar__inner">
          <div className="book-bar__price">
            {base ? `${fmt(base)} ${t.common.soum}` : '—'}
            <span>{t.booking.tax}</span>
          </div>
          <button className="btn" onClick={openBooking}>
            <CalendarCheck size={18} /> {!user ? t.booking.signInFirst : t.booking.open}
          </button>
        </div>
      </div>

      {open && (
        <div className="modal__overlay" onClick={close}>
          <div className="modal__card" onClick={(e) => e.stopPropagation()}>
            {step === 'form' && (
              <>
                <div className="modal__title">{t.booking.title}</div>
                <div className="modal__place">{place.name}</div>
                <div className="field-row">
                  <div className="field"><label>{t.booking.date}</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
                  <div className="field"><label>{t.booking.time}</label>
                    <input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div>
                </div>
                <div className="field"><label>{t.booking.guests}</label>
                  <div className="stepper">
                    <button onClick={() => setGuests((g) => Math.max(1, g - 1))}><Minus size={18} /></button>
                    <span className="stepper__val">{guests}</span>
                    <button onClick={() => setGuests((g) => Math.min(20, g + 1))}><Plus size={18} /></button>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 4 }}>
                  {row(t.booking.subtotal, `${fmt(base)} ${t.common.soum}`)}
                  {row(t.booking.tax, `${fmt(tax)} ${t.common.soum}`)}
                  {row(t.booking.total, `${fmt(total)} ${t.common.soum}`, true)}
                </div>
                <div style={{
                  background: 'rgba(210,162,76,.12)',
                  border: '1px solid rgba(210,162,76,.3)',
                  borderRadius: 10, padding: 10,
                  fontSize: 13, color: 'var(--text)',
                  marginTop: 12, display: 'flex', alignItems: 'flex-start', gap: 8
                }}>
                  <Clock size={16} style={{ flexShrink: 0, color: '#9a7320', marginTop: 1 }} />
                  <span>{t.booking.cancelWarning}</span>
                </div>
                <button className="btn btn--block" onClick={() => setStep('pay')} disabled={!date} style={{ marginTop: 12 }}>
                  {t.booking.next}
                </button>
              </>
            )}
            {step === 'pay' && (
              <>
                <div className="modal__title">{t.booking.payTitle}</div>
                <div className="modal__place">{t.booking.payChoose}</div>
                <div style={{ display: 'flex', gap: 12, margin: '8px 0 16px' }}>
                  {payBtn('payme', t.booking.payme)}
                  {payBtn('click', t.booking.click)}
                </div>
                {err && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 8 }}>{err}</div>}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 4, marginBottom: 12 }}>
                  {row(t.booking.total, `${fmt(total)} ${t.common.soum}`, true)}
                </div>
                <button className="btn btn--block" onClick={pay} disabled={loading}>
                  {t.booking.pay} · {fmt(total)} {t.common.soum}
                </button>
              </>
            )}
            {step === 'done' && (
              <div className="modal__success">
                <Check size={44} />
                <div className="modal__title">{t.booking.successTitle}</div>
                <div className="modal__place">{t.booking.successMsg}</div>
                {ref && <div style={{ marginTop: 8, fontWeight: 800, letterSpacing: '.5px' }}>{t.book2.ref}: {ref}</div>}
                <Link href="/profile/bookings" className="btn btn--block" style={{ marginTop: 10 }} onClick={close}>
                  {t.booking.viewBookings}
                </Link>
                <button className="btn btn--ghost btn--block" style={{ marginTop: 10 }} onClick={close}>{t.booking.close}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
