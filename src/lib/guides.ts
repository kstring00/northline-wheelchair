import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { isSiteLive } from "@/lib/env";

export type Guide = {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  draft: boolean;
  content: string;
  words: number;
};

const DIR = join(process.cwd(), "src/content/guides");

/** All guides, newest first. Drafts are included so they can be previewed. */
export function getGuides(): Guide[] {
  return readdirSync(DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const { data, content } = matter(readFileSync(join(DIR, f), "utf8"));
      return {
        slug: f.replace(/\.mdx$/, ""),
        title: String(data.title),
        description: String(data.description),
        date: String(data.date),
        author: String(data.author ?? "Northline"),
        draft: Boolean(data.draft),
        content,
        words: content.split(/\s+/).filter(Boolean).length,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export const getGuide = (slug: string) => getGuides().find((g) => g.slug === slug);

/** Drafts never enter the sitemap. Once live, drafts also disappear from the index page. */
export const publishedGuides = () => getGuides().filter((g) => !g.draft);
export const listedGuides = () => (isSiteLive ? publishedGuides() : getGuides());
