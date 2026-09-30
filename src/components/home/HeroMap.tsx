"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { PIN_AMBER } from "@/components/ui/Logo";

/*
 * Hero map demo, ported from the hero-map-routing demo (hero-map.svg, 720×520).
 *
 * Street nodes sit at XS[i] × YS[j]; a destination's mapNode is {i, j}. The
 * visitor's pointer (or a tap, or the arrow keys) sets "your door"; the door
 * snaps to the nearest node, the nearest destination is picked by Manhattan
 * distance, and the route runs along the start street to the arterial nearest
 * the midpoint, up or down the arterial, then across to the destination. It is
 * drawn as Signal Amber dots every 9 px over a navy halo, appearing in order.
 * Every destination shows its pin; the active one is "hot".
 *
 * The ETA line from the demo is dropped: the chip shows the destination name
 * and "From your door", nothing invented. Destinations come in as props (from
 * site.ts hospitals[]); no names live here.
 *
 * Until /public/brand/hero-map.svg arrives, the base map is drawn from the same
 * XS/YS arrays, so routes land on the same coordinates when it does.
 * Amber appears only on the route dots ([data-route]) and the pins ([data-pin]).
 */

export type HeroMapDestination = { name: string; node: { i: number; j: number }; href?: string };

type Node = { i: number; j: number };
type Pt = [number, number];

// ---------- Geometry from the demo ----------
const XS = [1, 45, 94, 137, 187, 232, 279, 324, 370, 415, 457, 509, 552, 601, 642, 692, 733];
const YS = [-2, 37, 79, 120, 163, 198, 240, 281, 317, 361, 398, 437, 482, 518, 560];
const VW = 720;
const VH = 520;
// The demo's arterials sit at x=148 and x=418 and routes snap to the nearest
// street; drawing them on the snapped streets keeps dots centred on the road.
const ARTERIAL_I = [3, 9];
const ARTERIALS = ARTERIAL_I.map((i) => XS[i]);
const IDLE_START: Node = { i: 2, j: 11 };
const DOT_STEP = 9;
const DOT_MS = 7; // per-dot delay, as in the demo
const IDLE_DELAY_MS = 500;
const REPLAY_MS = 1800;
const PIN_H = 25;

const nearestIndex = (arr: number[], v: number) => {
  let b = 0;
  for (let i = 1; i < arr.length; i++) if (Math.abs(arr[i] - v) < Math.abs(arr[b] - v)) b = i;
  return b;
};
const clampNode = (n: Node): Node => ({
  i: Math.max(0, Math.min(XS.length - 1, Math.round(n.i))),
  j: Math.max(0, Math.min(YS.length - 1, Math.round(n.j))),
});
const sameNode = (a: Node, b: Node) => a.i === b.i && a.j === b.j;
const px = (n: Node): Pt => [XS[n.i], YS[n.j]];

/** Start street → nearest arterial to the midpoint → along it → across to the destination. */
export function legs(s: Pt, d: Pt): Pt[] {
  let ax = XS[nearestIndex(XS, ARTERIALS[nearestIndex(ARTERIALS, (s[0] + d[0]) / 2)])];
  if (Math.abs(s[0] - d[0]) < 60) ax = d[0]; // same block: skip the arterial
  return [s, [ax, s[1]], [ax, d[1]], d];
}

/** Points every `step` px along a polyline. */
export function sample(pts: Pt[], step = DOT_STEP): Pt[] {
  const out: Pt[] = [];
  let carry = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[i + 1];
    const dx = bx - ax;
    const dy = by - ay;
    const len = Math.hypot(dx, dy);
    if (!len) continue;
    let t = carry;
    while (t <= len) {
      out.push([ax + (dx * t) / len, ay + (dy * t) / len]);
      t += step;
    }
    carry = t - len;
  }
  return out;
}

function nearestDestination(door: Node, dests: HeroMapDestination[]) {
  if (!dests.length) return -1;
  const [sx, sy] = px(door);
  let best = 0;
  let bd = Infinity;
  dests.forEach((d, i) => {
    const [dx, dy] = px(clampNode(d.node));
    const m = Math.abs(dx - sx) + Math.abs(dy - sy);
    if (m < bd) {
      bd = m;
      best = i;
    }
  });
  return best;
}

// ---------- Base map (provisional; hero-map.svg replaces it) ----------
// Deterministic omissions so the grid reads like a city, not graph paper.
const omit = (a: number, b: number) => ((a * 73856093) ^ (b * 19349663)) % 9 === 0;

function BaseMap() {
  const streets: string[] = [];
  const stubs: string[] = [];
  XS.forEach((x, i) => {
    if (ARTERIAL_I.includes(i)) return;
    for (let j = 0; j < YS.length - 1; j++) {
      const seg = `M${x} ${YS[j]}V${YS[j + 1]}`;
      (omit(i, j) ? stubs : streets).push(seg);
    }
  });
  YS.forEach((y, j) => {
    for (let i = 0; i < XS.length - 1; i++) {
      const seg = `M${XS[i]} ${y}H${XS[i + 1]}`;
      (omit(j + 40, i) ? stubs : streets).push(seg);
    }
  });
  return (
    <g aria-hidden="true">
      {/* shaded blocks */}
      <g fill="var(--color-morning)" fillOpacity="0.07">
        <rect x={XS[5] + 6} y={YS[1] + 6} width={XS[7] - XS[5] - 12} height={YS[3] - YS[1] - 12} rx="3" />
        <rect x={XS[10] + 6} y={YS[8] + 6} width={XS[12] - XS[10] - 12} height={YS[10] - YS[8] - 12} rx="3" />
        <rect x={XS[1] + 6} y={YS[6] + 6} width={XS[2] - XS[1] - 12} height={YS[8] - YS[6] - 12} rx="3" />
        <rect x={XS[13] + 6} y={YS[3] + 6} width={XS[15] - XS[13] - 12} height={YS[5] - YS[3] - 12} rx="3" />
      </g>
      {/* bayou */}
      <path d="M560 -10 C 600 90, 690 130, 660 230 S 600 380, 690 540" fill="none" stroke="var(--color-morning)" strokeOpacity="0.16" strokeWidth="10" strokeLinecap="round" />
      {/* local streets; a few stop short */}
      <path d={streets.join("")} fill="none" stroke="var(--color-morning)" strokeOpacity="0.28" strokeWidth="1.6" />
      <path d={stubs.join("")} fill="none" stroke="var(--color-morning)" strokeOpacity="0.28" strokeWidth="1.6" strokeDasharray="14 999" />
      {/* arterials */}
      <path d={ARTERIALS.map((x) => `M${x} -10V${VH + 10}`).join("")} fill="none" stroke="var(--color-morning)" strokeOpacity="0.55" strokeWidth="5" />
    </g>
  );
}

// Brand pin (24×31) scaled to PIN_H with its tip on (x, y).
const PIN_PATH = "M12 0C5.4 0 0 5.4 0 12c0 8.5 12 19 12 19s12-10.5 12-19C24 5.4 18.6 0 12 0z";
function PinAt({ x, y, hot }: { x: number; y: number; hot: boolean }) {
  const s = PIN_H / 31;
  return (
    <g transform={`translate(${x} ${y}) scale(${hot ? s * 1.15 : s}) translate(-12 -31)`} style={{ transition: "transform 200ms var(--ease-gentle)" }}>
      <path d={PIN_PATH} fill={PIN_AMBER} data-pin="" />
      <circle cx="12" cy="12" r="4.5" fill="var(--color-navy)" />
    </g>
  );
}

const KEY_MOVES: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };

export function HeroMap({ destinations, className = "" }: { destinations: HeroMapDestination[]; className?: string }) {
  const dests = useMemo(() => destinations.map((d) => ({ ...d, node: clampNode(d.node) })), [destinations]);
  const [door, setDoor] = useState<Node>(IDLE_START);
  const [run, setRun] = useState(0); // bump to restart the dot sequence
  const [warm, setWarm] = useState(false); // after the first interaction the opening delay is gone
  const [instant, setInstant] = useState(false); // pointer sweeps draw without the sequence
  const [announce, setAnnounce] = useState("");

  const frame = useRef(0);
  const pending = useRef<Node | null>(null);
  const replayTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const announceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastMove = useRef(0);
  const firstAnnounce = useRef(true);

  const best = nearestDestination(door, dests);
  const dest = best >= 0 ? dests[best] : null;
  const start = px(door);
  const pts = dest ? legs(start, px(dest.node)) : [start];
  const dots = dest ? sample(pts) : [];

  useEffect(() => {
    if (!dest) return;
    if (firstAnnounce.current) {
      firstAnnounce.current = false;
      return;
    }
    clearTimeout(announceTimer.current);
    announceTimer.current = setTimeout(() => setAnnounce(`Route from your door to ${dest.name}`), 300);
  }, [dest]);

  useEffect(() => () => {
    clearTimeout(replayTimer.current);
    clearTimeout(announceTimer.current);
    if (frame.current) cancelAnimationFrame(frame.current);
  }, []);

  const draw = useCallback((next: Node, animate: boolean) => {
    setWarm(true);
    setInstant(!animate);
    setDoor((prev) => (sameNode(prev, next) ? prev : next));
    if (animate) setRun((r) => r + 1);
  }, []);

  const nodeAt = (e: PointerEvent<HTMLDivElement>): Node => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * VW;
    const y = ((e.clientY - r.top) / r.height) * VH;
    return { i: nearestIndex(XS, x), j: nearestIndex(YS, y) };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    const now = performance.now();
    if (now - lastMove.current < 40) return; // the demo's 40 ms throttle
    lastMove.current = now;
    clearTimeout(replayTimer.current);
    const n = nodeAt(e);
    if (sameNode(n, door) && !pending.current) return;
    pending.current = n;
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const next = pending.current;
      pending.current = null;
      if (next) draw(next, false);
    });
  };
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return; // touch waits for the tap to finish (pointerup), so a scroll doesn't move the door
    clearTimeout(replayTimer.current);
    draw(nodeAt(e), true);
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "touch") return;
    draw(nodeAt(e), true);
  };
  const onPointerLeave = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    clearTimeout(replayTimer.current);
    replayTimer.current = setTimeout(() => draw(IDLE_START, true), REPLAY_MS);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Home") {
      e.preventDefault();
      draw(IDLE_START, true);
      return;
    }
    const mv = KEY_MOVES[e.key];
    if (!mv) return;
    e.preventDefault();
    draw(clampNode({ i: door.i + mv[0], j: door.j + mv[1] }), true);
  };

  // Chip: under the pin head, clamped inside the map as in the demo.
  const chipStyle: CSSProperties | undefined = dest
    ? (() => {
        const [x, y] = px(dest.node);
        const left = Math.min(Math.max((x / VW) * 100, 17), 83);
        const top = Math.min(((y + 14) / VH) * 100, 82);
        return { left: `${left}%`, top: `${top}%`, transform: "translateX(-50%)" };
      })()
    : undefined;

  const dotStyle = (i: number): CSSProperties =>
    instant ? { opacity: 1, animation: "none" } : { animationDelay: `${(warm ? 0 : IDLE_DELAY_MS) + i * DOT_MS}ms` };

  return (
    <div className={className}>
      <div
        data-hero-map
        role="group"
        tabIndex={0}
        aria-roledescription="interactive map demo"
        aria-label="Map demo: move your pointer or use the arrow keys to move your door; the route to the nearest hospital draws."
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
        onKeyDown={onKeyDown}
        className="relative aspect-[720/520] w-full cursor-crosshair select-none overflow-hidden rounded-[2rem] bg-navy shadow-[var(--shadow-lift)] [--logo-dot:var(--color-navy)] focus-visible:rounded-[2rem]"
      >
        <style>{`
          @keyframes hm-dot { to { opacity: 1; } }
          @keyframes hm-pulse { 0% { transform: scale(1); opacity: .7 } 100% { transform: scale(2.6); opacity: 0 } }
          [data-hero-map] .hm-dot { opacity: 0; animation: hm-dot 1ms linear forwards; }
          [data-hero-map] .hm-pulse { transform-origin: center; transform-box: fill-box; animation: hm-pulse 1.6s ease-out infinite; }
          @media (prefers-reduced-motion: reduce) {
            [data-hero-map] .hm-dot { animation: none; opacity: 1; }
            [data-hero-map] .hm-pulse { display: none; }
          }
        `}</style>
        <svg viewBox={`0 0 ${VW} ${VH}`} className="absolute inset-0 h-full w-full" aria-hidden="true" focusable="false">
          <BaseMap />
          {/* route: navy halo so the dots read over the streets, then amber dots in sequence */}
          <g data-route="hero" key={`${run}:${door.i},${door.j}>${best}`}>
            {dest && (
              <path d={"M" + pts.map((p) => `${p[0]} ${p[1]}`).join(" L")} fill="none" stroke="var(--color-navy)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
            )}
            {dots.map((p, i) => (
              <circle key={i} className="hm-dot" cx={p[0].toFixed(1)} cy={p[1].toFixed(1)} r="2.2" fill={PIN_AMBER} style={dotStyle(i)} />
            ))}
          </g>
          {/* destinations: every pin shows; the nearest is hot */}
          <g data-destinations>
            {dests.map((d, i) => {
              const [x, y] = px(d.node);
              const east = x > VW * 0.62;
              return (
                <g key={d.name} data-dest className={i === best ? "is-hot" : undefined} style={{ opacity: i === best ? 1 : 0.8 }}>
                  <PinAt x={x} y={y} hot={i === best} />
                  <text x={east ? x - 14 : x + 14} y={y - 22} textAnchor={east ? "end" : "start"} fontSize="11" fontWeight="700" fill="var(--color-cream)" fillOpacity={i === best ? 1 : 0.75} className="font-sans max-sm:hidden">
                    {d.name}
                  </text>
                </g>
              );
            })}
          </g>
          {/* your door */}
          <g data-door transform={`translate(${start[0]} ${start[1]})`} style={{ transition: "transform 180ms var(--ease-gentle)" }}>
            <circle className="hm-pulse" r="7" fill="none" stroke="var(--color-cream)" strokeWidth="2" />
            <circle r="7" fill="var(--color-navy)" stroke="var(--color-cream)" strokeWidth="3" />
          </g>
        </svg>

        {dest && (
          <div aria-hidden="true" data-hero-chip className="pointer-events-none absolute max-w-[42%] rounded-xl bg-white px-3 py-2 text-ink shadow-[var(--shadow-soft)] transition-[left,top] duration-300 ease-[var(--ease-gentle)]" style={chipStyle}>
            <p className="font-sans text-[14px] font-bold leading-tight">{dest.name}</p>
            <p className="mt-0.5 text-[12px] leading-tight text-ink/85">From your door</p>
          </div>
        )}
        <p className="sr-only" aria-live="polite">{announce}</p>
      </div>
      <p className="mt-3 text-center text-sm text-ink/85">Move your pointer or tap: the route draws from your door.</p>
    </div>
  );
}
