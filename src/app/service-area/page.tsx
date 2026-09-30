import type { Metadata } from "next";
import Link from "next/link";
import { site, coreAreas, hospitals, areaList } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { FinalCta } from "@/components/home/FinalCta";
import { PinIcon } from "@/components/ui/Icons";

export const metadata: Metadata = buildMetadata({
  title: "Wheelchair Transportation Service Area in North Houston",
  description: `Wheelchair van rides in ${areaList()}, plus ${site.moreAreas.slice(0, 4).join(", ")} and more. See the hospitals and clinics we drive to.`,
  path: "/service-area",
});

// Later: service-area map.
export default function ServiceAreaPage() {
  const facilities = Array.from(new Set(coreAreas.flatMap((a) => a.facilities))).sort();
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Service Area", path: "/service-area" }]}
        title="Wheelchair van service area in north Houston"
        answer={`Northline picks up riders across north Houston, including ${areaList()}, and drives to appointments anywhere in the Houston area, including the Texas Medical Center.`}
      />
      <Section id="cities" tone="white" eyebrow="Main areas" title="Cities we serve every day">
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coreAreas.map((a) => (
            <li key={a.slug} className="lift-card rounded-[var(--radius-card)] border border-ink/15 bg-cream">
              <Link href={`/service-area/${a.slug}`} className="flex min-h-24 items-start gap-4 rounded-[var(--radius-card)] p-5 no-underline">
                <PinIcon className="mt-1 h-6 w-6 shrink-0 text-navy" />
                <span>
                  <span className="block text-xl font-bold text-navy">{a.name} wheelchair transportation</span>
                  <span className="mt-1 block text-ink/85">{a.summary}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <h3 className="mt-12 text-xl font-bold">Also serving</h3>
        <p className="mt-2 text-lg text-ink/85">{site.moreAreas.join(", ")}. Not on the list? Call {site.phone.display} and ask.</p>
      </Section>
      <Section id="hospitals" eyebrow="Hospital pages" title="Hospitals we drive to most, with drop-off notes">
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {hospitals.map((h) => (
            <li key={h.slug} className="lift-card rounded-[var(--radius-card)] border border-ink/15 bg-white">
              <Link href={`/service-area/hospitals/${h.slug}`} className="flex min-h-24 flex-col justify-center rounded-[var(--radius-card)] p-5 no-underline">
                <span className="text-xl font-bold text-navy">{h.name}</span>
                <span className="mt-1 text-ink/85">{h.city} · {h.typicalTrips[0]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
      <Section id="facilities" tone="white" eyebrow="Also" title="Other hospitals and clinics we drive to">
        <ul className="mt-8 grid gap-x-8 gap-y-2 sm:grid-cols-2">
          {facilities.map((f) => <li key={f} className="text-lg">{f}</li>)}
        </ul>
      </Section>
      <FinalCta />
    </>
  );
}
