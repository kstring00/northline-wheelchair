import { NextResponse } from "next/server";
import { Resend } from "resend";
import { site } from "@/config/site";
import { coerceBooking, validateRequired } from "@/components/booking/model";
import { bookingEmail, riderAutoReply } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

/*
 * POST /api/book: the booking form's only backend.
 *
 * 1. Honeypot: a filled `website` field gets a quiet 200 and nothing else.
 * 2. Rate limit by IP (5 per 10 minutes, in memory; see src/lib/rate-limit.ts).
 * 3. Validate the five required fields again, server-side.
 * 4. Email the request to Jay with Resend, and a draft Ride Card to the rider
 *    if they gave an email.
 *
 * Without RESEND_API_KEY the route logs the message instead of sending it, so
 * local previews and the test scripts work, and answers { ok: true, delivered: false }.
 *
 * TODO Phase 2: text the confirmed Ride Card via src/lib/sms.ts (Twilio) once
 * Jay has confirmed the price and driver from the admin view.
 */

export const runtime = "nodejs";

// CONFIRM: the From address must be on a domain verified in Resend. The
// default is derived from site.url; override with BOOKING_FROM_EMAIL.
const defaultFrom = `Northline Bookings <bookings@${new URL(site.url).hostname.replace(/^www\./, "")}>`;

let warnedNoKey = false;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const data = coerceBooking(body);

  // Honeypot: bots fill every field. Say "ok" and drop it.
  if (data.website.trim()) return NextResponse.json({ ok: true });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limit = rateLimit(`book:${ip}`, { limit: 5, windowMs: 10 * 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  const errors = validateRequired(data);
  if (Object.keys(errors).length) return NextResponse.json({ ok: false, errors }, { status: 400 });

  const submittedAt = new Date();
  const toJay = bookingEmail(data, submittedAt);
  const riderEmail = data.email.trim();
  const toRider = riderEmail ? riderAutoReply(data) : null;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (!warnedNoKey) {
      console.warn("[api/book] RESEND_API_KEY is not set. Booking emails are logged, not sent.");
      warnedNoKey = true;
    }
    console.log(`[api/book] ${toJay.subject}\n${toJay.text}`);
    if (toRider) console.log(`[api/book] Rider copy → ${riderEmail}: ${toRider.subject}\n${toRider.text}`);
    return NextResponse.json({ ok: true, delivered: false });
  }

  const resend = new Resend(apiKey);
  const from = process.env.BOOKING_FROM_EMAIL || defaultFrom;
  const to = process.env.BOOKING_TO_EMAIL || site.email; // CONFIRM Jay's address

  const { data: sent, error } = await resend.emails.send({
    from,
    to,
    replyTo: riderEmail || undefined,
    subject: toJay.subject,
    text: toJay.text,
    html: toJay.html,
  });
  if (error || !sent) {
    // Never log the rider's details here: the request holds a name, phone and address.
    console.error("[api/book] Resend error:", error?.name, error?.message);
    return NextResponse.json({ ok: false, error: "Could not send the request" }, { status: 502 });
  }

  if (toRider) {
    // Best effort. Jay has the request either way, so a failed copy is not a failed booking.
    const reply = await resend.emails.send({ from, to: riderEmail, subject: toRider.subject, text: toRider.text, html: toRider.html });
    if (reply.error) console.error("[api/book] Rider copy failed:", reply.error.name, reply.error.message);
  }

  return NextResponse.json({ ok: true, delivered: true, id: sent.id });
}
