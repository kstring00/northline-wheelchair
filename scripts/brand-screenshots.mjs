// Brand pass screenshots: Home, /about, /book success (filled in like a real
// rider would) and the footer, at mobile (390) and desktop (1440) widths.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const out = process.env.OUT ?? "reports/screenshots/brand";
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });

async function settle(page) {
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 50)); } scrollTo(0, 0); });
  await page.waitForTimeout(1200);
}

async function bookRide(page) {
  // The five required fields only: that is the whole form now.
  await page.goto(BASE + "/book", { waitUntil: "networkidle" });
  await page.locator("#contactName").fill("Denise Alvarez");
  await page.locator("#phone").fill("281-555-0199");
  await page.locator("#pickupAddress").fill("4210 Spring Cypress Rd, Spring, TX");
  await page.locator("#destination").fill("DaVita Cypress Creek");
  const next = new Date(); next.setDate(next.getDate() + ((8 - next.getDay()) % 7 || 7)); // next Monday
  await page.locator("#date").fill(next.toISOString().slice(0, 10));
  await page.locator("#time").fill("07:15");
  await page.getByRole("button", { name: "Send ride request" }).click();
  await page.locator("[data-booking-success]").waitFor();
  await page.waitForTimeout(400);
}

for (const vp of [
  { name: "mobile", width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 },
  { name: "desktop", width: 1440, height: 900, deviceScaleFactor: 1 },
]) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.isMobile, hasTouch: vp.isMobile, deviceScaleFactor: vp.deviceScaleFactor });
  const page = await ctx.newPage();
  // Full-page captures stitch the sticky header and the fixed skip link into every crop; hide them for the shots.
  await page.addInitScript(() => document.addEventListener("DOMContentLoaded", () => { const st = document.createElement("style"); st.textContent = "header{position:static!important} a[href='#main']{display:none!important}"; document.head.appendChild(st); }));
  for (const [slug, path] of [["home", "/"], ["about", "/about"]]) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await settle(page);
    await page.screenshot({ path: `${out}/${slug}-${vp.name}.png`, fullPage: true });
    if (path === "/") {
      // Section crops for review: hero, services, map, reviews, owner.
      for (const [name, sel] of [["hero", "#hero"], ["services", "#services"], ["map", "#areas"], ["reviews", "#reviews"], ["owner", "#meet-jay"]]) {
        const el = page.locator(sel).first();
        await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(2300);
        const r = await el.evaluate((e) => { const b = e.getBoundingClientRect(); return { x: b.left + scrollX, y: b.top + scrollY, width: b.width, height: b.height }; });
        await page.screenshot({ path: `${out}/home-${name}-${vp.name}.png`, fullPage: true, clip: r });
      }
      // Map with the Spring chip open.
      if (!vp.isMobile) { await page.hover("[data-city='spring']"); await page.waitForTimeout(400); const r = await page.locator("#areas").evaluate((e) => { const b = e.getBoundingClientRect(); return { x: b.left + scrollX, y: b.top + scrollY, width: b.width, height: b.height }; }); await page.screenshot({ path: `${out}/home-map-hover-${vp.name}.png`, fullPage: true, clip: r }); }
    }
  }
  // Clip the footer out of a full-page capture so the sticky header doesn't overlay it.
  const box = await page.locator("footer").evaluate((el) => { const r = el.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height }; });
  await page.screenshot({ path: `${out}/footer-${vp.name}.png`, fullPage: true, clip: box });
  await bookRide(page);
  const sbox = await page.locator("[data-booking-success]").evaluate((el) => { const r = el.getBoundingClientRect(); return { x: Math.max(0, r.left + scrollX - 24), y: r.top + scrollY - 24, width: Math.min(document.documentElement.clientWidth, r.width + 48), height: r.height + 48 }; });
  await page.screenshot({ path: `${out}/book-success-${vp.name}.png`, fullPage: true, clip: sbox });
  await page.screenshot({ path: `${out}/book-success-${vp.name}-page.png`, fullPage: true });
  await ctx.close();
}
await browser.close();
console.log(`screenshots in ${out}`);
