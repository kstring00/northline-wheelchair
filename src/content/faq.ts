import { site, areaList } from "@/config/site";

export type Faq = { q: string; a: string };

/** General FAQ. Answers pull facts from site.ts; items marked CONFIRM need Jay's sign-off. */
export const faqs: Faq[] = [
  {
    q: "Is Northline an ambulance service?",
    a: "No. We give non-emergency wheelchair van rides. If someone is having a medical emergency, call 911.",
  },
  {
    q: "How far ahead should I book a ride?",
    a: `Please book at least ${site.booking.advanceNotice} ahead when you can. ${site.booking.sameDay}`, // CONFIRM
  },
  {
    q: "Can I stay in my own wheelchair?",
    a: "Yes. You ride in your own manual or power wheelchair. Our ramp and lift vans secure the chair to the floor, and you wear a seat belt. If you don't have a wheelchair, tell us when you book and we can bring one.", // CONFIRM loaner chairs
  },
  {
    q: "Can a family member ride along?",
    a: `Yes. Up to ${site.booking.maxCompanions} companions can ride with you. Just tell us when you book so we save the seats.`, // CONFIRM
  },
  {
    q: "Do you help from the door, or just the curb?",
    a: "Door to door. Your driver comes to your front door, helps you to the van, and walks you inside at the other end. If there are steps at your home, tell us when you book so we can plan for them.", // CONFIRM steps policy
  },
  {
    q: "How much does a ride cost?",
    a: "The price depends on distance, one-way or round trip, and wait time. We always tell you the price before we book the ride, so there are no surprises.", // CONFIRM pricing approach
  },
  {
    q: "Do you take Medicaid or insurance?",
    a: "Texas Medicaid rides are set up through your health plan's ride service. Call us and we'll tell you if we can take your ride, or help you find who can. We also take private pay and can bill facilities directly.", // CONFIRM Medicaid/broker participation
  },
  {
    q: "Can you do repeating rides, like dialysis three times a week?",
    a: "Yes. We set up repeating rides on the same days and times each week, so you don't have to call every time.",
  },
  {
    q: "What if my appointment runs late?",
    a: "That's okay. For round trips, call us when you're ready and we'll come back for you. Doctor visits often run late and we plan for that.", // CONFIRM wait/return policy
  },
  {
    q: "What areas do you serve?",
    a: `We drive riders across ${areaList()}, and many nearby towns. If you're not sure, call us and ask.`,
  },
];

/** Short list shown on the home page. */
export const homeFaqs = [faqs[2], faqs[3], faqs[5], faqs[6], faqs[0]];
