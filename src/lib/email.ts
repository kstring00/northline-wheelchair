import { site } from "@/config/site";
import { rideCardDate } from "@/components/brand/RideCard";
import { dayNames, formatDate, formatTime, mobilityOptions, whoOptions, windowText, type BookingData } from "@/components/booking/model";

/*
 * Email builders for the booking request. Pure functions: they return
 * { subject, text, html } and never send. Sending lives in /api/book.
 *
 * Brand colours only: Navy #16284A, Cream #FAF6EE, Ink #1E2533. Amber
 * #E8A33D appears once, as the "Pending" tag pill on the Ride Card.
 */

const NAVY = "#16284A";
const CREAM = "#FAF6EE";
const INK = "#1E2533";
const AMBER = "#E8A33D";

export type EmailMessage = { subject: string; text: string; html: string };

const tripTypeLabel: Record<string, string> = {
  "one-way": "One-way",
  "round-trip": "Round trip",
  "wait-and-return": "Wait & return",
};
const chairTypeLabel: Record<string, string> = { manual: "Manual", power: "Power", "not-sure": "Not sure" };

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function label<T extends string>(list: readonly { value: T; label: string }[], value: string) {
  return list.find((o) => o.value === value)?.label;
}

/** Every field, labelled in plain English. Blank fields read "Not given" so Jay sees the same list every time. */
export function bookingRows(d: BookingData, submittedAt = new Date(), ref = "") {
  const notGiven = "Not given";
  const repeatDays = d.repeatDays.map((x) => dayNames[x] ?? x).join(", ");
  const companions = d.companions === "0" ? "No one, just the rider" : `${d.companions} ${d.companions === "1" ? "person" : "people"}`;
  const rows: [string, string][] = [
    ["Reference", ref || notGiven],
    ["Name", d.contactName.trim() || notGiven],
    ["Phone", d.phone.trim() || notGiven],
    ["Pickup address", d.pickupAddress.trim() || notGiven],
    ["Apartment, building or room", d.pickupUnit.trim() || notGiven],
    ["Drop-off address", d.destination.trim() || notGiven],
    ["Date of the ride", d.date ? `${formatDate(d.date)} (${d.date})` : notGiven],
    ["Pickup window", windowText(d) || "Not sure yet (set it on the call)"],
    ["Trip type", tripTypeLabel[d.tripType] ?? "Not chosen (ask on the call)"],
    ["Return pickup time", d.returnTime ? formatTime(d.returnTime) : notGiven],
    ["Repeats", d.repeat === "repeat" ? "Yes, every week" : "No, just this once"],
    ["Repeat days", d.repeat === "repeat" ? repeatDays || notGiven : "—"],
    ["Repeat until", d.repeat === "repeat" ? (d.repeatUntil ? formatDate(d.repeatUntil) : "Ongoing") : "—"],
    ["Who the ride is for", label(whoOptions, d.who) ?? "Not chosen (ask on the call)"],
    ["Rider's name", d.riderName.trim() || notGiven],
    ["Facility or organization", d.orgName.trim() || notGiven],
    ["How the rider gets around", label(mobilityOptions, d.mobility) ?? "Not chosen (ask on the call)"],
    ["Wheelchair type", chairTypeLabel[d.chairType] ?? notGiven],
    ["People riding along", companions],
    ["Email", d.email.trim() || notGiven],
    ["Notes", d.notes.trim() || notGiven],
    ["Submitted at", submittedAt.toLocaleString("en-US", { timeZone: "America/Chicago", dateStyle: "medium", timeStyle: "short" }) + " (Central)"],
    ["Page", `${site.url}/book`],
  ];
  return rows;
}

function wrap(bodyHtml: string, preheader: string) {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(preheader)}</title></head>
<body style="margin:0;padding:0;background:${CREAM};color:${INK};font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.5;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border-radius:12px;overflow:hidden;">
<tr><td style="background:${NAVY};color:#FFFFFF;padding:14px 20px;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;font-size:13px;">Northline Wheelchair Transportation</td></tr>
<tr><td style="padding:24px 20px;">${bodyHtml}</td></tr>
<tr><td style="padding:16px 20px;color:${INK};font-size:13px;border-top:1px solid ${CREAM};">${esc(site.name)} · ${esc(site.phone.display)} · <a href="${esc(site.url)}" style="color:${NAVY};">${esc(site.url.replace(/^https?:\/\//, ""))}</a></td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

/** The request as Jay receives it: every field, labelled, in the on-screen order. */
export function bookingEmail(d: BookingData, submittedAt = new Date(), ref = ""): EmailMessage {
  const rows = bookingRows(d, submittedAt, ref);
  const who = d.contactName.trim() || "someone";
  const win = windowText(d);
  const when = d.date ? `${rideCardDate(d.date)}${win ? ` · ${win}` : ""}` : "date not given";
  const subject = `Ride request: ${who} · ${when}${ref ? ` · ${ref}` : ""}`;

  const text = [
    `New ride request from the website.`,
    `Call ${d.phone.trim() || "(no phone given)"} within ${site.responseTime} to confirm the price and details.`,
    ``,
    ...rows.map(([k, v]) => `${k}: ${v}`),
  ].join("\n");

  const html = wrap(
    `<h1 style="margin:0 0 8px;font-size:22px;color:${NAVY};">New ride request</h1>
<p style="margin:0 0 20px;">Call <a href="tel:${esc(d.phone.replace(/[^\d+]/g, ""))}" style="color:${NAVY};font-weight:bold;">${esc(d.phone.trim() || "(no phone given)")}</a> within ${esc(site.responseTime)} to confirm the price and details.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
${rows
  .map(
    ([k, v]) =>
      `<tr><th align="left" valign="top" style="padding:8px 12px 8px 0;border-top:1px solid ${CREAM};font-size:14px;color:${NAVY};width:42%;">${esc(k)}</th><td valign="top" style="padding:8px 0;border-top:1px solid ${CREAM};white-space:pre-wrap;">${esc(v)}</td></tr>`,
  )
  .join("\n")}
</table>`,
    subject,
  );

  return { subject, text, html };
}

/** Draft Ride Card lines shared by the rider's text and HTML copy. */
export function draftRideCard(d: BookingData) {
  const date = rideCardDate(d.date);
  const win = windowText(d);
  const when = `${d.repeat === "repeat" ? "From " : ""}${date}${win ? ` · ${win}` : ""}`;
  return {
    tag: "Pending",
    pickup: [d.pickupAddress.trim(), d.pickupUnit.trim()].filter(Boolean).join(", "),
    dropoff: d.destination.trim(),
    when,
    driver: "Named on our call",
  };
}

/** Channel wording follows site.smsEnabled; the en-route line only renders when Jay has confirmed it. */
const draftNote = () =>
  site.smsEnabled
    ? "This is your draft Ride Card. You'll get the confirmed one by text."
    : "This is your draft Ride Card. You'll get the confirmed Ride Card by email (or we'll read it to you on the call).";
const enRouteLine = () =>
  site.onTimePromise.enRouteText ? (site.smsEnabled ? "We text you when your driver is on the way. " : "We call you when your driver is on the way. ") : "";

/** Sent to the rider only when they gave an email. */
export function riderAutoReply(d: BookingData, ref = ""): EmailMessage {
  const subject = `We got your ride request${ref ? ` (${ref})` : ""}`;
  const card = draftRideCard(d);
  const first = (d.contactName.trim().split(/\s+/)[0] ?? "").replace(/[^\p{L}'-]/gu, "");
  const hi = first ? `Hi ${first},` : "Hi,";
  const promise = `Jay will call you within ${site.responseTime} during business hours to confirm the price and details. Your ride is not booked until we talk.`;

  const text = [
    hi,
    ``,
    `Thanks. Your ride request is in.${ref ? ` Your reference: ${ref}.` : ""}`,
    ``,
    `RIDE CARD — ${card.tag}`,
    `Pickup: ${card.pickup}`,
    `Drop-off: ${card.dropoff}`,
    `When: ${card.when}`,
    `Driver: named on our call`,
    ``,
    draftNote(),
    ``,
    promise,
    `Questions: ${site.phone.display}`,
    ``,
    `— Northline Wheelchair Transportation`,
  ].join("\n");

  const cell = (k: string, v: string, right = false) =>
    `<td valign="top" width="50%" style="padding:0;${right ? "text-align:right;" : ""}"><div style="font-size:12px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;color:${INK};opacity:0.85;">${esc(k)}</div><div style="margin-top:2px;font-size:15px;font-weight:bold;line-height:1.35;">${esc(v)}</div></td>`;

  const html = wrap(
    `<p style="margin:0 0 12px;">${esc(hi)}</p>
<h1 style="margin:0 0 8px;font-size:22px;color:${NAVY};">Thanks. Your ride request is in.</h1>
${ref ? `<p style="margin:0 0 20px;">Your reference: <strong>${esc(ref)}</strong></p>` : ""}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:340px;border-collapse:separate;border-radius:14px;overflow:hidden;border:1px solid ${CREAM};">
<tr><td style="background:${NAVY};color:#FFFFFF;padding:10px 14px;font-size:12px;font-weight:bold;letter-spacing:0.12em;text-transform:uppercase;">Ride Card <span style="float:right;background:${AMBER};color:${INK};border-radius:999px;padding:4px 10px;font-size:12px;letter-spacing:0.08em;">${esc(card.tag)}</span></td></tr>
<tr><td style="padding:14px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${cell("Pickup", card.pickup)}${cell("Drop-off", card.dropoff, true)}</tr></table>
<hr style="border:0;border-top:1px dashed ${INK};opacity:0.3;margin:12px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${cell("When", card.when)}${cell("Your driver", card.driver, true)}</tr></table>
<p style="margin:12px 0 0;font-size:13px;color:${INK};">${esc(enRouteLine())}Questions: <strong>${esc(site.phone.display)}</strong></p>
</td></tr>
</table>
<p style="margin:12px 0 20px;font-size:14px;color:${INK};">${esc(draftNote())}</p>
<p style="margin:0 0 8px;"><strong>${esc(promise)}</strong></p>
<p style="margin:0;">Questions: <a href="tel:${esc(site.phone.e164)}" style="color:${NAVY};font-weight:bold;">${esc(site.phone.display)}</a></p>`,
    subject,
  );

  return { subject, text, html };
}
