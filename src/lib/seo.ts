import type { Metadata } from "next";
import { site } from "@/config/site";
import { isSiteLive } from "@/lib/env";

type PageMeta = {
  /** Page title without the brand suffix. Include the service and city. */
  title: string;
  description: string;
  path: string;
  /** Use the full title as-is (home page). */
  absoluteTitle?: boolean;
};

export const robotsMeta: Metadata["robots"] = isSiteLive
  ? { index: true, follow: true }
  : { index: false, follow: false };

export function buildMetadata({ title, description, path, absoluteTitle }: PageMeta): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | ${site.shortName}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    robots: robotsMeta,
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: site.name,
      url: path,
      title: fullTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}

export function absoluteUrl(path = "/") {
  return new URL(path, site.url).toString();
}
