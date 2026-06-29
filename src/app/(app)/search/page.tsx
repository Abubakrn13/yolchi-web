'use client';

import { useMemo, useState } from 'react';
import { Search, BadgeCheck, Clock } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { usePlaces } from '@/lib/usePlaces';
import { useMounted } from '@/lib/useMounted';
import { openStatus } from '@/lib/util';
import PlaceCard from '@/components/PlaceCard';

type Sort = 'reco' | 'rating' | 'priceLow' | 'priceHigh';

export default function SearchPage() {
  const { t } = useT();
  const mounted = useMounted();
  const { places } = usePlaces();
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<Sort>('reco');
  const [openOnly, setOpenOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const all = places ?? [];
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    let list = all.filter((p) => !s || p.name.toLowerCase().includes(s) || p.city.toLowerCase().includes(s) || t.categories[p.categorySlug as keyof typeof t.categories].toLowerCase().includes(s));
    if (verifiedOnly) list = list.filter((p) => p.verified);
    if (openOnly && mounted) list = list.filter((p) => openStatus(p.workingHours).open);
    const sorted = [...list];
    if (sort === 'rating') sorted.sort((a, b) => b.ratingAvg - a.ratingAvg);
    else if (sort === 'priceLow') sorted.sort((a, b) => (a.bookingPrice ?? Infinity) - (b.bookingPrice ?? Infinity));
    else if (sort === 'priceHigh') sorted.sort((a, b) => (b.bookingPrice ?? -1) - (a.bookingPrice ?? -1));
    else sorted.sort((a, b) => b.ratingAvg - a.ratingAvg);
    return sorted;
  }, [all, q, sort, openOnly, verifiedOnly, mounted, t]);

  return (
    <div className="container">
      <div className="app-topbar"><h1>{t.search.title}</h1></div>
      <div className="search" style={{ maxWidth: '100%' }}>
        <Search size={18} className="search__icon" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search.placeholder} autoFocus />
      </div>
      <div className="filterbar">
        <select className="filter-select" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
          <option value="reco">{t.filters.sort}: {t.filters.reco}</option>
          <option value="rating">{t.filters.rating}</option>
          <option value="priceLow">{t.filters.priceLow}</option>
          <option value="priceHigh">{t.filters.priceHigh}</option>
        </select>
        <button className={`filter-toggle ${openOnly ? 'filter-toggle--on' : ''}`} onClick={() => setOpenOnly((v) => !v)}>
          <Clock size={14} /> {t.filters.openNow}
        </button>
        <button className={`filter-toggle ${verifiedOnly ? 'filter-toggle--on' : ''}`} onClick={() => setVerifiedOnly((v) => !v)}>
          <BadgeCheck size={14} /> {t.filters.verifiedOnly}
        </button>
      </div>
      <h2 className="app-section-title" style={{ marginTop: 20 }}>{q ? t.search.results : t.search.recent} · {results.length}</h2>
      {results.length === 0 ? <div className="empty">{t.search.empty}</div> : (
        <div className="grid">{results.map((p) => (<PlaceCard key={p.id} place={p} />))}</div>
      )}
    </div>
  );
}
