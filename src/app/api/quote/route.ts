import { chicagoToday } from "@/lib/dates";
import { deliverLead, guard, json, makeRef } from "@/lib/leads";
import { quoteEmail } from "@/lib/email-quote";
import { coerceQuote, validateQuote } from "@/components/pricing/quote-model";

/*
 * POST /api/quote: the /pricing quote form's backend.
 *
 * guard() handles bad JSON (400), the `website` honeypot (quiet 200) and the
 * per-IP rate limit (429). Then the fields are validated again here, and the
 * request is stored and emailed to Jay by deliverLead(). No auto-reply: the
 * form collects a phone number, not an email.
 */

export const runtime = "nodejs";

export async function POST(req: Request) {
  const g = await guard(req, "quote");
  if ("response" in g) return g.response;

  const data = coerceQuote(g.body);
  const errors = validateQuote(data, chicagoToday());
  if (Object.keys(errors).length) return json({ ok: false, errors }, 400);

  const ref = makeRef();
  const submittedAt = new Date();
  const { website: _honeypot, ...fields } = data;
  void _honeypot;

  return deliverLead({ kind: "quote", ref, record: fields, toJay: quoteEmail(data, ref, submittedAt) });
}
