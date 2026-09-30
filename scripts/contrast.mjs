// Verifies every text/background pair against WCAG targets. Colours are read
// from the six brand tokens in globals.css (no hand-kept copy). Opacity steps
// (ink/85 muted text, cream/80 on navy…) are blended onto their ground first.
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
const T = Object.fromEntries([...css.matchAll(/--color-([a-z]+):\s*(#[0-9a-f]{6})/gi)].map(([, k, v]) => [k, v]));
const need = ["navy", "amber", "cream", "ink", "morning", "sand", "white"];
const missing = need.filter((k) => !T[k]);
if (missing.length) { console.log(`FAIL  missing tokens: ${missing.join(", ")}`); process.exit(1); }

const rgb = (h) => h.replace("#", "").match(/../g).map((x) => parseInt(x, 16));
const mix = (fg, bg, a) => "#" + rgb(fg).map((c, i) => Math.round(a * c + (1 - a) * rgb(bg)[i]).toString(16).padStart(2, "0")).join("");
const lum = (h) => { const [r, g, b] = rgb(h).map((c) => c / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
/** "ink" or "ink/85" → a hex, blended onto `bg` when it has an opacity. */
const col = (spec, bg) => { const [k, a] = spec.split("/"); return a ? mix(T[k], T[bg], Number(a) / 100) : T[k]; };

const pairs = [
  // Brand Guidelines 2.1 / brand insert §2 (the required pairs).
  ["Ink on Cream (body text)", "ink", "cream", 7],
  ["Navy on Cream (headings, links)", "navy", "cream", 7],
  ["Ink on Amber (primary button text)", "ink", "amber", 4.5],
  // Every other text/ground pair in use.
  ["Ink on White", "ink", "white", 7], ["Ink on Sand", "ink", "sand", 7], ["Ink on Morning", "ink", "morning", 7],
  ["Navy on White", "navy", "white", 7], ["Navy on Sand", "navy", "sand", 7], ["Navy on Morning", "navy", "morning", 7],
  ["Muted ink/85 on Cream", "ink/85", "cream", 7], ["Muted ink/85 on White", "ink/85", "white", 7],
  ["Muted ink/85 on Sand", "ink/85", "sand", 7], ["Muted ink/85 on Morning", "ink/85", "morning", 7],
  ["White on Navy", "white", "navy", 7], ["Cream on Navy", "cream", "navy", 7], ["Muted cream/80 on Navy", "cream/80", "navy", 7],
  ["Placeholder ink/70 on White", "ink/70", "white", 4.5],
  // Non-text (3:1).
  ["Focus ring Navy vs Cream", "navy", "cream", 3], ["Focus ring Cream vs Navy (dark sections)", "cream", "navy", 3],
  ["Input border ink/60 vs White", "ink/60", "white", 3], ["Amber pin vs Navy", "amber", "navy", 3],
];
let fail = 0;
for (const [label, fg, bg, min] of pairs) {
  const r = ratio(col(fg, bg), T[bg]);
  const ok = r >= min;
  if (!ok) fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${r.toFixed(2).padStart(5)}:1  (need ${min})  ${label}`);
}
process.exit(fail ? 1 : 0);
