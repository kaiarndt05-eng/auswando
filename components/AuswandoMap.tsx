import { useMemo, useRef, useState } from 'react';
import { View, Image, StyleSheet, LayoutChangeEvent, Animated, PanResponder } from 'react-native';
import Svg, { Polyline, Circle, G, Text as SvgText } from 'react-native-svg';
import { C, COUNTRIES, CountryId } from '@/constants/theme';
import { KARTE_IMAGE } from '@/constants/images';

/** Props for the Auswando route map. */
export type AuswandoMapProps = {
  /** Destination country (pt | es | ch). */
  country: CountryId;
  /** Route progress 0–1 (0 = Deutschland, 1 = Ziel erreicht). */
  progress: number;
  /** Number of completed roadmap steps (used for stop markers along the route). */
  doneCount: number;
  /** Total number of free roadmap steps (stop count). */
  totalFree: number;
};

// Native pixel size of assets/images/karte.png — lets us "contain"-fit it and
// cap zoom at its real resolution so pinching in never upscales/blurs it.
const IMG_W = 3072;
const IMG_H = 5504;

// Hand-picked positions on the illustrated map, as a fraction of its width/height.
const ORIGIN = { fx: 0.677, fy: 0.505, label: 'Deutschland' };
const DESTINATIONS: Record<CountryId, { fx: number; fy: number; label: string }> = {
  pt: { fx: 0.13, fy: 0.8, label: 'Lissabon' },
  es: { fx: 0.275, fy: 0.758, label: 'Madrid' },
  ch: { fx: 0.615, fy: 0.617, label: 'Bern' },
};

const MIN_SCALE = 1;
const MAX_SCALE = 4.5;
const SAMPLES = 60;

type Pt = { x: number; y: number };
type Touch = { pageX: number; pageY: number };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function bezierPoint(t: number, p0: Pt, c1: Pt, c2: Pt, p1: Pt): Pt {
  const mt = 1 - t;
  return {
    x: mt * mt * mt * p0.x + 3 * mt * mt * t * c1.x + 3 * mt * t * t * c2.x + t * t * t * p1.x,
    y: mt * mt * mt * p0.y + 3 * mt * mt * t * c1.y + 3 * mt * t * t * c2.y + t * t * t * p1.y,
  };
}

const toPolyline = (pts: Pt[]) => pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
const touchDistance = ([a, b]: Touch[]) => Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
const touchMidpoint = ([a, b]: Touch[]) => ({ x: (a.pageX + b.pageX) / 2, y: (a.pageY + b.pageY) / 2 });

export default function AuswandoMap({ country, progress, doneCount, totalFree }: AuswandoMapProps) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setBox(b => (b.w === width && b.h === height ? b : { w: width, h: height }));
  };

  const dest = COUNTRIES.find(c => c.id === country)!;
  const destPos = DESTINATIONS[country];
  const prs = clamp(progress, 0, 1);

  // "Cover"-fit the map image so it always fills the whole area at minimum
  // zoom — never letterboxed, the user only ever sees more map, not empty space.
  const { contentW, contentH } = useMemo(() => {
    if (!box.w || !box.h) return { contentW: 0, contentH: 0 };
    const fit = Math.max(box.w / IMG_W, box.h / IMG_H);
    return { contentW: IMG_W * fit, contentH: IMG_H * fit };
  }, [box.w, box.h]);

  // --- Pinch-to-zoom & pan, built on PanResponder + Animated (no gesture-handler/
  // reanimated — those crash screens in Expo Go SDK 54, see CLAUDE.md). ---
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const txAnim = useRef(new Animated.Value(0)).current;
  const tyAnim = useRef(new Animated.Value(0)).current;
  const tf = useRef({ scale: 1, tx: 0, ty: 0 }).current;
  const gesture = useRef({
    mode: 'idle' as 'idle' | 'pan' | 'pinch',
    startScale: 1, startTx: 0, startTy: 0,
    startDist: 0, focalX: 0, focalY: 0,
  }).current;

  const applyTransform = (nextScale: number, nextTx: number, nextTy: number) => {
    const s = clamp(nextScale, MIN_SCALE, MAX_SCALE);
    const maxX = Math.max(0, (contentW * s - box.w) / 2);
    const maxY = Math.max(0, (contentH * s - box.h) / 2);
    const tx = clamp(nextTx, -maxX, maxX);
    const ty = clamp(nextTy, -maxY, maxY);
    tf.scale = s; tf.tx = tx; tf.ty = ty;
    scaleAnim.setValue(s);
    txAnim.setValue(tx);
    tyAnim.setValue(ty);
  };

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gs) =>
        evt.nativeEvent.touches.length >= 2 || Math.abs(gs.dx) > 4 || Math.abs(gs.dy) > 4,
      onPanResponderGrant: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length >= 2) {
          gesture.mode = 'pinch';
          gesture.startScale = tf.scale;
          gesture.startTx = tf.tx;
          gesture.startTy = tf.ty;
          gesture.startDist = touchDistance(touches);
          const mid = touchMidpoint(touches);
          gesture.focalX = mid.x - box.w / 2;
          gesture.focalY = mid.y - box.h / 2;
        } else {
          gesture.mode = 'pan';
          gesture.startTx = tf.tx;
          gesture.startTy = tf.ty;
        }
      },
      onPanResponderMove: (evt, gs) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length >= 2) {
          if (gesture.mode !== 'pinch') {
            gesture.mode = 'pinch';
            gesture.startScale = tf.scale;
            gesture.startTx = tf.tx;
            gesture.startTy = tf.ty;
            gesture.startDist = touchDistance(touches);
            const mid = touchMidpoint(touches);
            gesture.focalX = mid.x - box.w / 2;
            gesture.focalY = mid.y - box.h / 2;
          }
          const ratio = gesture.startDist > 0 ? touchDistance(touches) / gesture.startDist : 1;
          const nextScale = clamp(gesture.startScale * ratio, MIN_SCALE, MAX_SCALE);
          const r = nextScale / gesture.startScale;
          applyTransform(
            nextScale,
            gesture.focalX * (1 - r) + gesture.startTx * r,
            gesture.focalY * (1 - r) + gesture.startTy * r,
          );
        } else if (touches.length === 1) {
          if (gesture.mode !== 'pan') {
            gesture.mode = 'pan';
            gesture.startTx = tf.tx;
            gesture.startTy = tf.ty;
          }
          applyTransform(tf.scale, gesture.startTx + gs.dx, gesture.startTy + gs.dy);
        }
      },
      onPanResponderRelease: () => { gesture.mode = 'idle'; },
      onPanResponderTerminate: () => { gesture.mode = 'idle'; },
    })
  ).current;

  // --- The route from Germany to the chosen destination, drawn as a road on the map ---
  const route = useMemo(() => {
    if (!contentW || !contentH) return null;
    const p0: Pt = { x: ORIGIN.fx * contentW, y: ORIGIN.fy * contentH };
    const p1: Pt = { x: destPos.fx * contentW, y: destPos.fy * contentH };
    const dx = p1.x - p0.x, dy = p1.y - p0.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len; // perpendicular — bows the road like a real route hugging the terrain
    const bow = len * 0.16;
    const c1: Pt = { x: p0.x + dx * 0.28 + nx * bow, y: p0.y + dy * 0.28 + ny * bow };
    const c2: Pt = { x: p0.x + dx * 0.72 + nx * bow, y: p0.y + dy * 0.72 + ny * bow };
    const pts: Pt[] = [];
    for (let i = 0; i <= SAMPLES; i++) pts.push(bezierPoint(i / SAMPLES, p0, c1, c2, p1));
    return { p0, p1, c1, c2, pts };
  }, [contentW, contentH, destPos]);

  const journey = useMemo(() => {
    if (!route) return null;
    const splitIdx = Math.round(prs * SAMPLES);
    const n = Math.max(1, totalFree);
    return {
      traveled: route.pts.slice(0, splitIdx + 1),
      remaining: route.pts.slice(splitIdx),
      carPos: bezierPoint(prs, route.p0, route.c1, route.c2, route.p1),
      stops: Array.from({ length: n }, (_, i) => {
        const t = (i + 1) / (n + 1);
        return { pos: bezierPoint(t, route.p0, route.c1, route.c2, route.p1), done: prs >= t - 0.015 };
      }),
    };
  }, [route, prs, totalFree]);

  const u = contentW / 100; // proportional unit for stroke widths & marker sizes

  const label = (p: Pt, dy: number, text: string) => (
    <G>
      <SvgText x={p.x} y={p.y + dy} fontSize={u * 2.1} fontWeight="800" stroke="#FFFFFF" strokeWidth={u * 1.1} fill="#FFFFFF" textAnchor="middle">{text}</SvgText>
      <SvgText x={p.x} y={p.y + dy} fontSize={u * 2.1} fontWeight="800" fill={C.text} textAnchor="middle">{text}</SvgText>
    </G>
  );

  return (
    <View style={s.fill} onLayout={onLayout} {...responder.panHandlers}>
      {contentW > 0 && route && journey && (
        <View style={[StyleSheet.absoluteFill, s.center]} pointerEvents="box-none">
          <Animated.View
            collapsable={false}
            style={{
              width: contentW,
              height: contentH,
              transform: [{ translateX: txAnim }, { translateY: tyAnim }, { scale: scaleAnim }],
            }}
          >
            <Image source={KARTE_IMAGE} style={{ width: contentW, height: contentH }} resizeMode="contain" />
            <Svg width={contentW} height={contentH} style={StyleSheet.absoluteFill}>
              {/* road bed */}
              <Polyline points={toPolyline(route.pts)} stroke="#FFFFFF" strokeOpacity={0.65} strokeWidth={u * 1.1} strokeLinecap="round" strokeLinejoin="round" fill="none" />
              {/* stretch ahead — dashed & faded */}
              <Polyline points={toPolyline(journey.remaining)} stroke={dest.color} strokeOpacity={0.45} strokeWidth={u * 0.6} strokeDasharray={`${u * 1.4},${u * 1.1}`} strokeLinecap="round" fill="none" />
              {/* stretch already traveled — solid */}
              {journey.traveled.length > 1 && (
                <Polyline points={toPolyline(journey.traveled)} stroke={dest.color} strokeWidth={u * 0.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
              )}
              {/* roadmap-step stops along the way */}
              {journey.stops.map((stop, i) => (
                <Circle
                  key={i}
                  cx={stop.pos.x}
                  cy={stop.pos.y}
                  r={stop.done ? u * 1.1 : u * 0.8}
                  fill={stop.done ? dest.color : '#FFFFFF'}
                  stroke={stop.done ? '#FFFFFF' : C.border}
                  strokeWidth={u * 0.25}
                />
              ))}
              {/* origin */}
              <Circle cx={route.p0.x} cy={route.p0.y} r={u * 1.6} fill={C.primary} stroke="#FFFFFF" strokeWidth={u * 0.4} />
              {label(route.p0, -u * 2.6, ORIGIN.label)}
              {/* destination */}
              <Circle cx={route.p1.x} cy={route.p1.y} r={u * 1.8} fill={dest.color} stroke="#FFFFFF" strokeWidth={u * 0.4} />
              {label(route.p1, -u * 2.8, destPos.label)}
              {/* current position — "as if you were driving there" */}
              {prs > 0.02 && prs < 0.985 && (
                <G>
                  <Circle cx={journey.carPos.x} cy={journey.carPos.y} r={u * 2.2} fill="#FFFFFF" stroke={dest.color} strokeWidth={u * 0.5} />
                  <SvgText x={journey.carPos.x} y={journey.carPos.y + u * 0.8} fontSize={u * 2.4} textAnchor="middle">🚗</SvgText>
                </G>
              )}
            </Svg>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#EAF1F8', overflow: 'hidden' },
  center: { alignItems: 'center', justifyContent: 'center' },
});
