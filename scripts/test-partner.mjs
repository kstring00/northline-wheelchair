// Walkthrough of /partners: the facility account form (error summary, standing-
// schedule expander, success with a reference), the packet request (buttons
// tick their box and move focus), /api/partner, and axe on the facility pages.
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const REF_RE = /NL-\d{6}-[2-9A-HJKMNP-Z]{4}/;
// A fresh client IP per run so the 5-per-10-minutes limit never trips across reruns.
const ip = () => `198.51.100.${1 + Math.floor(Math.random() * 250)}`;

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, extraHTTPHeaders: { "x-forwarded-for": ip() } });
const page = await context.newPage();
const log = [];
const check = (name, ok, detail = "") => { log.push({ name, ok, detail }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`); };
const focused = () => page.evaluate(() => { const a = document.activeElement; return { tag: a?.tagName, id: a?.id, role: a?.getAttribute("role"), text: a?.textContent?.trim().slice(0, 120) }; });
const axeTags = ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"];

await page.goto(BASE + "/partners", { waitUntil: "networkidle" });

// ---- Account form ----
const account = page.locator('form[aria-label="Facility account"]');
await account.getByRole("button", { name: "Send account request" }).click();
await page.waitForTimeout(200);
let f = await focused();
check("Account: empty submit focuses the error summary", f.role === "alert" && /Please fix these 6 things/.test(f.text ?? ""), f.text);
check("Account: summary links to fields", (await account.locator('[role="alert"] a[href="#acct-phone"]').count()) === 1);
check("Account: facility marked aria-invalid", (await page.locator("#acct-facility").getAttribute("aria-invalid")) === "true");
check("Account: visible Error: prefix", (await page.locator("#acct-email-error", { hasText: "Error:" }).count()) === 1);

await page.fill("#acct-facility", "Cypress Creek Rehab");
await page.selectOption("#acct-facilityType", "Skilled nursing");
await page.fill("#acct-contactName", "Dana Ortiz");
await page.fill("#acct-phone", "281-555-0199");
await page.fill("#acct-email", "dana@example.org");
await page.selectOption("#acct-volume", "3–5");
await page.waitForTimeout(100);
check("Account: errors clear as fields are fixed", (await account.locator('[role="alert"] a').count()) === 0);

// Standing-schedule expander.
const toggle = page.locator("#acct-standing-toggle");
check("Expander starts collapsed", (await toggle.getAttribute("aria-expanded")) === "false" && !(await page.locator("#acct-standing-rows").isVisible()));
await toggle.click();
await page.waitForTimeout(150);
check("Expander opens with one patient row", (await toggle.getAttribute("aria-expanded")) === "true" && (await page.locator("[data-schedule-row]").count()) === 1);
check(
  "PHI notice verbatim above the rows",
  ((await page.locator("[data-phi-notice]").textContent()) ?? "").trim() ===
    "Initials only. Please don't send names, dates of birth, diagnoses or street addresses here. We'll take the pickup address by phone.",
);
await page.getByRole("button", { name: "Add another patient" }).click();
await page.waitForTimeout(100);
f = await focused();
check("Add another patient adds a row and focuses its initials", (await page.locator("[data-schedule-row]").count()) === 2 && f.id === "acct-schedule-1-initials", f.id);
await page.getByRole("button", { name: "Remove patient 2" }).click();
check("Remove patient drops the row", (await page.locator("[data-schedule-row]").count()) === 1);

await page.fill("#acct-schedule-0-initials", "J1");
await page.fill("#acct-schedule-0-zip", "7709");
await account.getByRole("button", { name: "Send account request" }).click();
await page.waitForTimeout(200);
f = await focused();
check("Bad initials: summary focused with the initials error", f.role === "alert" && /2 or 3 letters/.test(f.text ?? ""), f.text);
check("Bad initials: field aria-invalid", (await page.locator("#acct-schedule-0-initials").getAttribute("aria-invalid")) === "true");
check("Bad ZIP: error shown", (await page.locator("#acct-schedule-0-zip-error").count()) === 1);

await page.fill("#acct-schedule-0-initials", "JD");
await page.fill("#acct-schedule-0-zip", "77090");
await page.fill("#acct-schedule-0-time", "06:30");
for (const day of ["Mon", "Wed", "Fri"]) await page.check(`#acct-schedule-0-days-${day}`);
await account.getByRole("button", { name: "Send account request" }).click();
await page.waitForSelector("[data-partner-success]", { timeout: 8000 }).catch(() => {});
await page.waitForTimeout(300);
f = await focused();
check("Account success: focus on the heading", f.tag === "H3" && f.text === "Thanks, Dana. Your request reached Jay.", f.text);
const accountDone = (await page.locator("[data-partner-success]").textContent()) ?? "";
check("Account success: shows a reference", REF_RE.test(accountDone), accountDone.match(/NL-\S+/)?.[0] ?? accountDone.slice(0, 80));
check("Account success: says he'll call the number given", accountDone.includes("He'll call you at 281-555-0199"));

// ---- Packet request ----
const packet = page.locator('form[aria-label="Packet request"]');
await packet.getByRole("button", { name: "Send packet request" }).click();
await page.waitForTimeout(200);
f = await focused();
check("Packet: empty submit focuses the error summary", f.role === "alert" && /Please choose at least one thing/.test(f.text ?? ""), f.text);
await page.locator('[data-packet-button="w9"]').click();
await page.waitForTimeout(200);
check("Packet: W-9 button ticks its box", await page.locator("#pk-items-w9").isChecked());
f = await focused();
check("Packet: focus moves to the first empty field", f.id === "pk-name", f.id);
await page.fill("#pk-name", "Dana Ortiz");
await page.fill("#pk-facility", "Cypress Creek Rehab");
await page.fill("#pk-role", "Discharge planner");
await page.fill("#pk-email", "dana@example.org");
await packet.getByRole("button", { name: "Send packet request" }).click();
await page.waitForSelector("[data-packet-success]", { timeout: 8000 }).catch(() => {});
await page.waitForTimeout(300);
f = await focused();
check("Packet success: focus on the heading", f.tag === "H3" && /W-9/.test(f.text ?? ""), f.text);
const packetDone = (await page.locator("[data-packet-success]").textContent()) ?? "";
check("Packet success: lists W-9 and a reference", packetDone.includes("W-9") && REF_RE.test(packetDone), packetDone.slice(0, 160));
check("Packet success: names the email", packetDone.includes("We'll email dana@example.org when it's ready."));

// ---- axe ----
for (const p of ["/partners", "/partners/dialysis", "/partners/discharge"]) {
  await page.goto(BASE + p, { waitUntil: "networkidle" });
  const axe = await new AxeBuilder({ page }).withTags(axeTags).analyze();
  check(`axe: ${p}`, axe.violations.length === 0, axe.violations.map((v) => `${v.id}(${v.nodes.length})`).join(","));
}
// With the expander open and a row present.
await page.goto(BASE + "/partners", { waitUntil: "networkidle" });
await page.locator("#acct-standing-toggle").click();
const axeOpen = await new AxeBuilder({ page }).withTags(axeTags).analyze();
check("axe: /partners with the standing expander open", axeOpen.violations.length === 0, axeOpen.violations.map((v) => v.id).join(","));

await browser.close();

// ---- /api/partner ----
const apiIp = ip();
const post = (body, raw = false) =>
  fetch(BASE + "/api/partner", { method: "POST", headers: { "Content-Type": "application/json", "x-forwarded-for": apiIp }, body: raw ? body : JSON.stringify(body) });
const validAccount = { kind: "account", facility: "Cypress Creek Rehab", facilityType: "Skilled nursing", contactName: "Dana Ortiz", phone: "281-555-0199", email: "dana@example.org", volume: "3–5" };
const validPacket = { kind: "packet", items: ["w9", "coi"], name: "Dana Ortiz", facility: "Cypress Creek Rehab", role: "Discharge planner", email: "dana@example.org" };

let r = await post({ ...validAccount, website: "http://spam.example" });
let j = await r.json().catch(() => ({}));
check("API: honeypot filled → 200 {ok:true}", r.status === 200 && j.ok === true && !j.ref, `${r.status} ${JSON.stringify(j)}`);
r = await post({ kind: "account", facility: "X" });
j = await r.json().catch(() => ({}));
check("API: account missing fields → 400 with errors", r.status === 400 && j.ok === false && j.errors?.phone && j.errors?.email && j.errors?.volume, `${r.status} ${Object.keys(j.errors ?? {}).join(",")}`);
r = await post({ ...validAccount, schedules: [{ initials: "J1", days: ["Mon"], time: "06:30", zip: "77090", notes: "" }] });
j = await r.json().catch(() => ({}));
check("API: bad initials → 400", r.status === 400 && !!j.errors?.["schedule-0-initials"], `${r.status} ${Object.keys(j.errors ?? {}).join(",")}`);
r = await post({ ...validAccount, schedules: [{ initials: "JD", days: ["Mon", "Wed", "Fri"], time: "06:30", zip: "77090", notes: "Side door" }], extra: "ignored" });
j = await r.json().catch(() => ({}));
check("API: valid account → 200 with a reference", r.status === 200 && j.ok === true && REF_RE.test(j.ref ?? ""), `${r.status} ${JSON.stringify(j)}`);
r = await post(validPacket);
j = await r.json().catch(() => ({}));
check("API: valid packet → 200 with a reference", r.status === 200 && j.ok === true && REF_RE.test(j.ref ?? ""), `${r.status} ${JSON.stringify(j)}`);

// A second client for the remaining 400s, so the first stays under the limit.
const ip2 = ip();
const post2 = (body, raw = false) =>
  fetch(BASE + "/api/partner", { method: "POST", headers: { "Content-Type": "application/json", "x-forwarded-for": ip2 }, body: raw ? body : JSON.stringify(body) });
r = await post2({ kind: "packet", items: [], name: "Dana", facility: "CCR", role: "RN", email: "nope" });
j = await r.json().catch(() => ({}));
check("API: packet with no items / bad email → 400", r.status === 400 && j.errors?.items && j.errors?.email, `${r.status} ${Object.keys(j.errors ?? {}).join(",")}`);
r = await post2({ kind: "other" });
check("API: unknown kind → 400", r.status === 400, String(r.status));
r = await post2("{not json", true);
check("API: bad JSON → 400", r.status === 400, String(r.status));
r = await fetch(BASE + "/api/partner", { method: "GET" });
check("API: GET is not allowed", r.status === 405, String(r.status));

const failed = log.filter((l) => !l.ok);
console.log(`\n${log.length - failed.length}/${log.length} passed`);
process.exit(failed.length ? 1 : 0);
