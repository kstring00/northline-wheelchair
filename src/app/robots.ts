import type { MetadataRoute } from "next";
import { isSiteLive } from "@/lib/env";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  // Pre-launch: block everything and don't advertise the sitemap.
  if (!isSiteLive) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
