import { site } from "@/config/site";

/*
 * Text-message templates. Written the way Jay talks: short, in his name, with
 * a promise to text again. Sending is Phase 2 (Twilio); these are the words.
 */

/** Post-ride review request. Sent once, after the ride, from the admin ride view (Phase 2). */
export function reviewRequestSms(link: string) {
  return `Thanks for riding with Northline. If we did right by you, a review helps other families find us: ${link}`;
}

/** The Ride Card as a text: pickup, drop-off, when, driver. Nothing else. */
export function rideCardSms(r: { contactFirstName?: string; pickup: string; dropoff: string; when: string; driver: string }) {
  const hi = r.contactFirstName ? `Hi ${r.contactFirstName}, this` : "This";
  return `${hi} is Jay with Northline. Your ride is set: ${r.when}, ${r.pickup} to ${r.dropoff}. Driver: ${r.driver}. I'll text when I'm on the way. Questions: ${site.phone.display}`;
}
