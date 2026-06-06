import { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C, COUNTRIES, CountryId } from '@/constants/theme';

export type AuswandoMapProps = {
  country: CountryId;
  progress: number;
  doneCount: number;
  totalFree: number;
};

const BERLIN = { lat: 52.52, lng: 13.405 };
const DEST_COORDS: Record<CountryId, { lat: number; lng: number }> = {
  pt: { lat: 38.716, lng: -9.139 },
  es: { lat: 40.416, lng: -3.703 },
  ch: { lat: 46.948, lng: 7.447 },
};

function slerp(la1: number, ln1: number, la2: number, ln2: number, t: number) {
  const r = Math.PI / 180, deg = 180 / Math.PI;
  const p1 = la1 * r, l1 = ln1 * r, p2 = la2 * r, l2 = ln2 * r;
  const x1 = Math.cos(p1) * Math.cos(l1), y1 = Math.cos(p1) * Math.sin(l1), z1 = Math.sin(p1);
  const x2 = Math.cos(p2) * Math.cos(l2), y2 = Math.cos(p2) * Math.sin(l2), z2 = Math.sin(p2);
  const dot = Math.max(-1, Math.min(1, x1 * x2 + y1 * y2 + z1 * z2));
  const o = Math.acos(dot);
  if (o < 1e-10) return { lat: la1, lng: ln1 };
  const s = Math.sin(o);
  const s1 = Math.sin((1 - t) * o) / s, s2 = Math.sin(t * o) / s;
  return {
    lat: deg * Math.atan2(s1 * z1 + s2 * z2, Math.sqrt((s1 * x1 + s2 * x2) ** 2 + (s1 * y1 + s2 * y2) ** 2)),
    lng: deg * Math.atan2(s1 * y1 + s2 * y2, s1 * x1 + s2 * x2),
  };
}

export default function AuswandoMap({ country, progress, doneCount, totalFree }: AuswandoMapProps) {
  // react-globe.gl accesses `window` on import — must be loaded client-side only.
  const [GlobeComp, setGlobeComp] = useState<React.ComponentType<any> | null>(null);
  const [demoProgress, setDemoProgress] = useState(progress);
  const globeRef = useRef<any>(null);

  useEffect(() => {
    import('react-globe.gl').then(m => setGlobeComp(() => m.default));
  }, []);

  useEffect(() => { setDemoProgress(progress); }, [progress]);

  const dest = COUNTRIES.find(c => c.id === country)!;
  const destCoord = DEST_COORDS[country];
  const prs = Math.max(0, Math.min(1, demoProgress));

  const buildArcs = useCallback(() => {
    const arcs: object[] = [];
    if (prs > 0.01) {
      const mid = slerp(BERLIN.lat, BERLIN.lng, destCoord.lat, destCoord.lng, prs);
      arcs.push({ sLat: BERLIN.lat, sLng: BERLIN.lng, eLat: mid.lat, eLng: mid.lng, col: [dest.color, dest.color], sw: 2.5, dl: 1, dg: 0.01 });
      arcs.push({ sLat: mid.lat, sLng: mid.lng, eLat: destCoord.lat, eLng: destCoord.lng, col: [dest.color + '55', dest.color + '55'], sw: 1.5, dl: 0.35, dg: 0.65 });
    } else {
      arcs.push({ sLat: BERLIN.lat, sLng: BERLIN.lng, eLat: destCoord.lat, eLng: destCoord.lng, col: [dest.color + '55', dest.color + '55'], sw: 1.5, dl: 0.35, dg: 0.65 });
    }
    return arcs;
  }, [dest.color, destCoord, prs]);

  const buildPoints = useCallback(() => {
    const pts: object[] = [
      { lat: BERLIN.lat, lng: BERLIN.lng, col: C.primary, r: 0.55, alt: 0.01, lbl: 'Berlin' },
      { lat: destCoord.lat, lng: destCoord.lng, col: dest.color, r: 0.65, alt: 0.01, lbl: dest.name },
    ];
    const n = Math.max(1, totalFree);
    for (let i = 0; i < n; i++) {
      const t = (i + 1) / (n + 1);
      const pos = slerp(BERLIN.lat, BERLIN.lng, destCoord.lat, destCoord.lng, t);
      const done = prs >= t - 0.01;
      pts.push({ lat: pos.lat, lng: pos.lng, col: done ? dest.color : '#1e2840', r: done ? 0.32 : 0.25, alt: done ? 0.015 : 0.005, lbl: String(i + 1) });
    }
    if (prs > 0.01 && prs < 0.99) {
      const pp = slerp(BERLIN.lat, BERLIN.lng, destCoord.lat, destCoord.lng, prs);
      pts.push({ lat: pp.lat, lng: pp.lng, col: '#ffffff', r: 0.45, alt: 0.025, lbl: '' });
    }
    return pts;
  }, [dest.color, dest.name, destCoord, totalFree, prs]);

  useEffect(() => {
    const g = globeRef.current;
    if (!g) return;
    g.arcsData(buildArcs()).pointsData(buildPoints());
    g.pointOfView({ lat: 49, lng: 5, altitude: 1.85 }, 600);
  }, [buildArcs, buildPoints]);

  if (!GlobeComp) {
    return <View style={s.loading}><Text style={s.loadingText}>Globus lädt…</Text></View>;
  }

  return (
    <View style={s.wrap}>
      <GlobeComp
        ref={globeRef}
        globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png"
        atmosphereColor="#1a5fa0"
        atmosphereAltitude={0.14}
        arcsData={buildArcs()}
        arcStartLat={(d: any) => d.sLat}
        arcStartLng={(d: any) => d.sLng}
        arcEndLat={(d: any) => d.eLat}
        arcEndLng={(d: any) => d.eLng}
        arcColor={(d: any) => d.col}
        arcStroke={(d: any) => d.sw}
        arcDashLength={(d: any) => d.dl}
        arcDashGap={(d: any) => d.dg}
        arcDashAnimateTime={0}
        arcAltitudeAutoScale={0.3}
        pointsData={buildPoints()}
        pointLat={(d: any) => d.lat}
        pointLng={(d: any) => d.lng}
        pointColor={(d: any) => d.col}
        pointRadius={(d: any) => d.r}
        pointAltitude={(d: any) => d.alt}
        pointLabel={(d: any) => d.lbl || ''}
        onGlobeReady={() => globeRef.current?.pointOfView({ lat: 49, lng: 5, altitude: 1.85 }, 1800)}
      />

      {/* Demo slider overlay */}
      <View style={s.ctrl}>
        <Text style={s.ctrlLabel}>Progress</Text>
        <input
          type="range" min={0} max={100}
          value={Math.round(demoProgress * 100)}
          onChange={e => setDemoProgress(Number((e.target as HTMLInputElement).value) / 100)}
          style={{ flex: 1, accentColor: C.primary, cursor: 'pointer', margin: '0 4px' } as any}
        />
        <Text style={s.ctrlPct}>{Math.round(demoProgress * 100)}%</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#050e1f' },
  loading: { flex: 1, backgroundColor: '#050e1f', alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: C.textSub, fontSize: 14 },
  ctrl: {
    position: 'absolute' as any, bottom: 0, left: 0, right: 0, height: 56,
    backgroundColor: 'rgba(8,14,34,0.92)',
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, gap: 14,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)',
  },
  ctrlLabel: { color: C.textSub, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
  ctrlPct: { color: C.text, fontSize: 13, fontWeight: '700', minWidth: 38, textAlign: 'right' },
});
