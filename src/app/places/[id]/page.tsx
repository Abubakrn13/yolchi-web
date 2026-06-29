'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Phone, Clock, Navigation, UtensilsCrossed, BadgeCheck, Share2, X } from 'lucide-react';
import { api, type ServerPlace, type ServerReview } from '@/lib/api';
import { useToasts } from '@/lib/store';
import { useT } from '@/lib/i18n';
import { priceLevel } from '@/lib/format';
import { openStatus } from '@/lib/util';
import { useMounted } from '@/lib/useMounted';
import CategoryIcon from '@/components/CategoryIcon';
import RatingStars from '@/components/RatingStars';
import FavoriteButton from '@/components/FavoriteButton';
import ReviewSection from '@/components/ReviewSection';
import BookingModal from '@/components/BookingModal';

export default function PlaceDetailPage() {
  const { t } = useT();
  const mounted = useMounted();
  const params = useParams();
  const id = String(params.id);
  const pushToast = useToasts((s) => s.push);

  const [place, setPlace] = useState<ServerPlace | null | undefined>(undefined);
  const [reviews, setReviews] = useState<ServerReview[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    api.getPlace(id)
      .then((d) => { if (alive) { setPlace(d.place); setReviews(d.reviews); } })
      .catch(() => { if (alive) setPlace(null); });
    // Joyga kirganini belgilash (faqat tizimdagi foydalanuvchilar uchun, server o'z joyini chetlab o'tadi)
    api.markVisit(id).catch(() => {});
    return () => { alive = false; };
  }, [id]);

  if (place === undefined) return <div className="container" style={{ padding: 60, textAlign: 'center', color: 'var(--text-2)' }}>…</div>;
  if (!place) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ marginBottom: 16, color: 'var(--text-2)' }}>404</p>
        <Link href="/home" className="btn">{t.nav.home}</Link>
      </div>
    );
  }

  const os = openStatus(place.workingHours);

  const share = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) await navigator.share({ title: place.name, url });
      else { await navigator.clipboard.writeText(url); pushToast(t.share.copied, 'success'); }
    } catch { /* user cancelled */ }
  };

  return (
    <>
      <div className="detail__cover">
        <Link href="/home" className="detail__back"><ArrowLeft size={16} /> {t.detail.back}</Link>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={place.photos[0]} alt={place.name} />
        <div className="detail__overlay" />
        <FavoriteButton id={place.id} className="detail__fav" />
      </div>

      <main className="detail-body container">
        <div className="detail__head">
          <div className="detail__cat"><CategoryIcon slug={place.categorySlug as any} size={18} /> {t.categories[place.categorySlug as keyof typeof t.categories]}</div>
          <div className="detail__price">{priceLevel(place.priceLevel)}</div>
        </div>
        <h1 className="detail__title">{place.name}</h1>
        <div style={{ marginTop: 8 }}><RatingStars value={place.ratingAvg} count={place.ratingCount} showValue size={18} /></div>

        <div className="detail__trust">
          <span className={`badge ${place.verified ? 'badge--verified' : 'badge--pending'}`}>
            <BadgeCheck size={12} /> {place.verified ? t.status.verified : t.status.pending}
          </span>
          {mounted && os.known && (
            <span className={`badge ${os.open ? 'badge--open' : 'badge--closed'}`}><Clock size={12} /> {os.open ? t.status.openNow : t.status.closed}</span>
          )}
        </div>

        <div className="detail__chips">
          {place.workingHours && <span className="detail__chip"><Clock size={14} /> {place.workingHours}</span>}
          {place.city && <span className="detail__chip"><MapPin size={14} /> {place.city}</span>}
        </div>

        <div className="detail__addr-row">
          <div className="detail__addr"><MapPin size={18} /> {place.address || place.city || '—'}</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href={`/places/${place.id}/route`} className="call-btn"><Navigation size={16} /> {t.detail.route}</Link>
            <button className="call-btn" onClick={share}><Share2 size={16} /> {t.share.share}</button>
            {place.phone && <a href={`tel:${place.phone}`} className="call-btn"><Phone size={16} /> {t.detail.call}</a>}
          </div>
        </div>

        <div className="detail__section">
          <h2>{t.detail.about}</h2>
          <p className="detail__desc">{place.description || '—'}</p>
        </div>

        {place.menu && place.menu.length > 0 && (
          <div className="detail__section">
            <h2><UtensilsCrossed size={18} style={{ verticalAlign: '-3px' }} /> {t.detail.menu}</h2>
            <div className="menu-tags">{place.menu.map((m, i) => (<span key={i} className="menu-tag">{m}</span>))}</div>
          </div>
        )}

        {place.photos.length > 1 && (
          <div className="detail__section">
            <h2>{t.detail.gallery}</h2>
            <div className="gallery">
              {place.photos.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={src} alt={`${place.name} ${i + 1}`} onClick={() => setLightbox(src)} style={{ cursor: 'zoom-in' }} />
              ))}
            </div>
          </div>
        )}

        <ReviewSection placeId={place.id} initialReviews={reviews} onChange={(updated, ratingUpd) => {
          setReviews(updated);
          // Yangi reytingni darhol joy state'iga qo'shamiz - yulduzchalar darhol yangilanadi
          if (ratingUpd && place) setPlace({ ...place, ratingAvg: ratingUpd.ratingAvg, ratingCount: ratingUpd.ratingCount });
        }} />
      </main>

      {place.isBookable && <BookingModal place={place} />}

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lightbox__close" onClick={() => setLightbox(null)}><X size={22} /></button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt={place.name} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}
