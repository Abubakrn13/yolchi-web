'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Camera, ChevronRight, CalendarCheck, Settings, LogOut, Plus, Check, Pencil, Wallet } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { useAuth, useToasts } from '@/lib/store';
import { useMyPlaces } from '@/lib/usePlaces';
import { api } from '@/lib/api';
import PlaceCard from '@/components/PlaceCard';

export default function ProfilePage() {
  const { t } = useT();
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const ready = useAuth((s) => s.ready);
  const updateProfile = useAuth((s) => s.updateProfile);
  const signOut = useAuth((s) => s.signOut);
  const pushToast = useToasts((s) => s.push);
  const myPlaces = useMyPlaces(!!user && user.role === 'business');
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  if (!ready || !user) return <div className="container"><div className="empty">…</div></div>;

  const displayName = user.name || (user.provider === 'google' ? 'Google User' : user.phone);
  const initial = (displayName[0] || 'Y').toUpperCase();
  const isBusiness = user.role === 'business';

  const onPhoto = async (files: FileList | null) => {
    if (!files || !files[0]) return;
    setSaving(true);
    try {
      const { urls } = await api.uploadPhotos([files[0]]);
      await updateProfile({ photo: urls[0] });
      pushToast(t.profile.saved, 'success');
    } catch (e: any) { pushToast(e.message, 'error'); }
    finally { setSaving(false); }
  };

  const saveName = async () => {
    setSaving(true);
    try { await updateProfile({ name: name.trim() }); setEditing(false); pushToast(t.profile.saved, 'success'); }
    catch (e: any) { pushToast(e.message, 'error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="container">
      <div className="app-topbar"><h1>{t.profile.title}</h1></div>

      <div className="profile-hero">
        <label className="avatar-upload">
          <div className="profile-hero__avatar">
            {user.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photo} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : initial}
          </div>
          <span className="avatar-upload__badge"><Camera size={12} /></span>
          <input type="file" accept="image/*" onChange={(e) => onPhoto(e.target.files)} disabled={saving} />
        </label>
        <div className="profile-hero__info">
          {editing ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.profile.namePlaceholder} autoFocus disabled={saving}
                style={{ flex: 1, borderRadius: 10, border: '1px solid rgba(255,255,255,.3)', background: 'rgba(255,255,255,.12)', color: '#fff', padding: '8px 10px', fontFamily: 'inherit' }}/>
              <button className="profile-hero__btn" onClick={saveName} disabled={saving}><Check size={14} /> {t.profile.save}</button>
            </div>
          ) : (
            <>
              <div className="profile-hero__name">
                {displayName}{' '}
                <button onClick={() => { setName(user.name || ''); setEditing(true); }}
                  style={{ background: 'none', border: 'none', color: 'var(--gold-l)', cursor: 'pointer', verticalAlign: 'middle' }}>
                  <Pencil size={15} />
                </button>
              </div>
              <div className="profile-hero__meta">{isBusiness ? t.profile.business : t.profile.tourist} · {user.phone}</div>
            </>
          )}
        </div>
      </div>

      <div className="menu-list">
        {isBusiness && (
          <Link href="/profile/add-place" className="menu-item">
            <span className="menu-item__icon"><Plus size={20} /></span> {t.profile.addPlace}
            <ChevronRight size={18} className="menu-item__chev" />
          </Link>
        )}
        {isBusiness && (
          <Link href="/profile/wallet" className="menu-item">
            <span className="menu-item__icon" style={{ color: 'var(--turq-d)' }}><Wallet size={20} /></span> {t.wallet.title}
            <ChevronRight size={18} className="menu-item__chev" />
          </Link>
        )}
        {user.isAdmin && (
          <Link href="/admin" className="menu-item">
            <span className="menu-item__icon" style={{ color: 'var(--gold)' }}><Check size={20} /></span> Admin
            <ChevronRight size={18} className="menu-item__chev" />
          </Link>
        )}
        <Link href="/profile/bookings" className="menu-item">
          <span className="menu-item__icon"><CalendarCheck size={20} /></span> {t.profile.myBookings}
          <ChevronRight size={18} className="menu-item__chev" />
        </Link>
        <Link href="/profile/settings" className="menu-item">
          <span className="menu-item__icon"><Settings size={20} /></span> {t.profile.settings}
          <ChevronRight size={18} className="menu-item__chev" />
        </Link>
        <button className="menu-item" onClick={async () => { await signOut(); router.replace('/'); }}>
          <span className="menu-item__icon" style={{ color: 'var(--danger)' }}><LogOut size={20} /></span> {t.profile.signOut}
        </button>
      </div>

      {isBusiness && (
        <>
          <h2 className="app-section-title" style={{ marginTop: 28 }}>{t.profile.myPlaces}</h2>
          {!myPlaces ? (
            <div className="empty">…</div>
          ) : myPlaces.length === 0 ? (
            <div className="empty">{t.profile.noPlaces}</div>
          ) : (
            <div className="grid">{myPlaces.map((p) => (<PlaceCard key={p.id} place={p} />))}</div>
          )}
        </>
      )}
    </div>
  );
}
