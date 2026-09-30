/*
 * The quote request: fields, options and validation, shared by QuoteForm (client)
 * and /api/quote (server). Pure: no React, no Resend.
 */

export type QuoteData = { pickupZip: string; destZip: string; date: string; mobility: string; tripType: string; phone: string; website: string };
export type QuoteErrors = Partial<Record<keyof QuoteData, string>>;

export const emptyQuote: QuoteData = { pickupZip: "", destZip: "", date: "", mobility: "", tripType: "", phone: "", website: "" };

export const quoteMobilityOptions = [
  { value: "wheelchair", label: "Wheelchair" },
  { value: "walker", label: "Walker or cane" },
  { value: "ambulatory", label: "Walks with a little help" },
] as const;

export const quoteTripTypeOptions = [
  { value: "one-way", label: "One-way" },
  { value: "round-trip", label: "Round trip" },
  { value: "wait-and-return", label: "Wait & return" },
] as const;

export const labelFor = (list: readonly { value: string; label: string }[], v: string) => list.find((o) => o.value === v)?.label;

export const phoneDigits = (v: string) => {
  const d = v.replace(/\D/g, "");
  return d.length === 11 && d.startsWith("1") ? d.slice(1) : d;
};

/** "(281) 555-0142" from any 10-digit entry; the entry as typed otherwise. */
export const formatPhone = (v: string) => {
  const d = phoneDigits(v);
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : v.trim();
};

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Untrusted JSON → QuoteData (strings only, trimmed, length-capped). */
export function coerceQuote(body: unknown): QuoteData {
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  return {
    pickupZip: str(b.pickupZip, 10),
    destZip: str(b.destZip, 10),
    date: str(b.date, 10),
    mobility: str(b.mobility, 20),
    tripType: str(b.tripType, 20),
    phone: str(b.phone, 30),
    website: str(b.website, 200),
  };
}

const isRealDate = (iso: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
};

/** `today` is the Chicago date (YYYY-MM-DD) from chicagoToday(). */
export function validateQuote(d: QuoteData, today: string): QuoteErrors {
  const e: QuoteErrors = {};
  if (!/^\d{5}$/.test(d.pickupZip.trim())) e.pickupZip = "Please enter the 5-digit pickup ZIP code.";
  if (!/^\d{5}$/.test(d.destZip.trim())) e.destZip = "Please enter the 5-digit ZIP code where you're going.";
  if (!d.date || !isRealDate(d.date)) e.date = "Please choose the date of the ride.";
  else if (d.date < today) e.date = "That date has passed. Please choose today or later.";
  if (phoneDigits(d.phone).length !== 10) e.phone = "Please enter a 10-digit phone number so Jay can call you with the price.";
  if (d.mobility && !labelFor(quoteMobilityOptions, d.mobility)) e.mobility = "Please choose how the rider gets around.";
  if (d.tripType && !labelFor(quoteTripTypeOptions, d.tripType)) e.tripType = "Please choose the kind of trip.";
  return e;
}

/** "2026-10-12" → "Mon Oct 12" (calendar date; no time zone shift). */
export function shortDate(iso: string) {
  if (!isRealDate(iso)) return iso || "date not given";
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const f = (o: Intl.DateTimeFormatOptions) => dt.toLocaleDateString("en-US", { timeZone: "UTC", ...o });
  return `${f({ weekday: "short" })} ${f({ month: "short" })} ${d}`;
}
