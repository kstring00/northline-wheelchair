// Launch guard (runs in prebuild and CI). Only bites when the build is the
// live site: NEXT_PUBLIC_SITE_LIVE=true. Then the build fails, with a message
// saying exactly what to fix, if
//   - the phone number is still a placeholder (contains 555),
//   - the street address is still a placeholder (contains 12345),
//   - any form could accept a lead it can't deliver: RESEND_API_KEY,
//     BOOKING_TO_EMAIL, BOOKING_FROM_EMAIL and the lead store
//     (UPSTASH_REDIS_REST_URL + _TOKEN, or KV_REST_API_URL + _TOKEN) must be set.
import { site } from "../src/config/site";

const live = process.env.NEXT_PUBLIC_SITE_LIVE === "true";
if (!live) {
  console.log("check:launch skipped (NEXT_PUBLIC_SITE_LIVE is not true)");
  process.exit(0);
}

const problems: string[] = [];
if (/555/.test(site.phone.display) || /555/.test(site.phone.e164)) {
  problems.push(`site.ts phone is a placeholder (${site.phone.display}). Put Jay's real number in src/config/site.ts (phone.display and phone.e164).`);
}
if (site.dispatchPhone && /555/.test(site.dispatchPhone.display)) {
  problems.push(`site.ts dispatchPhone is a placeholder (${site.dispatchPhone.display}).`);
}
if (/12345/.test(site.address.street)) {
  problems.push(`site.ts street address is a placeholder (${site.address.street}). Put the real address in, or set address.showStreet to false and remove the street.`);
}
for (const key of ["RESEND_API_KEY", "BOOKING_TO_EMAIL", "BOOKING_FROM_EMAIL"]) {
  if (!process.env[key]) problems.push(`${key} is not set. The forms would accept leads they can't email.`);
}
const store =
  (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) || (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
if (!store) problems.push("The lead store is not configured (UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN, or KV_REST_API_URL + KV_REST_API_TOKEN). Every lead must be stored as well as emailed.");

if (problems.length) {
  console.error("\ncheck:launch FAILED. This is a live build (NEXT_PUBLIC_SITE_LIVE=true) and it isn't ready:\n");
  for (const p of problems) console.error(`  ✗ ${p}`);
  console.error("\nFix these, or build with NEXT_PUBLIC_SITE_LIVE=false.\n");
  process.exit(1);
}
console.log("check:launch passed");
