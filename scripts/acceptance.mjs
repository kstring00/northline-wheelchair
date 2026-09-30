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
import { existsSync, readFileSync } from "node:fs";

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
check("NEMT phrasing only on Home, /faq and the wheelchair service page", nemt.every((x) => /^\/(faq|services\/wheelchair-transportation)?:/.test(x)), nemt.join(" "));
check("NEMT parenthetical on Home and the wheelchair service page", nemt.some((x) => x.startsWith("/:")) && nemt.some((x) => x.startsWith("/services/wheelchair-transportation:")), nemt.join(" "));

// 3. Home: on-time promise above the fold (inside hero section) and stats strip present
const home = await html("/");
check("On-time promise renders inside hero section", /<section id="hero"[\s\S]*How we make sure you're never late[\s\S]*<\/section>/.test(text(home).length ? home.replace(/&#x27;/g, "'") : home));
// A1: stats are null in site.ts, so the strip must be absent (no section, no zeros).
{
  const noScripts = (h) => h.replace(/<script[\s\S]*?<\/script>/g, "");
  const about = await html("/about");
  check("Stats strip absent while stats are null (Home)", !/data-countup|Northline by the numbers/.test(noScripts(home)));
  check("Stats strip absent while stats are null (/about)", !/data-countup|Northline by the numbers/.test(noScripts(about)));
}

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
check("priceRange absent while pricing is unconfirmed", !/"priceRange"/.test(home));
check("FAQPage on every service page", (await Promise.all(urls.filter((u) => u.startsWith("/services/")).map(html))).every((h) => /"@type":"FAQPage"/.test(h)));

// 6a. Homepage revision 3
{
  const h = home;
  const services = h.match(/<ul data-service-list[\s\S]*?<\/ul>/)?.[0] ?? "";
  check("Services list: five rows, headings are links", (services.match(/<h3[^>]*>\s*<a /g) ?? []).length === 5, String((services.match(/<h3/g) ?? []).length));
  check("Services list: no cards, shadows, numbers or Learn more", services && !/shadow|rounded-\[var|lift-card|Learn more|>0\d</.test(services) && !/<svg/.test(services));
  check("Services list: For facilities not in the list", !/For facilities/.test(services) && /facilities work with us/.test(h));
  // The hero holds a nested <section> (the promise), so cut at the next top-level section instead.
  const hero = h.slice(h.indexOf('<section id="hero"'), h.indexOf('aria-label="Northline by the numbers"'));
  check("Hero: headline text", /Wheelchair van rides in north Houston\./.test(hero));
  check("Hero: one line under it", /On time, every ride\. We call you back within 30 minutes\s?\./.test(text(hero)));
  check("Hero: deleted lines gone", !/Non-emergency medical transportation, in plain words|know the price before you ride|See how pricing works|for you or someone you love/.test(hero));
  const heroLeft = hero.split("data-hero-map")[0];
  check("Hero: no uppercase except the pill, no poster class", !/poster/.test(heroLeft) && (heroLeft.match(/uppercase/g) ?? []).length === 0);
  check("Owner: placeholder text present verbatim", /Jay(&#x27;|')s story goes here — how Northline started and why, in his own words, from questionnaire Q11\. Nothing on this site describes Jay(&#x27;|')s life until he writes it\./.test(h) && /\[Jay(&#x27;|')s headline, in his words\]/.test(h) && /A note from the owner/i.test(h));
  check("Owner: no 'dad' anywhere on Home or /about", !/\bdad\b/i.test(text(h)) && !/\bdad\b/i.test(text(await html("/about"))));
  const reviews = h.match(/<section id="reviews"[\s\S]*?<\/section>/)?.[0] ?? "";
  check("Reviews: honest empty state", /We ask every rider for a review after the ride\./.test(reviews) && /Northline is new\./.test(reviews) && /data-reviews="empty"/.test(reviews));
  check("Reviews: zero review/star/quote elements while reviews[] is empty", !/data-review\b|data-review-stars|<blockquote|Example review/.test(reviews) && !/data-google-rating/.test(reviews));
  check("Reviews: SMS template exists", existsSync("src/content/sms.ts") && /reviewRequestSms/.test(readFileSync("src/content/sms.ts", "utf8")));
  // Hero map
  const heroMapSrc = readFileSync("src/components/home/HeroMap.tsx", "utf8");
  const hospitalNames = JSON.parse(execSync("node -e \"const s=require('fs').readFileSync('src/config/site.ts','utf8');console.log(JSON.stringify([...s.matchAll(/name: \\\"([^\\\"]+(Hospital|Medical Center|Healthcare)[^\\\"]*)\\\"/g)].map(m=>m[1])))\"").toString());
  check("HeroMap: no hardcoded destination names", hospitalNames.length > 0 && hospitalNames.every((n) => !heroMapSrc.includes(n)), hospitalNames.filter((n) => heroMapSrc.includes(n)).join(","));
  const heroMapHtml = hero.slice(hero.indexOf("data-hero-map"), hero.indexOf("Move your pointer or tap"));
  check("HeroMap: no ETA / minutes string", !/\bETA\b|minutes|\d+\s*min\b/i.test(heroMapSrc.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, "")) && !/\bETA\b|\bmin(ute)?s?\b/i.test(text(heroMapHtml)));
  check("HeroMap: rendered after the headline and CTA", hero.indexOf("data-hero-map") > hero.indexOf("data-hero-cta") && hero.indexOf("data-hero-cta") > hero.indexOf("hero-heading"));
  check("HeroMap: caption text", /Move your pointer or tap: the route draws from your door\./.test(hero));
  // Service map
  const areas = h.match(/<section id="areas"[\s\S]*?<\/section>/)?.[0] ?? "";
  check("Service map: SVG committed", existsSync("public/brand/service-map.svg") && !execSync("git status --porcelain public/brand/service-map.svg").toString().trim().startsWith("??"));
  check("Service map: renders without JS (inline SVG with freeways, cities, TMC)", /<svg[^>]*id="nl-service-map"/.test(areas) && /data-freeway/.test(areas) && /data-city="spring"/.test(areas) && /data-tmc/.test(areas));
  const cityLinks = ["houston", "spring", "humble", "the-woodlands", "cypress"].filter((c) => /wheelchair transportation/.test(text(areas.match(new RegExp(`<a[^>]+href="/service-area/${c}"[^>]*>[\\s\\S]*?</a>`))?.[0] ?? "")));
  check("Service map: five core city <a> links in the HTML", cityLinks.length === 5, cityLinks.join(","));
  check("Service map: hand-traced geometry declared in the SVG", /geometry: (hand-traced|OpenStreetMap)/.test(readFileSync("public/brand/service-map.svg", "utf8")));
  check("Ride Card: sample tag on the partners sample", /data-sample="true"[\s\S]*?Sample Ride Card\. Names, times and driver are examples\./.test((await html("/partners")).replace(/\n/g, " ")) || /data-sample-tag/.test(await html("/partners")));
}

// 6p. Facility (B2B) path: /partners packet + account form, landing pages, old service URL
{
  const h = await html("/partners");
  const t = text(h);
  const packet = ["Rate sheet (PDF)", "Certificate of Insurance", "W-9", "Driver credential summary", "Vehicle spec"];
  const buttons = [...h.matchAll(/<button[^>]*data-packet-button="[^"]+"[^>]*>([\s\S]*?)<\/button>/g)].map((m) => text(m[1]).trim());
  check("/partners: five packet buttons", buttons.length === 5 && packet.every((p) => buttons.some((b) => b.includes(p))), buttons.join(" | "));
  const ids = ["acct-facility", "acct-facilityType", "acct-contactName", "acct-role", "acct-phone", "acct-email", "acct-billingName", "acct-billingEmail", "acct-poRequired", "acct-bookers", "acct-volume", "acct-standing", "acct-notes", "acct-website", "acct-standing-toggle", "acct-standing-rows"];
  const missing = ids.filter((id) => !new RegExp(`id="${id}"`).test(h));
  check("/partners: account form fields present by id", missing.length === 0, missing.join(","));
  const packetIds = ["pk-items", "pk-name", "pk-facility", "pk-role", "pk-email", "pk-website"].filter((id) => !new RegExp(`id="${id}"`).test(h));
  check("/partners: packet form fields present by id", packetIds.length === 0, packetIds.join(","));
  check("/partners: standing expander wired (aria-expanded/aria-controls)", /aria-expanded="false"[^>]*aria-controls="acct-standing-rows"|aria-controls="acct-standing-rows"[^>]*aria-expanded="false"/.test(h) || /id="acct-standing-toggle"[^>]*aria-expanded/.test(h));
  check(
    "/partners: PHI notice verbatim",
    t.includes("Initials only. Please don't send names, dates of birth, diagnoses or street addresses here. We'll take the pickup address by phone."),
  );
  const dispatchNull = /dispatchPhone:\s*null/.test(readFileSync("src/config/site.ts", "utf8"));
  check("/partners: 'Ask for dispatch.' shown while dispatchPhone is null", !dispatchNull || t.includes("Ask for dispatch."));
  check("/partners: packet intro line", t.includes("We'll email what you ask for as soon as it's ready. Nothing is posted here."));
  const invented = ["Net-30", "Jay still takes", "Drop-off notes on file", "Early chairs"].filter((s) => t.includes(s));
  check("/partners: no invented claims", invented.length === 0, invented.join(","));
  check("/partners: no hosted packet files", !/href="[^"]+\.(pdf|docx?)"/i.test(h));
  check("/partners: H1", /<h1[^>]*>Patient rides for facilities in north Houston<\/h1>/.test(h));
  check("/partners: links to both landing pages", /href="\/partners\/dialysis"/.test(h) && /href="\/partners\/discharge"/.test(h));
  for (const [p, h1] of [["/partners/dialysis", "Dialysis transportation contracts in north Houston"], ["/partners/discharge", "Hospital discharge transportation for case managers in north Houston"]]) {
    const r = await fetch(BASE + p);
    const body = await r.text();
    check(`${p}: 200 with H1`, r.status === 200 && text(get(body, /<h1[^>]*>([\s\S]*?)<\/h1>/)).trim() === h1, `${r.status} "${text(get(body, /<h1[^>]*>([\s\S]*?)<\/h1>/)).trim()}"`);
    check(`${p}: links to /partners#account`, /href="\/partners#account"/.test(body));
    check(`${p}: in sitemap`, urls.includes(p));
  }
  const old = await fetch(BASE + "/services/facility-and-discharge-partners", { redirect: "manual" });
  const loc = old.headers.get("location") ?? "";
  check("Old facility service URL: 301 to /partners", old.status === 301 && (loc === "/partners" || new URL(loc, BASE).pathname === "/partners"), `${old.status} ${loc}`);
  check("Old facility service URL gone from sitemap", !urls.includes("/services/facility-and-discharge-partners"));
}

// 6b. Launch blockers: none of these strings may render anywhere (built HTML, visible text + meta).
{
  const strings = ["years driving", "5,000", "98%", "Net-30", "insured", "certified", "text you", "by text"];
  const placeholders = ["555-", "12345"];
  const found = {};
  for (const p of allPages) {
    const h = await html(p);
    const t = text(h) + " " + [...h.matchAll(/<meta[^>]+content="([^"]*)"/g)].map((m) => m[1]).join(" ");
    for (const w of [...strings, ...placeholders]) if (t.toLowerCase().includes(w.toLowerCase())) (found[w] ??= []).push(p);
  }
  for (const w of strings) check(`Built HTML: "${w}" appears nowhere`, !found[w], (found[w] ?? []).slice(0, 4).join(" "));
  // The phone and street are placeholders until Jay confirms them; check:launch blocks a live build while they are.
  for (const w of placeholders) console.log(`INFO  "${w}" on ${(found[w] ?? []).length} page(s) (placeholder phone/address; a live build fails until replaced)`);
  const safety = await html("/safety");
  check("/safety shows the one honest line", /data-unconfirmed/.test(safety) && /Jay is confirming these details/.test(text(safety)));
  check("/pricing rules block shows the one honest line", /data-unconfirmed/.test(await html("/pricing")));
  check("Medicaid answer is the brokers sentence", /We(&#x27;|')re currently private-pay and facility-billed/.test(await html("/faq")) && !/Medicare does not pay/.test(await html("/faq")));
  check("SMS mock hidden while smsEnabled is false", !/data-sms-mock/.test(home) && !/data-sms-mock/.test(await html("/partners")));
  const hosp = await html("/service-area/hospitals/houston-methodist-willowbrook");
  check("Invented hospital notes gone", !/Traffic on 249|vans are near it most days/.test(hosp));
  const faq = text(await html("/faq"));
  check("FAQ 11 carries no hospital list", !/We serve .*Hospital.* and every other hospital/.test(faq));
  const partnerRedirect = await fetch(BASE + "/services/facility-and-discharge-partners", { redirect: "manual" });
  check("Old facility service URL → 301 /partners", partnerRedirect.status === 301 && /\/partners$/.test(partnerRedirect.headers.get("location") ?? ""), `${partnerRedirect.status} ${partnerRedirect.headers.get("location")}`);
  for (const [p, h1] of [["/book", "Book a wheelchair van ride in north Houston"], ["/pricing", "Wheelchair van ride prices in north Houston"], ["/service-area", "Wheelchair van service area in north Houston"], ["/contact", "Contact Northline, wheelchair van rides in north Houston"]]) {
    check(`H1 ${p}`, text(get(await html(p), /<h1[^>]*>([\s\S]*?)<\/h1>/)).trim() === h1, text(get(await html(p), /<h1[^>]*>([\s\S]*?)<\/h1>/)).trim());
  }
  check("FinalCta sentence case, no poster class", /Ready when you are\./.test(home) && !/id="final-cta-heading"[^>]*poster/.test(home));
}

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
