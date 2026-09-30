import {
  site,
  coreAreas,
  fullAddress,
  realReviews,
  hasRealReviews,
  type Service,
  type CoreArea,
  type Hospital,
} from "@/config/site";
import { absoluteUrl } from "@/lib/seo";

/** JSON-LD builders. Every value comes from site.ts. Nothing is invented. */

const businessId = absoluteUrl("/#business");
const orgId = absoluteUrl("/#organization");

const sameAs = () => Object.values(site.social).filter(Boolean);

const postalAddress = () => ({
  "@type": "PostalAddress",
  ...(site.address.showStreet ? { streetAddress: site.address.street } : {}),
  addressLocality: site.address.city,
  addressRegion: site.address.region,
  postalCode: site.address.postalCode,
  addressCountry: site.address.country,
});

/** Each core city links to its own page, so Google can tie the area to the URL. */
const areaServed = () => [
  ...coreAreas.map((a) => ({ "@type": "City", name: `${a.name}, TX`, url: absoluteUrl(`/service-area/${a.slug}`) })),
  ...site.moreAreas.map((name) => ({ "@type": "City", name: `${name}, TX` })),
];

const openingHours = () =>
  site.hours.map((h) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: h.days.map((d) => `https://schema.org/${d}`),
    opens: h.opens,
    closes: h.closes,
  }));

/** Review + AggregateRating only when real reviews and a real rating exist. */
const ratingBlock = () =>
  hasRealReviews
    ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: site.googleRating,
          reviewCount: site.googleReviewCount ?? realReviews.length,
          bestRating: 5,
          worstRating: 1,
        },
        review: realReviews.map((r) => ({
          "@type": "Review",
          author: { "@type": "Person", name: r.author },
          datePublished: r.date,
          reviewBody: r.text,
          reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
        })),
      }
    : {};

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": orgId,
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    logo: absoluteUrl("/logo.png"),
    telephone: site.phone.e164,
    email: site.email,
    foundingDate: String(site.foundingYear),
    ...(sameAs().length ? { sameAs: sameAs() } : {}),
  };
}

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": businessId,
    name: site.name,
    description: `${site.tagline}. Door-to-door wheelchair van rides in ${coreAreas.map((a) => a.name).join(", ")}, TX.`,
    url: site.url,
    telephone: site.phone.e164,
    email: site.email,
    image: absoluteUrl(site.images.hero.src),
    logo: absoluteUrl("/logo.png"),
    ...(site.pricing.priceRange !== null && site.pricing.displayMode !== "quoteOnly" ? { priceRange: site.pricing.priceRange } : {}),
    address: postalAddress(),
    geo: { "@type": "GeoCoordinates", latitude: site.geo.latitude, longitude: site.geo.longitude },
    areaServed: areaServed(),
    openingHoursSpecification: openingHours(),
    parentOrganization: { "@id": orgId },
    ...(site.languages.includes("es") ? { knowsLanguage: ["en", "es"] } : {}),
    ...(sameAs().length ? { sameAs: sameAs() } : {}),
    ...ratingBlock(),
  };
}

export function serviceSchema(service: Service, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": absoluteUrl(`${path}#service`),
    name: service.name,
    serviceType: service.primaryKeyword,
    description: service.answer,
    url: absoluteUrl(path),
    provider: { "@id": businessId },
    areaServed: areaServed(),
  };
}

export function cityServiceSchema(area: CoreArea, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": absoluteUrl(`${path}#service`),
    name: `${area.name} Wheelchair Transportation`,
    serviceType: "Wheelchair transportation",
    description: area.summary,
    url: absoluteUrl(path),
    provider: { "@id": businessId },
    areaServed: { "@type": "City", name: `${area.name}, TX` },
  };
}

export function hospitalServiceSchema(h: Hospital, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": absoluteUrl(`${path}#service`),
    name: `Wheelchair transportation to ${h.name}`,
    serviceType: "Wheelchair transportation",
    description: `Door-to-door wheelchair van rides to and from ${h.name}, ${h.city}, TX.`,
    url: absoluteUrl(path),
    provider: { "@id": businessId },
    areaServed: { "@type": "Place", name: h.name, address: h.address },
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbSchema(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: absoluteUrl(c.path) })),
  };
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export function articleSchema(a: { title: string; description: string; date: string; author: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    datePublished: a.date,
    author: { "@type": "Person", name: a.author },
    publisher: { "@id": orgId },
    mainEntityOfPage: absoluteUrl(a.path),
  };
}

export { fullAddress };
