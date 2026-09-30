import type { Metadata } from "next";
import { site } from "@/config/site";
import { isSiteLive } from "@/lib/env";

type PageMeta = {
  /**
   * Keyword-first title: "[Service] in [Place]". The brand suffix
   * "| Northline Wheelchair Transportation" is added here. Only /about and
   * /contact may lead with the brand (pass `brandFirst`).
   */
  title: string;
  description: string;
  path: string;
  brandFirst?: boolean;
  /** Draft content: never indexed, even when the site is live. */
  draft?: boolean;
};

export const robotsMeta: Metadata["robots"] = isSiteLive
  ? { index: true, follow: true }
  : { index: false, follow: false };

export function buildMetadata({ title, description, path, brandFirst, draft }: PageMeta): Metadata {
  const fullTitle = brandFirst ? `${site.name} | ${title}` : `${title} | ${site.name}`;
  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: path },
    robots: draft ? { index: false, follow: false } : robotsMeta,
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: site.name,
      url: path,
      title: fullTitle,
      description,
    },
    twitter: { card: "summary_large_image", title: fullTitle, description },
  };
}

export function absoluteUrl(path = "/") {
  return new URL(path, site.url).toString();
}
