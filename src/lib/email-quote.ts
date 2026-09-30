import { site } from "@/config/site";
import { formatPhone, labelFor, quoteMobilityOptions, quoteTripTypeOptions, shortDate, type QuoteData } from "@/components/pricing/quote-model";

/*
 * Email builder for a quote request. Pure: returns { subject, text, html } and
 * never sends. Sending lives in src/lib/leads.ts (deliverLead).
 *
 * Brand colours only: Navy #16284A, Cream #FAF6EE, Ink #1E2533. No auto-reply:
 * the quote form asks for a phone number, not an email.
 */

const NAVY = "#16284A";
const CREAM = "#FAF6EE";
const INK = "#1E2533";

export type QuoteEmail = { subject: string; text: string; html: string };

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Every field, labelled. Blank optional fields read "Not chosen" so Jay sees the same list every time. */
export function quoteRows(d: QuoteData, ref: string, submittedAt = new Date()): [string, string][] {
  return [
    ["Reference", ref],
    ["Phone for the callback", formatPhone(d.phone)],
    ["Pickup ZIP code", d.pickupZip],
    ["Destination ZIP code", d.destZip],
    ["Date of the ride", `${shortDate(d.date)} (${d.date})`],
    ["How the rider gets around", labelFor(quoteMobilityOptions, d.mobility) ?? "Not chosen (ask on the call)"],
    ["Trip type", labelFor(quoteTripTypeOptions, d.tripType) ?? "Not chosen (ask on the call)"],
    ["Submitted at", submittedAt.toLocaleString("en-US", { timeZone: "America/Chicago", dateStyle: "medium", timeStyle: "short" }) + " (Central)"],
    ["Page", `${site.url}/pricing`],
  ];
}

/** Subject: "Quote request: 77014 → 77030 · Mon Oct 12 · NL-261012-ABCD". */
export function quoteSubject(d: QuoteData, ref: string) {
  return `Quote request: ${d.pickupZip} → ${d.destZip} · ${shortDate(d.date)} · ${ref}`;
}

export function quoteEmail(d: QuoteData, ref: string, submittedAt = new Date()): QuoteEmail {
  const rows = quoteRows(d, ref, submittedAt);
  const subject = quoteSubject(d, ref);
  const phone = formatPhone(d.phone);
  const tel = `tel:+1${d.phone.replace(/\D/g, "").slice(-10)}`;

  const text = [
    `New quote request from the website.`,
    `Call ${phone} within ${site.responseTime} during business hours with the price.`,
    ``,
    ...rows.map(([k, v]) => `${k}: ${v}`),
  ].join("\n");

  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:${CREAM};color:${INK};font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.5;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border-radius:12px;overflow:hidden;">
<tr><td style="background:${NAVY};color:#FFFFFF;padding:14px 20px;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;font-size:13px;">Northline Wheelchair Transportation</td></tr>
<tr><td style="padding:24px 20px;">
<h1 style="margin:0 0 8px;font-size:22px;color:${NAVY};">New quote request</h1>
<p style="margin:0 0 20px;">Call <a href="${esc(tel)}" style="color:${NAVY};font-weight:bold;">${esc(phone)}</a> within ${esc(site.responseTime)} during business hours with the price.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
${rows
  .map(
    ([k, v]) =>
      `<tr><th align="left" valign="top" style="padding:8px 12px 8px 0;border-top:1px solid ${CREAM};font-size:14px;color:${NAVY};width:42%;">${esc(k)}</th><td valign="top" style="padding:8px 0;border-top:1px solid ${CREAM};">${esc(v)}</td></tr>`,
  )
  .join("\n")}
</table>
</td></tr>
<tr><td style="padding:16px 20px;color:${INK};font-size:13px;border-top:1px solid ${CREAM};">${esc(site.name)} · ${esc(site.phone.display)} · <a href="${esc(site.url)}" style="color:${NAVY};">${esc(site.url.replace(/^https?:\/\//, ""))}</a></td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  return { subject, text, html };
}
