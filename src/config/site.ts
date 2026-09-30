/**
 * Single source of truth for every business fact on the site.
 *
 * Pages, JSON-LD schema, meta tags, header, footer and the booking form all
 * read from this file. Anything marked `// CONFIRM` is a realistic placeholder
 * that must be checked with Jay before launch. Run `grep -rn "CONFIRM" src`
 * to list every one.
 *
 * NAP rule: `name`, `address` and `phone` below must match the Google
 * Business Profile character for character.
 */

export type ImageAsset = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type CoreArea = {
  slug: string;
  name: string;
  county: string;
  /** One-line summary used on cards and in meta descriptions. */
  summary: string;
  neighborhoods: string[];
  /** Hospitals, dialysis centers and clinics we regularly drive riders to. */
  facilities: string[];
  typicalTrips: string[];
  geo: { latitude: number; longitude: number };
};

export type Service = {
  slug: string;
  name: string;
  /** Short label for nav and cards. */
  shortName: string;
  /** The 1–2 sentence "direct answer" that opens the service page. */
  answer: string;
  cardSummary: string;
  primaryKeyword: string;
};

export const site = {
  name: "Northline Wheelchair Transportation",
  shortName: "Northline",
  legalName: "Northline Wheelchair Transportation LLC", // CONFIRM exact legal entity name
  tagline: "Wheelchair van rides you can count on",
  url: "https://www.northlinewheelchair.com", // CONFIRM final domain (www vs non-www)
  foundingYear: 2024, // CONFIRM
  priceRange: "$$", // CONFIRM

  owner: {
    firstName: "Jay",
    fullName: "Jay", // CONFIRM Jay's last name for the About page and schema
    role: "Owner and lead driver", // CONFIRM
    photo: {
      src: "/images/owner-jay.jpg", // CONFIRM replace with Jay's real photo
      alt: "Jay, owner of Northline Wheelchair Transportation, standing beside a Northline wheelchair van", // CONFIRM
      width: 960,
      height: 1200,
    } satisfies ImageAsset,
    note: [
      // CONFIRM Jay's own words. Draft written for the pitch.
      "I started Northline after spending a year driving my own dad to dialysis three times a week. Finding a ride that showed up on time, and treated him with respect, was harder than it should have been.",
      "Every rider in my van gets the same care I gave my dad: a hand at the door, a secure ride, and a driver who waits until you are safely inside.",
    ],
  },

  phone: {
    display: "(281) 555-0142", // CONFIRM
    e164: "+12815550142", // CONFIRM
  },
  email: "rides@northlinewheelchair.com", // CONFIRM

  address: {
    street: "12345 Veterans Memorial Dr, Suite 100", // CONFIRM (or hide if Jay runs a service-area business)
    city: "Houston",
    region: "TX",
    postalCode: "77014", // CONFIRM
    country: "US",
    /** Service-area businesses can hide the street on Google. Keep in sync with GBP. */
    showStreet: true, // CONFIRM
  },
  geo: { latitude: 29.9786, longitude: -95.4786 }, // CONFIRM (north Houston placeholder)

  hours: [
    // CONFIRM all hours. Early starts cover dialysis chairs.
    { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "05:00", closes: "20:00", label: "Mon–Fri", display: "5:00 AM – 8:00 PM" },
    { days: ["Saturday"], opens: "06:00", closes: "18:00", label: "Saturday", display: "6:00 AM – 6:00 PM" },
    { days: ["Sunday"], opens: "08:00", closes: "16:00", label: "Sunday", display: "8:00 AM – 4:00 PM" },
  ],

  booking: {
    callbackWindow: "30 minutes", // CONFIRM "We'll call you within ___ to confirm"
    callbackHoursNote: "during business hours", // CONFIRM
    advanceNotice: "24 hours", // CONFIRM preferred notice for new rides
    sameDay: "Same-day rides when a van is free. Call to check.", // CONFIRM
    maxCompanions: 2, // CONFIRM seats for companions per ride
  },

  /** Core areas get their own /service-area/[city] page. North-side focus. */
  coreAreas: [
    {
      slug: "houston",
      name: "Houston",
      county: "Harris County",
      summary: "Wheelchair van rides across north Houston and into the Texas Medical Center.",
      neighborhoods: ["Greenspoint", "Aldine", "Champions", "Northside", "The Heights", "Acres Homes"], // CONFIRM
      facilities: [
        // CONFIRM facilities Jay regularly serves
        "Texas Medical Center",
        "HCA Houston Healthcare Northwest",
        "Memorial Hermann–Texas Medical Center",
        "Houston Methodist Hospital",
      ],
      typicalTrips: ["Specialist visits in the Medical Center", "Dialysis three times a week", "Hospital discharge rides home"], // CONFIRM
      geo: { latitude: 29.7604, longitude: -95.3698 },
    },
    {
      slug: "spring",
      name: "Spring",
      county: "Harris County",
      summary: "Door-to-door wheelchair rides from Spring and Klein to clinics, dialysis and the Medical Center.",
      neighborhoods: ["Old Town Spring", "Klein", "Gleannloch Farms", "Northgate Forest", "Spring Creek Oaks"], // CONFIRM
      facilities: ["HCA Houston Healthcare Northwest", "Kelsey-Seybold Clinic – Spring", "Local dialysis centers along FM 2920"], // CONFIRM
      typicalTrips: ["Dialysis near FM 2920", "Rides to Houston Methodist The Woodlands", "Physical therapy visits"], // CONFIRM
      geo: { latitude: 30.0799, longitude: -95.4172 },
    },
    {
      slug: "humble",
      name: "Humble",
      county: "Harris County",
      summary: "Wheelchair van rides for Humble, Atascocita and Kingwood riders.",
      neighborhoods: ["Atascocita", "Kingwood", "Eagle Springs", "Fall Creek", "Walden on Lake Houston"], // CONFIRM
      facilities: ["Memorial Hermann Northeast Hospital", "HCA Houston Healthcare Kingwood", "Local dialysis centers near FM 1960"], // CONFIRM
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

  /** Additional places served, listed on the hub page (no individual pages). */
  moreAreas: ["Tomball", "Kingwood", "Atascocita", "Klein", "Aldine", "Jersey Village", "Conroe", "Katy"], // CONFIRM

  services: [
    {
      slug: "wheelchair-transportation",
      name: "Wheelchair Transportation",
      shortName: "Wheelchair van rides",
      answer:
        "Northline gives door-to-door wheelchair van rides across north Houston, Spring, Humble, The Woodlands and Cypress. A trained driver helps you from your door, secures your wheelchair in a ramp or lift van, and walks you all the way inside.",
      cardSummary: "Door-to-door rides in ramp and lift vans. You stay in your own wheelchair the whole way.",
      primaryKeyword: "wheelchair transportation Houston",
    },
    {
      slug: "medical-appointments",
      name: "Rides to Medical Appointments",
      shortName: "Medical appointments",
      answer:
        "Northline provides wheelchair van rides to doctor visits, dialysis, physical therapy and other medical appointments across the north Houston area, including repeating rides on a set schedule.",
      cardSummary: "Doctor visits, dialysis, therapy and repeating rides on your schedule.",
      primaryKeyword: "non-emergency medical transportation Houston",
    },
    {
      slug: "hospital-discharge",
      name: "Hospital Discharge Rides",
      shortName: "Hospital discharge",
      answer:
        "Northline picks patients up from Houston-area hospitals and rehab centers when they are discharged and brings them safely home or to their next care setting in a wheelchair van.",
      cardSummary: "A safe ride home from the hospital or rehab, timed to your discharge.",
      primaryKeyword: "hospital discharge transportation",
    },
    {
      slug: "senior-transportation",
      name: "Senior Transportation",
      shortName: "Senior rides",
      answer:
        "Northline offers assisted rides for older adults who can walk with some help, with a driver who gives a steady arm from door to door, across north Houston and nearby suburbs.",
      cardSummary: "Assisted rides for older adults who walk with a cane, walker or a steady arm.",
      primaryKeyword: "senior transportation Houston",
    },
  ] satisfies Service[],

  /** Placeholder counts: CONFIRM every number with Jay before launch. */
  stats: [
    { value: 5000, suffix: "+", label: "rides completed" }, // CONFIRM
    { value: 98, suffix: "%", label: "on-time pickups" }, // CONFIRM
    { value: 12, suffix: "", label: "years of driving experience" }, // CONFIRM
  ],

  /** Driver and vehicle standards. Every item must be verified. */
  standards: {
    drivers: [
      "CPR and First Aid certified", // CONFIRM
      "Criminal background check and drug screening", // CONFIRM
      "Trained in wheelchair securement and safe transfers", // CONFIRM (e.g. CTAA PASS)
      "Clean driving record, checked every year", // CONFIRM
    ],
    vehicles: [
      "Ramp and lift vans rated for power chairs", // CONFIRM
      "Four-point wheelchair tie-downs and shoulder belts", // CONFIRM
      "Inspected and cleaned before every shift", // CONFIRM
      "Fully insured for passenger transportation", // CONFIRM
    ],
  },

  payment: {
    // CONFIRM every option. Do not publish insurance acceptance until Jay confirms.
    options: [
      { title: "Private pay", body: "Pay by card, cash or check. We tell you the price before the ride, with no surprise fees." }, // CONFIRM
      { title: "Medicaid", body: "Texas Medicaid rides are arranged through your health plan's transportation service. Ask us if we can take your ride." }, // CONFIRM brokers
      { title: "Facilities and case managers", body: "We can bill your facility or agency directly for patient rides." }, // CONFIRM
    ],
  },

  testimonials: [
    // CONFIRM Replace with real Google reviews (with permission). `isPlaceholder` shows a "Sample" tag.
    { quote: "Jay got my mother to dialysis on time every single week. She actually looks forward to the ride now.", name: "Denise R.", context: "Daughter of a rider in Spring", isPlaceholder: true },
    { quote: "We book Northline for discharges almost every day. They answer the phone and they show up. That matters.", name: "Marcus T.", context: "Discharge planner, north Houston", isPlaceholder: true },
    { quote: "The driver was patient and kind with my husband's power chair. I didn't have to worry once.", name: "Linda G.", context: "Wife of a rider in Cypress", isPlaceholder: true },
  ],

  social: {
    googleBusinessProfile: "", // CONFIRM GBP URL once claimed
    facebook: "", // CONFIRM
    instagram: "", // CONFIRM
    nextdoor: "", // CONFIRM
  },

  analytics: {
    /** Microsoft Clarity project ID. Empty = no script rendered. */
    clarityProjectId: "", // CONFIRM
    /** Google Search Console HTML-tag verification token. Empty = no tag. */
    googleSiteVerification: "", // CONFIRM
  },

  images: {
    /** Swap the hero photo by changing only src/alt (and width/height to match). */
    hero: {
      src: "/images/hero-placeholder.jpg", // CONFIRM replace with a real photo of Jay helping a rider into the van
      alt: "A Northline driver guiding a smiling older woman in a wheelchair up the ramp of a navy wheelchair van", // CONFIRM
      width: 1600,
      height: 1200,
    } satisfies ImageAsset,
    vanRamp: {
      src: "/images/van-ramp-placeholder.jpg", // CONFIRM
      alt: "A Northline wheelchair van with its side ramp lowered to the curb", // CONFIRM
      width: 1600,
      height: 1067,
    } satisfies ImageAsset,
    driverHelping: {
      src: "/images/driver-helping-placeholder.jpg", // CONFIRM
      alt: "A driver securing a wheelchair with floor straps inside the van", // CONFIRM
      width: 1600,
      height: 1067,
    } satisfies ImageAsset,
    houston: {
      src: "/images/houston-placeholder.jpg", // CONFIRM
      alt: "The downtown Houston skyline at sunrise seen from the north", // CONFIRM
      width: 1600,
      height: 900,
    } satisfies ImageAsset,
  },
};

export type Site = typeof site;

export const coreAreas: readonly CoreArea[] = site.coreAreas;
export const services: readonly Service[] = site.services;

export function getService(slug: string) {
  return services.find((s) => s.slug === slug);
}

export function getCoreArea(slug: string) {
  return coreAreas.find((a) => a.slug === slug);
}

export const telHref = `tel:${site.phone.e164}`;
export const bookHref = "/book";

/** "Houston, Spring, Humble, The Woodlands and Cypress" */
export function areaList(conj = "and") {
  const names = coreAreas.map((a) => a.name);
  return `${names.slice(0, -1).join(", ")} ${conj} ${names[names.length - 1]}`;
}

export const fullAddress = `${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postalCode}`;
