import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/layout/PageHeader";
import { OwnerNote } from "@/components/home/OwnerNote";
import { TeamGrid } from "@/components/home/TeamGrid";
import { StatsStrip } from "@/components/home/StatsStrip";
import { Section } from "@/components/ui/Section";
import { FinalCta } from "@/components/home/FinalCta";
import { CheckIcon } from "@/components/ui/Icons";

export const metadata: Metadata = buildMetadata({
  title: "About Jay",
  brandFirst: true,
  description: `Meet Jay, owner and driver at ${site.name} in north Houston, and the people who drive your rides.`,
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ name: "About", path: "/about" }]}
        title="About Jay and Northline"
        answer={`${site.name} is a locally owned wheelchair van service on Houston's north side.`}
        cta={false}
      />
      <OwnerNote />
      <StatsStrip />
      <TeamGrid />
      <Section id="standards" tone="navy" eyebrow="What we hold ourselves to" title="Every driver, every van, every ride">
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {([["Drivers", [...site.safety.driverScreening, ...site.safety.driverTraining]], ["Every ride", site.safety.everyRide], ["Vans", site.safety.vehicles]] as const).map(([h, list]) => (
            <div key={h}>
              <h3 className="text-xl font-bold !text-cream">{h}</h3>
              <ul className="mt-3 space-y-2">
                {list.map((x) => <li key={x} className="flex gap-2 text-cream/80"><CheckIcon className="mt-1 h-5 w-5 shrink-0 text-cream" /> {x}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <Link href="/safety" className="mt-8 inline-flex min-h-12 items-center font-bold text-cream underline decoration-2 underline-offset-4">Read the full safety page</Link>
      </Section>
      <FinalCta />
    </>
  );
}
