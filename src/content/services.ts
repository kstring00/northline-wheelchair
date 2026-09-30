import type { Faq } from "@/content/faq";
import { site } from "@/config/site";

/** Service-specific FAQs (shown on each service page). CONFIRM policies with Jay. */
export const serviceFaqs: Record<string, Faq[]> = {
  "wheelchair-transportation": [
    {
      q: "Can your vans carry a power wheelchair or scooter?",
      a: "Yes. Our ramp and lift vans carry most manual and power wheelchairs. If your chair is extra wide or heavy, tell us the size when you book so we send the right van.", // CONFIRM lift weight limits
    },
    {
      q: "Do I have to get out of my wheelchair?",
      a: "No. You stay in your own wheelchair for the whole ride. We lock it to the floor with four straps and give you a seat belt and shoulder belt.", // CONFIRM
    },
    {
      q: "What if there are steps at my home?",
      a: "Tell us when you book. Our drivers can help with a few steps, and we'll talk with you about the safest way in and out.", // CONFIRM steps policy
    },
    {
      q: "How early will the driver arrive?",
      a: "We plan to arrive a few minutes early so you're never rushed. We'll call if anything changes on the road.", // CONFIRM
    },
    {
      q: "Can I book a ride that isn't medical?",
      a: "Yes. We drive riders to church, family events, the store, the airport and more. Any trip where you need a wheelchair van.", // CONFIRM
    },
  ],
};

export const wheelchairIncluded = [
  { title: "Door-to-door help", body: "We meet you at your door and walk you all the way inside when you arrive." },
  { title: "Ramp and lift vans", body: "Roll on in your own chair. No lifting, no transfers." },
  { title: "Secure, comfortable ride", body: "Four-point tie-downs, a seat belt and a calm, careful driver." }, // CONFIRM
  { title: "Family can ride along", body: `Up to ${site.booking.maxCompanions} companions can come with you.` }, // CONFIRM seats and any fee
  { title: "Round trips made easy", body: "Running late? Call when you're ready and we'll come back." }, // CONFIRM
  { title: "A clear price up front", body: "We tell you the price before we book. No surprise fees." }, // CONFIRM
];

export const commonTrips = [
  { label: "Dialysis, three times a week", href: "/services/medical-appointments" },
  { label: "Doctor and specialist visits", href: "/services/medical-appointments" },
  { label: "Physical therapy", href: "/services/medical-appointments" },
  { label: "Going home from the hospital", href: "/services/hospital-discharge" },
  { label: "Texas Medical Center appointments", href: "/service-area/houston" },
  { label: "Church, family visits and errands", href: "/services/senior-transportation" },
];
