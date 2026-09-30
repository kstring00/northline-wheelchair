// Approximates INP: measures Event Timing durations for real interactions on a
// 4x CPU-throttled mobile profile. Reports the worst interaction per page.
import { chromium } from "@playwright/test";
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const ctx = await b.newContext({ viewport: { width: 412, height: 823 }, isMobile: true, hasTouch: true });
const run = async (path, actions) => {
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await p.addInitScript(() => { window.__ev = []; new PerformanceObserver((l) => l.getEntries().forEach((e) => e.interactionId && window.__ev.push({ name: e.name, d: e.duration }))).observe({ type: "event", buffered: true, durationThreshold: 16 }); });
  await p.goto(BASE + path, { waitUntil: "networkidle" });
  for (const a of actions) { await a(p); await p.waitForTimeout(400); }
  const ev = await p.evaluate(() => window.__ev);
  const worst = ev.reduce((m, e) => (e.d > m.d ? e : m), { d: 0 });
  console.log(`${path.padEnd(8)} interactions:${ev.length}  worst:${Math.round(worst.d)}ms (${worst.name ?? "-"})  ${worst.d < 200 ? "PASS" : "FAIL"}`);
  await p.close();
};
await run("/", [
  (p) => p.getByRole("button", { name: "Menu" }).tap(),
  (p) => p.getByRole("button", { name: "Close" }).tap(),
  async (p) => { await p.locator("#faq").scrollIntoViewIfNeeded(); await p.locator("#faq button[aria-expanded]").first().tap(); },
  (p) => p.locator("#faq button[aria-expanded]").nth(1).tap(),
]);
await run("/book", [
  (p) => p.locator('label[for="who-loved-one"]').tap(),
  (p) => p.getByRole("button", { name: /Continue/ }).tap(),
  (p) => p.getByLabel("Where should we pick them up?").tap(),
  (p) => p.keyboard.type("12 Main"),
  (p) => p.getByRole("button", { name: /Continue/ }).tap(),
]);
await b.close();
