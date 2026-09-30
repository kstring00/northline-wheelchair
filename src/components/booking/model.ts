import { site } from "@/config/site";

export type Who = "self" | "loved-one" | "facility";

export type BookingData = {
  who: Who | "";
  pickupAddress: string;
  pickupUnit: string;
  destination: string;
  date: string;
  time: string;
  tripType: "one-way" | "round-trip" | "wait-and-return" | "";
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
  /** Honeypot: humans never see or fill this. Checked server-side in /api/book. */
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

/**
 * Copy that changes with who the ride is for. The required fields use the
 * neutral labels; these tailor the optional "anything else" section.
 */
export function copyFor(who: Who | "") {
  switch (who) {
    case "loved-one":
      return {
        mobilityLegend: "How does your loved one get around?",
        riderLabel: "Rider's full name",
      };
    case "facility":
      return {
        mobilityLegend: "How does the patient get around?",
        riderLabel: "Patient or client name",
      };
    default:
      return {
        mobilityLegend: "How does the rider get around?",
        riderLabel: "Rider's full name",
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

/** The five things we need before Jay can call. Order matches the on-screen order. */
export const requiredFields = ["contactName", "phone", "pickupAddress", "destination", "date", "time"] as const;

/**
 * Plain-language validation for the required fields. Used on the client and
 * again in /api/book. Order matches the on-screen order.
 */
export function validateRequired(d: BookingData, today = todayISO()): Errors {
  const e: Errors = {};
  if (d.contactName.trim().length < 2) e.contactName = "Please enter your name.";
  if (phoneDigits(d.phone).length !== 10) e.phone = `Please enter a 10-digit phone number, like ${site.phone.display}.`;
  if (d.pickupAddress.trim().length < 5) e.pickupAddress = "Please enter the pickup address, with the street and city.";
  if (d.destination.trim().length < 3) e.destination = "Please enter where you're going. A place name and address work best.";
  if (!d.date) e.date = "Please choose the date of the ride.";
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date)) e.date = "Please choose the date of the ride.";
  else if (d.date < today) e.date = "That date has already passed. Please choose today or a later date.";
  if (!d.time) e.time = "Please enter the appointment time.";
  return e;
}

/** Optional fields only get checked when they were filled in. */
export function validateOptional(d: BookingData): Errors {
  const e: Errors = {};
  if (d.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email.trim()))
    e.email = "Please check the email address. It should look like name@example.com.";
  if (d.repeat === "repeat" && d.repeatDays.length === 0) e.repeatDays = "Please choose the days this ride repeats.";
  return e;
}

/** Everything the form checks before sending, in on-screen order. */
export function validateBooking(d: BookingData): Errors {
  return { ...validateRequired(d), ...validateOptional(d) };
}

/**
 * Coerce an untrusted JSON body into a BookingData with every key present
 * (strings trimmed to a sane length, unknown enum values dropped). The route
 * validates the result with validateRequired.
 */
export function coerceBooking(input: unknown): BookingData {
  const src = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const str = (k: keyof BookingData, max = 500) => (typeof src[k] === "string" ? (src[k] as string).slice(0, max) : "");
  const oneOf = <T extends string>(k: keyof BookingData, allowed: readonly T[]): T | "" => {
    const v = src[k];
    return typeof v === "string" && (allowed as readonly string[]).includes(v) ? (v as T) : "";
  };
  return {
    who: oneOf("who", ["self", "loved-one", "facility"] as const),
    pickupAddress: str("pickupAddress"),
    pickupUnit: str("pickupUnit", 200),
    destination: str("destination"),
    date: str("date", 10),
    time: str("time", 5),
    tripType: oneOf("tripType", ["one-way", "round-trip", "wait-and-return"] as const),
    returnTime: str("returnTime", 5),
    repeat: oneOf("repeat", ["once", "repeat"] as const) || "once",
    repeatDays: Array.isArray(src.repeatDays) ? days.filter((x) => (src.repeatDays as unknown[]).includes(x)) : [],
    repeatUntil: str("repeatUntil", 10),
    mobility: oneOf("mobility", ["own-wheelchair", "needs-wheelchair", "walker", "walk-with-help"] as const),
    chairType: oneOf("chairType", ["manual", "power", "not-sure"] as const),
    companions: str("companions", 2) || "0",
    riderName: str("riderName", 200),
    contactName: str("contactName", 200),
    orgName: str("orgName", 200),
    phone: str("phone", 40),
    email: str("email", 200),
    notes: str("notes", 4000),
    website: str("website", 200),
  };
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
