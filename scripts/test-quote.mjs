// /pricing with every price unconfirmed, the quote form end to end, and the
// /api/quote route. Needs a running server (BASE_URL, default localhost:3000).
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const REF = /NL-\d{6}-[2-9A-HJKMNP-Z]{4}/;
const TAGS = ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"];

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const page = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
const log = [];
const check = (name, ok, detail = "") => { log.push({ name, ok, detail }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`); };
const focused = () => page.evaluate(() => { const a = document.activeElement; return { tag: a?.tagName, text: a?.textContent?.trim().slice(0, 80), errors: a?.hasAttribute("data-quote-errors") ?? false }; });

// Chicago calendar date, plus n days, as YYYY-MM-DD.
const chicagoDate = (plusDays = 0) => {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const get = (t) => Number(parts.find((p) => p.type === t)?.value);
  const d = new Date(Date.UTC(get("year"), get("month") - 1, get("day") + plusDays));
  return d.toISOString().slice(0, 10);
};
const future = chicagoDate(3);

await page.goto(BASE + "/pricing", { waitUntil: "networkidle" });

// Nothing unconfirmed is asserted.
check("Rules block shows [data-unconfirmed]", (await page.locator("#rules [data-unconfirmed]").count()) >= 1);
const mainText = await page.locator("main").innerText();
const dollar = mainText.match(/\$\s?\d[^\n]{0,40}/);
check('No "$" followed by a digit in main text', !dollar, dollar?.[0] ?? "");
check("H1 reads the north Houston title", ((await page.locator("h1").first().textContent()) ?? "").trim() === "Wheelchair van ride prices in north Houston");

const axePage = await new AxeBuilder({ page }).withTags(TAGS).analyze();
check("axe on /pricing", axePage.violations.length === 0, axePage.violations.map((v) => `${v.id}×${v.nodes.length}`).join(","));

const form = page.locator('form[aria-labelledby="quote-heading"]');
const submit = form.getByRole("button", { name: "Get my price" });

// Empty submit: focus moves to the error summary.
await submit.click();
await page.waitForTimeout(200);
let f = await focused();
check("Empty submit moves focus to error summary", f.errors, f.text);
check("Error summary lists ZIPs, date and phone", (await form.locator("[data-quote-errors] a").count()) === 4, String(await form.locator("[data-quote-errors] a").count()));

// Past date.
await page.fill("#q-pickupZip", "77014");
await page.fill("#q-destZip", "77030");
await page.fill("#q-phone", "281-555-0142");
await page.fill("#q-date", "2020-01-01");
await submit.click();
await page.waitForTimeout(200);
check("Past date gets an error", await form.getByText("That date has passed").first().isVisible());
f = await focused();
check("Past date: focus on error summary", f.errors, f.text);

// Valid submit.
await page.fill("#q-date", future);
await submit.click();
const success = page.locator("[data-quote-success]");
await success.waitFor({ timeout: 10_000 }).catch(() => {});
await page.waitForTimeout(200);
f = await focused();
check("Success: focus moves to the success heading", f.tag === "H3" && f.text === "Thanks. Your quote request reached Jay.", `${f.tag} ${f.text}`);
const successText = (await success.textContent().catch(() => "")) ?? "";
check("Success shows a reference number", REF.test(successText), successText.match(REF)?.[0] ?? successText.slice(0, 120));
check("Success names the callback number", successText.includes("(281) 555-0142"));
check('Success has no "$" followed by a digit', !/\$\s?\d/.test(successText));

const axeSuccess = await new AxeBuilder({ page }).withTags(TAGS).analyze();
check("axe on the success state", axeSuccess.violations.length === 0, axeSuccess.violations.map((v) => `${v.id}×${v.nodes.length}`).join(","));

await browser.close();

// /api/quote, straight from the script, each block from its own client IP.
const valid = { pickupZip: "77014", destZip: "77030", date: future, phone: "281-555-0142", mobility: "wheelchair", tripType: "one-way" };
const post = (body, ip) => fetch(BASE + "/api/quote", { method: "POST", headers: { "Content-Type": "application/json", "x-forwarded-for": ip }, body: JSON.stringify(body) });

let r = await post({ ...valid, website: "http://spam.example" }, "203.0.113.21");
let j = await r.json().catch(() => ({}));
check("API: honeypot filled → 200 {ok:true}", r.status === 200 && j.ok === true && !j.ref, `${r.status} ${JSON.stringify(j)}`);
r = await post({ pickupZip: "77014" }, "203.0.113.21");
j = await r.json().catch(() => ({}));
check("API: missing fields → 400 with errors", r.status === 400 && j.ok === false && !!j.errors?.destZip && !!j.errors?.date && !!j.errors?.phone, `${r.status} ${Object.keys(j.errors ?? {}).join(",")}`);
r = await post({ ...valid, date: "2020-01-01" }, "203.0.113.21");
j = await r.json().catch(() => ({}));
check("API: past date → 400", r.status === 400 && !!j.errors?.date, `${r.status} ${JSON.stringify(j.errors ?? {})}`);
r = await post(valid, "203.0.113.21");
j = await r.json().catch(() => ({}));
check("API: valid → 200 with ref", r.status === 200 && j.ok === true && REF.test(j.ref ?? ""), `${r.status} ${JSON.stringify(j)}`);

const failed = log.filter((l) => !l.ok);
console.log(`\n${log.length - failed.length}/${log.length} passed`);
process.exit(failed.length ? 1 : 0);
