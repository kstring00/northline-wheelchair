// Keyboard-only walkthrough of /book (no mouse clicks). Verifies focus
// management, validation messages, tailored copy, and the success screen.
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const page = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
const log = [];
const check = (name, ok, detail = "") => { log.push({ name, ok, detail }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`); };
const focused = () => page.evaluate(() => { const a = document.activeElement; return { tag: a?.tagName, id: a?.id, text: a?.textContent?.trim().slice(0, 60), name: a?.getAttribute("name"), value: a?.value }; });
const tabTo = async (predicate, max = 60) => { for (let i = 0; i < max; i++) { await page.keyboard.press("Tab"); const f = await focused(); if (predicate(f)) return f; } return null; };
const type = async (id, text) => { const f = await tabTo((f) => f.id === id); if (!f) throw new Error("could not tab to " + id); await page.keyboard.type(text); };

await page.goto(BASE + "/book", { waitUntil: "networkidle" });

// Skip link is the first tab stop.
await page.keyboard.press("Tab");
check("Skip link is first tab stop", (await focused()).text === "Skip to main content");

// Step 1: submit without choosing.
let f = await tabTo((f) => f.text?.startsWith("Continue to"));
check("Reached Continue button by keyboard", !!f);
await page.keyboard.press("Enter");
await page.waitForTimeout(200);
f = await focused();
check("Empty submit moves focus to error summary", (f.text ?? "").includes("Please fix"), f.text);
check("Plain-language error shown", await page.getByText("Please choose who this ride is for.").first().isVisible());
check("Radio group marked aria-invalid", (await page.locator("fieldset#who").getAttribute("aria-invalid")) === "true");

// Choose "A patient or client" with arrow keys.
f = await tabTo((f) => f.name === "who");
await page.keyboard.press("ArrowDown"); await page.keyboard.press("ArrowDown");
f = await focused();
check("Arrow keys move between radio options", f.value === "facility", f.value);
check("Facility tailoring message appears", await page.getByText("repeating schedule").isVisible());
await page.keyboard.press("Enter"); // Enter in a radio submits the form
await page.waitForTimeout(500);
f = await focused();
check("Step 2: focus moves to step heading", f.tag === "H2" && f.text === "The patient's trip", f.text);
check("Progress text updates", (await page.getByText("Step 2 of 3").count()) > 0);
check("Pickup label tailored for facility", await page.getByLabel("Pickup address (home, hospital or facility)").isVisible());

// Step 2 validation: past date.
await type("pickupAddress", "1200 Binz St, Houston, TX 77004");
await type("destination", "DaVita Dialysis, 123 Main St, Spring");
await tabTo((f) => f.id === "date");
await page.keyboard.type("01012020");
await page.keyboard.press("Enter");
await page.waitForTimeout(200);
check("Past date gets plain-language error", await page.getByText("That date has already passed").first().isVisible());
check("Missing time error", await page.getByText("Please enter the appointment or pickup time.").first().isVisible());
check("Missing trip type error", await page.getByText("Please choose one-way, round trip, or wait and return.").first().isVisible());

// Fix step 2 by keyboard.
const d = new Date(Date.now() + 3 * 864e5);
const mmddyyyy = `${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}${d.getFullYear()}`;
await page.locator("#date").focus();
await page.keyboard.type(mmddyyyy);
await tabTo((f) => f.id === "time");
await page.keyboard.type("0930AM");
check("Wait & Return option present", (await page.locator('input[name="tripType"][value="wait-and-return"]').count()) === 1);
f = await tabTo((f) => f.name === "tripType");
await page.keyboard.press("ArrowRight"); // round trip
f = await tabTo((f) => f.name === "repeat");
await page.keyboard.press("ArrowRight"); // repeats
f = await tabTo((f) => f.name === "repeatDays" && f.value === "Mon");
await page.keyboard.press("Space");
await tabTo((f) => f.value === "Wed"); await page.keyboard.press("Space");
await tabTo((f) => f.value === "Fri"); await page.keyboard.press("Space");
check("Schedule end date shown for facility", await page.locator("#repeatUntil").isVisible());
await tabTo((f) => f.text?.startsWith("Continue to"));
await page.keyboard.press("Enter");
await page.waitForTimeout(500);
f = await focused();
check("Step 3: focus moves to heading", f.tag === "H2" && f.text === "Mobility and contact", f.text);

// Step 3: check autocomplete attributes / input types.
const attrs = await page.evaluate(() => Object.fromEntries(["contactName", "orgName", "phone", "email"].map((id) => { const el = document.getElementById(id); return [id, `${el?.getAttribute("type") ?? "text"}/${el?.getAttribute("autocomplete")}`]; })));
check("Autocomplete + input types correct", attrs.contactName === "text/name" && attrs.orgName === "text/organization" && attrs.phone === "tel/tel" && attrs.email === "email/email", JSON.stringify(attrs));
const medicalFields = await page.evaluate(() => [...document.querySelectorAll("form label, form legend")].map((l) => l.textContent).filter((t) => /diagnos|condition|medicat|illness|disabilit/i.test(t)));
check("No medical questions asked (labels/legends)", medicalFields.length === 0, medicalFields.join("|"));

await tabTo((f) => f.name === "mobility");
await page.keyboard.press("Space");
await type("riderName", "Ruth Alvarez");
await type("contactName", "Maria Chen");
await type("orgName", "Northwest Dialysis Center");
await type("phone", "281-555-01");
await type("email", "maria@example");
await tabTo((f) => f.text === "Send ride request");
await page.keyboard.press("Enter");
await page.waitForTimeout(200);
check("Short phone gets plain error", await page.getByText("Please enter a 10-digit phone number").first().isVisible());
check("Bad email gets plain error", await page.getByText("Please check the email address").first().isVisible());
check("Error summary links present", (await page.locator('[role="alert"] a').count()) === 2);

await page.locator("#phone").focus(); await page.keyboard.type("42");
await page.locator("#email").focus(); await page.keyboard.type(".org");
await tabTo((f) => f.text === "Send ride request");
await page.keyboard.press("Enter");
await page.waitForTimeout(1500);
f = await focused();
check("Success: focus moves to thank-you heading", f.tag === "H2" && f.text?.startsWith("Thank you, Maria"), f.text);
check("Success states responseTime", await page.getByText("We call back within 30 minutes", { exact: true }).isVisible());
check("Success repeats phone number", await page.locator('[data-booking-root] a[href^="tel:"]').first().isVisible());
check("Success summarises repeating days", await page.getByText("Every Monday, Wednesday, Friday").isVisible());
const card = page.locator("[data-booking-success] [data-ride-card]");
check("Success shows a Ride Card", await card.isVisible());
check("Ride Card carries the rider's own pickup and drop-off", (await card.getByText("1200 Binz St, Houston, TX 77004").isVisible()) && (await card.getByText("DaVita Dialysis, 123 Main St, Spring").isVisible()));
check("Ride Card tag shows the repeat days", /^Every (Mon|Tue|Wed|Thu|Fri|Sat|Sun)( · (Mon|Tue|Wed|Thu|Fri|Sat|Sun))*$/.test((await card.locator("[data-ride-card-tag]").textContent())?.trim() ?? ""), await card.locator("[data-ride-card-tag]").textContent());

const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
check("axe on success state", axe.violations.length === 0, axe.violations.map((v) => v.id).join(","));

// ?for=facility preset
await page.goto(BASE + "/book?for=facility", { waitUntil: "networkidle" });
check("?for=facility preselects option", await page.locator('input[value="facility"]').isChecked());

// No-JS: form hidden, phone fallback shown.
const noJs = await (await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } })).newPage();
await noJs.goto(BASE + "/book");
check("No-JS: call fallback visible", await noJs.getByText("Online booking needs JavaScript turned on.").isVisible());
await noJs.goto(BASE + "/");
check("No-JS: FAQ answers readable", await noJs.getByText("Book a wait-and-return ride and your driver waits", { exact: false }).first().isVisible());
check("No-JS: hero route visible", (await noJs.locator("[data-hero-pattern]").evaluate((el) => getComputedStyle(el).opacity)) === "1");

await browser.close();
const failed = log.filter((l) => !l.ok);
console.log(`\n${log.length - failed.length}/${log.length} passed`);
process.exit(failed.length ? 1 : 0);
