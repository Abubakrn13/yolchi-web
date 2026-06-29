'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarCheck, Store, Info, Bell, Star } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { useNotifications } from '@/lib/store';

export default function NotificationsPage() {
  const { t, lang } = useT();
  const items = useNotifications((s) => s.items);
  const ready = useNotifications((s) => s.ready);
  const markAllRead = useNotifications((s) => s.markAllRead);
  const clear = useNotifications((s) => s.clear);

  useEffect(() => { if (ready && items.some((n) => !n.read)) markAllRead(); }, [ready, items, markAllRead]);

  const icon = (type: string) => {
    if (type === 'booking') return <CalendarCheck size={18} />;
    if (type === 'place') return <Store size={18} />;
    if (type === 'review_reminder') return <Star size={18} fill="currentColor" />;
    return <Info size={18} />;
  };
  const fmtTime = (iso: string) => { try { return new Date(iso).toLocaleString(lang === 'ru' ? 'ru-RU' : lang === 'en' ? 'en-US' : 'uz-UZ'); } catch { return ''; } };

  return (
    <div className="container">
      <div className="app-topbar">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/home" style={{ color: 'var(--text-2)', display: 'inline-flex' }}><ArrowLeft size={22} /></Link>
          {t.notif.title}
        </h1>
      </div>
      {ready && items.length > 0 && (
        <div className="notif-bar"><button onClick={() => clear()}>{t.notif.clear}</button></div>
      )}
      {!ready ? <div className="empty">…</div> : items.length === 0 ? (
        <div className="empty"><Bell size={28} style={{ opacity: .5, marginBottom: 8 }} /><div>{t.notif.empty}</div></div>
      ) : (
        <div className="notif-list">
          {items.map((n) => {
            const isReminder = n.type === 'review_reminder';
            return (
              <div key={n.id} className={`notif-item ${!n.read ? 'notif-item--unread' : ''} ${isReminder ? 'notif-item--reminder' : ''}`}>
                <div className={`notif-item__icon ${isReminder ? 'notif-item__icon--reminder' : ''}`}>{icon(n.type)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="notif-item__title">{isReminder ? t.notif.reminderTitle : n.title}</div>
                  <div className="notif-item__body">
                    {isReminder ? (
                      <>
                        <span style={{ fontWeight: 600, color: 'var(--text)' }}>{n.body}</span>
                        <div style={{ marginTop: 4 }}>{t.notif.reminderBody}</div>
                      </>
                    ) : n.body}
                  </div>
                  <div className="notif-item__time">{fmtTime(n.createdAt)}</div>
                  {isReminder && n.placeId && (
                    <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <Link href={`/places/${n.placeId}?focus=review`} className="btn" style={{ padding: '8px 14px', fontSize: 13 }}>
                        <Star size={14} fill="currentColor" /> {t.notif.rateNow}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
