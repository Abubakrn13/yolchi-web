'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, Marker, Polyline, TileLayer } from 'react-leaflet';

const startDot = L.divIcon({
  className: '',
  html: '<div style="width:18px;height:18px;border-radius:50%;background:#18B2C6;border:3px solid #fff;box-shadow:0 0 0 2px #18B2C6"></div>',
  iconSize: [18, 18], iconAnchor: [9, 9],
});
const endPin = L.divIcon({
  className: 'map-pin',
  html: '<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="#D2A24C" stroke="white" stroke-width="1.4"><path d="M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.6" fill="white" stroke="none"/></svg>',
  iconSize: [34, 34], iconAnchor: [17, 33],
});

export default function RouteMap({
  from, to, line,
}: {
  from: [number, number];
  to: [number, number];
  line: [number, number][];
}) {
  const bounds = line.length > 1 ? L.latLngBounds(line as L.LatLngExpression[]) : L.latLngBounds([from, to]);
  return (
    <MapContainer bounds={bounds} boundsOptions={{ padding: [40, 40] }} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
      <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png" attribution="" subdomains="abcd" maxZoom={20} />
      {line.length > 1 && <Polyline positions={line} pathOptions={{ color: '#18B2C6', weight: 5, opacity: 0.85 }} />}
      <Marker position={from} icon={startDot} />
      <Marker position={to} icon={endPin} />
    </MapContainer>
  );
}
