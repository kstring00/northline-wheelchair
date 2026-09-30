/**
 * Every UI string in one place. A Spanish version (Phase 3) is a second
 * object with the same keys, selected by the route's locale. Page body copy
 * lives beside its page; the strings here are the ones that repeat.
 */
import { site } from "@/config/site";

export const t = {
  brand: {
    wordmark: site.shortName,
    descriptor: "Wheelchair Transportation",
    homeLink: ", home page",
  },
  actions: {
    book: "Book a Ride",
    bookLong: "Book a wheelchair van ride",
    call: "Call Now",
    callNumber: `Call ${site.phone.display}`,
    orCall: `or call ${site.phone.display}`,
    text: "Text us",
    quote: "Get a quote in 2 minutes",
    leaveReview: "Leave a review",
    back: "Back",
    continueTo: (step: string) => `Continue to ${step}`,
    send: "Send ride request",
    sending: "Sending your request…",
    requestAnother: "Request another ride",
    menu: "Menu",
    close: "Close",
    skip: "Skip to main content",
  },
  nav: {
    services: "Services",
    pricing: "Pricing",
    serviceArea: "Service Area",
    partners: "For Facilities",
    safety: "Safety",
    about: "About Jay",
    guides: "Guides",
    faq: "FAQ",
    contact: "Contact",
    main: "Main",
    quickActions: "Quick actions",
    breadcrumb: "Breadcrumb",
  },
  promise: {
    heading: "How we make sure you're never late",
    confirmationCall: "We call the day before to confirm your pickup time.",
    enRouteText: "We text you when your driver is on the way.",
    arriveEarly: (m: number) => `Your driver arrives ${m} minutes early.`,
    waitAndReturn: "Your driver waits during your appointment and brings you home.",
  },
  response: {
    callback: `We call back within ${site.responseTime} during business hours.`,
    callbackShort: `Callback within ${site.responseTime}`,
    afterHours: site.afterHoursPolicy,
  },
  labels: {
    hours: "Hours",
    afterHours: "After hours?",
    draft: "Draft, pending approval",
    confirm: "To confirm with Jay",
    seHabla: "Se habla español",
    stepOf: (n: number, total: number) => `Step ${n} of ${total}`,
    optional: "(optional)",
    error: "Error:",
    weCan: "We can",
    weCant: "We can't",
    askUs: "Ask us",
  },
  footer: {
    services: "Services",
    areas: "Where we drive",
    allAreas: "All service areas",
    company: "Company",
    rights: "All rights reserved.",
    privacy: "Privacy policy",
  },
  notFound: {
    title: "This road doesn't go anywhere",
    body: "We couldn't find that page. You can still book a ride or call us, and we'll get you where you need to go.",
    home: "Go to the home page",
  },
};

export type Dictionary = typeof t;
