'use client';
import { useEffect, useState } from 'react';
import { api, type ServerPlace } from './api';

export function usePlaces() {
  const [places, setPlaces] = useState<ServerPlace[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    api.listPlaces()
      .then((d) => { if (alive) setPlaces(d.places); })
      .catch((e) => { if (alive) setError(e.message); });
    return () => { alive = false; };
  }, []);
  return { places, error, loading: places === null };
}

export function useMyPlaces(enabled: boolean) {
  const [items, setItems] = useState<ServerPlace[] | null>(null);
  useEffect(() => {
    if (!enabled) { setItems([]); return; }
    let alive = true;
    api.myPlaces().then((d) => { if (alive) setItems(d.places); }).catch(() => { if (alive) setItems([]); });
    return () => { alive = false; };
  }, [enabled]);
  return items;
}
