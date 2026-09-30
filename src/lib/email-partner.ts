import { site } from "@/config/site";
import type { Outbound } from "@/lib/leads";
import { days as dayOrder, joinAnd, packetLabel, poOptions, standingOptions, type AccountData, type PacketData } from "@/components/partners/model";

/*
 * Email builders for /api/partner (facility account inquiries and packet
 * requests). Pure functions: they return { subject, text, html } and never
 * send. Sending lives in src/lib/leads.ts.
 *
 * Brand colours only: Navy #16284A, Cream #FAF6EE, Ink #1E2533, White.
 */

const NAVY = "#16284A";
const CREAM = "#FAF6EE";
const INK = "#1E2533";

const notGiven = "Not given";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const optionLabel = (list: { value: string; label: string }[], v: string) => list.find((o) => o.value === v)?.label ?? notGiven;

/** "3–5 rides/week", "Not sure yet" */
export function weeklyVolume(v: string) {
  if (!v) return notGiven;
  if (v === "Not sure yet") return "Volume not sure yet";
  return `${v.replace(/ rides$/, "")} rides/week`;
}

const submittedLine = (at: Date) =>
  at.toLocaleString("en-US", { timeZone: "America/Chicago", dateStyle: "medium", timeStyle: "short" }) + " (Central)";

function wrap(bodyHtml: string, preheader: string) {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(preheader)}</title></head>
<body style="margin:0;padding:0;background:${CREAM};color:${INK};font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.5;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border-radius:12px;overflow:hidden;">
<tr><td style="background:${NAVY};color:#FFFFFF;padding:14px 20px;font-weight:bold;font-size:15px;">Northline Wheelchair Transportation</td></tr>
<tr><td style="padding:24px 20px;">${bodyHtml}</td></tr>
<tr><td style="padding:16px 20px;color:${INK};font-size:13px;border-top:1px solid ${CREAM};">${esc(site.name)} · ${esc(site.phone.display)} · <a href="${esc(site.url)}" style="color:${NAVY};">${esc(site.url.replace(/^https?:\/\//, ""))}</a></td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function rowsTable(rows: [string, string][]) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
${rows
  .map(
    ([k, v]) =>
      `<tr><th align="left" valign="top" style="padding:8px 12px 8px 0;border-top:1px solid ${CREAM};font-size:14px;color:${NAVY};width:42%;">${esc(k)}</th><td valign="top" style="padding:8px 0;border-top:1px solid ${CREAM};white-space:pre-wrap;">${esc(v)}</td></tr>`,
  )
  .join("\n")}
</table>`;
}

const sortDays = (list: string[]) => [...list].sort((a, b) => dayOrder.indexOf(a as never) - dayOrder.indexOf(b as never));

function timeLabel(t: string) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return t;
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

export function accountRows(d: AccountData, ref: string, at = new Date()): [string, string][] {
  return [
    ["Reference", ref],
    ["Facility", d.facility.trim() || notGiven],
    ["Facility type", d.facilityType || notGiven],
    ["Contact name", d.contactName.trim() || notGiven],
    ["Role", d.role.trim() || notGiven],
    ["Direct phone", d.phone.trim() || notGiven],
    ["Work email", d.email.trim() || notGiven],
    ["Billing / AP contact", d.billingName.trim() || notGiven],
    ["Billing / AP email", d.billingEmail.trim() || notGiven],
    ["PO required", d.poRequired ? optionLabel(poOptions, d.poRequired) : notGiven],
    ["Authorized bookers", d.bookers.trim() || notGiven],
    ["Typical weekly volume", weeklyVolume(d.volume)],
    ["Standing schedules", d.standing ? optionLabel(standingOptions, d.standing) : notGiven],
    ["Standing-schedule rows", d.schedules.length ? String(d.schedules.length) : "None"],
    ["Notes", d.notes.trim() || notGiven],
    ["Submitted at", submittedLine(at)],
    ["Page", `${site.url}/partners`],
  ];
}

/** Facility account inquiry, to Jay. No auto-reply: Jay calls. */
export function accountEmail(d: AccountData, ref: string, at = new Date()): Outbound {
  const subject = `Facility inquiry: ${d.facility.trim()} · ${d.facilityType} · ${weeklyVolume(d.volume)} · ${ref}`;
  const rows = accountRows(d, ref, at);
  const call = `Call ${d.contactName.trim()} at ${d.phone.trim()}.`;

  const schedText = d.schedules.map(
    (r, i) =>
      `  ${i + 1}. ${r.initials.trim().toUpperCase()} · ${sortDays(r.days).join(" ") || "days not given"} · ${timeLabel(r.time) || "time not given"} · ZIP ${r.zip.trim() || "not given"}${r.notes.trim() ? ` · ${r.notes.trim()}` : ""}`,
  );
  const text = [
    `New facility account inquiry from the website.`,
    call,
    ``,
    ...rows.map(([k, v]) => `${k}: ${v}`),
    ...(d.schedules.length ? [``, `Standing schedules (initials only):`, ...schedText] : []),
  ].join("\n");

  const cell = `padding:6px 8px;border-top:1px solid ${CREAM};font-size:14px;vertical-align:top;`;
  const head = `padding:6px 8px;font-size:13px;color:${NAVY};text-align:left;`;
  const schedHtml = d.schedules.length
    ? `<h2 style="margin:24px 0 8px;font-size:18px;color:${NAVY};">Standing schedules (initials only)</h2>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
<tr><th style="${head}">Initials</th><th style="${head}">Days</th><th style="${head}">Time</th><th style="${head}">ZIP</th><th style="${head}">Notes</th></tr>
${d.schedules
  .map(
    (r) =>
      `<tr><td style="${cell}font-weight:bold;">${esc(r.initials.trim().toUpperCase())}</td><td style="${cell}">${esc(sortDays(r.days).join(" ") || "—")}</td><td style="${cell}">${esc(timeLabel(r.time) || "—")}</td><td style="${cell}">${esc(r.zip.trim() || "—")}</td><td style="${cell}white-space:pre-wrap;">${esc(r.notes.trim() || "—")}</td></tr>`,
  )
  .join("\n")}
</table>`
    : "";

  const html = wrap(
    `<h1 style="margin:0 0 8px;font-size:22px;color:${NAVY};">New facility account inquiry</h1>
<p style="margin:0 0 20px;">Call ${esc(d.contactName.trim())} at <a href="tel:${esc(phoneHref(d.phone))}" style="color:${NAVY};font-weight:bold;">${esc(d.phone.trim())}</a>.</p>
${rowsTable(rows)}
${schedHtml}`,
    subject,
  );
  return { subject, text, html };
}

/** Packet request (rate sheet, COI, W-9…), to Jay. */
export function packetEmail(d: PacketData, ref: string, at = new Date()): Outbound {
  const labels = d.items.map(packetLabel);
  const subject = `Packet request: ${d.facility.trim()} · ${labels.join(", ")} · ${ref}`;
  const rows: [string, string][] = [
    ["Reference", ref],
    ["Asked for", joinAnd(labels)],
    ["Name", d.name.trim()],
    ["Role", d.role.trim()],
    ["Facility", d.facility.trim()],
    ["Send to", d.email.trim()],
    ["Submitted at", submittedLine(at)],
    ["Page", `${site.url}/partners`],
  ];
  const text = [`New packet request from the website.`, `Email ${d.email.trim()} when it's ready. They were told nothing is posted on the site.`, ``, ...rows.map(([k, v]) => `${k}: ${v}`)].join("\n");
  const html = wrap(
    `<h1 style="margin:0 0 8px;font-size:22px;color:${NAVY};">New packet request</h1>
<p style="margin:0 0 20px;">${esc(d.name.trim())} at ${esc(d.facility.trim())} asked for ${esc(joinAnd(labels))}. Reply to <a href="mailto:${esc(d.email.trim())}" style="color:${NAVY};font-weight:bold;">${esc(d.email.trim())}</a> when it&#8217;s ready.</p>
${rowsTable(rows)}`,
    subject,
  );
  return { subject, text, html };
}

function phoneHref(p: string) {
  const digits = p.replace(/\D/g, "");
  return digits.length === 10 ? `+1${digits}` : digits;
}
