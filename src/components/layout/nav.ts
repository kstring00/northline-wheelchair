import { services } from "@/config/site";
import { t } from "@/content/dictionary";

export const serviceLinks = services.map((s) => ({ href: `/services/${s.slug}`, label: s.shortName }));

/** `shortLabel` is shown on laptop widths (1024–1279px) so the header fits; the full label stays the accessible name. */
export const mainLinks: { href: string; label: string; shortLabel?: string }[] = [
  { href: "/pricing", label: t.nav.pricing },
  { href: "/service-area", label: t.nav.serviceArea },
  { href: "/partners", label: t.nav.partners },
  { href: "/about", label: t.nav.about, shortLabel: "About" },
];

/** Secondary links shown in the mobile menu and footer. */
export const moreLinks = [
  { href: "/safety", label: t.nav.safety },
  { href: "/guides", label: t.nav.guides },
  { href: "/faq", label: t.nav.faq },
  { href: "/contact", label: t.nav.contact },
];
