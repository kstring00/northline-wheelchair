// Brand acceptance (Brand Guidelines + brand insert §9). Two parts:
//   Static (always): every colour literal in the codebase, every amber use,
//     every uppercase use, the /public inventory, pattern SVG sizes.
//   Runtime (needs the server on BASE_URL): logo tones, pin colour, header and
//     footer clear space, 24px minimum, computed amber uses, pattern count.
// Writes reports/brand.json. Exit 1 on any FAIL.
import { readFileSync, readdirSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const report = { stray: [], amber: [], uppercase: [], publicFiles: [], patterns: [], runtime: {} };
let fails = 0;
const fail = (msg) => { fails++; console.log(`FAIL  ${msg}`); };
const pass = (msg) => console.log(`PASS  ${msg}`);
const info = (msg) => console.log(`      ${msg}`);

const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});

// ---------- 1. Colour literals ----------
const css = readFileSync(join(ROOT, "src/app/globals.css"), "utf8");
const tokens = Object.fromEntries([...css.matchAll(/--color-([a-z]+):\s*(#[0-9a-f]{6})/gi)].map(([, k, v]) => [v.toLowerCase(), k]));
const toHex = (r, g, b) => "#" + [r, g, b].map((n) => Number(n).toString(16).padStart(2, "0")).join("");
const SELF = ["scripts/brand-check.mjs"];
const files = [...walk(join(ROOT, "src")), ...walk(join(ROOT, "scripts")), ...walk(join(ROOT, "public")).filter((f) => f.endsWith(".svg"))]
  .filter((f) => /\.(tsx?|mjs|css|svg|sh)$/.test(f) && !SELF.includes(relative(ROOT, f)));
const literals = [];
for (const f of files) {
  readFileSync(f, "utf8").split("\n").forEach((line, i) => {
    const at = `${relative(ROOT, f)}:${i + 1}`;
    for (const m of line.matchAll(/(?:#|%23)([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)) {
      let h = m[1].toLowerCase();
      if (h.length === 3) h = [...h].map((c) => c + c).join("");
      literals.push({ at, value: `#${h}` });
    }
    for (const m of line.matchAll(/rgba?\(\s*(\d+)[\s,_]+(\d+)[\s,_]+(\d+)/g)) literals.push({ at, value: toHex(m[1], m[2], m[3]) });
    if (/\b(hsl|oklch|lab|lch)\(/.test(line)) literals.push({ at, value: line.match(/\b(hsl|oklch|lab|lch)\([^)]*\)/)[0] });
  });
}
const stray = literals.filter((l) => !tokens[l.value]);
report.stray = stray;
if (stray.length) { fail(`${stray.length} colour literal(s) outside the six tokens + white:`); stray.forEach((s) => info(`${s.value}  ${s.at}`)); }
else pass(`colour literals: ${literals.length} found, all are brand tokens (${[...new Set(literals.map((l) => tokens[l.value]))].join(", ")})`);

// ---------- 2. Amber uses in source ----------
// Allowed: the pin, the primary button, a route line. The Ride Card's amber tag
// pill is specified by the brand insert (§5) and listed separately.
const amberRules = [
  [/Logo\.tsx$|logomark\.svg$|pin\.svg$|make-icons\.mjs$|opengraph-image\.tsx$|app\/icon\.svg$/, "pin"],
  [/Button\.tsx$|MobileActionBar\.tsx$/, "primary button"],
  [/HeroMap\.tsx$/, "route line / pin (hero map demo)"],
  [/build-map\.ts$|service-map\.svg$|map-data\//, "pin (service map)"],
  [/lib\/email\.ts$/, "Pending tag in the booking email"],
  [/RideCard\.tsx$/, "Ride Card tag (brand insert §5)"],
  [/globals\.css$|contrast\.mjs$/, "token definition / check"],
  [/app\/brand\/page\.tsx$/, "brand sheet swatch (/brand, internal)"],
];
for (const f of files) {
  readFileSync(f, "utf8").split("\n").forEach((line, i) => {
    if (!/\bamber\b|e8a33d/i.test(line) || /^\s*(\/\/|\*|\/\*)/.test(line)) return;
    const rel = relative(ROOT, f);
    const kind = amberRules.find(([re]) => re.test(rel))?.[1] ?? "OTHER";
    report.amber.push({ at: `${rel}:${i + 1}`, kind });
  });
}
const amberOther = report.amber.filter((a) => a.kind === "OTHER");
info(`amber in source: ${report.amber.length} line(s)`);
for (const k of [...new Set(report.amber.map((a) => a.kind))]) info(`  ${k}: ${report.amber.filter((a) => a.kind === k).map((a) => a.at).join(", ")}`);
if (amberOther.length) fail(`amber outside pin / primary button / route line: ${amberOther.map((a) => a.at).join(", ")}`);
else pass("amber only on the pin, the primary button, the route line (and the specified Ride Card tag)");

// ---------- 3. Uppercase ----------
for (const f of files.filter((f) => /\.(tsx|css)$/.test(f))) {
  readFileSync(f, "utf8").split("\n").forEach((line, i) => {
    if (/\buppercase\b|text-transform:\s*uppercase/.test(line)) report.uppercase.push(`${relative(ROOT, f)}:${i + 1}`);
  });
}
info(`uppercase (labels, tagline, poster, Ride Card labels): ${report.uppercase.join(", ")}`);

// ---------- 4. /public inventory ----------
for (const f of walk(join(ROOT, "public"))) {
  const rel = relative(join(ROOT, "public"), f);
  const kind = rel.startsWith("brand/") && rel.endsWith(".svg") ? "brand SVG"
    : /^icon-.*\.png$|^logo\.png$/.test(rel) ? "icon (generated from the logomark)"
    : /^images\/.*(placeholder|owner-jay)\.jpg$/.test(rel) ? "photo placeholder (flat, no illustration)"
    : "UNCLASSIFIED";
  report.publicFiles.push({ file: rel, bytes: statSync(f).size, kind });
}
const unclassified = report.publicFiles.filter((p) => p.kind === "UNCLASSIFIED");
report.publicFiles.forEach((p) => info(`/public/${p.file}  ${(p.bytes / 1024).toFixed(1)} KB  ${p.kind}`));
if (unclassified.length) fail(`files in /public that are not a brand SVG, icon or photo placeholder: ${unclassified.map((p) => p.file).join(", ")}`);
else pass("/public holds only brand SVGs, generated icons and photo placeholders");

// ---------- 5. Pattern SVGs ----------
for (const name of ["pattern-navy.svg", "pattern-sand.svg"]) {
  const p = join(ROOT, "public/brand", name);
  let src;
  try { src = readFileSync(p, "utf8"); } catch { fail(`/public/brand/${name} is missing`); continue; }
  const kb = statSync(p).size / 1024;
  const provisional = src.includes("PROVISIONAL");
  report.patterns.push({ name, kb: +kb.toFixed(1), provisional });
  if (kb >= 60) fail(`${name} is ${kb.toFixed(1)} KB (limit 60 KB)`);
  else pass(`${name} ${kb.toFixed(1)} KB (< 60 KB)${provisional ? "  [PROVISIONAL stand-in: replace with the brand book export]" : ""}`);
  if (/E8A33D/i.test(src)) fail(`${name} contains amber: the route belongs only on the hero overlay`);
}

// ---------- 6. Runtime ----------
let chromium;
try { ({ chromium } = await import("@playwright/test")); } catch { /* no playwright */ }
const up = await fetch(BASE).then((r) => r.ok).catch(() => false);
if (!chromium || !up) {
  info(`runtime checks skipped (server not reachable at ${BASE})`);
} else {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
  const AMBER = "rgb(232, 163, 61)";
  const toneRgb = { navy: "rgb(22, 40, 74)", white: "rgb(255, 255, 255)", ink: "rgb(30, 37, 51)" };
  for (const vp of [{ name: "desktop", width: 1440, height: 900 }, { name: "mobile", width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    for (const path of ["/", "/about", "/book", "/partners", "/contact", "/pricing", "/this-page-does-not-exist", "/brand"]) {
      await page.goto(BASE + path, { waitUntil: "networkidle" });
      const r = await page.evaluate(({ AMBER, toneRgb }) => {
        const vis = (el) => { const cs = getComputedStyle(el); const b = el.getBoundingClientRect(); return cs.display !== "none" && cs.visibility !== "hidden" && b.width > 0 && b.height > 0; };
        const out = { logos: [], pins: [], amber: [], patterns: 0, heroRoutes: 0, heroRoutesOutsideHero: 0, clear: [] };
        for (const el of document.querySelectorAll("[data-logo]")) {
          if (!vis(el)) continue;
          const tone = el.dataset.logoTone;
          const b = el.getBoundingClientRect();
          const pad = parseFloat(getComputedStyle(el).paddingTop) || 0;
          out.logos.push({ variant: el.dataset.logo, tone, color: getComputedStyle(el).color, want: toneRgb[tone], height: b.height - 2 * pad });
        }
        for (const p of document.querySelectorAll("[data-pin]")) out.pins.push(getComputedStyle(p).fill);
        // Clear space: header and footer logos. Padding must be >= N height and no
        // other visible element may overlap the padded box.
        for (const [where, sel] of [["header", "header a[href='/'] [data-logo]"], ["footer", "footer [data-logo]"]]) {
          for (const el of document.querySelectorAll(sel)) {
            if (!vis(el)) continue;
            const pad = parseFloat(getComputedStyle(el).paddingTop);
            const want = parseFloat(getComputedStyle(el).getPropertyValue("--logo-clear"));
            const box = el.getBoundingClientRect();
            const scope = el.closest(where);
            const hits = [...scope.querySelectorAll("a, button, p, h2, nav, ul, address, img, [data-contact-block]")].filter((o) => {
              if (el.contains(o) || o.contains(el) || !vis(o)) return false;
              const q = o.getBoundingClientRect();
              return q.left < box.right - 0.5 && q.right > box.left + 0.5 && q.top < box.bottom - 0.5 && q.bottom > box.top + 0.5;
            }).map((o) => o.tagName + (o.textContent ?? "").trim().slice(0, 20));
            out.clear.push({ where, pad, want, hits });
          }
        }
        // Computed amber: where does it show up?
        for (const el of document.querySelectorAll("body *")) {
          if (!vis(el) && el.tagName !== "circle" && el.tagName !== "path") continue;
          const cs = getComputedStyle(el);
          const props = ["color", "backgroundColor", "borderTopColor", "fill", "stroke", "outlineColor"].filter((p) => cs[p] === AMBER);
          if (!props.length) continue;
          if (props.every((p) => p === "color" || p === "borderTopColor" || p === "outlineColor") && !el.textContent.trim() && cs.borderTopWidth === "0px" && cs.outlineStyle === "none") continue;
          const kind = el.closest("[data-pin]") || el.matches("[data-pin]") ? "pin"
            : el.closest("[data-route]") ? "route line"
            : el.closest("[data-ride-card]") ? "Ride Card tag"
            : /\bbg-amber\b/.test(el.className?.baseVal ?? el.className) ? "primary button"
            : "OTHER";
          out.amber.push({ kind, props, el: el.tagName.toLowerCase() + ":" + (el.textContent ?? "").trim().slice(0, 30) });
        }
        for (const el of document.querySelectorAll(".pattern-navy, .pattern-sand")) {
          if (el.closest("footer") || el.closest("#hero") || el.matches("[data-ride-card-back]")) continue;
          out.patterns++;
        }
        out.heroRoutes = document.querySelectorAll("[data-route='hero']").length;
        out.heroRoutesOutsideHero = [...document.querySelectorAll("[data-route='hero']")].filter((e) => !e.closest("#hero")).length;
        return out;
      }, { AMBER, toneRgb });
      const tag = `${vp.name} ${path}`;
      report.runtime[tag] = r;
      const badTone = r.logos.filter((l) => l.color !== l.want);
      const tiny = r.logos.filter((l) => l.height < 24);
      const badPins = r.pins.filter((f) => f !== AMBER);
      const other = r.amber.filter((a) => a.kind === "OTHER");
      const clearBad = r.clear.filter((c) => c.pad + 0.5 < c.want || c.want <= 0 || c.hits.length);
      const tones = [...new Set(r.logos.map((l) => l.tone))].join("/");
      if (badTone.length) fail(`${tag}: logo colour wrong ${JSON.stringify(badTone)}`);
      if (tiny.length) fail(`${tag}: logo under 24px tall ${JSON.stringify(tiny)}`);
      if (badPins.length) fail(`${tag}: pin recoloured: ${badPins.join(", ")}`);
      if (other.length) fail(`${tag}: amber outside pin/button/route: ${JSON.stringify(other)}`);
      if (clearBad.length) fail(`${tag}: logo clear space ${JSON.stringify(clearBad)}`);
      if (r.patterns > 1) fail(`${tag}: ${r.patterns} patterned section grounds (max 1)`);
      if (r.heroRoutes > 1 || r.heroRoutesOutsideHero) fail(`${tag}: amber pattern route ${r.heroRoutes}× (${r.heroRoutesOutsideHero} outside hero)`);
      if (!badTone.length && !tiny.length && !badPins.length && !other.length && !clearBad.length && r.patterns <= 1) {
        const kinds = [...new Set(r.amber.map((a) => a.kind))].join(", ");
        pass(`${tag}: ${r.logos.length} logo(s) [${tones}], ${r.pins.length} pin(s) amber, clear space ok (${r.clear.map((c) => `${c.where} ${c.pad}px ≥ ${c.want}px`).join("; ") || "n/a"}), amber on: ${kinds}, patterned grounds: ${r.patterns}`);
      }
    }
    await page.close();
  }
  await browser.close();
}

mkdirSync(join(ROOT, "reports"), { recursive: true });
writeFileSync(join(ROOT, "reports/brand.json"), JSON.stringify(report, null, 2));
console.log(fails ? `\n${fails} brand check(s) failed` : "\nAll brand checks passed");
process.exit(fails ? 1 : 0);
