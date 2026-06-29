'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';
import { CATEGORIES } from '@/lib/mock-data';
import { useT } from '@/lib/i18n';
import { useAuth, useToasts } from '@/lib/store';
import { usePlaces } from '@/lib/usePlaces';
import { distanceKm } from '@/lib/distance';
import { CategorySlug } from '@/lib/types';
import CategoryIcon from '@/components/CategoryIcon';
import PlaceCard from '@/components/PlaceCard';

export default function HomePage() {
  const { t } = useT();
  const user = useAuth((s) => s.user);
  const pushToast = useToasts((s) => s.push);
  const { places, loading } = usePlaces();
  const [cat, setCat] = useState<CategorySlug | null>(null);
  const [me, setMe] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  const detectLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      pushToast(t.home.locDenied, 'error'); return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setMe({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocating(false); },
      () => { pushToast(t.home.locDenied, 'error'); setLocating(false); },
      { timeout: 10000 },
    );
  };

  const all = places ?? [];
  const filtered = useMemo(() => (cat ? all.filter((p) => p.categorySlug === cat) : all), [all, cat]);
  const reco = useMemo(() => [...all].sort((a, b) => b.ratingAvg - a.ratingAvg).slice(0, 6), [all]);
  const near = useMemo(() => {
    if (!me) return [];
    return [...all]
      .map((p) => ({ ...p, _d: distanceKm(me, p.location) }))
      .sort((a, b) => a._d - b._d)
      .slice(0, 6);
  }, [all, me]);

  const name = user?.name || '';

  return (
    <div className="container">
      <div className="app-topbar">
        <div>
          <div style={{ color: 'var(--text-2)', fontSize: 14 }}>{t.home.hello}{name ? `, ${name}` : ''}</div>
          <h1>{t.home.explore}</h1>
        </div>
      </div>

      <div className="chips" style={{ marginTop: 8 }}>
        <button className={`chip ${cat === null ? 'chip--active' : ''}`} onClick={() => setCat(null)}>{t.categories.all}</button>
        {CATEGORIES.map((c) => (
          <button key={c.id} className={`chip ${cat === c.slug ? 'chip--active' : ''}`} onClick={() => setCat(c.slug)}>
            <CategoryIcon slug={c.slug} size={15} /> {t.categories[c.slug]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty" style={{ marginTop: 24 }}>…</div>
      ) : all.length === 0 ? (
        // Tasdiqlangan joylar umuman yo'q
        <div className="empty" style={{ marginTop: 40, padding: '40px 20px' }}>
          <MapPin size={32} style={{ opacity: .4, marginBottom: 10 }} />
          <div style={{ fontWeight: 700, fontSize: 17 }}>{t.home.emptyAll}</div>
        </div>
      ) : (
        <>
          {!cat && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, gap: 10, flexWrap: 'wrap' }}>
                <h2 className="app-section-title" style={{ margin: 0 }}>{t.home.nearMe}</h2>
                {!me && (
                  <button className="btn btn--ghost" onClick={detectLocation} disabled={locating} style={{ padding: '7px 14px', fontSize: 13 }}>
                    <MapPin size={14} /> {locating ? t.home.locating : t.home.getLoc}
                  </button>
                )}
              </div>
              {me && near.length > 0 && (
                <div className="reco__track">
                  {near.map((p) => (
                    <div key={p.id} style={{ flex: '0 0 270px', position: 'relative' }}>
                      <PlaceCard place={p} />
                      <span style={{ position: 'absolute', top: 10, right: 10, zIndex: 3, background: 'rgba(255,255,255,.92)', borderRadius: 20, padding: '3px 9px', fontSize: 11, fontWeight: 700, color: 'var(--turq-d)' }}>
                        {p._d < 1 ? `${Math.round(p._d * 1000)} m` : `${p._d.toFixed(1)} km`}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <h2 className="app-section-title" style={{ marginTop: 24 }}>{t.home.recommended}</h2>
              <div className="reco__track">
                {reco.map((p) => (<div key={p.id} style={{ flex: '0 0 270px' }}><PlaceCard place={p} /></div>))}
              </div>
            </>
          )}

          <h2 className="app-section-title" style={{ marginTop: 24 }}>{cat ? t.categories[cat] : t.home.all}</h2>
          {filtered.length === 0 ? (
            <div className="empty">{t.home.emptyApproved}</div>
          ) : (
            <div className="grid">
              {filtered.map((p) => (<PlaceCard key={p.id} place={p} />))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
