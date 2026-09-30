import { site, areaList, money, hospitals } from "@/config/site";

export type Faq = { id: number; q: string; a: string };

const p = site.pricing;
const c = site.capabilities;
const yesNo = (v: boolean | null, yes: string, no: string, unknown: string) => (v === null ? unknown : v ? yes : no);

/**
 * The master FAQ. Every answer is 2–3 plain sentences and pulls its facts from
 * site.ts, so a policy change in one place updates every page and the schema.
 * Answers that depend on Jay's policy are CONFIRM until he signs off.
 */
export const faqs: Faq[] = [
  {
    id: 1,
    q: "How do I book a ride, and how much notice do you need?",
    a: `Call ${site.phone.display} or send a ride request online. It takes about two minutes, and we call you back within ${site.responseTime} to confirm. Please give us ${site.booking.advanceNotice} when you can.`, // CONFIRM
  },
  {
    id: 2,
    q: "Do you take same-day rides?",
    a: `${site.booking.sameDay} Same-day hospital discharges are the most common one, and we plan our days around them.`, // CONFIRM
  },
  {
    id: 3,
    q: "What does a ride cost, and are nights and weekends different?",
    a:
      p.displayMode === "quoteOnly"
        ? `The price depends on distance, wait time and the time of day. We tell you the exact price before you book, and it never changes after. ${p.afterHoursRule}` // CONFIRM
        : `Rides start at ${money(p.base ?? 0)}, which covers the first ${p.baseIncludesMiles} miles${p.displayMode === "full" && p.perMile ? `, then ${money(p.perMile)} a mile` : ""}. ${p.afterHoursRule}${p.displayMode === "full" && p.afterHoursFee ? ` The fee is ${money(p.afterHoursFee)}.` : ""} You'll know the full price before you book.`, // CONFIRM
  },
  {
    id: 4,
    q: "Can a family member or caregiver ride along?",
    a: `Yes. Up to ${c.maxCompanions ?? "two"} people can ride with you${p.companionFee === 0 ? ", at no charge" : p.companionFee ? ` for ${money(p.companionFee)} each` : ""}. Tell us when you book so we save the seats.`, // CONFIRM
  },
  {
    id: 5,
    q: "Will the driver wait during my appointment and bring me home?",
    a: site.onTimePromise.waitAndReturn
      ? `Yes. Book a wait-and-return ride and your driver waits, walks you back out, and takes you home. ${p.waitFreeMinutes ? `The first ${p.waitFreeMinutes} minutes of waiting are free` : "Wait time is billed by the hour"}${p.waitPerHour ? `, then ${money(p.waitPerHour)} an hour` : ""}.` // CONFIRM
      : `For round trips, call us when you're done and we'll come back for you. Tell us your appointment length when you book and we'll plan the return.`, // CONFIRM
  },
  {
    id: 6,
    q: "Will you help me into the building and find the right suite?",
    a: "Yes. Door to door means your driver comes to your front door, and at the other end walks you inside to the right suite or check-in desk. Give us the suite number when you book and we'll take you straight there.", // CONFIRM
  },
  {
    id: 7,
    q: "Do your drivers lift riders? What about stairs?",
    a: `${yesNo(c.driversLift, "Our drivers can help lift a rider for a short transfer.", "For safety, our drivers don't lift riders. You ride in your own chair, on our ramp or lift.", "Ask us about lifting when you book.")} ${yesNo(c.stairs, "We can help with a few steps at the door.", "We can't carry riders up or down stairs. If there are steps at your door, tell us when you book and we'll talk through the safest plan.", "Tell us about steps at your door when you book.")}`, // CONFIRM
  },
  {
    id: 8,
    q: "Do you provide a wheelchair if I don't have one?",
    a: yesNo(c.provideChair, "Yes. Tell us when you book and the driver brings a wheelchair for the ride. It's yours from your door to the suite and back.", "We don't carry loaner wheelchairs, so you'll need your own chair for the ride.", "Ask us when you book."), // CONFIRM
  },
  {
    id: 9,
    q: "Do you take Medicaid, Medicare, or insurance?",
    a: `${p.insurance.medicaid} ${p.insurance.medicare}`, // CONFIRM
  },
  {
    id: 10,
    q: "Do you do recurring rides for dialysis or therapy?",
    a: "Yes. We set up standing rides on the same days and times each week, with the same driver whenever we can. You book once and we handle the rest, including early-morning dialysis chairs.", // CONFIRM
  },
  {
    id: 11,
    q: "Can you pick up from a hospital discharge the same day?",
    a: `Usually, yes. Call as soon as the nurse says the discharge is coming, and we'll give you a real pickup window. We serve ${hospitals.slice(0, 2).map((h) => h.name).join(", ")} and every other hospital in the north Houston area.`, // CONFIRM
  },
  {
    id: 12,
    q: "Can I bring oxygen or medical equipment?",
    a: `${yesNo(c.oxygen, "Yes. Portable oxygen rides with you, secured next to your chair.", "We can't carry oxygen on board.", "Ask us about oxygen when you book.")} Walkers, folding chairs and small equipment are fine. ${yesNo(c.stretcher, "We also take stretcher rides.", "We don't do stretcher rides. If you need one, we'll help you find who does.", "")}`, // CONFIRM
  },
  {
    id: 13,
    q: "Which areas and hospitals do you serve?",
    a: `We pick up across ${areaList()}, and nearby towns like ${site.moreAreas.slice(0, 3).join(", ")}. We drive to any hospital or clinic in the Houston area, including the Texas Medical Center.`,
  },
  {
    id: 14,
    q: "How are your drivers trained and screened?",
    a: `Every driver passes a ${site.safety.driverScreening.join(" and a ").toLowerCase()}. Drivers are ${site.safety.driverTraining.slice(0, 2).join(" and ").replace("CPR and First Aid certified", "CPR and First Aid certified").toLowerCase()}, and every ride uses ${site.safety.everyRide[0].toLowerCase()}.`, // CONFIRM
  },
  {
    id: 15,
    q: "What if I need to cancel?",
    a: `${p.cancellationWindow} Just call or text us as soon as you know.`, // CONFIRM
  },
  {
    id: 16,
    q: "How is this different from Uber or a taxi?",
    a: "Our vans have ramps and lifts, so you ride in your own wheelchair, strapped down and belted in. The driver is trained to help you, walks you inside, and waits if you ask. A rideshare driver waits at the curb, if they show up at all.",
  },
];

export const faqById = (id: number) => faqs.find((f) => f.id === id)!;
export const faqsFor = (ids: number[]) => ids.map(faqById);

/** Short list on the home page. */
export const homeFaqs = faqsFor([3, 5, 4, 7, 9]);
