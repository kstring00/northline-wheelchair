/**
 * Builds public/brand/service-map.svg: the "Where we drive" map.
 *
 *   npx tsx scripts/build-map.ts
 *
 * Geometry comes from OpenStreetMap (Overpass) when the network allows it,
 * otherwise from the hand-traced alignments in scripts/map-data/*.json. The
 * SVG is self-contained (renders with no JS and no web fonts), uses only the
 * six brand tones plus white, and carries data-* hooks for the client-side
 * enhancement in src/components/home/ServiceMapInteractive.tsx.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { site } from "../src/config/site";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const dataDir = join(here, "map-data");
const outFile = join(root, "public/brand/service-map.svg");

/* ------------------------------------------------------------------ tones */
const NAVY = "#16284A";
const AMBER = "#E8A33D";
const MORNING = "#DCE6F5";
const WHITE = "#FFFFFF";
const PIN_PATH = "M12 0C5.4 0 0 5.4 0 12c0 8.5 12 19 12 19s12-10.5 12-19C24 5.4 18.6 0 12 0z";
const FONT_STACK = `"Bricolage Grotesque", "Atkinson Hyperlegible", system-ui, sans-serif`;

/* ------------------------------------------------------------- projection */
// Equirectangular with cos(30°) longitude scaling. The latitude range is fixed
// (Conroe at the top edge, the Texas Medical Center at the bottom edge) and
// the longitude range is derived so the map is a 1200 × 900 landscape.
const W = 1200;
const H = 900;
const LAT_MIN = 29.69;
const LAT_MAX = 30.34;
const LON_CENTER = -95.43;
const COS30 = Math.cos((30 * Math.PI) / 180);
const PX_PER_DEG = H / (LAT_MAX - LAT_MIN);
const LON_SPAN = W / (PX_PER_DEG * COS30);
const LON_MIN = LON_CENTER - LON_SPAN / 2;
const LON_MAX = LON_CENTER + LON_SPAN / 2;
const PX_PER_KM = PX_PER_DEG / 110.574;

type LonLat = [number, number];
type XY = [number, number];

const project = ([lon, lat]: LonLat): XY => [(lon - LON_MIN) * COS30 * PX_PER_DEG, (LAT_MAX - lat) * PX_PER_DEG];
const geoXY = (g: { latitude: number; longitude: number }) => project([g.longitude, g.latitude]);
const r1 = (n: number) => (Math.round(n * 10) / 10).toString();

/* --------------------------------------------------------------- features */
type Kind = "freeway" | "road" | "river" | "lake";
type Tags = Record<string, string>;
type Feature = { id: string; kind: Kind; osm: (tags: Tags) => boolean };

const refHas = (tags: Tags, re: RegExp) => (tags.ref ?? "").split(";").some((r) => re.test(r.trim()));
const nameHas = (tags: Tags, re: RegExp) => re.test(tags.name ?? "");

const FEATURES: Feature[] = [
  { id: "i45", kind: "freeway", osm: (t) => refHas(t, /^I[- ]45$/) },
  { id: "us290", kind: "freeway", osm: (t) => refHas(t, /^US[- ]290$/) },
  { id: "tx249", kind: "freeway", osm: (t) => refHas(t, /^(TX|SH)[- ]249$/) },
  { id: "sh99", kind: "freeway", osm: (t) => refHas(t, /^(TX|SH)[- ]99$/) },
  { id: "beltway8", kind: "freeway", osm: (t) => refHas(t, /^Beltway 8$/) || nameHas(t, /Sam Houston (Tollway|Parkway)/) },
  { id: "us59", kind: "freeway", osm: (t) => refHas(t, /^(US[- ]59|I[- ]69)$/) },
  { id: "i610", kind: "freeway", osm: (t) => refHas(t, /^I[- ]610$/) },
  { id: "i10", kind: "freeway", osm: (t) => refHas(t, /^I[- ]10$/) },
  { id: "hardy", kind: "road", osm: (t) => nameHas(t, /Hardy Toll/) },
  { id: "fm1960", kind: "road", osm: (t) => refHas(t, /^FM[- ]1960$/) },
  { id: "lake-houston", kind: "lake", osm: (t) => t.natural === "water" && nameHas(t, /^Lake Houston$/) },
  { id: "spring-creek", kind: "river", osm: (t) => !!t.waterway && nameHas(t, /^Spring Creek$/) },
  { id: "cypress-creek", kind: "river", osm: (t) => !!t.waterway && nameHas(t, /^Cypress Creek$/) },
  { id: "west-fork-san-jacinto", kind: "river", osm: (t) => !!t.waterway && nameHas(t, /West Fork San Jacinto/) },
];

const OVERPASS_ENDPOINTS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"];
const OVERPASS_QUERY = `[out:json][timeout:25][bbox:29.66,-95.80,30.36,-95.05];
(
  way[highway~"^(motorway|trunk)$"][ref~"(^|;)(I[- ](45|69|610|10)|US[- ](290|59)|(TX|SH)[- ](249|99))($|;)"];
  way[highway~"^(motorway|trunk|primary)$"][name~"Sam Houston (Tollway|Parkway)|Hardy Toll"];
  way[highway~"^(motorway|trunk|primary|secondary)$"][ref~"(^|;)FM[- ]1960($|;)"];
  relation[natural=water][name="Lake Houston"];
  way[waterway][name~"^(Spring Creek|Cypress Creek|West Fork San Jacinto River)$"];
);
out geom;`;

type OsmGeom = { lat: number; lon: number }[];
type OsmElement = {
  type: "way" | "relation" | "node";
  tags?: Tags;
  geometry?: OsmGeom;
  members?: { type: string; role: string; geometry?: OsmGeom }[];
};

async function fetchOverpass(): Promise<OsmElement[] | null> {
  for (const url of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: "data=" + encodeURIComponent(OVERPASS_QUERY),
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { elements?: OsmElement[] };
      if (!json.elements?.length) throw new Error("empty result");
      console.log(`Overpass: ${json.elements.length} elements from ${url}`);
      return json.elements;
    } catch (err) {
      console.log(`Overpass unreachable at ${url}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  return null;
}

const toLonLat = (g: OsmGeom): LonLat[] => g.map((p) => [p.lon, p.lat]);

/** Joins way fragments end-to-end into rings (for the lake's outer boundary). */
function stitchRings(ways: LonLat[][]): LonLat[][] {
  const pool = ways.map((w) => w.slice());
  const rings: LonLat[][] = [];
  const same = (a: LonLat, b: LonLat) => Math.abs(a[0] - b[0]) < 1e-7 && Math.abs(a[1] - b[1]) < 1e-7;
  while (pool.length) {
    const ring = pool.shift()!;
    let grew = true;
    while (grew && !same(ring[0], ring[ring.length - 1])) {
      grew = false;
      for (let i = 0; i < pool.length; i++) {
        const w = pool[i];
        const end = ring[ring.length - 1];
        if (same(w[0], end)) ring.push(...w.slice(1));
        else if (same(w[w.length - 1], end)) ring.push(...w.slice(0, -1).reverse());
        else continue;
        pool.splice(i, 1);
        grew = true;
        break;
      }
    }
    rings.push(ring);
  }
  return rings;
}

function fromOsm(elements: OsmElement[], f: Feature): LonLat[][] | null {
  const lines: LonLat[][] = [];
  for (const el of elements) {
    if (!el.tags || !f.osm(el.tags)) continue;
    if (el.type === "way" && el.geometry) lines.push(toLonLat(el.geometry));
    if (el.type === "relation" && el.members) {
      const outers = el.members.filter((m) => m.type === "way" && m.role !== "inner" && m.geometry).map((m) => toLonLat(m.geometry!));
      lines.push(...(f.kind === "lake" ? stitchRings(outers) : outers));
    }
  }
  return lines.length ? lines : null;
}

function fromFile(f: Feature): LonLat[][] {
  const raw = JSON.parse(readFileSync(join(dataDir, `${f.id}.json`), "utf8")) as LonLat[];
  return [raw];
}

/* ----------------------------------------------------------- geometry ops */
/** Douglas–Peucker in projected pixel space. */
function simplify(points: XY[], tolerance: number): XY[] {
  if (points.length <= 2) return points;
  const sq = tolerance * tolerance;
  const keep = new Array<boolean>(points.length).fill(false);
  keep[0] = keep[points.length - 1] = true;
  const stack: [number, number][] = [[0, points.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop()!;
    let maxD = 0;
    let idx = -1;
    const [ax, ay] = points[a];
    const [bx, by] = points[b];
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy || 1;
    for (let i = a + 1; i < b; i++) {
      const [px, py] = points[i];
      const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
      const ex = ax + t * dx - px;
      const ey = ay + t * dy - py;
      const d = ex * ex + ey * ey;
      if (d > maxD) {
        maxD = d;
        idx = i;
      }
    }
    if (maxD > sq && idx > 0) {
      keep[idx] = true;
      stack.push([a, idx], [idx, b]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

/** Andrew's monotone chain, counter-clockwise. */
function convexHull(points: XY[]): XY[] {
  const pts = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: XY, a: XY, b: XY) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: XY[] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: XY[] = [];
  for (const p of pts.reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

const pathD = (lines: XY[][], close = false) =>
  lines.map((pts) => pts.map(([x, y], i) => `${i ? "L" : "M"}${r1(x)} ${r1(y)}`).join("") + (close ? "Z" : "")).join("");

/** Text rotation (degrees) that runs along the road between two geo points, never upside down. */
function angleAlong(a: LonLat, b: LonLat) {
  const [ax, ay] = project(a);
  const [bx, by] = project(b);
  let deg = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI;
  if (deg > 90) deg -= 180;
  if (deg < -90) deg += 180;
  return Math.round(deg);
}

/** Point on a polyline nearest a latitude (used to aim route curves at I-45). */
function xAtLat(line: LonLat[], lat: number) {
  let best = line[0];
  for (const p of line) if (Math.abs(p[1] - lat) < Math.abs(best[1] - lat)) best = p;
  return project(best)[0];
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

/* ------------------------------------------------------------------- pins */
function pin(x: number, y: number, height: number) {
  const s = height / 31;
  return (
    `<g data-pin-wrap="" style="transform-origin:${r1(x)}px ${r1(y)}px">` +
    `<g transform="translate(${r1(x - 12 * s)} ${r1(y - 31 * s)}) scale(${r1(s)})">` +
    `<path d="${PIN_PATH}" fill="${AMBER}" data-pin=""/><circle cx="12" cy="12" r="4.5" fill="${NAVY}"/></g></g>`
  );
}

/* ----------------------------------------------------------------- labels */
type Anchor = "start" | "end" | "middle";

const CORE_LABEL: Record<string, { at?: LonLat; anchor: Anchor }> = {
  // Houston's pin sits on the north side of the city so it does not land on the Medical Center marker.
  houston: { at: [-95.383, 29.862], anchor: "start" },
  spring: { anchor: "start" },
  humble: { anchor: "start" },
  "the-woodlands": { anchor: "end" },
  cypress: { anchor: "end" },
};

const TOWNS: { name: string; at: LonLat; anchor?: Anchor }[] = [
  { name: "Tomball", at: [-95.6161, 30.0972] },
  { name: "Kingwood", at: [-95.185, 30.05], anchor: "end" },
  { name: "Klein", at: [-95.53, 30.033] },
  { name: "Aldine", at: [-95.3799, 29.9327] },
  { name: "Conroe", at: [-95.4561, 30.3119] },
];

const HOSPITAL_LABEL: Record<string, { anchor: Anchor; lines: string[]; dy?: number }> = {
  "hca-houston-healthcare-northwest": { anchor: "start", lines: ["HCA Houston Healthcare", "Northwest"], dy: 14 },
  "memorial-hermann-the-woodlands": { anchor: "start", lines: ["Memorial Hermann", "The Woodlands Medical Center"], dy: 12 },
  "houston-methodist-willowbrook": { anchor: "end", lines: ["Houston Methodist", "Willowbrook Hospital"] },
  "st-lukes-the-woodlands": { anchor: "start", lines: ["St. Luke's Health –", "The Woodlands Hospital"] },
};

const ROAD_LABELS: { text: string; at: LonLat; along?: [LonLat, LonLat]; anchor?: Anchor; feature: string }[] = [
  { text: "I-45", at: [-95.478, 30.262], along: [[-95.463, 30.28], [-95.46, 30.24]], anchor: "middle", feature: "i45" },
  { text: "I-45", at: [-95.436, 29.9], along: [[-95.413, 29.938], [-95.408, 29.895]], anchor: "middle", feature: "i45" },
  { text: "US-290", at: [-95.63, 29.947], along: [[-95.618, 29.928], [-95.65, 29.945]], anchor: "middle", feature: "us290" },
  { text: "TX-249", at: [-95.61, 30.028], along: [[-95.585, 30.02], [-95.6, 30.04]], anchor: "middle", feature: "tx249" },
  { text: "Grand Parkway 99", at: [-95.54, 30.09], along: [[-95.55, 30.075], [-95.5, 30.085]], anchor: "middle", feature: "sh99" },
  { text: "Beltway 8", at: [-95.36, 29.928], anchor: "middle", feature: "beltway8" },
  { text: "Hardy Toll Rd", at: [-95.375, 30.03], along: [[-95.391, 29.995], [-95.403, 30.052]], anchor: "middle", feature: "hardy" },
  { text: "FM 1960", at: [-95.33, 30.008], anchor: "middle", feature: "fm1960" },
  { text: "US-59", at: [-95.328, 29.86], along: [[-95.32, 29.845], [-95.315, 29.88]], anchor: "middle", feature: "us59" },
  { text: "I-10", at: [-95.62, 29.79], anchor: "middle", feature: "i10" },
  { text: "Lake Houston", at: [-95.14, 29.965], anchor: "middle", feature: "lake-houston" },
  { text: "Spring Creek", at: [-95.62, 30.125], anchor: "middle", feature: "spring-creek" },
];

/* ------------------------------------------------------------------- build */
async function main() {
  const osm = await fetchOverpass();
  const geo = new Map<string, LonLat[][]>();
  let osmCount = 0;
  for (const f of FEATURES) {
    const fromNet = osm ? fromOsm(osm, f) : null;
    if (fromNet) osmCount++;
    geo.set(f.id, fromNet ?? fromFile(f));
  }
  const source =
    osmCount === FEATURES.length
      ? "OpenStreetMap via Overpass, © OpenStreetMap contributors, ODbL"
      : osmCount > 0
        ? `mixed: ${osmCount} features from OpenStreetMap (© OpenStreetMap contributors, ODbL), the rest hand-traced from known alignments`
        : "hand-traced from known alignments (Overpass unreachable at build)";

  const px = (id: string, close = false) =>
    pathD(
      geo.get(id)!.map((line) => simplify(line.map(project), 1.2)),
      close,
    );

  /* Service field: convex hull of the five core cities, grown ~18 km. */
  const hull = convexHull(site.coreAreas.map((a) => geoXY(a.geo)));
  const fieldStroke = r1(2 * 18 * PX_PER_KM);
  const hullPoints = hull.map(([x, y]) => `${r1(x)},${r1(y)}`).join(" ");

  const out: string[] = [];
  out.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  out.push(
    `<svg xmlns="http://www.w3.org/2000/svg" id="nl-service-map" viewBox="0 0 ${W} ${H}" aria-hidden="true" focusable="false" data-i45-x="${r1(xAtLat(geo.get("i45")![0], 29.9))}" font-family='${FONT_STACK}'>`,
  );
  out.push(`<!-- Northline service-area map. Generated by scripts/build-map.ts; do not edit by hand. -->`);
  out.push(`<!-- geometry: ${source} -->`);
  out.push(`<title>Northline service area: north Houston</title>`);
  out.push(`<defs>
<filter id="nl-field-feather" x="-25%" y="-25%" width="150%" height="150%"><feGaussianBlur stdDeviation="14"/></filter>
<clipPath id="nl-map-clip"><rect width="${W}" height="${H}"/></clipPath>
</defs>`);
  out.push(`<style>
#nl-service-map{display:block;width:100%;height:auto}
#nl-service-map .t-display{font-family:var(--font-bricolage,"Bricolage Grotesque"),"Bricolage Grotesque","Atkinson Hyperlegible",system-ui,sans-serif}
#nl-service-map .t-text{font-family:var(--font-atkinson,"Atkinson Hyperlegible"),"Atkinson Hyperlegible",system-ui,sans-serif}
#nl-service-map [data-city]{cursor:pointer}
#nl-service-map [data-city] text{transition:fill-opacity .2s ease}
#nl-service-map [data-pin-wrap]{transition:transform .25s cubic-bezier(.22,.61,.36,1)}
#nl-service-map [data-city].is-active text{fill-opacity:1}
#nl-service-map [data-city].is-active [data-pin-wrap]{transform:scale(1.15)}
@media (max-width:640px){
#nl-service-map .t-core{font-size:40px}
#nl-service-map .t-town{font-size:28px}
#nl-service-map .t-tmc{font-size:24px}
#nl-service-map .t-hosp,#nl-service-map .t-road{display:none}
#nl-service-map [data-pin-wrap]{transform:scale(1.8)}
#nl-service-map [data-city].is-active [data-pin-wrap]{transform:scale(2)}
#nl-service-map [data-tmc-ring]{transform:scale(1.8)}
#nl-service-map [data-town-dot]{transform:scale(1.8)}
}
</style>`);

  out.push(`<rect width="${W}" height="${H}" fill="${NAVY}"/>`);
  out.push(`<g clip-path="url(#nl-map-clip)">`);

  // Service field
  out.push(
    `<g data-field="" filter="url(#nl-field-feather)" opacity="0.25"><polygon points="${hullPoints}" fill="${MORNING}" stroke="${MORNING}" stroke-width="${fieldStroke}" stroke-linejoin="round"/></g>`,
  );

  // Water
  out.push(`<g data-water="" fill="none" stroke="${MORNING}" stroke-opacity="0.18" stroke-linecap="round" stroke-linejoin="round">`);
  out.push(`<path d="${px("lake-houston", true)}" fill="${MORNING}" fill-opacity="0.18" stroke-width="1.5"/>`);
  for (const id of ["spring-creek", "cypress-creek", "west-fork-san-jacinto"]) out.push(`<path d="${px(id)}" stroke-width="2.5"/>`);
  out.push(`</g>`);

  // FM / toll roads
  out.push(`<g data-roads="" fill="none" stroke="${MORNING}" stroke-opacity="0.35" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">`);
  for (const id of ["hardy", "fm1960"]) out.push(`<path d="${px(id)}"/>`);
  out.push(`</g>`);

  // Freeways: navy casing under a Morning line; both animate with pathLength="1".
  out.push(`<g data-freeways="" fill="none" stroke-linecap="round" stroke-linejoin="round">`);
  for (const f of FEATURES.filter((f) => f.kind === "freeway")) {
    const d = px(f.id);
    out.push(`<g data-freeway-group="${f.id}">`);
    out.push(`<path d="${d}" stroke="${NAVY}" stroke-width="8" pathLength="1" data-freeway=""/>`);
    out.push(`<path d="${d}" stroke="${MORNING}" stroke-opacity="0.55" stroke-width="3.5" pathLength="1" data-freeway=""/>`);
    out.push(`</g>`);
  }
  out.push(`</g>`);

  // Road and water names
  out.push(`<g data-road-labels="" class="t-text" font-size="12" font-weight="700" fill="${WHITE}" fill-opacity="0.55" letter-spacing="0.04em">`);
  for (const l of ROAD_LABELS) {
    const [x, y] = project(l.at);
    const rot = l.along ? angleAlong(l.along[0], l.along[1]) : 0;
    const water = l.feature === "lake-houston" || l.feature === "spring-creek";
    out.push(
      `<text class="t-road" data-label="" x="${r1(x)}" y="${r1(y)}" text-anchor="${l.anchor ?? "start"}"${rot ? ` transform="rotate(${rot} ${r1(x)} ${r1(y)})"` : ""}${water ? ` font-weight="400" font-style="italic" letter-spacing="0.08em"` : ""}>${esc(l.text)}</text>`,
    );
  }
  out.push(`</g>`);

  // Secondary towns
  out.push(`<g data-towns="" class="t-text" font-size="18" font-weight="400" fill="${WHITE}">`);
  for (const t of TOWNS) {
    const [x, y] = project(t.at);
    const anchor = t.anchor ?? "start";
    const tx = anchor === "end" ? x - 9 : anchor === "middle" ? x : x + 9;
    out.push(
      `<g data-town="${esc(t.name.toLowerCase())}"><circle data-town-dot="" cx="${r1(x)}" cy="${r1(y)}" r="3" fill="${WHITE}" fill-opacity="0.6" style="transform-origin:${r1(x)}px ${r1(y)}px"/>` +
        `<text class="t-town" data-label="" x="${r1(tx)}" y="${r1(y + 6)}" text-anchor="${anchor}" fill-opacity="0.7">${esc(t.name)}</text></g>`,
    );
  }
  out.push(`</g>`);

  // Hospitals
  out.push(`<g data-hospitals="" class="t-text" font-size="14" font-weight="400" fill="${WHITE}">`);
  for (const h of site.hospitals) {
    const [x, y] = geoXY(h.geo);
    const cfg = HOSPITAL_LABEL[h.slug] ?? { anchor: "start" as Anchor, lines: [h.name] };
    const tx = cfg.anchor === "end" ? x - 11 : cfg.anchor === "middle" ? x : x + 11;
    const dy = cfg.dy ?? 0;
    const baseY = cfg.lines.length > 1 ? y - 8 + dy : y - 3 + dy;
    const tspans = cfg.lines.map((line, i) => `<tspan x="${r1(tx)}" dy="${i ? 15 : 0}">${esc(line)}</tspan>`).join("");
    out.push(
      `<g data-hospital="${esc(h.slug)}" data-x="${r1(x)}" data-y="${r1(y)}">${pin(x, y, 14)}<text class="t-hosp" data-label="" x="${r1(tx)}" y="${r1(baseY)}" text-anchor="${cfg.anchor}" fill-opacity="0.85">${tspans}</text></g>`,
    );
  }
  out.push(`</g>`);

  // Client route layer (dotted line from a city to the Medical Center)
  out.push(`<g data-route-layer=""></g>`);

  // Core cities
  out.push(`<g data-cities="" class="t-display" font-size="26" font-weight="700" fill="${WHITE}">`);
  for (const a of site.coreAreas) {
    const cfg = CORE_LABEL[a.slug] ?? { anchor: "start" as Anchor };
    const [x, y] = cfg.at ? project(cfg.at) : geoXY(a.geo);
    const tx = cfg.anchor === "end" ? x - 15 : cfg.anchor === "middle" ? x : x + 15;
    const ty = cfg.anchor === "middle" ? y - 26 : y - 2;
    out.push(
      `<g data-city="${esc(a.slug)}" id="city-${esc(a.slug)}" data-name="${esc(a.name)}" data-x="${r1(x)}" data-y="${r1(y)}">` +
        `<circle cx="${r1(x)}" cy="${r1(y - 6)}" r="40" fill="transparent" pointer-events="all"/>` +
        pin(x, y, 18) +
        `<text class="t-core" data-label="" x="${r1(tx)}" y="${r1(ty)}" text-anchor="${cfg.anchor}" fill-opacity="0.92">${esc(a.name)}</text></g>`,
    );
  }
  out.push(`</g>`);

  // Texas Medical Center
  {
    const [x, y] = project([-95.398, 29.707]);
    out.push(
      `<g data-tmc="" data-x="${r1(x)}" data-y="${r1(y)}" class="t-text" fill="${WHITE}">` +
        `<g data-tmc-ring="" style="transform-origin:${r1(x)}px ${r1(y)}px"><circle cx="${r1(x)}" cy="${r1(y)}" r="7.5" fill="none" stroke="${WHITE}" stroke-width="2.5"/><circle cx="${r1(x)}" cy="${r1(y)}" r="2.5"/></g>` +
        `<text class="t-tmc" data-label="" x="${r1(x - 14)}" y="${r1(y + 5)}" text-anchor="end" font-size="14" font-weight="700">Texas Medical Center</text></g>`,
    );
  }

  out.push(`<g data-chip-anchor=""></g>`);
  out.push(`</g>`); // clip
  out.push(`</svg>`);

  const svg = out.join("\n") + "\n";
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, svg);

  const bytes = Buffer.byteLength(svg);
  console.log(`Wrote ${outFile} (${(bytes / 1024).toFixed(1)} KB, ${bytes} bytes)`);
  console.log(`Geometry source: ${source}`);
  console.log(`Projection: lon ${LON_MIN.toFixed(3)}..${LON_MAX.toFixed(3)}, lat ${LAT_MIN}..${LAT_MAX} → ${W}×${H}`);
  const [tx, ty] = project([-95.398, 29.707]);
  console.log(`TMC marker at (${r1(tx)}, ${r1(ty)})`);

  // Brand guard: amber appears only inside pins.
  const amberOutsidePins = svg.replace(/<path d="[^"]+" fill="#E8A33D" data-pin=""\/>/g, "").match(/#E8A33D/gi);
  if (amberOutsidePins) throw new Error("Amber used outside a pin");
  const hexes = new Set((svg.match(/#[0-9a-fA-F]{6}\b/g) ?? []).map((h) => h.toUpperCase()));
  const allowed = new Set([NAVY, AMBER, MORNING, WHITE].map((h) => h.toUpperCase()));
  for (const h of hexes) if (!allowed.has(h)) throw new Error(`Off-brand colour ${h}`);
  if (bytes > 120 * 1024) throw new Error(`SVG is ${bytes} bytes; limit is 120 KB`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
