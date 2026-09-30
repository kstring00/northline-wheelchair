// Full-page + above-the-fold screenshots at mobile (360/412) and desktop widths.
import { chromium } from "@playwright/test";
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const pages = (process.env.PAGES ?? "/,/book,/services/wheelchair-transportation").split(",");
const out = process.env.OUT ?? "reports/screenshots";
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const viewports = [
  { name: "mobile", width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 },
  { name: "desktop", width: 1440, height: 900, deviceScaleFactor: 1 },
];
for (const vp of viewports) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.isMobile, hasTouch: vp.isMobile, deviceScaleFactor: vp.deviceScaleFactor, reducedMotion: process.env.REDUCED ? "reduce" : "no-preference" });
  const page = await ctx.newPage();
  for (const p of pages) {
    await page.goto(BASE + p, { waitUntil: "networkidle" });
    await page.waitForTimeout(2600);
    const slug = p === "/" ? "home" : p.replace(/^\//, "").replace(/\//g, "_");
    await page.screenshot({ path: `${out}/${slug}-${vp.name}-fold.png` });
    if (!process.env.FOLD_ONLY) {
      // Scroll through so scroll-triggered states settle, then capture the full page.
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${out}/${slug}-${vp.name}-full.png`, fullPage: true });
      await page.evaluate(() => window.scrollTo(0, 0));
    }
  }
  await ctx.close();
}
await browser.close();
console.log("done");
