'use client';

import dynamic from 'next/dynamic';
import { usePlaces } from '@/lib/usePlaces';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false, loading: () => <div className="map-loading">…</div> });

export default function MapPage() {
  const { places } = usePlaces();
  return <div className="map-fill"><MapView places={places ?? []} /></div>;
}
