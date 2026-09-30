/*
 * Facility forms: shared types, options, coercion and validation. Pure: used by
 * PartnerForm and PacketForm in the browser and by /api/partner on the server,
 * so both sides apply the same rules.
 *
 * Error keys double as DOM ids after a form prefix ("acct-" or "pk-").
 */

export type Errors = Record<string, string>;

export const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export const packetItems = [
  { value: "rate-sheet", label: "Rate sheet (PDF)" },
  { value: "coi", label: "Certificate of Insurance" },
  { value: "w9", label: "W-9" },
  { value: "driver-credentials", label: "Driver credential summary" },
  { value: "vehicle-spec", label: "Vehicle spec" },
] as const;
export type PacketItem = (typeof packetItems)[number]["value"];

export const facilityTypes = [
  "Hospital",
  "Skilled nursing",
  "Assisted living",
  "Dialysis clinic",
  "Outpatient clinic",
  "Home health",
  "Case management",
  "Other",
] as const;

export const volumeOptions = ["1–2 rides", "3–5", "6–10", "11–20", "More than 20", "Not sure yet"] as const;

export const poOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "not-sure", label: "Not sure" },
];
export const standingOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "not-yet", label: "Not yet" },
];

export const MAX_ROWS = 5;

export type ScheduleRow = { initials: string; days: string[]; time: string; zip: string; notes: string };
export const emptyRow = (): ScheduleRow => ({ initials: "", days: [], time: "", zip: "", notes: "" });

export type AccountData = {
  facility: string;
  facilityType: string;
  contactName: string;
  role: string;
  phone: string;
  email: string;
  billingName: string;
  billingEmail: string;
  poRequired: string;
  bookers: string;
  volume: string;
  standing: string;
  notes: string;
  schedules: ScheduleRow[];
  website: string;
};

export const emptyAccount: AccountData = {
  facility: "",
  facilityType: "",
  contactName: "",
  role: "",
  phone: "",
  email: "",
  billingName: "",
  billingEmail: "",
  poRequired: "",
  bookers: "",
  volume: "",
  standing: "",
  notes: "",
  schedules: [],
  website: "",
};

export type PacketData = { items: string[]; name: string; facility: string; role: string; email: string; website: string };
export const emptyPacket: PacketData = { items: [], name: "", facility: "", role: "", email: "", website: "" };

export function phoneDigits(v: string) {
  const d = v.replace(/\D/g, "");
  return d.length === 11 && d.startsWith("1") ? d.slice(1) : d;
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const isEmail = (v: string) => emailRe.test(v.trim());

export const INITIALS_RE = /^[A-Za-z]{2,3}$/;
export const ZIP_RE = /^\d{5}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** A row with nothing in it is not a row: it is dropped, not flagged. */
export const isBlankRow = (r: ScheduleRow) => !r.initials.trim() && r.days.length === 0 && !r.time && !r.zip.trim() && !r.notes.trim();

export const packetLabel = (v: string) => packetItems.find((p) => p.value === v)?.label ?? v;

/** "W-9", "W-9 and Vehicle spec", "Rate sheet (PDF), W-9 and Vehicle spec" */
export function joinAnd(list: string[]) {
  if (list.length <= 1) return list.join("");
  return `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}`;
}

export function validateAccount(d: AccountData): Errors {
  const e: Errors = {};
  if (d.facility.trim().length < 2) e.facility = "Please enter the facility name.";
  if (!(facilityTypes as readonly string[]).includes(d.facilityType)) e.facilityType = "Please choose the kind of facility.";
  if (d.contactName.trim().length < 2) e.contactName = "Please enter your name.";
  if (phoneDigits(d.phone).length !== 10) e.phone = "Please enter a 10-digit direct phone number.";
  if (!isEmail(d.email)) e.email = "Please enter your work email, like name@facility.org.";
  if (d.billingEmail.trim() && !isEmail(d.billingEmail)) e.billingEmail = "Please check the billing email, or leave it blank.";
  if (!(volumeOptions as readonly string[]).includes(d.volume)) e.volume = "Please choose a rough weekly number of rides.";
  d.schedules.forEach((r, i) => {
    if (isBlankRow(r)) return;
    const n = i + 1;
    if (!INITIALS_RE.test(r.initials.trim())) e[`schedule-${i}-initials`] = `Patient ${n}: please enter 2 or 3 letters for the initials.`;
    if (r.zip.trim() && !ZIP_RE.test(r.zip.trim())) e[`schedule-${i}-zip`] = `Patient ${n}: please enter a 5-digit pickup ZIP.`;
    if (r.time && !TIME_RE.test(r.time)) e[`schedule-${i}-time`] = `Patient ${n}: please enter the time, like 06:30 AM.`;
  });
  return e;
}

export function validatePacket(d: PacketData): Errors {
  const e: Errors = {};
  if (d.items.length === 0) e.items = "Please choose at least one thing to send.";
  if (d.name.trim().length < 2) e.name = "Please enter your name.";
  if (d.facility.trim().length < 2) e.facility = "Please enter the facility name.";
  if (d.role.trim().length < 2) e.role = "Please enter your role.";
  if (!isEmail(d.email)) e.email = "Please enter your work email, like name@facility.org.";
  return e;
}

// Server-side coercion. Unknown keys are ignored; every string is capped.
const str = (v: unknown, max = 200) => (typeof v === "string" ? v.slice(0, max) : "");
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {});

export function coerceAccount(input: unknown): AccountData {
  const b = obj(input);
  const rows = Array.isArray(b.schedules) ? b.schedules.slice(0, MAX_ROWS) : [];
  return {
    facility: str(b.facility),
    facilityType: str(b.facilityType),
    contactName: str(b.contactName),
    role: str(b.role),
    phone: str(b.phone, 40),
    email: str(b.email),
    billingName: str(b.billingName),
    billingEmail: str(b.billingEmail),
    poRequired: poOptions.some((o) => o.value === b.poRequired) ? (b.poRequired as string) : "",
    bookers: str(b.bookers, 2000),
    volume: str(b.volume),
    standing: standingOptions.some((o) => o.value === b.standing) ? (b.standing as string) : "",
    notes: str(b.notes, 2000),
    schedules: rows
      .map((raw) => {
        const r = obj(raw);
        const rowDays = Array.isArray(r.days) ? days.filter((x) => (r.days as unknown[]).includes(x)) : [];
        return { initials: str(r.initials, 10), days: [...rowDays], time: str(r.time, 10), zip: str(r.zip, 10), notes: str(r.notes, 500) };
      })
      .filter((r) => !isBlankRow(r)),
    website: str(b.website),
  };
}

export function coercePacket(input: unknown): PacketData {
  const b = obj(input);
  const items = Array.isArray(b.items) ? packetItems.map((p) => p.value).filter((v) => (b.items as unknown[]).includes(v)) : [];
  return { items, name: str(b.name), facility: str(b.facility), role: str(b.role), email: str(b.email), website: str(b.website) };
}
