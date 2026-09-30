import { services } from "@/config/site";
import { t } from "@/content/dictionary";

export const serviceLinks = services.map((s) => ({ href: `/services/${s.slug}`, label: s.shortName }));

export const mainLinks = [
  { href: "/pricing", label: t.nav.pricing },
  { href: "/service-area", label: t.nav.serviceArea },
  { href: "/partners", label: t.nav.partners },
  { href: "/about", label: t.nav.about },
];

/** Secondary links shown in the mobile menu and footer. */
export const moreLinks = [
  { href: "/safety", label: t.nav.safety },
  { href: "/guides", label: t.nav.guides },
  { href: "/faq", label: t.nav.faq },
  { href: "/contact", label: t.nav.contact },
];
