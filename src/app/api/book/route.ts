import { site } from "@/config/site";
import { coerceBooking, validateRequired } from "@/components/booking/model";
import { bookingEmail, riderAutoReply } from "@/lib/email";
import { chicagoToday, deliverLead, guard, json, makeRef } from "@/lib/leads";

/*
 * POST /api/book: the booking form's backend.
 *
 * 1. Honeypot and rate limit (src/lib/leads.ts `guard`).
 * 2. Validate the required fields again, with "today" in America/Chicago.
 * 3. Give the request a reference number (NL-YYMMDD-XXXX).
 * 4. Store it and email Jay (and the rider, if they gave an email). In
 *    production the route never answers "ok" without delivering: see
 *    deliverLead.
 *
 * TODO Phase 2: text the confirmed Ride Card via src/lib/sms.ts (Twilio) once
 * Jay has confirmed the price and driver from the admin view.
 */

export const runtime = "nodejs";

export async function POST(req: Request) {
  const g = await guard(req, "booking");
  if ("response" in g) return g.response;

  const data = coerceBooking(g.body);
  const errors = validateRequired(data, chicagoToday());
  if (Object.keys(errors).length) return json({ ok: false, errors }, 400);

  const ref = makeRef();
  const riderEmail = data.email.trim();
  const { website: _hp, ...record } = data;
  void _hp;
  return deliverLead({
    kind: "booking",
    ref,
    record: { ...record, source: `${site.url}/book` },
    toJay: bookingEmail(data, new Date(), ref),
    replyTo: riderEmail || undefined,
    autoReply: riderEmail ? { to: riderEmail, message: riderAutoReply(data, ref) } : null,
  });
}
