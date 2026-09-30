// Site audit: crawls every internal link from "/", then per page checks
// status, title/description/canonical/OG/Twitter, H1 count, image alt text,
// JSON-LD types, 360px horizontal overflow, tap-target sizes, the Call/Book
// actions, and axe-core (WCAG 2.2 AA). Writes reports/audit.json.
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { writeFileSync, mkdirSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const page = await ctx.newPage();

const queue = ["/"];
const seen = new Set(queue);
const results = [];
const brokenLinks = [];

while (queue.length) {
  const path = queue.shift();
  const res = await page.goto(BASE + path, { waitUntil: "networkidle" });
  const status = res?.status() ?? 0;
  if (status !== 200) { brokenLinks.push({ path, status }); continue; }
  await page.waitForTimeout(300);

  const info = await page.evaluate(() => {
    const meta = (sel) => document.querySelector(sel)?.getAttribute("content") ?? null;
    const links = [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href"));
    const imgs = [...document.querySelectorAll("img")].map((i) => ({ src: i.getAttribute("src"), alt: i.getAttribute("alt"), loading: i.getAttribute("loading"), fetchpriority: i.getAttribute("fetchpriority") }));
    const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap((s) => { const j = JSON.parse(s.textContent); return (Array.isArray(j) ? j : [j]).map((x) => x["@type"]); });
    // Tap targets: every visible interactive control. Inline links inside running
    // text are reported separately (WCAG 2.5.8 exempts them).
    const small = [];
    const inlineSmall = [];
    for (const el of document.querySelectorAll("a[href], button, input:not([type=hidden]), select, textarea, summary")) {
      if (el.closest("[aria-hidden=true]")) continue;
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") continue;
      let r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (el.matches("input[type=radio], input[type=checkbox]")) r = el.closest("label")?.getBoundingClientRect() ?? r;
      if (r.width < 48 || r.height < 48) {
        const inline = el.tagName === "A" && el.parentElement && ["P", "LI", "DD", "SPAN"].includes(el.parentElement.tagName) && el.parentElement.textContent.trim().length > el.textContent.trim().length + 3;
        (inline ? inlineSmall : small).push({ tag: el.tagName.toLowerCase(), text: (el.textContent || el.getAttribute("aria-label") || el.id).trim().slice(0, 40), w: Math.round(r.width), h: Math.round(r.height) });
      }
    }
    const bar = document.querySelector('nav[aria-label="Quick actions"]');
    return {
      title: document.title,
      description: meta('meta[name="description"]'),
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
      robots: meta('meta[name="robots"]'),
      ogTitle: meta('meta[property="og:title"]'),
      ogImage: meta('meta[property="og:image"]'),
      twitterCard: meta('meta[name="twitter:card"]'),
      h1: [...document.querySelectorAll("h1")].map((h) => h.textContent.trim()),
      imgs,
      ld,
      links,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      small,
      inlineSmall,
      hasCall: !!bar?.querySelector('a[href^="tel:"]'),
      hasBook: !!bar?.querySelector('a[href="/book"]'),
      skipLink: document.querySelector('a[href="#main"]')?.textContent ?? null,
      landmarks: { header: !!document.querySelector("header"), main: !!document.querySelector("main#main"), footer: !!document.querySelector("footer") },
    };
  });

  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]).analyze();

  for (const href of info.links) {
    if (!href || !href.startsWith("/") || href.startsWith("//")) continue;
    const clean = href.split("#")[0].split("?")[0] || "/";
    if (!seen.has(clean)) { seen.add(clean); queue.push(clean); }
  }
  delete info.links;
  results.push({ path, status, ...info, axe: axe.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, sample: v.nodes[0]?.target })) });
}

// 404 handling
const nf = await page.goto(BASE + "/this-page-does-not-exist");
const nfInfo = { status: nf?.status(), h1: await page.locator("h1").allTextContents(), hasTel: (await page.locator('main a[href^="tel:"]').count()) > 0, hasBook: (await page.locator('main a[href="/book"]').count()) > 0 };

// Static files
const statics = {};
for (const p of ["/robots.txt", "/sitemap.xml", "/manifest.webmanifest", "/favicon.ico", "/icon.svg", "/apple-icon.png", "/opengraph-image", "/twitter-image", "/logo.png"]) {
  const r = await page.request.get(BASE + p);
  statics[p] = { status: r.status(), type: r.headers()["content-type"] };
  if (p === "/robots.txt") statics[p].body = (await r.text()).trim();
}

await browser.close();

const titles = results.map((r) => r.title);
const descs = results.map((r) => r.description);
const dupTitles = titles.filter((t, i) => titles.indexOf(t) !== i);
const dupDescs = descs.filter((t, i) => descs.indexOf(t) !== i);

mkdirSync("reports", { recursive: true });
writeFileSync("reports/audit.json", JSON.stringify({ pages: results, brokenLinks, notFound: nfInfo, statics, dupTitles, dupDescs }, null, 2));

// Console summary
const row = (r) => [
  r.path.padEnd(38),
  `h1:${r.h1.length}`,
  `overflow:${r.overflow}`,
  `small:${r.small.length}`,
  `inlineSmall:${r.inlineSmall.length}`,
  `noAlt:${r.imgs.filter((i) => i.alt === null).length}`,
  `bar:${r.hasCall && r.hasBook ? "ok" : "MISSING"}`,
  `axe:${r.axe.length}`,
  `ld:${[...new Set(r.ld)].join("+")}`,
].join("  ");
console.log(results.map(row).join("\n"));
console.log("\nbroken links:", brokenLinks.length ? brokenLinks : "none");
console.log("404:", nfInfo);
console.log("statics:", Object.entries(statics).map(([k, v]) => `${k}=${v.status}`).join(" "));
console.log("robots.txt:", JSON.stringify(statics["/robots.txt"].body));
console.log("robots meta:", [...new Set(results.map((r) => r.robots))]);
console.log("duplicate titles:", dupTitles.length ? dupTitles : "none", " duplicate descriptions:", dupDescs.length ? dupDescs : "none");
for (const r of results) {
  if (r.small.length) console.log("SMALL", r.path, JSON.stringify(r.small));
  if (r.axe.length) console.log("AXE", r.path, JSON.stringify(r.axe));
}
