/**
 * Single source of truth for every business fact on the site.
 *
 * Pages, JSON-LD schema, meta tags, header, footer, pricing, booking and the
 * safety page all read from this file. Anything marked `// CONFIRM` is a
 * realistic placeholder that must be checked with Jay before launch.
 * Run `grep -rn "CONFIRM" src` to list every one.
 *
 * Rendering rule: a `null` value means "unknown". Components render nothing
 * for null. They never invent a number, a policy or a credential.
 *
 * NAP rule: `name`, `address` and `phone` must match the Google Business
 * Profile character for character.
 */

export type ImageAsset = { src: string; alt: string; width: number; height: number };

export type CoreArea = {
  slug: string;
  name: string;
  county: string;
  summary: string;
  neighborhoods: string[];
  facilities: string[];
  typicalTrips: string[];
  geo: { latitude: number; longitude: number };
};

export type Service = {
  slug: string;
  name: string;
  shortName: string;
  /** Place used in the H1: "[name] in [place]". */
  place: string;
  /** The 1–2 sentence direct answer that opens the page. */
  answer: string;
  cardSummary: string;
  primaryKeyword: string;
  /** Question numbers from the master FAQ list (src/content/faq.ts). */
  faqIds: number[];
};

export type Hospital = {
  slug: string;
  name: string;
  system: string;
  /** Campus address, as riders would give it. */
  address: string;
  city: string;
  /** Which core-area page this campus sits nearest. */
  nearestAreas: string[];
  /** Entrance and drop-off notes. Draft until Jay confirms. */
  dropOffNotes: string[];
  dropOffNotesDraft: boolean;
  typicalTrips: string[];
  /** Something true and specific about running rides to this campus. */
  localNote: string;
  /** Real position for the service map (WGS84). */
  geo: { latitude: number; longitude: number };
  /** Street-grid node on the hero map demo (hero-map.svg, 720×520): column i indexes XS (0–16, west→east), row j indexes YS (0–14, north→south). */
  mapNode: { i: number; j: number };
};

export type TeamMember = {
  firstName: string;
  role: string;
  yearsDriving: number | null;
  /** One line in their own words. */
  quote: string;
  certifications: string[];
  photo: ImageAsset | null;
  isPlaceholder: boolean;
};

export type Review = {
  author: string; // "Denise R."
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  date: string; // ISO date
  driverName: string | null;
  source: "google" | "facebook" | "direct";
  sourceUrl: string | null;
  /** Placeholders render with a visible "Example" tag and never enter schema. */
  isPlaceholder: boolean;
};

export type PricingDisplayMode = "full" | "startingAt" | "quoteOnly";

export const site = {
  name: "Northline Wheelchair Transportation",
  shortName: "Northline",
  legalName: "Northline Wheelchair Transportation LLC", // CONFIRM exact legal entity name
  tagline: "Wheelchair van rides you can count on",
  url: "https://www.northlinewheelchair.com", // CONFIRM final domain (www vs non-www)
  foundingYear: 2024, // CONFIRM
  /** Phase 3: adding "es" turns on the /es build. Badge shows only when Spanish is listed. */
  languages: ["en"] as ("en" | "es")[], // CONFIRM does anyone on the team speak Spanish?

  owner: {
    firstName: "Jay",
    fullName: "Jay", // CONFIRM Jay's last name for the About page and schema
    role: "Owner & driver", // CONFIRM
    photo: {
      src: "/images/owner-jay.jpg", // CONFIRM replace with Jay's real photo
      alt: "Jay, owner of Northline Wheelchair Transportation, standing beside a Northline wheelchair van", // CONFIRM
      width: 960,
      height: 1200,
    } satisfies ImageAsset,
    /**
     * Jay's story, in his own words, from questionnaire Q11. Empty until he
     * writes it: the site shows a marked placeholder, never draft copy.
     */
    note: [] as string[], // CONFIRM Q11
    /** Headline for the owner note, in Jay's words. Empty = placeholder. */
    noteHeadline: "", // CONFIRM
  },

  phone: { display: "(281) 555-0142", e164: "+12815550142" }, // CONFIRM
  /** Text messages. When true, a "Text us" button appears next to Call. */
  smsEnabled: true, // CONFIRM can Jay's dispatch line receive texts?
  email: "rides@northlinewheelchair.com", // CONFIRM

  address: {
    street: "12345 Veterans Memorial Dr, Suite 100", // CONFIRM (or hide if Jay runs a service-area business)
    city: "Houston",
    region: "TX",
    postalCode: "77014", // CONFIRM
    country: "US",
    showStreet: true, // CONFIRM
  },
  geo: { latitude: 29.9786, longitude: -95.4786 }, // CONFIRM

  /** The only place hours live. Header, footer, contact, schema and OG all read this. */
  hours: [
    // CONFIRM all hours
    { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "05:00", closes: "20:00", label: "Mon–Fri", display: "5:00 AM – 8:00 PM" },
    { days: ["Saturday"], opens: "06:00", closes: "18:00", label: "Saturday", display: "6:00 AM – 6:00 PM" },
    { days: ["Sunday"], opens: "08:00", closes: "16:00", label: "Sunday", display: "8:00 AM – 4:00 PM" },
  ],
  /** Plain sentence shown under the hours everywhere. */
  afterHoursPolicy: "After hours, leave a message or text. We answer first thing the next morning, and we'll always try to help with an early-morning dialysis chair.", // CONFIRM 24/7, on-call or next-day?

  /** "We call back within ___ during business hours." Used on every success screen and the sticky bar. */
  responseTime: "30 minutes", // CONFIRM

  booking: {
    advanceNotice: "24 hours", // CONFIRM
    sameDay: "We take same-day rides when a van is free. Call and ask.", // CONFIRM
  },

  /** Every line renders only when true / set. This is the brand promise. */
  onTimePromise: {
    confirmationCall: true, // CONFIRM we call the day before to confirm
    enRouteText: true, // CONFIRM we text when the driver is on the way
    arriveEarlyMinutes: 10 as number | null, // CONFIRM
    waitAndReturn: true, // CONFIRM driver waits and brings you home
  },

  /** Home stats. Each renders only when set. */
  stats: {
    years: 12 as number | null, // CONFIRM years Jay has been driving riders
    rides: 5000 as number | null, // CONFIRM
    onTimeRate: 98 as number | null, // CONFIRM percent
  },

  /** Read by /pricing, the booking form, the FAQ and LocalBusiness.priceRange. */
  pricing: {
    displayMode: "startingAt" as PricingDisplayMode, // CONFIRM Jay's choice: "full" | "startingAt" | "quoteOnly"
    currency: "USD",
    base: 45 as number | null, // CONFIRM base fare (first miles included below)
    baseIncludesMiles: 10 as number | null, // CONFIRM
    perMile: 3 as number | null, // CONFIRM per mile after the included miles
    waitPerHour: 25 as number | null, // CONFIRM wait time, billed by the quarter hour after the first 15 minutes
    waitFreeMinutes: 15 as number | null, // CONFIRM
    companionFee: 0 as number | null, // CONFIRM 0 = companions ride free
    roundTripRule: "A round trip is two one-way fares. If the driver waits, wait time is added instead of a second base fare.", // CONFIRM
    afterHoursRule: "Rides before 6 AM, after 6 PM, on weekends or on holidays add one flat fee. We tell you before you book, never after.", // CONFIRM hours and fee (amount lives in afterHoursFee)
    afterHoursFee: 15 as number | null, // CONFIRM
    cancellationWindow: "Cancel up to 2 hours before pickup at no charge. Later than that, we charge half the base fare.", // CONFIRM
    paymentMethods: ["Card", "Cash", "Check", "Facility invoice"], // CONFIRM
    insurance: {
      medicaid: "Texas Medicaid rides are booked through your health plan's ride line, not directly with us. Call and we'll help you find the right number.", // CONFIRM broker enrollment
      medicare: "Medicare does not pay for wheelchair van rides to routine appointments. Most Medicare riders pay privately.", // CONFIRM
      private: "Some long-term care policies reimburse rides. We give you a receipt you can submit.", // CONFIRM
      brokers: [] as string[], // CONFIRM e.g. ["ModivCare", "MTM"] once enrolled
    },
    /** Schema.org priceRange, used only when displayMode !== "quoteOnly". */
    priceRange: "$$", // CONFIRM
  },

  /** What we can and can't do. null = unknown, rendered as "ask us". All CONFIRM. */
  capabilities: {
    ownChair: true, // CONFIRM rider stays in own manual or power chair
    provideChair: true, // CONFIRM we bring a wheelchair if you don't have one
    walker: true, // CONFIRM
    walkWithHelp: true, // CONFIRM
    bariatricMaxLbs: 600 as number | null, // CONFIRM lift rating
    oxygen: true as boolean | null, // CONFIRM portable oxygen OK
    stretcher: false as boolean | null, // CONFIRM
    stairs: false as boolean | null, // CONFIRM drivers carry riders up stairs?
    driversLift: false as boolean | null, // CONFIRM drivers lift riders?
    maxCompanions: 2 as number | null, // CONFIRM
    serviceAnimals: true as boolean | null, // CONFIRM
  },

  /** /safety. Each list renders only the items present. */
  safety: {
    driverScreening: ["Criminal background check", "Drug screening before hire and at random"], // CONFIRM
    driverTraining: ["CPR and First Aid certified", "PASS wheelchair securement training", "Defensive driving course"], // CONFIRM (PASS = CTAA Passenger Assistance Safety and Sensitivity)
    everyRide: ["Four-point wheelchair tie-downs", "Lap and shoulder belt for the rider", "Pre-trip vehicle check with a written checklist"], // CONFIRM
    vehicles: ["Rear-entry ramp vans and side-lift vans", "Lift rated to 600 lbs", "Cleaned and disinfected between riders"], // CONFIRM
    insurance: "Commercial auto and passenger liability insurance", // CONFIRM carrier and limits; do not name a carrier until verified
  },

  coreAreas: [
    {
      slug: "houston",
      name: "Houston",
      county: "Harris County",
      summary: "Wheelchair van rides across north Houston and into the Texas Medical Center.",
      neighborhoods: ["Greenspoint", "Aldine", "Champions", "Northside", "The Heights", "Acres Homes"], // CONFIRM
      facilities: ["Texas Medical Center", "HCA Houston Healthcare Northwest", "Memorial Hermann–Texas Medical Center", "Houston Methodist Hospital"], // CONFIRM
      typicalTrips: ["Specialist visits in the Medical Center", "Dialysis three times a week", "Hospital discharge rides home"], // CONFIRM
      geo: { latitude: 29.7604, longitude: -95.3698 },
    },
    {
      slug: "spring",
      name: "Spring",
      county: "Harris County",
      summary: "Door-to-door wheelchair rides from Spring and Klein to clinics, dialysis and the Medical Center.",
      neighborhoods: ["Old Town Spring", "Klein", "Gleannloch Farms", "Northgate Forest", "Spring Creek Oaks"], // CONFIRM
      facilities: ["HCA Houston Healthcare Northwest", "Kelsey-Seybold Clinic – Spring", "Dialysis centers along FM 2920"], // CONFIRM
      typicalTrips: ["Dialysis near FM 2920", "Rides to Houston Methodist The Woodlands", "Physical therapy visits"], // CONFIRM
      geo: { latitude: 30.0799, longitude: -95.4172 },
    },
    {
      slug: "humble",
      name: "Humble",
      county: "Harris County",
      summary: "Wheelchair van rides for Humble, Atascocita and Kingwood riders.",
      neighborhoods: ["Atascocita", "Kingwood", "Eagle Springs", "Fall Creek", "Walden on Lake Houston"], // CONFIRM
      facilities: ["Memorial Hermann Northeast Hospital", "HCA Houston Healthcare Kingwood", "Dialysis centers near FM 1960"], // CONFIRM
      typicalTrips: ["Rides to Memorial Hermann Northeast", "Dialysis in Atascocita", "Trips into the Medical Center"], // CONFIRM
      geo: { latitude: 29.9988, longitude: -95.2622 },
    },
    {
      slug: "the-woodlands",
      name: "The Woodlands",
      county: "Montgomery County",
      summary: "Wheelchair transportation throughout The Woodlands and south Montgomery County.",
      neighborhoods: ["Alden Bridge", "Sterling Ridge", "Panther Creek", "Creekside Park", "Cochran's Crossing"], // CONFIRM
      facilities: ["Memorial Hermann The Woodlands Medical Center", "Houston Methodist The Woodlands Hospital", "St. Luke's Health–The Woodlands Hospital"], // CONFIRM
      typicalTrips: ["Hospital discharge rides home", "Cancer treatment visits", "Rides to senior living communities"], // CONFIRM
      geo: { latitude: 30.1658, longitude: -95.4613 },
    },
    {
      slug: "cypress",
      name: "Cypress",
      county: "Harris County",
      summary: "Wheelchair van rides for Cypress, Towne Lake and Bridgeland families.",
      neighborhoods: ["Towne Lake", "Bridgeland", "Cypress Creek Lakes", "Fairfield", "Coles Crossing"], // CONFIRM
      facilities: ["Houston Methodist Cypress Hospital", "HCA Houston Healthcare North Cypress", "Houston Methodist Willowbrook Hospital"], // CONFIRM
      typicalTrips: ["Rides to Houston Methodist Cypress", "Weekly physical therapy", "Dialysis near US-290"], // CONFIRM
      geo: { latitude: 29.9691, longitude: -95.6972 },
    },
  ] satisfies CoreArea[],

  moreAreas: ["Tomball", "Kingwood", "Atascocita", "Klein", "Aldine", "Jersey Village", "Conroe", "Katy"], // CONFIRM

  /** Hospital landing pages. Every entry is CONFIRM until Jay gives his real list. */
  hospitals: [
    {
      slug: "hca-houston-healthcare-northwest",
      name: "HCA Houston Healthcare Northwest",
      system: "HCA Houston Healthcare",
      address: "710 Cypress Creek Pkwy, Houston, TX 77090", // CONFIRM
      city: "Houston",
      nearestAreas: ["houston", "spring", "cypress"],
      dropOffNotes: ["We use the main entrance off Cypress Creek Parkway, under the covered drive.", "For outpatient imaging and the cath lab, tell us and we'll use the outpatient entrance instead.", "Discharges usually leave from the main lobby. Nurses call us when the paperwork is done."], // CONFIRM
      dropOffNotesDraft: true,
      typicalTrips: ["Discharge rides home to Spring and Klein", "Cardiology and imaging appointments", "ER visits that turn into a ride home"],
      localNote: "This is the closest full hospital to most of our Spring and FM 1960 riders, so our vans are near it most days.", // CONFIRM
      geo: { latitude: 29.9884, longitude: -95.4259 }, // CONFIRM from the street address
      mapNode: { i: 3, j: 2 }, // CONFIRM position on the hero map grid
    },
    {
      slug: "memorial-hermann-the-woodlands",
      name: "Memorial Hermann The Woodlands Medical Center",
      system: "Memorial Hermann",
      address: "9250 Pinecroft Dr, The Woodlands, TX 77380", // CONFIRM
      city: "The Woodlands",
      nearestAreas: ["the-woodlands", "spring"],
      dropOffNotes: ["The main entrance on Pinecroft Drive has a covered drop-off with room for our ramp.", "The medical office buildings next door have separate entrances. Give us the suite number and we'll drop you at the right building.", "For discharges, the transport desk brings riders to the main entrance."], // CONFIRM
      dropOffNotesDraft: true,
      typicalTrips: ["Rides home to The Woodlands and Spring after a stay", "Cancer center visits", "Follow-up visits in the medical office buildings"],
      localNote: "Riders often have a visit at the hospital and a second one in the office buildings on the same campus. Book a wait-and-return and we'll move you between them.", // CONFIRM
      geo: { latitude: 30.1568, longitude: -95.4563 }, // CONFIRM from the street address
      mapNode: { i: 13, j: 12 }, // CONFIRM position on the hero map grid
    },
    {
      slug: "houston-methodist-willowbrook",
      name: "Houston Methodist Willowbrook Hospital",
      system: "Houston Methodist",
      address: "18220 State Hwy 249, Houston, TX 77070", // CONFIRM
      city: "Houston",
      nearestAreas: ["cypress", "spring", "houston"],
      dropOffNotes: ["The main entrance faces Highway 249. We pull into the covered patient drop-off.", "The Willowbrook medical office buildings have their own drop-off on the north side of the campus.", "Parking-garage entrances are tight for a ramp van, so we stay at the front drive."], // CONFIRM
      dropOffNotesDraft: true,
      typicalTrips: ["Discharge rides home to Cypress and Tomball", "Physical therapy visits", "Specialist visits in the office buildings"],
      localNote: "Traffic on 249 stacks up after 3 PM. For afternoon pickups we leave early and text you when we're close.", // CONFIRM
      geo: { latitude: 29.9781, longitude: -95.5519 }, // CONFIRM from the street address
      mapNode: { i: 9, j: 3 }, // CONFIRM position on the hero map grid
    },
    {
      slug: "st-lukes-the-woodlands",
      name: "St. Luke's Health – The Woodlands Hospital",
      system: "St. Luke's Health",
      address: "17200 St Luke's Way, The Woodlands, TX 77384", // CONFIRM
      city: "The Woodlands",
      nearestAreas: ["the-woodlands", "spring"],
      dropOffNotes: ["The main entrance is off St. Luke's Way, with a covered patient drop-off.", "Emergency drop-off is around the side. Tell us if you're going to the ER.", "The campus has several office buildings. Send us the suite number and we'll take you to the door."], // CONFIRM
      dropOffNotesDraft: true,
      typicalTrips: ["Rides home to north Montgomery County after a stay", "Heart and vascular follow-ups", "Rehab and therapy visits"],
      localNote: "It's the farthest north of the hospitals we serve, so we plan extra time on I-45 during the morning rush.", // CONFIRM
      geo: { latitude: 30.1922, longitude: -95.4533 }, // CONFIRM from the street address
      mapNode: { i: 15, j: 9 }, // CONFIRM position on the hero map grid
    },
  ] satisfies Hospital[],

  /** Order of the Home services list, by what brings in rides. "For facilities" lives in the strip below it. */
  homeServiceOrder: ["dialysis-transportation", "medical-appointments", "hospital-discharge", "wheelchair-transportation", "senior-transportation"],

  services: [
    {
      slug: "wheelchair-transportation",
      name: "Wheelchair Transportation",
      shortName: "Wheelchair van rides",
      place: "Houston",
      answer: "Northline gives door-to-door wheelchair van rides in Houston, Spring, Humble, The Woodlands and Cypress. Your driver helps you from your door, secures your wheelchair in a ramp or lift van, and walks you to the right suite.",
      cardSummary: "Door-to-door rides in ramp and lift vans, anywhere in the Houston area. You stay in your own wheelchair the whole way, and your driver walks you to the right door.",
      primaryKeyword: "wheelchair transportation Houston",
      faqIds: [1, 4, 6, 7, 8],
    },
    {
      slug: "medical-appointments",
      name: "Rides to Medical Appointments",
      shortName: "Medical appointments",
      place: "North Houston",
      answer: "Northline drives north Houston riders to doctor visits, therapy, imaging and other medical appointments in a wheelchair van, then waits and brings them home.",
      cardSummary: "Doctor visits, therapy, imaging and follow-ups, timed so you arrive early. Your driver can wait and bring you home.",
      primaryKeyword: "medical transportation north Houston",
      faqIds: [1, 5, 6, 3, 15],
    },
    {
      slug: "dialysis-transportation",
      name: "Dialysis Rides",
      shortName: "Dialysis rides",
      place: "North Houston",
      answer: "Northline gives standing wheelchair van rides to dialysis in north Houston, three times a week on the same days and times, with the same driver whenever we can.",
      cardSummary: "Standing rides three times a week, same days and same times, usually the same driver. Early chairs are our specialty.",
      primaryKeyword: "dialysis transportation Houston",
      faqIds: [10, 2, 5, 12, 3],
    },
    {
      slug: "hospital-discharge",
      name: "Hospital Discharge Rides",
      shortName: "Hospital discharge",
      place: "Houston",
      answer: "Northline picks riders up from Houston hospitals and rehab centers when they're discharged and brings them home in a wheelchair van, often the same day you call.",
      cardSummary: "A ride home from the hospital, timed to the discharge and often the same day. We meet you at the entrance the nurse names.",
      primaryKeyword: "hospital discharge transportation Houston",
      faqIds: [11, 2, 4, 7, 3],
    },
    {
      slug: "senior-transportation",
      name: "Senior Transportation",
      shortName: "Senior rides",
      place: "North Houston",
      answer: "Northline gives assisted rides to older adults in north Houston who walk with a cane, a walker or a steady arm, with a driver who helps from door to door.",
      cardSummary: "Assisted rides for older adults who walk with a cane, a walker or a steady arm. No wheelchair needed to ride with us.",
      primaryKeyword: "senior transportation Houston",
      faqIds: [16, 4, 6, 7, 3],
    },
    {
      slug: "facility-and-discharge-partners",
      name: "Wheelchair Transportation for Facilities",
      shortName: "For facilities",
      place: "North Houston",
      answer: "Northline gives hospitals, skilled nursing, assisted living and dialysis clinics in north Houston one direct dispatch line for patient rides, discharges and standing schedules, billed to a facility account.",
      cardSummary: "One direct line for discharge planners, nursing homes and clinics.",
      primaryKeyword: "patient transportation for facilities Houston",
      faqIds: [11, 10, 9, 14, 13],
    },
  ] satisfies Service[],

  /** Jay first. Placeholder cards render with a CONFIRM label until photos arrive. */
  team: [
    {
      firstName: "Jay",
      role: "Owner & driver",
      yearsDriving: 12, // CONFIRM
      quote: "I drive most of the dialysis runs myself. I like knowing my regulars by name.", // CONFIRM
      certifications: ["CPR", "First Aid", "PASS certified"], // CONFIRM
      photo: null as ImageAsset | null, // CONFIRM real photo
      isPlaceholder: true,
    },
    {
      firstName: "Driver 2", // CONFIRM
      role: "Driver",
      yearsDriving: null,
      quote: "", // CONFIRM one line in their own words
      certifications: [] as string[],
      photo: null as ImageAsset | null,
      isPlaceholder: true,
    },
  ] satisfies TeamMember[],

  /** Real reviews only. Placeholders show an "Example" tag and never enter schema. */
  googleRating: null as number | null, // CONFIRM e.g. 4.9 once the profile has reviews
  googleReviewCount: null as number | null, // CONFIRM
  googleReviewUrl: null as string | null, // CONFIRM "Leave a review" link from the Google Business Profile
  /**
   * Real reviews only. No review, quote or star renders anywhere until this
   * holds an entry with isPlaceholder: false. Filled from the Google Business
   * Profile as reviews come in (CONFIRM).
   */
  reviews: [] as Review[],

  social: {
    googleBusinessProfile: "", // CONFIRM
    facebook: "", // CONFIRM
    instagram: "", // CONFIRM
    nextdoor: "", // CONFIRM
  },

  analytics: {
    clarityProjectId: "", // CONFIRM
    googleSiteVerification: "", // CONFIRM
  },

  images: {
    /** false: the hero shows the brand map pattern. Set true once hero.src is a real photo. */
    heroPhotoReady: false, // CONFIRM
    hero: {
      src: "/images/hero-placeholder.jpg", // CONFIRM real photo of Jay helping a rider into the van
      alt: "A Northline driver guiding a smiling older woman in a wheelchair up the ramp of a navy wheelchair van", // CONFIRM
      width: 1600,
      height: 1200,
    } satisfies ImageAsset,
    vanRamp: { src: "/images/van-ramp-placeholder.jpg", alt: "A Northline wheelchair van with its side ramp lowered to the curb", width: 1600, height: 1067 } satisfies ImageAsset, // CONFIRM
    driverHelping: { src: "/images/driver-helping-placeholder.jpg", alt: "A driver securing a wheelchair with floor straps inside the van", width: 1600, height: 1067 } satisfies ImageAsset, // CONFIRM
  },
};

export type Site = typeof site;

export const coreAreas: readonly CoreArea[] = site.coreAreas;
export const services: readonly Service[] = site.services;
export const hospitals: readonly Hospital[] = site.hospitals;

export const getService = (slug: string) => services.find((s) => s.slug === slug);
export const getCoreArea = (slug: string) => coreAreas.find((a) => a.slug === slug);
export const getHospital = (slug: string) => hospitals.find((h) => h.slug === slug);

export const telHref = `tel:${site.phone.e164}`;
export const smsHref = `sms:${site.phone.e164}`;
export const bookHref = "/book";

/** "Houston, Spring, Humble, The Woodlands and Cypress" */
export function areaList(conj = "and") {
  const names = coreAreas.map((a) => a.name);
  return `${names.slice(0, -1).join(", ")} ${conj} ${names[names.length - 1]}`;
}

export const fullAddress = `${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postalCode}`;

/** Real reviews only (used for the strip's schema and the rating badge). */
export const realReviews = site.reviews.filter((r) => !r.isPlaceholder);
export const hasRealReviews = realReviews.length > 0 && site.googleRating !== null;

export const money = (n: number) => (Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`);

/** Compact hours line for meta descriptions: "Mon–Fri 5 AM–8 PM". */
export function hoursSummary() {
  const h = site.hours[0];
  const short = (t: string) => {
    const [hh, mm] = t.split(":").map(Number);
    return `${((hh + 11) % 12) + 1}${mm ? ":" + String(mm).padStart(2, "0") : ""} ${hh >= 12 ? "PM" : "AM"}`;
  };
  return `${h.label} ${short(h.opens)}–${short(h.closes)}`;
}
