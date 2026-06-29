'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import Link from 'next/link';
import { Place } from '@/lib/types';

const pin = L.divIcon({
  className: 'map-pin',
  html:
    '<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="#18B2C6" stroke="white" stroke-width="1.4"><path d="M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.6" fill="white" stroke="none"/></svg>',
  iconSize: [34, 34],
  iconAnchor: [17, 33],
  popupAnchor: [0, -30],
});

export default function MapView({ places }: { places: Place[] }) {
  return (
    <MapContainer center={[41.3, 64.6]} zoom={6} scrollWheelZoom className="leaflet-map">
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
        attribution=""
        subdomains="abcd"
        maxZoom={20}
      />
      {places.map((p) => (
        <Marker key={p.id} position={[p.location.lat, p.location.lng]} icon={pin}>
          <Popup>
            <div className="map-popup">
              <strong>{p.name}</strong>
              <div>
                {p.categoryName} · {p.city}
              </div>
              <Link href={`/places/${p.id}`}>Batafsil →</Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
