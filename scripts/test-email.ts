/*
 * Send one sample booking email through Resend to check the domain, the
 * From address and the inbox. Run with the key in the environment:
 *
 *   RESEND_API_KEY=re_... BOOKING_TO_EMAIL=jay@example.com npx tsx scripts/test-email.ts
 *
 * Optional: BOOKING_FROM_EMAIL (must be on a domain verified in Resend),
 * RIDER_EMAIL to also send the rider auto-reply to that address.
 */
import { Resend } from "resend";
import { site } from "../src/config/site";
import { bookingEmail, riderAutoReply } from "../src/lib/email";
import { emptyBooking, todayISO, type BookingData } from "../src/components/booking/model";

async function main() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set. Nothing was sent.");
    console.error("Run: RESEND_API_KEY=re_... BOOKING_TO_EMAIL=you@example.com npx tsx scripts/test-email.ts");
    process.exit(1);
  }

  const to = process.env.BOOKING_TO_EMAIL || site.email;
  const from = process.env.BOOKING_FROM_EMAIL || `Northline Bookings <bookings@${new URL(site.url).hostname.replace(/^www\./, "")}>`;

  const inThreeDays = new Date(Date.now() + 3 * 864e5);
  const sample: BookingData = {
    ...emptyBooking,
    who: "facility",
    contactName: "Maria Chen",
    phone: "(281) 555-0142",
    pickupAddress: "1200 Binz St, Houston, TX 77004",
    pickupUnit: "Room 214",
    destination: "DaVita Dialysis, 123 Main St, Spring",
    date: todayISO(inThreeDays),
    time: "09:30",
    tripType: "round-trip",
    returnTime: "13:00",
    repeat: "repeat",
    repeatDays: ["Mon", "Wed", "Fri"],
    riderName: "Ruth Alvarez",
    orgName: "Northwest Dialysis Center",
    mobility: "own-wheelchair",
    chairType: "power",
    companions: "1",
    email: process.env.RIDER_EMAIL ?? "",
    notes: "TEST from scripts/test-email.ts. Use the side entrance on Binz; gate code 4421.",
  };

  const resend = new Resend(apiKey);
  const msg = bookingEmail(sample);
  console.log(`Sending "${msg.subject}"\n  from: ${from}\n  to:   ${to}`);

  const { data, error } = await resend.emails.send({ from, to, subject: `[TEST] ${msg.subject}`, text: msg.text, html: msg.html });
  if (error) {
    console.error("Resend error:", error.name, error.message);
    process.exit(1);
  }
  console.log("Sent. Message id:", data?.id);

  if (sample.email) {
    const reply = riderAutoReply(sample);
    const r = await resend.emails.send({ from, to: sample.email, subject: `[TEST] ${reply.subject}`, text: reply.text, html: reply.html });
    if (r.error) {
      console.error("Rider copy error:", r.error.name, r.error.message);
      process.exit(1);
    }
    console.log("Rider copy sent. Message id:", r.data?.id);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
