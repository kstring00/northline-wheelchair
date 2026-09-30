import { services } from "@/config/site";

export const serviceLinks = services.map((s) => ({ href: `/services/${s.slug}`, label: s.shortName }));

export const mainLinks = [
  { href: "/service-area", label: "Service Area" },
  { href: "/about", label: "About Jay" },
  { href: "/faq", label: "FAQ" },
];
