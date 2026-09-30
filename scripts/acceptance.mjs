// Phase 1.5 acceptance checks against a running production build:
//  - service + place in title, H1 and first sentence of every service/city/hospital page
//  - banned words across rendered pages (lorem, exceptional, unparalleled, solutions)
//  - "NEMT" only on Home intro and /faq
//  - no iframes or external scripts/widgets
//  - stats strip / on-time promise present on Home
//  - drafts excluded from sitemap and noindexed
//  - Review/AggregateRating absent unless real reviews exist
// Plus a source grep for lorem / CONFIRM / banned words (reported, not failed).
import { execSync } from "node:child_process";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
let fails = 0;
const check = (n, ok, d = "") => { if (!ok) fails++; console.log(`${ok ? "PASS" : "FAIL"}  ${n}${d ? `  (${d})` : ""}`); };
const html = async (p) => (await fetch(BASE + p)).text();
const text = (h) => h.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&apos;|&#x27;/g, "'").replace(/\s+/g, " ");
const get = (h, re) => (h.match(re) ?? [])[1] ?? "";

const sitemap = await html("/sitemap.xml");
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);

// 1. service + place
const placeRe = /(Houston|Spring|Humble|The Woodlands|Cypress|Willowbrook)/i;
const serviceRe = /(wheelchair|ride|rides|transportation|dialysis|discharge|senior|patient)/i;
for (const p of urls.filter((u) => /^\/(services|service-area)\//.test(u))) {
  const h = await html(p);
  const title = get(h, /<title>([^<]+)<\/title>/);
  const h1 = text(get(h, /<h1[^>]*>([\s\S]*?)<\/h1>/));
  const main = text(get(h, /<main[\s\S]*?<h1[\s\S]*?<\/h1>([\s\S]*?)<\/section>/));
  const first = main.replace(/\bSt\. /g, "St ").split(/(?<=[.!?])\s/)[0] ?? "";
  const ok = [title, h1, first].every((s) => placeRe.test(s) && serviceRe.test(s));
  check(`service + place: ${p}`, ok, ok ? "" : `title="${title}" h1="${h1}" first="${first.slice(0, 80)}"`);
}
check("Home title is 'Wheelchair Transportation in North Houston | Northline…'", get(await html("/"), /<title>([^<]+)<\/title>/).startsWith("Wheelchair Transportation in North Houston | Northline Wheelchair Transportation"));

// 2. banned words + NEMT placement + iframes + external scripts
const banned = /\b(lorem|exceptional|unparalleled|solutions|mobility needs)\b/i;
const allPages = [...urls, "/book"];
let nemt = [];
for (const p of allPages) {
  const h = await html(p);
  const t = text(h);
  const m = t.match(banned);
  check(`no banned words: ${p}`, !m, m ? m[0] : "");
  const count = (t.match(/\bNEMT\b|non-emergency medical transportation/gi) ?? []).length;
  if (count) nemt.push(`${p}:${count}`);
  check(`no iframes: ${p}`, !/<iframe/i.test(h));
  const ext = [...h.matchAll(/<script[^>]+src="(https?:)?\/\/([^/"]+)/g)].map((x) => x[2]).filter((d) => !/localhost/.test(d));
  check(`no external scripts: ${p}`, ext.length === 0, ext.join(","));
}
check("NEMT phrasing only on Home and /faq", nemt.every((x) => x.startsWith("/:") || x.startsWith("/faq:")), nemt.join(" "));

// 3. Home: on-time promise above the fold (inside hero section) and stats strip present
const home = await html("/");
check("On-time promise renders inside hero section", /<section id="hero"[\s\S]*How we make sure you're never late[\s\S]*<\/section>/.test(text(home).length ? home.replace(/&#x27;/g, "'") : home));
check("Stats strip present with 3 numbers", (home.replace(/<script[\s\S]*?<\/script>/g, "").match(/data-countup-value/g) ?? []).length === 3);

// 4. drafts
const drafts = ["/guides/first-wheelchair-van-ride", "/guides/recurring-dialysis-rides-checklist", "/guides/hospital-discharge-ride-home"];
check("Draft guides excluded from sitemap", drafts.every((d) => !urls.includes(d)));
for (const d of drafts) {
  const h = await html(d);
  check(`Draft noindex + label: ${d}`, /content="noindex, nofollow"/.test(h) && /Draft, pending approval/.test(h));
}
check("Hospital drop-off notes carry draft label", /Drop-off notes: draft/.test(await html("/service-area/hospitals/hca-houston-healthcare-northwest")));

// 5. schema gating
check("No AggregateRating/Review while reviews are placeholders", !/AggregateRating|"@type":"Review"/.test(home));
check("priceRange present when displayMode != quoteOnly", /"priceRange"/.test(home));
check("FAQPage on every service page", (await Promise.all(urls.filter((u) => u.startsWith("/services/")).map(html))).every((h) => /"@type":"FAQPage"/.test(h)));

// 6. sticky bar + success screens show responseTime
check("Sticky bar shows callback window", /Callback within 30 minutes/.test(home));

// 7. source grep report
console.log("\nSource grep (reported, not scored):");
for (const w of ["lorem", "CONFIRM", "exceptional", "unparalleled", "solutions"]) {
  let n = 0;
  try { n = Number(execSync(`grep -rIic "${w}" src | awk -F: '{s+=$2} END {print s}'`).toString().trim()); } catch {}
  console.log(`  ${w.padEnd(13)} ${n}`);
}
console.log(fails ? `\n${fails} acceptance check(s) FAILED` : "\nAll acceptance checks passed");
process.exit(fails ? 1 : 0);
