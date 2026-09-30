import { Resend } from "resend";
import { site } from "@/config/site";
import { rateLimit } from "@/lib/rate-limit";
import { chicagoToday } from "@/lib/dates";

export { chicagoToday };

/*
 * Shared delivery for every form route (/api/book, /api/quote, /api/partner).
 *
 * A lead is delivered when it is STORED or EMAILED; ideally both. The store
 * (Upstash Redis, Vercel KV's successor on the Vercel Marketplace) holds one
 * JSON record per lead so no lead depends on one email arriving; the Phase 2
 * admin view reads it. The email goes to Jay through Resend.
 *
 * In production (VERCEL_ENV=production) a route never says "ok" without
 * delivering: if neither the store nor the email is configured, or both fail,
 * it answers 503 with the phone number. Outside production, with nothing
 * configured, it logs the message so previews and tests work.
 */

export type LeadKind = "booking" | "quote" | "partner";
export type Outbound = { subject: string; text: string; html: string };

export const isProduction = () => process.env.VERCEL_ENV === "production";

// No 0/O, 1/I/L: easy to read back over the phone.
const REF_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

/** Reference number NL-YYMMDD-XXXX (Chicago date). Shown to the rider, in Jay's email and in the auto-reply. */
export function makeRef(now = new Date()) {
  const [y, m, d] = chicagoToday(now).split("-");
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  const tail = Array.from(bytes, (b) => REF_ALPHABET[b % REF_ALPHABET.length]).join("");
  return `NL-${y.slice(2)}${m}${d}-${tail}`;
}

export const unavailableMessage = () =>
  `We couldn't send your request online right now. Please call us at ${site.phone.display} and we'll take it by phone.`;

export function json(body: unknown, status = 200, headers?: Record<string, string>) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...headers } });
}

/** Body parse + honeypot + rate limit. Returns a Response to send, or the parsed body. */
export async function guard(req: Request, kind: LeadKind): Promise<{ response: Response } | { body: Record<string, unknown> }> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return { response: json({ ok: false, error: "Invalid JSON" }, 400) };
  }
  if (!body || typeof body !== "object") return { response: json({ ok: false, error: "Invalid body" }, 400) };
  const b = body as Record<string, unknown>;
  // Honeypot: bots fill every field. Say "ok" and drop it.
  if (typeof b.website === "string" && b.website.trim()) return { response: json({ ok: true }) };
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limit = rateLimit(`${kind}:${ip}`, { limit: 5, windowMs: 10 * 60_000 });
  if (!limit.ok) {
    return { response: json({ ok: false, error: "Too many requests" }, 429, { "Retry-After": String(limit.retryAfterSeconds) }) };
  }
  return { body: b };
}

function storeConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

/** LPUSH one JSON record onto leads:{kind} via the Upstash REST API. No SDK needed. */
async function storeLead(kind: LeadKind, record: Record<string, unknown>) {
  const cfg = storeConfig();
  if (!cfg) return { ok: false as const, configured: false as const };
  try {
    const res = await fetch(cfg.url, {
      method: "POST",
      headers: { Authorization: `Bearer ${cfg.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(["LPUSH", `leads:${kind}`, JSON.stringify(record)]),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`store ${res.status}`);
    return { ok: true as const, configured: true as const };
  } catch (e) {
    console.error(`[leads] store failed for ${kind}:`, (e as Error).message);
    return { ok: false as const, configured: true as const };
  }
}

const defaultFrom = () => `Northline Bookings <bookings@${new URL(site.url).hostname.replace(/^www\./, "")}>`;

async function emailLead(toJay: Outbound, replyTo: string | undefined, autoReply: { to: string; message: Outbound } | null) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false as const, configured: false as const };
  const resend = new Resend(key);
  const from = process.env.BOOKING_FROM_EMAIL || defaultFrom(); // CONFIRM: a domain verified in Resend
  const to = process.env.BOOKING_TO_EMAIL || site.email; // CONFIRM Jay's inbox
  const { data, error } = await resend.emails.send({ from, to, replyTo, subject: toJay.subject, text: toJay.text, html: toJay.html });
  if (error || !data) {
    // Never log the lead itself: it holds names, phones and addresses.
    console.error("[leads] Resend error:", error?.name, error?.message);
    return { ok: false as const, configured: true as const };
  }
  if (autoReply) {
    // Best effort. Jay has the lead either way.
    const r = await resend.emails.send({ from, to: autoReply.to, subject: autoReply.message.subject, text: autoReply.message.text, html: autoReply.message.html });
    if (r.error) console.error("[leads] auto-reply failed:", r.error.name, r.error.message);
  }
  return { ok: true as const, configured: true as const, id: data.id };
}

/**
 * Store, then email. Returns the Response the route should send.
 * `record` is what the store keeps (the submitted fields plus ref and time).
 */
export async function deliverLead(opts: {
  kind: LeadKind;
  ref: string;
  record: Record<string, unknown>;
  toJay: Outbound;
  replyTo?: string;
  autoReply?: { to: string; message: Outbound } | null;
}) {
  const record = { ...opts.record, ref: opts.ref, kind: opts.kind, submittedAt: new Date().toISOString() };
  const stored = await storeLead(opts.kind, record);
  const emailed = await emailLead(opts.toJay, opts.replyTo || undefined, opts.autoReply ?? null);

  if (stored.ok || emailed.ok) {
    return json({ ok: true, ref: opts.ref, stored: stored.ok, emailed: emailed.ok });
  }
  const nothingConfigured = !stored.configured && !emailed.configured;
  if (nothingConfigured && !isProduction()) {
    console.warn(`[leads] No store or email configured; logging the ${opts.kind} instead (non-production only).`);
    console.log(`[leads] ${opts.toJay.subject}\n${opts.toJay.text}`);
    return json({ ok: true, ref: opts.ref, stored: false, emailed: false, delivered: false });
  }
  return json({ ok: false, error: "unavailable", message: unavailableMessage(), phone: site.phone.display }, 503);
}
