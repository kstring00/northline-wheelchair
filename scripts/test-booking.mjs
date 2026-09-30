// Keyboard-only walkthrough of /book (no mouse clicks). Verifies focus
// management, validation messages, the optional-details disclosure, the
// success screen with its draft Ride Card, and the /api/book route.
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const page = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
const log = [];
const check = (name, ok, detail = "") => { log.push({ name, ok, detail }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`); };
const focused = () => page.evaluate(() => { const a = document.activeElement; return { tag: a?.tagName, id: a?.id, text: a?.textContent?.trim().slice(0, 60), name: a?.getAttribute("name"), value: a?.value }; });
const tabTo = async (predicate, max = 80) => { for (let i = 0; i < max; i++) { await page.keyboard.press("Tab"); const f = await focused(); if (predicate(f)) return f; } return null; };
const type = async (id, text) => { const f = await tabTo((f) => f.id === id); if (!f) throw new Error("could not tab to " + id); await page.keyboard.type(text); };
const submit = async (wait = 300) => { const f = await tabTo((f) => f.text === "Send ride request"); if (!f) throw new Error("could not tab to submit"); await page.keyboard.press("Enter"); await page.waitForTimeout(wait); };

const PICKUP = "1200 Binz St, Houston, TX 77004";
const DROPOFF = "DaVita Dialysis, 123 Main St, Spring";

await page.goto(BASE + "/book", { waitUntil: "networkidle" });

// Skip link is the first tab stop.
await page.keyboard.press("Tab");
check("Skip link is first tab stop", (await focused()).text === "Skip to main content");

// One form, no steps.
check("No step indicator", (await page.getByText(/Step \d of \d/).count()) === 0);
check("Submit button is present up front", await page.getByRole("button", { name: "Send ride request" }).isVisible());

// Empty submit: focus moves to the error summary, six required messages.
await submit();
let f = await focused();
check("Empty submit moves focus to error summary", (f.text ?? "").includes("Please fix these 6 things"), f.text);
const requiredMsgs = [
  "Please enter your name.",
  "Please enter a 10-digit phone number",
  "Please enter the pickup address",
  "Please enter where you're going",
  "Please choose the date of the ride.",
  "Please enter the appointment time.",
];
for (const m of requiredMsgs) check(`Required error: "${m}"`, (await page.locator('[role="alert"] a', { hasText: m }).count()) === 1);
check("Error summary has six links", (await page.locator('[role="alert"] a').count()) === 6);
check("Name input marked aria-invalid", (await page.locator("#contactName").getAttribute("aria-invalid")) === "true");
check("Field errors carry the visible Error: prefix", (await page.locator("#phone-error", { hasText: "Error:" }).count()) === 1);

// Past date.
await tabTo((f) => f.id === "date");
await page.keyboard.type("01012020");
await submit();
check("Past date gets plain-language error", await page.getByText("That date has already passed").first().isVisible());

// Fill the five required fields by keyboard.
await type("contactName", "Maria Chen");
await type("phone", "281-555-0142");
await type("pickupAddress", PICKUP);
await type("destination", DROPOFF);
const d = new Date(Date.now() + 3 * 864e5);
const mmddyyyy = `${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}${d.getFullYear()}`;
await tabTo((f) => f.id === "date");
await page.keyboard.type(mmddyyyy);
await tabTo((f) => f.id === "time");
await page.keyboard.type("0930AM");
await page.waitForTimeout(100);
check("Errors clear as fields are fixed", (await page.locator('[role="alert"] a').count()) === 0, String(await page.locator('[role="alert"] a').count()));

// Optional details disclosure.
const more = page.locator('button[aria-controls="booking-more"]');
const panel = page.locator("[data-booking-more]");
check("Expander starts collapsed (aria-expanded=false)", (await more.getAttribute("aria-expanded")) === "false");
check("Optional panel hidden while collapsed", !(await panel.isVisible()) && (await panel.getAttribute("data-state")) === "closed");
f = await tabTo((f) => f.text?.startsWith("Anything else we should know?"));
check("Expander reachable by keyboard", !!f);
await page.keyboard.press("Enter");
await page.waitForTimeout(150);
check("Expander opens (aria-expanded=true)", (await more.getAttribute("aria-expanded")) === "true");
check("Optional panel visible when open", (await panel.isVisible()) && (await panel.getAttribute("data-state")) === "open");
check("Wait & Return option present", (await page.locator('input[name="tripType"][value="wait-and-return"]').count()) === 1);

// who = facility by arrow keys reveals org + rider name.
f = await tabTo((f) => f.name === "who");
await page.keyboard.press("ArrowDown"); await page.keyboard.press("ArrowDown");
f = await focused();
check("Arrow keys move between who options", f.value === "facility", f.value);
check("Facility reveals organization and rider name", (await page.locator("#orgName").isVisible()) && (await page.locator("#riderName").isVisible()));

const attrs = await page.evaluate(() => Object.fromEntries(["contactName", "phone", "email"].map((id) => { const el = document.getElementById(id); return [id, `${el?.getAttribute("type") ?? "text"}/${el?.getAttribute("autocomplete")}`]; })));
check("Autocomplete + input types correct", attrs.contactName === "text/name" && attrs.phone === "tel/tel" && attrs.email === "email/email", JSON.stringify(attrs));
const medicalFields = await page.evaluate(() => [...document.querySelectorAll("form label, form legend")].map((l) => l.textContent).filter((t) => /diagnos|condition|medicat|illness|disabilit/i.test(t)));
check("No medical questions asked (labels/legends)", medicalFields.length === 0, medicalFields.join("|"));

// Honeypot stays hidden and out of the tab order.
const honeypot = await page.evaluate(() => { const el = document.getElementById("website"); if (!el) return null; const r = el.getBoundingClientRect(); return { offscreen: r.right < 0, ariaHidden: el.closest('[aria-hidden="true"]') !== null, tabindex: el.getAttribute("tabindex") }; });
check("Honeypot present, off-screen, aria-hidden, tabIndex -1", !!honeypot && honeypot.offscreen && honeypot.ariaHidden && honeypot.tabindex === "-1", JSON.stringify(honeypot));

// Send.
await submit(2500);
f = await focused();
check("Success: focus moves to thank-you heading", f.tag === "H2" && f.text?.startsWith("Thank you, Maria"), f.text);
check("Success states Jay's callback window", await page.getByText("Jay will call you within 30 minutes", { exact: true }).first().isVisible());
check("Success repeats phone number", await page.locator('[data-booking-root] a[href^="tel:"]').first().isVisible());
const card = page.locator("[data-booking-success] [data-ride-card]");
check("Success shows a Ride Card", await card.isVisible());
check("Ride Card carries the typed pickup and drop-off", (await card.getByText(PICKUP).isVisible()) && (await card.getByText(DROPOFF).isVisible()));
const tag = (await card.locator("[data-ride-card-tag]").textContent())?.trim() ?? "";
check("Ride Card tag starts with Pending", tag.startsWith("Pending"), tag);
check("Draft note under the card", ((await page.locator("[data-draft-note]").textContent()) ?? "").trim() === "This is your draft Ride Card. You'll get the confirmed one by text.");

const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
check("axe on success state", axe.violations.length === 0, axe.violations.map((v) => v.id).join(","));

// ?for=facility preset: option chosen and the optional section open.
await page.goto(BASE + "/book?for=facility", { waitUntil: "networkidle" });
check("?for=facility preselects option", await page.locator('input[value="facility"]').isChecked());
check("?for=facility opens the optional section", (await page.locator('button[aria-controls="booking-more"]').getAttribute("aria-expanded")) === "true" && (await page.locator("[data-booking-more]").isVisible()));

const axeForm = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
check("axe on open form", axeForm.violations.length === 0, axeForm.violations.map((v) => v.id).join(","));

// No-JS: form hidden, phone fallback shown.
const noJs = await (await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } })).newPage();
await noJs.goto(BASE + "/book");
check("No-JS: call fallback visible", await noJs.getByText("Online booking needs JavaScript turned on.").isVisible());
await noJs.goto(BASE + "/");
check("No-JS: FAQ answers readable", await noJs.getByText("Book a wait-and-return ride and your driver waits", { exact: false }).first().isVisible());

await browser.close();

// /api/book, straight from the script. Each block uses its own client IP so
// the counts never mix with the browser submission above.
const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const valid = { contactName: "Maria Chen", phone: "281-555-0142", pickupAddress: PICKUP, destination: DROPOFF, date: iso, time: "09:30" };
const post = (body, ip, raw = false) =>
  fetch(BASE + "/api/book", { method: "POST", headers: { "Content-Type": "application/json", "x-forwarded-for": ip }, body: raw ? body : JSON.stringify(body) });

let r = await post({ ...valid, website: "http://spam.example" }, "203.0.113.7");
let j = await r.json().catch(() => ({}));
check("API: honeypot filled → 200 {ok:true}", r.status === 200 && j.ok === true, `${r.status} ${JSON.stringify(j)}`);
r = await post("{not json", "203.0.113.7", true);
check("API: bad JSON → 400", r.status === 400, String(r.status));
r = await post({ contactName: "Maria" }, "203.0.113.7");
j = await r.json().catch(() => ({}));
check("API: missing fields → 400 with errors", r.status === 400 && j.ok === false && j.errors && j.errors.phone && j.errors.date, `${r.status} ${Object.keys(j.errors ?? {}).join(",")}`);
r = await post(valid, "203.0.113.7");
j = await r.json().catch(() => ({}));
check("API: valid → 200 ok (delivered false without a key)", r.status === 200 && j.ok === true && (j.delivered === false || j.delivered === true), `${r.status} ${JSON.stringify(j)}`);
r = await fetch(BASE + "/api/book", { method: "GET" });
check("API: GET is not allowed", r.status === 405, String(r.status));

// Rate limit, last: six quick valid POSTs from one client, the sixth is 429.
const statuses = [];
for (let i = 0; i < 6; i++) statuses.push((await post(valid, "203.0.113.8")).status);
const sixth = await post(valid, "203.0.113.8");
void sixth;
check("API: 5 requests pass, the 6th is 429", statuses.slice(0, 5).every((s) => s === 200) && statuses[5] === 429, statuses.join(","));
r = await post(valid, "203.0.113.8");
check("API: 429 carries Retry-After", r.status === 429 && Number(r.headers.get("retry-after")) > 0, `${r.status} retry-after=${r.headers.get("retry-after")}`);

const failed = log.filter((l) => !l.ok);
console.log(`\n${log.length - failed.length}/${log.length} passed`);
process.exit(failed.length ? 1 : 0);
