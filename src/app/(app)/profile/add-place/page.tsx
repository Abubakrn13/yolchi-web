'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Check, MapPin, CreditCard, X, ImagePlus, Wallet, ArrowRight } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { CATEGORIES } from '@/lib/mock-data';
import { useToasts, useNotifications } from '@/lib/store';
import { api } from '@/lib/api';
import { CategorySlug } from '@/lib/types';

const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false, loading: () => <div className="map-loading">…</div> });

const LISTING_FEE = 30000;
const fmt = (n: number) => n.toLocaleString('en-US').replace(/,/g, ' ');

export default function AddPlacePage() {
  const { t } = useT();
  const pushToast = useToasts((s) => s.push);
  const loadNotif = useNotifications((s) => s.load);

  // Forma maydonlari
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategorySlug>('restaurant');
  const [desc, setDesc] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [hours, setHours] = useState('');
  const [menu, setMenu] = useState('');
  const [price, setPrice] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [err, setErr] = useState('');

  // To'lov holati
  const [showPay, setShowPay] = useState(false);
  const [payMethod, setPayMethod] = useState<'wallet' | 'payme' | 'click'>('wallet');
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // To'lov modali ochilganda balansni yuklash
  useEffect(() => {
    if (!showPay) return;
    api.getWallet().then((w) => setWalletBalance(w.balance)).catch(() => setWalletBalance(0));
  }, [showPay]);

  const onFiles = async (files: FileList | null) => {
    if (!files) return;
    const remaining = 10 - photos.length;
    const list = Array.from(files).slice(0, remaining);
    if (list.length === 0) return;
    setUploading(true);
    try { const { urls } = await api.uploadPhotos(list); setPhotos((cur) => [...cur, ...urls]); }
    catch (e: any) { pushToast(e.message, 'error'); }
    finally { setUploading(false); }
  };

  // Bosqich 1: forma to'g'ri to'ldirilganini tekshirib, to'lov ekranini ochish
  const openPayment = () => {
    setErr('');
    if (!name.trim() || !loc || !city.trim() || !phone.trim()) {
      setErr(t.create.required);
      return;
    }
    setShowPay(true);
  };

  // Bosqich 2: to'lov + joy yaratish
  const submit = async () => {
    setSubmitting(true);
    setErr('');
    try {
      const res = await api.createPlace({
        name: name.trim(), description: desc.trim(),
        categorySlug: category,
        city: city.trim(), address: address.trim() || undefined,
        phone: phone.trim(),
        location: loc!, photos,
        menu: menu ? menu.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
        workingHours: hours || undefined,
        bookingPrice: price ? Number(price) : undefined,
        priceLevel: 2,
        paymentMethod: payMethod,
      });
      pushToast(t.create.success, 'success');
      loadNotif();
      setShowPay(false);
      setDone(true);
    } catch (e: any) { setErr(e.message); pushToast(e.message, 'error'); }
    finally { setSubmitting(false); }
  };

  if (done) {
    return (
      <div className="container">
        <div className="create-card" style={{ marginTop: 24 }}>
          <div className="create-success"><Check size={20} /> {t.create.success}</div>
          <p style={{ color: 'var(--text-2)', fontSize: 13, marginTop: 8 }}>{t.notif.placeBody}</p>
          <Link href="/home" className="btn btn--block" style={{ marginTop: 14 }}>{t.nav.home}</Link>
        </div>
      </div>
    );
  }

  const Req = () => <span style={{ color: 'var(--danger)' }}>*</span>;

  // To'lov tugmasi: hamyonda yetarli mablag' bormi?
  const walletOK = walletBalance !== null && walletBalance >= LISTING_FEE;
  const canPay = payMethod === 'wallet' ? walletOK : true;

  const payBtn = (m: 'wallet' | 'payme' | 'click', label: string, hint?: string, disabled?: boolean) => (
    <button
      type="button"
      onClick={() => !disabled && setPayMethod(m)}
      disabled={disabled}
      className={`pay-option ${payMethod === m && !disabled ? 'pay-option--on' : ''} ${disabled ? 'pay-option--disabled' : ''}`}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
        <span style={{ fontWeight: 700 }}>{label}</span>
        {payMethod === m && !disabled && <Check size={16} color="var(--turq)" />}
      </div>
      {hint && <div style={{ fontSize: 12, color: disabled ? 'var(--danger)' : 'var(--text-2)', marginTop: 4 }}>{hint}</div>}
    </button>
  );

  return (
    <div className="container">
      <div className="app-topbar">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/profile" style={{ color: 'var(--text-2)', display: 'inline-flex' }}><ArrowLeft size={22} /></Link>
          {t.create.title}
        </h1>
      </div>
      <div className="create-card">
        <div className="create-card__sub">{t.create.subtitle}</div>

        <div className="field">
          <label>{t.create.pickLocation} <Req /></label>
          <div className="map-picker"><MapPicker value={loc} onPick={(lat, lng) => setLoc({ lat, lng })} /></div>
          <div className={`picked-hint ${loc ? 'picked-hint--ok' : 'picked-hint--no'}`}>
            <MapPin size={14} /> {loc ? `${t.create.picked} (${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)})` : t.create.pickHint}
          </div>
        </div>

        <div className="field"><label>{t.create.name} <Req /></label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.create.namePh} /></div>

        <div className="field-row">
          <div className="field"><label>{t.create.category}</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as CategorySlug)}>
              {CATEGORIES.map((c) => (<option key={c.slug} value={c.slug}>{t.categories[c.slug]}</option>))}
            </select></div>
          <div className="field"><label>{t.create.cityLabel} <Req /></label>
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder={t.create.cityPh} /></div>
        </div>

        <div className="field"><label>{t.create.addressLabel}</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t.create.addressPh} /></div>

        <div className="field"><label>{t.create.phoneLabel} <Req /></label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t.create.phonePh} /></div>

        <div className="field"><label>{t.create.description}</label>
          <textarea value={desc} maxLength={500} onChange={(e) => setDesc(e.target.value)} placeholder={t.create.descPh} rows={3} />
          <div className="char-count">{desc.length}/500 {t.create.descCount}</div></div>

        <div className="field">
          <label>{t.create.photos} <span style={{ color: 'var(--text-2)', fontWeight: 400 }}>· {t.create.photosHint}</span></label>
          <div className="photo-grid">
            {photos.map((src, i) => (
              <div key={i} className="photo-tile">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`photo ${i + 1}`} />
                <button type="button" className="photo-tile__del" onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}><X size={14} /></button>
              </div>
            ))}
            {photos.length < 10 && (
              <label className="photo-add">
                <ImagePlus size={22} />
                <input type="file" accept="image/*" multiple disabled={uploading} onChange={(e) => onFiles(e.target.files)} />
              </label>
            )}
          </div>
        </div>

        <div className="field-row">
          <div className="field"><label>{t.create.hours}</label>
            <input value={hours} onChange={(e) => setHours(e.target.value)} placeholder={t.create.hoursPh} /></div>
          <div className="field"><label>{t.create.price}</label>
            <input inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))} placeholder={t.create.pricePh} /></div>
        </div>

        {category === 'restaurant' && (
          <div className="field"><label>{t.create.menu}</label>
            <input value={menu} onChange={(e) => setMenu(e.target.value)} placeholder={t.create.menuPh} /></div>
        )}

        <div className="fee-row"><CreditCard size={16} /> {t.create.fee}</div>
        <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 14 }}>{t.create.taxNote}</div>

        {err && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 10 }}>{err}</div>}
        <button className="btn btn--block" onClick={openPayment} disabled={uploading}>
          {t.create.payContinue} <ArrowRight size={15} />
        </button>
      </div>

      {/* To'lov modali */}
      {showPay && (
        <div className="modal__overlay" onClick={() => !submitting && setShowPay(false)}>
          <div className="modal__card" onClick={(e) => e.stopPropagation()}>
            <div className="modal__title">{t.create.payTitle}</div>
            <div className="modal__place">{t.create.paySubtitle}</div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'var(--surface)', borderRadius: 12, margin: '12px 0 16px' }}>
              <span style={{ color: 'var(--text-2)', fontSize: 14 }}>{t.wallet.amount}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22 }}>{fmt(LISTING_FEE)} {t.common.soum}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {payBtn(
                'wallet',
                t.create.payWallet,
                walletBalance === null
                  ? t.wallet.title + '…'
                  : `${t.create.payWalletBalance}: ${fmt(walletBalance)} ${t.common.soum}${!walletOK ? ' — ' + t.create.payInsufficient : ''}`,
                walletBalance !== null && !walletOK,
              )}
              {payBtn('payme', t.create.payPayme)}
              {payBtn('click', t.create.payClick)}
            </div>

            {err && <div style={{ color: 'var(--danger)', fontSize: 13, marginTop: 10 }}>{err}</div>}

            <button className="btn btn--block" onClick={submit} disabled={submitting || (payMethod === 'wallet' && !walletOK)} style={{ marginTop: 14 }}>
              {payMethod === 'wallet' ? <Wallet size={15} /> : <CreditCard size={15} />}
              {' '}{t.create.payBtn} · {fmt(LISTING_FEE)} {t.common.soum}
            </button>
            <button className="btn btn--ghost btn--block" onClick={() => setShowPay(false)} disabled={submitting} style={{ marginTop: 8 }}>{t.create.payCancel}</button>
          </div>
        </div>
      )}
    </div>
  );
}
