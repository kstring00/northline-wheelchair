import { site } from "@/config/site";
import { reviewRequestSms, rideCardSms } from "@/content/sms";

/*
 * SMS delivery. Phase 2: Twilio. Until then these functions build the message
 * and return it without sending, so the admin ride view and the booking route
 * can be wired now and go live by adding credentials.
 */

export type SmsResult = { to: string; body: string; sent: false; reason: "phase-2-not-configured" };

/** "Send review request" action on the admin ride view (Phase 2). */
export function sendReviewRequest(to: string): SmsResult {
  // TODO Phase 2: send with Twilio; record sentAt on the ride so it is only sent once.
  const link = site.googleReviewUrl ?? "[Google review link: CONFIRM]";
  return { to, body: reviewRequestSms(link), sent: false, reason: "phase-2-not-configured" };
}

/** Text the confirmed Ride Card to the rider or contact (Phase 2). */
export function sendRideCard(to: string, card: Parameters<typeof rideCardSms>[0]): SmsResult {
  // TODO Phase 2: send with Twilio once Jay has confirmed the price and driver.
  return { to, body: rideCardSms(card), sent: false, reason: "phase-2-not-configured" };
}
