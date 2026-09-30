/*
 * Dates in the business's time zone. Intl only, so it is safe in client
 * bundles (src/lib/leads.ts imports Resend and must stay server-only).
 */

/** Today's date in America/Chicago as YYYY-MM-DD. */
export function chicagoToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}
