"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { PIN_AMBER, Pin } from "@/components/ui/Logo";

/*
 * Hero map demo. A stylised street grid in the brand map style: navy ground,
 * Morning streets, water and blocks. The visitor's pointer (or a tap, or the
 * arrow keys) sets "your door"; the door snaps to the nearest street node, the
 * nearest destination is picked by Manhattan distance, and the route is drawn
 * as Signal Amber dots that appear in sequence, start street → arterial →
 * destination. Amber is used only on the route dots (inside [data-route]) and
 * the brand pin ([data-pin], from Logo.tsx).
 *
 * Everything drawn is deterministic (no Math.random) and the first render is
 * identical on the server and the client: the default door and its route are
 * in the HTML, and the route's opening animation is a CSS delay, so it plays
 * ~500 ms after first paint with no JavaScript required.
 */

export type HeroMapDestination = { name: string; node: { i: number; j: number }; href?: string };

type Node = { i: number; j: number };

// ---------- Grid ----------
const COLS = 9;
const ROWS = 7;
const STEP = 48;
const VW = 480;
const VH = 360;
// The 9 × 7 node grid is centred in the viewBox; streets run past the last
// nodes to the edges so the city continues off-frame.
const MX = (VW - (COLS - 1) * STEP) / 2; // 48
const MY = (VH - (ROWS - 1) * STEP) / 2; // 36
const AI = 4; // arterial column
const AJ = 3; // arterial row
const DEFAULT_DOOR: Node = { i: 1, j: 5 };
const DOT_GAP = 12;
const ROUTE_MS = 900;
const PIN_H = 34; // pin height in viewBox units (tip on the node)
const PIN_HEAD = PIN_H * (19 / 31); // pin head centre above the tip

const nx = (i: number) => MX + i * STEP;
const ny = (j: number) => MY + j * STEP;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
/** Percentage of the map's width or height, rounded so the markup stays tidy. */
const pct = (v: number, of: number) => `${Math.round((v / of) * 10000) / 100}%`;
const sameNode = (a: Node, b: Node) => a.i === b.i && a.j === b.j;
const clampNode = (n: Node): Node => ({ i: clamp(Math.round(n.i) || 0, 0, COLS - 1), j: clamp(Math.round(n.j) || 0, 0, ROWS - 1) });

// ---------- Routing (pure) ----------
/**
 * Start → nearest arterial (along the start's own row or column) → along the
 * arterial → along the destination's row/column to it. Of the two arterials,
 * the one giving the shorter route wins; on a tie, the one reached sooner. A
 * start that already shares a row or column with the destination goes straight
 * there along that street.
 */
export function routeBetween(start: Node, dest: Node): Node[] {
  const path: Node[] = [start];
  let cur = start;
  const walkI = (to: number) => {
    while (cur.i !== to) {
      cur = { i: cur.i + Math.sign(to - cur.i), j: cur.j };
      path.push(cur);
    }
  };
  const walkJ = (to: number) => {
    while (cur.j !== to) {
      cur = { i: cur.i, j: cur.j + Math.sign(to - cur.j) };
      path.push(cur);
    }
  };
  if (start.i === dest.i) {
    walkJ(dest.j);
    return path;
  }
  if (start.j === dest.j) {
    walkI(dest.i);
    return path;
  }
  const viaCol = Math.abs(start.i - AI) + Math.abs(start.j - dest.j) + Math.abs(AI - dest.i);
  const viaRow = Math.abs(start.j - AJ) + Math.abs(start.i - dest.i) + Math.abs(AJ - dest.j);
  const useCol = viaCol < viaRow || (viaCol === viaRow && Math.abs(start.i - AI) <= Math.abs(start.j - AJ));
  if (useCol) {
    walkI(AI);
    walkJ(dest.j);
    walkI(dest.i);
  } else {
    walkJ(AJ);
    walkI(dest.i);
    walkJ(dest.j);
  }
  return path;
}

const manhattan = (a: Node, b: Node) => Math.abs(a.i - b.i) + Math.abs(a.j - b.j);

/** One dot every DOT_GAP units along the route polyline (the start node itself carries the door ring). */
function routeDots(path: Node[]): Array<[number, number]> {
  const dots: Array<[number, number]> = [];
  for (let k = 1; k < path.length; k++) {
    const a = path[k - 1];
    const b = path[k];
    const n = STEP / DOT_GAP;
    for (let s = 1; s <= n; s++) {
      const t = s / n;
      dots.push([nx(a.i) + (nx(b.i) - nx(a.i)) * t, ny(a.j) + (ny(b.j) - ny(a.j)) * t]);
    }
  }
  return dots;
}

// ---------- Static scenery (computed once, deterministic) ----------
/** ~12% of local street segments are left as dead-end stubs. */
function omitted(i: number, j: number, vertical: boolean) {
  const h = Math.imul((i * ROWS + j + (vertical ? 64 : 0) + 1) | 0, 0x85ebca6b) >>> 0;
  return (h >>> 9) % 100 < 12;
}

function buildStreets() {
  let local = "";
  let arterial = "";
  const STUB = 14;
  // Rows.
  for (let j = 0; j < ROWS; j++) {
    const y = ny(j);
    if (j === AJ) {
      arterial += `M0 ${y}H${VW}`;
      continue;
    }
    local += `M0 ${y}H${MX}M${nx(COLS - 1)} ${y}H${VW}`;
    for (let i = 0; i < COLS - 1; i++) {
      const x0 = nx(i);
      local += omitted(i, j, false) ? `M${x0} ${y}h${STUB}` : `M${x0} ${y}h${STEP}`;
    }
  }
  // Columns.
  for (let i = 0; i < COLS; i++) {
    const x = nx(i);
    if (i === AI) {
      arterial += `M${x} 0V${VH}`;
      continue;
    }
    local += `M${x} 0V${MY}M${x} ${ny(ROWS - 1)}V${VH}`;
    for (let j = 0; j < ROWS - 1; j++) {
      const y0 = ny(j);
      local += omitted(i, j, true) ? `M${x} ${y0 + STEP}v-${STUB}` : `M${x} ${y0}v${STEP}`;
    }
  }
  return { local, arterial };
}

const STREETS = buildStreets();

// Shaded blocks: [i, j, cols, rows] in grid cells, inset from the streets.
const BLOCKS: Array<[number, number, number, number]> = [
  [1, 1, 2, 1],
  [6, 4, 2, 2],
  [2, 4, 1, 1],
  [5, 0, 1, 2],
];
const BLOCK_INSET = 5;

// One curved bayou running down the east side and out at the bottom.
const BAYOU = `M${VW - 22} 0C${VW - 60} 70 ${VW + 4} 130 ${VW - 40} 190S${VW - 110} 300 ${VW - 130} ${VH}`;

const CSS = `
[data-hero-map] .hm-dot{opacity:0;transform-box:fill-box;transform-origin:center;animation:hm-dot 220ms var(--ease-gentle) both}
@keyframes hm-dot{from{opacity:0;transform:scale(.3)}to{opacity:1;transform:none}}
[data-hero-map] .hm-door{transition:transform 180ms var(--ease-gentle)}
[data-hero-map] .hm-pulse{transform-box:fill-box;transform-origin:center;animation:hm-pulse 1.8s ease-out infinite}
@keyframes hm-pulse{from{transform:scale(1);opacity:.7}to{transform:scale(2.6);opacity:0}}
@media (prefers-reduced-motion:reduce){[data-hero-map] .hm-dot{animation:none;opacity:1}[data-hero-map] .hm-pulse{display:none}}
`;

const KEY_MOVES: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

export function HeroMap({ destinations, className = "" }: { destinations: HeroMapDestination[]; className?: string }) {
  const [door, setDoor] = useState<Node>(DEFAULT_DOOR);
  // `run` bumps to replay the current route; `warm` is false only for the
  // server-rendered opening route, which carries a 500 ms lead-in delay.
  const [run, setRun] = useState(0);
  const [warm, setWarm] = useState(false);
  const [live, setLive] = useState("");

  const frame = useRef(0);
  const pendingNode = useRef<Node | null>(null);
  const replayTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const announced = useRef<string | null>(null);

  const targets = useMemo(() => destinations.map((d) => ({ ...d, node: clampNode(d.node) })), [destinations]);

  const dest = useMemo(() => {
    let best: (typeof targets)[number] | undefined;
    let bestD = Infinity;
    for (const t of targets) {
      const d = manhattan(door, t.node);
      if (d < bestD) {
        bestD = d;
        best = t;
      }
    }
    return best;
  }, [targets, door]);

  const dots = useMemo(() => (dest ? routeDots(routeBetween(door, dest.node)) : []), [door, dest]);
  const stepMs = dots.length ? Math.min(30, ROUTE_MS / dots.length) : 0;
  const leadMs = warm ? 0 : 500;
  const routeKey = `${run}:${door.i},${door.j}>${dest ? `${dest.node.i},${dest.node.j}` : "-"}`;

  // Announce the destination for assistive tech, debounced so a mouse sweep
  // across the map does not read out every hospital it passes.
  useEffect(() => {
    if (!dest) return;
    if (announced.current === null) {
      announced.current = dest.name;
      return;
    }
    if (announced.current === dest.name) return;
    const t = setTimeout(() => {
      announced.current = dest.name;
      setLive(`Route from your door to ${dest.name}`);
    }, 300);
    return () => clearTimeout(t);
  }, [dest]);

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      clearTimeout(replayTimer.current);
    },
    [],
  );

  const moveDoor = useCallback((next: Node) => {
    setWarm(true);
    setDoor((prev) => (sameNode(prev, next) ? prev : next));
  }, []);

  const nodeAt = (e: PointerEvent<HTMLDivElement>): Node => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * VW;
    const y = ((e.clientY - r.top) / r.height) * VH;
    return clampNode({ i: (x - MX) / STEP, j: (y - MY) / STEP });
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    const n = nodeAt(e);
    if (sameNode(n, door) && !pendingNode.current) return;
    pendingNode.current = n;
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const next = pendingNode.current;
      pendingNode.current = null;
      if (next) moveDoor(next);
    });
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "touch") return;
    moveDoor(nodeAt(e));
  };

  const onPointerEnter = () => clearTimeout(replayTimer.current);

  const onPointerLeave = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    clearTimeout(replayTimer.current);
    replayTimer.current = setTimeout(() => {
      setWarm(true);
      setRun((r) => r + 1);
    }, 1800);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Home") {
      e.preventDefault();
      moveDoor(DEFAULT_DOOR);
      return;
    }
    const mv = KEY_MOVES[e.key];
    if (!mv) return;
    e.preventDefault();
    moveDoor(clampNode({ i: door.i + mv[0], j: door.j + mv[1] }));
  };

  // Chip placement: beside the pin head, flipped to the west half for eastern
  // nodes and dropped below the node on the top two rows so it stays in frame.
  const chipStyle: CSSProperties | undefined = dest
    ? (() => {
        const x = nx(dest.node.i);
        const y = ny(dest.node.j);
        const east = dest.node.i > AI;
        const below = dest.node.j <= 1;
        const s: CSSProperties = {};
        if (east) s.right = pct(VW - (x - 18), VW);
        else s.left = pct(x + 18, VW);
        if (below) s.top = pct(y + 12, VH);
        else {
          s.top = pct(y - PIN_HEAD, VH);
          s.transform = "translateY(-50%)";
        }
        return s;
      })()
    : undefined;

  return (
    <div className={className}>
      <style>{CSS}</style>
      <div
        data-hero-map
        role="group"
        tabIndex={0}
        aria-roledescription="interactive map demo"
        aria-label="Map demo: move your pointer or use the arrow keys to move your door; the route to the nearest hospital draws."
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onKeyDown={onKeyDown}
        className="relative aspect-[4/3] w-full cursor-crosshair overflow-hidden rounded-[2rem] bg-navy shadow-[var(--shadow-lift)] select-none [--logo-dot:var(--color-navy)] focus-visible:rounded-[2rem]"
      >
        <svg viewBox={`0 0 ${VW} ${VH}`} className="absolute inset-0 h-full w-full" aria-hidden="true" focusable="false">
          {/* Scenery: blocks, bayou, streets. All Morning on navy at low alpha. */}
          <g fill="var(--color-morning)" fillOpacity={0.07}>
            {BLOCKS.map(([i, j, w, h]) => (
              <rect key={`${i}-${j}`} x={nx(i) + BLOCK_INSET} y={ny(j) + BLOCK_INSET} width={w * STEP - 2 * BLOCK_INSET} height={h * STEP - 2 * BLOCK_INSET} rx={3} />
            ))}
          </g>
          <path d={BAYOU} fill="none" stroke="var(--color-morning)" strokeOpacity={0.16} strokeWidth={9} strokeLinecap="round" />
          <path d={STREETS.local} fill="none" stroke="var(--color-morning)" strokeOpacity={0.28} strokeWidth={1.6} strokeLinecap="round" />
          <path d={STREETS.arterial} fill="none" stroke="var(--color-morning)" strokeOpacity={0.55} strokeWidth={5} />

          {/* Route: one dot per 12 units, appearing in sequence. */}
          <g key={routeKey} data-route="hero" fill={PIN_AMBER}>
            {dots.map(([x, y], k) => (
              <circle key={k} className="hm-dot" cx={x} cy={y} r={2.6} style={{ animationDelay: `${Math.round(leadMs + k * stepMs)}ms` }} />
            ))}
          </g>

          {/* Your door. */}
          <g className="hm-door" style={{ transform: `translate(${nx(door.i)}px, ${ny(door.j)}px)` }} fill="none" stroke="var(--color-white)">
            <circle className="hm-pulse" r={7} strokeWidth={2} />
            <circle r={7} strokeWidth={2.5} />
          </g>
        </svg>

        {dest && (
          <>
            <Pin
              className="pointer-events-none absolute w-auto -translate-x-1/2 -translate-y-full transition-[left,top] duration-300 ease-[var(--ease-gentle)]"
              style={{ height: pct(PIN_H, VH), left: pct(nx(dest.node.i), VW), top: pct(ny(dest.node.j), VH) }}
            />
            <div aria-hidden="true" className="pointer-events-none absolute max-w-[42%] rounded-xl bg-white px-3 py-2 text-ink shadow-[var(--shadow-soft)]" style={chipStyle}>
              <p className="font-sans text-[14px] font-bold leading-tight">{dest.name}</p>
              <p className="mt-0.5 text-[12px] leading-tight text-ink/85">From your door</p>
            </div>
          </>
        )}

        <p className="sr-only" aria-live="polite">
          {live}
        </p>
      </div>
      <p className="mt-3 text-center text-sm text-ink/85">Move your pointer or tap: the route draws from your door.</p>
    </div>
  );
}
