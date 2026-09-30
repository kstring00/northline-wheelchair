import { deliverLead, guard, json, makeRef } from "@/lib/leads";
import { accountEmail, packetEmail } from "@/lib/email-partner";
import { coerceAccount, coercePacket, validateAccount, validatePacket } from "@/components/partners/model";

/*
 * POST /api/partner: the /partners forms' backend.
 *
 *   { kind: "account", ... }  facility account inquiry (PartnerForm)
 *   { kind: "packet", ... }   rate sheet / COI / W-9 / credential / vehicle request (PacketForm)
 *
 * guard() handles bad JSON (400), the `website` honeypot (quiet 200) and the
 * per-IP rate limit (429). Fields are validated again here with the same rules
 * as the browser, then stored and emailed to Jay by deliverLead(). No
 * auto-reply: Jay calls account inquiries, and emails packet requests himself.
 */

export const runtime = "nodejs";

export async function POST(req: Request) {
  const g = await guard(req, "partner");
  if ("response" in g) return g.response;

  const kind = g.body.kind;
  if (kind !== "account" && kind !== "packet") return json({ ok: false, errors: { kind: "Unknown request type." } }, 400);

  const submittedAt = new Date();

  if (kind === "packet") {
    const data = coercePacket(g.body);
    const errors = validatePacket(data);
    if (Object.keys(errors).length) return json({ ok: false, errors }, 400);
    const ref = makeRef(submittedAt);
    const { website: _hp, ...fields } = data;
    void _hp;
    return deliverLead({ kind: "partner", ref, record: { ...fields, kind }, toJay: packetEmail(data, ref, submittedAt), replyTo: data.email.trim() });
  }

  const data = coerceAccount(g.body);
  const errors = validateAccount(data);
  if (Object.keys(errors).length) return json({ ok: false, errors }, 400);
  const ref = makeRef(submittedAt);
  const { website: _hp, ...fields } = data;
  void _hp;
  return deliverLead({ kind: "partner", ref, record: { ...fields, kind }, toJay: accountEmail(data, ref, submittedAt), replyTo: data.email.trim() });
}
