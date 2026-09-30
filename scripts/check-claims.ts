// Stage 2 of the claims check (runs postbuild and in CI).
//
// Reads every prerendered page in .next/server/app and fails if a claim
// renders while the site.ts field that should back it is null or empty.
// Stage 1 (scripts/check-copy.mjs) already stops claims being written as
// literal copy; this catches everything that reaches the HTML.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { site } from "../src/config/site";

const APP = join(process.cwd(), ".next/server/app");
if (!existsSync(APP)) {
  console.error("check:claims: no build output at .next/server/app. Run `next build` first.");
  process.exit(1);
}
const walk = (dir: string): string[] => readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const pages = walk(APP).filter((f) => f.endsWith(".html"));

const p = site.pricing;
const anyPrice = [p.base, p.perMile, p.waitPerHour, p.companionFee, p.afterHoursFee].some((v) => v !== null);
const rules: { name: string; re: RegExp; allowed: boolean; field: string }[] = [
  { name: "years", re: /\b\d+\+?\s+years\b/i, allowed: site.stats.years !== null || site.team.some((m) => m.yearsDriving !== null), field: "stats.years / team[].yearsDriving" },
  { name: "rides completed", re: /rides completed/i, allowed: site.stats.rides !== null, field: "stats.rides" },
  { name: "on-time", re: /\bon-time\b/i, allowed: site.stats.onTimeRate !== null, field: "stats.onTimeRate" },
  { name: "$ amount", re: /\$\s?\d/, allowed: anyPrice, field: "pricing.base / perMile / waitPerHour / companionFee / afterHoursFee" },
  { name: "Net-30", re: /\bnet-30\b/i, allowed: /net-30/i.test(site.partners.invoicing ?? ""), field: "partners.invoicing" },
  { name: "insured", re: /\binsured\b/i, allowed: site.safety.insurance !== null, field: "safety.insurance" },
  { name: "certified", re: /\bcertified\b/i, allowed: site.safety.driverTraining.length > 0 || site.team.some((m) => m.certifications.length > 0), field: "safety.driverTraining / team[].certifications" },
  { name: "background-check", re: /\bbackground[- ]check/i, allowed: site.safety.driverScreening.length > 0, field: "safety.driverScreening" },
  { name: "text promise", re: /\b(text you|by text|we text|call or text)\b/i, allowed: site.smsEnabled, field: "smsEnabled" },
];

const visible = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");

const hits: string[] = [];
for (const f of pages) {
  const html = readFileSync(f, "utf8");
  // Visible text plus meta descriptions and titles (they're copy too).
  const meta = [...html.matchAll(/<(?:meta[^>]+content|title)[^>]*?(?:="([^"]*)"|>([^<]*)<)/g)].map((m) => m[1] ?? m[2] ?? "").join(" ");
  const text = `${visible(html)} ${meta}`;
  for (const r of rules) {
    if (r.allowed) continue;
    const m = text.match(r.re);
    if (m) {
      const at = Math.max(0, (m.index ?? 0) - 50);
      hits.push(`/${relative(APP, f).replace(/\.html$/, "").replace(/^index$/, "")}  ${r.name} (needs ${r.field}): …${text.slice(at, at + 120).trim()}…`);
    }
  }
}

if (hits.length) {
  console.error(`check:claims FAILED. These pages show claims whose site.ts field is still null:\n  ${hits.join("\n  ")}`);
  process.exit(1);
}
console.log(`check:claims passed (${pages.length} pages)`);
