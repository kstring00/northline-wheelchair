import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { listedGuides } from "@/lib/guides";
import { PageHeader } from "@/components/layout/PageHeader";
import { DraftLabel } from "@/components/ui/Badges";
import { FinalCta } from "@/components/home/FinalCta";

export const metadata: Metadata = buildMetadata({
  title: "Caregiver Guides for Wheelchair Rides in Houston",
  description: "Plain guides for families arranging wheelchair van rides in Houston: first rides, recurring dialysis schedules, and the ride home from the hospital.",
  path: "/guides",
});

const fmt = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

export default function GuidesPage() {
  const guides = listedGuides();
  return (
    <>
      <PageHeader crumbs={[{ name: "Guides", path: "/guides" }]} title="Guides for families arranging rides in Houston" answer="Short, plain answers to the questions adult children ask us most. Written by the people who drive the rides." cta={false} />
      <section aria-label="Guides" className="bg-white py-12 sm:py-16">
        <div className="container-page max-w-3xl">
          <ol className="divide-y divide-hairline">
            {guides.map((g) => (
              <li key={g.slug} className="py-8">
                <p className="text-sm text-muted">{fmt(g.date)} · {g.author} · {Math.max(2, Math.round(g.words / 200))} min read</p>
                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                  <Link href={`/guides/${g.slug}`} className="text-navy-900 underline decoration-2 underline-offset-4 hover:text-navy-700">{g.title}</Link>
                </h2>
                <p className="mt-2 text-lg text-muted">{g.description}</p>
                {g.draft && <div className="mt-3"><DraftLabel /></div>}
              </li>
            ))}
          </ol>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
