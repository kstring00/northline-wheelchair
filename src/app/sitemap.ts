import type { MetadataRoute } from "next";
import { coreAreas, services } from "@/config/site";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entry = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: "monthly",
    priority,
  });
  return [
    entry("/", 1),
    entry("/book", 0.9),
    ...services.map((s) => entry(`/services/${s.slug}`, 0.9)),
    entry("/service-area", 0.8),
    ...coreAreas.map((a) => entry(`/service-area/${a.slug}`, 0.8)),
    entry("/about", 0.6),
    entry("/faq", 0.6),
    entry("/privacy", 0.2),
  ];
}
