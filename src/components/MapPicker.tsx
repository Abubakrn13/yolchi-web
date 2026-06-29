'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';

const pin = L.divIcon({
  className: 'map-pin',
  html: '<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="#18B2C6" stroke="white" stroke-width="1.4"><path d="M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.6" fill="white" stroke="none"/></svg>',
  iconSize: [34, 34], iconAnchor: [17, 33],
});

function ClickCatcher({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click(e) { onPick(e.latlng.lat, e.latlng.lng); } });
  return null;
}

export default function MapPicker({
  value, onPick,
}: {
  value: { lat: number; lng: number } | null;
  onPick: (lat: number, lng: number) => void;
}) {
  return (
    <MapContainer center={[41.31, 69.24]} zoom={6} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
      <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png" attribution="" subdomains="abcd" maxZoom={20} />
      <ClickCatcher onPick={onPick} />
      {value && <Marker position={[value.lat, value.lng]} icon={pin} />}
    </MapContainer>
  );
}
