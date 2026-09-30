import { site } from "@/config/site";

export type Who = "self" | "loved-one" | "facility";
export type Step = 1 | 2 | 3;

export type BookingData = {
  who: Who | "";
  pickupAddress: string;
  pickupUnit: string;
  destination: string;
  date: string;
  time: string;
  tripType: "one-way" | "round-trip" | "";
  returnTime: string;
  repeat: "once" | "repeat";
  repeatDays: string[];
  repeatUntil: string;
  mobility: "own-wheelchair" | "needs-wheelchair" | "walker" | "walk-with-help" | "";
  chairType: "manual" | "power" | "not-sure" | "";
  companions: string;
  riderName: string;
  contactName: string;
  orgName: string;
  phone: string;
  email: string;
  notes: string;
  /** Honeypot: humans never see or fill this. Checked server-side in Phase 2. */
  website: string;
};

export const emptyBooking: BookingData = {
  who: "",
  pickupAddress: "",
  pickupUnit: "",
  destination: "",
  date: "",
  time: "",
  tripType: "",
  returnTime: "",
  repeat: "once",
  repeatDays: [],
  repeatUntil: "",
  mobility: "",
  chairType: "",
  companions: "0",
  riderName: "",
  contactName: "",
  orgName: "",
  phone: "",
  email: "",
  notes: "",
  website: "",
};

export const whoOptions: { value: Who; label: string; hint: string }[] = [
  { value: "self", label: "Myself", hint: "I need a ride for me." },
  { value: "loved-one", label: "A loved one", hint: "A parent, spouse, friend or family member." },
  { value: "facility", label: "A patient or client", hint: "I work at a hospital, clinic, facility or agency." },
];

export const mobilityOptions: { value: Exclude<BookingData["mobility"], "">; label: string; hint: string }[] = [
  { value: "own-wheelchair", label: "Uses their own wheelchair", hint: "Manual or power chair. They stay in it for the ride." },
  { value: "needs-wheelchair", label: "Needs a wheelchair", hint: "We'll bring one for the ride." },
  { value: "walker", label: "Uses a walker or cane", hint: "We'll help with steps and seating." },
  { value: "walk-with-help", label: "Can walk with some help", hint: "A steady arm from door to door." },
];

export const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export const dayNames: Record<string, string> = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday" };

/** Copy that changes with who the ride is for. */
export function copyFor(who: Who | "") {
  switch (who) {
    case "loved-one":
      return {
        tripHeading: "Your loved one's trip",
        pickupLabel: "Where should we pick them up?",
        mobilityLegend: "How does your loved one get around?",
        riderLabel: "Rider's full name",
        contactLabel: "Your name",
        phoneLabel: "Your phone number",
        phoneHint: "We'll call this number to confirm the ride.",
      };
    case "facility":
      return {
        tripHeading: "The patient's trip",
        pickupLabel: "Pickup address (home, hospital or facility)",
        mobilityLegend: "How does the patient get around?",
        riderLabel: "Patient or client name",
        contactLabel: "Your name",
        phoneLabel: "Your direct phone number",
        phoneHint: "We'll call you to confirm. Add an extension in the notes if needed.",
      };
    default:
      return {
        tripHeading: "Your trip",
        pickupLabel: "Where should we pick you up?",
        mobilityLegend: "How do you get around?",
        riderLabel: "Your full name",
        contactLabel: "Your full name",
        phoneLabel: "Your phone number",
        phoneHint: "We'll call this number to confirm the ride.",
      };
  }
}

export type Errors = Partial<Record<keyof BookingData, string>>;

export function phoneDigits(v: string) {
  const d = v.replace(/\D/g, "");
  return d.length === 11 && d.startsWith("1") ? d.slice(1) : d;
}

export function todayISO(now = new Date()) {
  const tz = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tz).toISOString().slice(0, 10);
}

/** Plain-language validation for one step. Order matches the on-screen order. */
export function validateStep(step: Step, d: BookingData): Errors {
  const e: Errors = {};
  if (step === 1) {
    if (!d.who) e.who = "Please choose who this ride is for.";
  }
  if (step === 2) {
    if (d.pickupAddress.trim().length < 5) e.pickupAddress = "Please enter the pickup address, with the street and city.";
    if (d.destination.trim().length < 3) e.destination = "Please enter where you're going. A place name and address work best.";
    if (!d.date) e.date = "Please choose the date of the ride.";
    else if (d.date < todayISO()) e.date = "That date has already passed. Please choose today or a later date.";
    if (!d.time) e.time = "Please enter the appointment or pickup time.";
    if (!d.tripType) e.tripType = "Please choose one-way or round trip.";
    if (d.repeat === "repeat" && d.repeatDays.length === 0) e.repeatDays = "Please choose the days this ride repeats.";
  }
  if (step === 3) {
    if (!d.mobility) e.mobility = "Please choose how the rider gets around.";
    if (d.who !== "self" && d.riderName.trim().length < 2) e.riderName = "Please enter the rider's name.";
    if (d.contactName.trim().length < 2) e.contactName = d.who === "self" ? "Please enter your name." : "Please enter your name so we know who to ask for.";
    if (d.who === "facility" && d.orgName.trim().length < 2) e.orgName = "Please enter your facility or organization name.";
    if (phoneDigits(d.phone).length !== 10) e.phone = `Please enter a 10-digit phone number, like ${site.phone.display}.`;
    if (d.who === "facility" && !d.email.trim()) e.email = "Please enter your work email so we can send the confirmation.";
    else if (d.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email.trim()))
      e.email = "Please check the email address. It should look like name@example.com.";
  }
  return e;
}

export function formatTime(t: string) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function formatDate(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}
