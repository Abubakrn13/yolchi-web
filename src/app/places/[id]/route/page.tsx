'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft, Navigation, CornerUpLeft, CornerUpRight, ArrowUp, Flag } from 'lucide-react';
import { api, type ServerPlace } from '@/lib/api';
import { useT } from '@/lib/i18n';

const RouteMap = dynamic(() => import('@/components/RouteMap'), { ssr: false, loading: () => <div className="map-loading">…</div> });

interface Step { text: string; dist: number; type: string; modifier?: string }

export default function RoutePage() {
  const { t } = useT();
  const params = useParams();
  const id = String(params.id);
  const [place, setPlace] = useState<ServerPlace | null | undefined>(undefined);

  const [from, setFrom] = useState<[number, number] | null>(null);
  const [denied, setDenied] = useState(false);
  const [line, setLine] = useState<[number, number][]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [summary, setSummary] = useState<{ dist: number; dur: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api.getPlace(id).then((d) => { if (alive) setPlace(d.place); }).catch(() => { if (alive) setPlace(null); });
    return () => { alive = false; };
  }, [id]);

  const to: [number, number] | null = place ? [place.location.lat, place.location.lng] : null;

  useEffect(() => {
    if (!to) return;
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setFrom([pos.coords.latitude, pos.coords.longitude]),
        () => { setDenied(true); setFrom([to[0] + 0.025, to[1] + 0.03]); },
        { timeout: 8000 },
      );
    } else { setDenied(true); setFrom([to[0] + 0.025, to[1] + 0.03]); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place]);

  const instr = (type: string, modifier?: string, name?: string) => {
    let base = t.route.straight;
    if (type === 'depart') base = t.route.depart;
    else if (type === 'arrive') base = t.route.arrive;
    else {
      switch (modifier) {
        case 'left': base = t.route.left; break;
        case 'right': base = t.route.right; break;
        case 'slight left': base = t.route.slightLeft; break;
        case 'slight right': base = t.route.slightRight; break;
        case 'sharp left': base = t.route.sharpLeft; break;
        case 'sharp right': base = t.route.sharpRight; break;
        case 'uturn': base = t.route.uturn; break;
        default: base = t.route.straight;
      }
    }
    return name ? `${base} — ${name}` : base;
  };

  useEffect(() => {
    if (!from || !to) return;
    setLoading(true);
    const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson&steps=true`;
    fetch(url).then((r) => r.json()).then((data) => {
      const route = data.routes?.[0]; if (!route) { setLoading(false); return; }
      const coords: [number, number][] = route.geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
      setLine(coords);
      setSummary({ dist: route.distance, dur: route.duration });
      const legSteps = route.legs?.[0]?.steps ?? [];
      setSteps(legSteps.map((s: any) => ({ text: instr(s.maneuver.type, s.maneuver.modifier, s.name), dist: s.distance, type: s.maneuver.type, modifier: s.maneuver.modifier })));
      setLoading(false);
    }).catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from]);

  if (place === undefined) return <div className="container" style={{ padding: 60, textAlign: 'center', color: 'var(--text-2)' }}>…</div>;
  if (!place || !to) return <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}><Link href="/home" className="btn">{t.nav.home}</Link></div>;

  const fmtDist = (m: number) => (m >= 1000 ? `${(m / 1000).toFixed(1)} ${t.route.km}` : `${Math.round(m)} ${t.route.m}`);
  const stepIcon = (type: string, modifier?: string) => {
    if (type === 'arrive') return <Flag size={18} />;
    if (type === 'depart') return <Navigation size={18} />;
    if (modifier?.includes('left')) return <CornerUpLeft size={18} />;
    if (modifier?.includes('right')) return <CornerUpRight size={18} />;
    return <ArrowUp size={18} />;
  };

  return (
    <div className="route-page">
      <div className="route-top">
        <Link href={`/places/${place.id}`} style={{ color: 'var(--text-2)', display: 'inline-flex' }}><ArrowLeft size={22} /></Link>
        <div>
          <div className="route-top__title">{place.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{t.route.to}: {place.address || place.city || place.name}</div>
        </div>
      </div>
      <div className="route-map">
        {from ? <RouteMap from={from} to={to} line={line} /> : <div className="map-loading">{t.route.locating}</div>}
      </div>
      {summary && (
        <div className="route-summary">
          <div className="route-summary__big">{Math.round(summary.dur / 60)} {t.route.min}</div>
          <div style={{ color: 'var(--text-2)' }}>{fmtDist(summary.dist)}</div>
          {denied && <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--gold)' }}>{t.route.denied}</div>}
        </div>
      )}
      <div className="route-steps">
        {loading && <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-2)' }}>{t.route.loading}</div>}
        {!loading && steps.map((s, i) => (
          <div key={i} className="route-step">
            <div className="route-step__icon">{stepIcon(s.type, s.modifier)}</div>
            <div>
              <div className="route-step__text">{s.text}</div>
              {s.dist > 0 && <div className="route-step__dist">{fmtDist(s.dist)}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
