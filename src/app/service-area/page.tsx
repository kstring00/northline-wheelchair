import type { Metadata } from "next";
import Link from "next/link";
import { site, coreAreas, areaList } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { FinalCta } from "@/components/home/FinalCta";
import { PinIcon } from "@/components/ui/Icons";

export const metadata: Metadata = buildMetadata({
  title: "Wheelchair Transportation Service Area | North Houston",
  description: `Wheelchair van rides in ${areaList()}, plus ${site.moreAreas.slice(0, 4).join(", ")} and more. See the hospitals and clinics we drive to.`,
  path: "/service-area",
});

// PHASE 2: add the service-area map and the full hospital/clinic directory.
export default function ServiceAreaPage() {
  const facilities = Array.from(new Set(coreAreas.flatMap((a) => a.facilities))).sort();
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Service Area", path: "/service-area" }]}
        title="Our wheelchair transportation service area"
        answer={`Northline picks up riders across north Houston, including ${areaList()}, and drives to appointments anywhere in the Houston area, including the Texas Medical Center.`}
      />
      <Section id="cities" tone="white" eyebrow="Main areas" title="Cities we serve every day">
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coreAreas.map((a) => (
            <li key={a.slug} className="lift-card rounded-[var(--radius-card)] border border-hairline bg-cream">
              <Link href={`/service-area/${a.slug}`} className="flex min-h-24 items-start gap-4 rounded-[var(--radius-card)] p-5 no-underline">
                <PinIcon className="mt-1 h-6 w-6 shrink-0 text-navy-700" />
                <span>
                  <span className="block text-xl font-bold text-navy-900">{a.name} wheelchair transportation</span>
                  <span className="mt-1 block text-muted">{a.summary}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <h3 className="mt-12 text-xl font-bold">Also serving</h3>
        <p className="mt-2 text-lg text-muted">{site.moreAreas.join(", ")}. Not on the list? Call {site.phone.display} and ask.</p>
      </Section>
      <Section id="facilities" eyebrow="Where we drive" title="Hospitals and clinics we drive to">
        <ul className="mt-8 grid gap-x-8 gap-y-2 sm:grid-cols-2">
          {facilities.map((f) => <li key={f} className="text-lg">{f}</li>)}
        </ul>
      </Section>
      <FinalCta />
    </>
  );
}
