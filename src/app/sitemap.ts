import type { MetadataRoute } from "next";
import { coreAreas, services, hospitals } from "@/config/site";
import { absoluteUrl } from "@/lib/seo";
import { publishedGuides } from "@/lib/guides";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entry = (path: string, priority: number, lastModified: Date = now): MetadataRoute.Sitemap[number] => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency: "monthly",
    priority,
  });
  return [
    entry("/", 1),
    entry("/book", 0.9),
    entry("/pricing", 0.9),
    ...services.map((s) => entry(`/services/${s.slug}`, 0.9)),
    entry("/service-area", 0.8),
    ...coreAreas.map((a) => entry(`/service-area/${a.slug}`, 0.8)),
    ...hospitals.map((h) => entry(`/service-area/hospitals/${h.slug}`, 0.7)),
    entry("/partners", 0.8),
    entry("/partners/dialysis", 0.7),
    entry("/partners/discharge", 0.7),
    entry("/safety", 0.7),
    entry("/about", 0.6),
    entry("/faq", 0.6),
    entry("/contact", 0.5),
    entry("/guides", 0.6),
    // Drafts never enter the sitemap.
    ...publishedGuides().map((g) => entry(`/guides/${g.slug}`, 0.5, new Date(g.date))),
    entry("/privacy", 0.2),
  ];
}
