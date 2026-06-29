'use client';

import Link from 'next/link';
import { MapPin, BadgeCheck, Clock } from 'lucide-react';
import { Place } from '@/lib/types';
import { priceLevel } from '@/lib/format';
import { isVerified, openStatus } from '@/lib/util';
import { useT } from '@/lib/i18n';
import { useMounted } from '@/lib/useMounted';
import CategoryIcon from './CategoryIcon';
import RatingStars from './RatingStars';
import FavoriteButton from './FavoriteButton';

export default function PlaceCard({ place }: { place: Place }) {
  const { t } = useT();
  const mounted = useMounted();
  const verified = isVerified(place);
  const os = openStatus(place.workingHours);

  return (
    <Link href={`/places/${place.id}`} className="place-card">
      <div className="place-card__media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={place.photos[0]} alt={place.name} loading="lazy" />
        <div className="place-card__badges">
          {verified && <span className="badge badge--verified"><BadgeCheck size={12} /> {t.status.verified}</span>}
          {mounted && os.known && (
            <span className={`badge ${os.open ? 'badge--open' : 'badge--closed'}`}><Clock size={12} /> {os.open ? t.status.openNow : t.status.closed}</span>
          )}
        </div>
        <span className="price-badge">{priceLevel(place.priceLevel)}</span>
        <FavoriteButton id={place.id} className="place-card__fav" />
      </div>
      <div className="place-card__body">
        <div className="place-card__cat"><CategoryIcon slug={place.categorySlug as any} size={14} /> {t.categories[place.categorySlug as keyof typeof t.categories]}</div>
        <div className="place-card__name">{place.name}</div>
        <div className="place-card__meta"><MapPin size={14} /> {place.city || '—'}</div>
        <div className="place-card__rating"><RatingStars value={place.ratingAvg} count={place.ratingCount} showValue /></div>
      </div>
    </Link>
  );
}
