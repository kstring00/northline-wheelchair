// Verifies reduced-motion shows every final state instantly, and that the
// full-motion path actually animates (and ends in the same final state).
import { chromium } from "@playwright/test";
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
let fails = 0;
const check = (n, ok, d = "") => { if (!ok) fails++; console.log(`${ok ? "PASS" : "FAIL"}  ${n}${d ? `  (${d})` : ""}`); };

const state = (page) => page.evaluate(() => ({
  heroOpacity: getComputedStyle(document.querySelector("[data-hero-route]")).opacity,
  lines: [...document.querySelectorAll("[data-how-line]")].map((l) => getComputedStyle(l).transform),
  lits: [...document.querySelectorAll("[data-how-lit]")].map((l) => getComputedStyle(l).opacity),
  counts: [...document.querySelectorAll("[data-countup-value]")].map((e) => e.textContent),
  h1Opacity: getComputedStyle(document.querySelector("h1")).opacity,
  motionClass: document.documentElement.classList.contains("motion-ok"),
}));

// Reduced motion
{
  const page = await (await browser.newContext({ reducedMotion: "reduce", viewport: { width: 390, height: 844 } })).newPage();
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(150);
  const s = await state(page);
  check("Reduced: no motion-ok class", !s.motionClass);
  check("Reduced: hero route visible immediately", s.heroOpacity === "1", s.heroOpacity);
  check("Reduced: how-it-works lines fully drawn", s.lines.every((t) => t === "none" || t.startsWith("matrix(1, 0, 0, 1")), s.lines.join(" | "));
  check("Reduced: every step lit", s.lits.every((o) => o === "1"), s.lits.join(","));
  check("Reduced: stats show final values", s.counts.join(",") === "5,000,98,12", s.counts.join(","));
  await page.waitForTimeout(2000);
  const s2 = await state(page);
  check("Reduced: nothing changes after load", JSON.stringify(s) === JSON.stringify(s2));
}

// Full motion
{
  const page = await (await browser.newContext({ reducedMotion: "no-preference", viewport: { width: 390, height: 844 } })).newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  const s0 = await state(page);
  check("Motion: hero H1 never faded (LCP safe)", s0.h1Opacity === "1");
  check("Motion: stats reset to 0 before entering view", s0.counts.every((c) => c === "0"), s0.counts.join(","));
  check("Motion: lines start undrawn below the fold", s0.lines.every((t) => t.includes("0, 0, 0") || t.startsWith("matrix(1, 0, 0, 0")), s0.lines.join(" | "));
  await page.waitForTimeout(3000);
  check("Motion: hero route visible after draw", (await state(page)).heroOpacity === "1");
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 300) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 50)); } });
  await page.waitForTimeout(2000);
  const s1 = await state(page);
  check("Motion: stats counted up to final values", s1.counts.join(",") === "5,000,98,12", s1.counts.join(","));
  check("Motion: lines fully drawn after scrolling past", s1.lines.every((t) => t.startsWith("matrix(1, 0, 0, 1")), s1.lines.join(" | "));
  check("Motion: all steps lit after scrolling past", s1.lits.every((o) => o === "1"), s1.lits.join(","));
}
await browser.close();
process.exit(fails ? 1 : 0);
