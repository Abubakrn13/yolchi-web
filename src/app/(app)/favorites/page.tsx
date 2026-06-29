'use client';

import { useT } from '@/lib/i18n';
import { useFavorites } from '@/lib/store';
import { usePlaces } from '@/lib/usePlaces';
import PlaceCard from '@/components/PlaceCard';

export default function FavoritesPage() {
  const { t } = useT();
  const ids = useFavorites((s) => s.ids);
  const ready = useFavorites((s) => s.ready);
  const { places } = usePlaces();
  const all = places ?? [];
  const favs = ready ? all.filter((p) => ids.includes(p.id)) : [];

  return (
    <div className="container">
      <div className="app-topbar"><h1>{t.nav.favorites}</h1></div>
      {!ready || !places ? (
        <div className="empty">…</div>
      ) : favs.length === 0 ? (
        <div className="empty">{t.profile.noFavorites}</div>
      ) : (
        <div className="grid">{favs.map((p) => (<PlaceCard key={p.id} place={p} />))}</div>
      )}
    </div>
  );
}
