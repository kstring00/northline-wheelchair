import { site, coreAreas, fullAddress, type Service, type CoreArea } from "@/config/site";
import { absoluteUrl } from "@/lib/seo";

/** JSON-LD builders. All values come from site.ts. */

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

const areaServed = () => [
  ...coreAreas.map((a) => ({ "@type": "City", name: `${a.name}, TX` })),
  ...site.moreAreas.map((name) => ({ "@type": "City", name: `${name}, TX` })),
];

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
    description: `${site.tagline}. Door-to-door wheelchair van rides across ${coreAreas.map((a) => a.name).join(", ")}, TX.`,
    url: site.url,
    telephone: site.phone.e164,
    email: site.email,
    image: absoluteUrl(site.images.hero.src),
    logo: absoluteUrl("/logo.png"),
    priceRange: site.priceRange,
    address: postalAddress(),
    geo: { "@type": "GeoCoordinates", latitude: site.geo.latitude, longitude: site.geo.longitude },
    areaServed: areaServed(),
    openingHoursSpecification: site.hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days.map((d) => `https://schema.org/${d}`),
      opens: h.opens,
      closes: h.closes,
    })),
    parentOrganization: { "@id": orgId },
    ...(sameAs().length ? { sameAs: sameAs() } : {}),
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

export type Crumb = { name: string; path: string };

export function breadcrumbSchema(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export { fullAddress };
