import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site, coreAreas, getCoreArea, services, hospitals } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { cityServiceSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { FinalCta } from "@/components/home/FinalCta";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/Icons";

export const dynamicParams = false;

export function generateStaticParams() {
  return coreAreas.map((a) => ({ city: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/service-area/[city]">): Promise<Metadata> {
  const { city } = await params;
  const area = getCoreArea(city);
  if (!area) return {};
  return buildMetadata({
    title: `${area.name} Wheelchair Transportation`,
    description: `Wheelchair van rides in ${area.name}, TX: ${area.facilities.slice(0, 2).join(", ")} and more. Door-to-door help. Call ${site.phone.display}.`,
    path: `/service-area/${area.slug}`,
  });
}


export default async function CityPage({ params }: PageProps<"/service-area/[city]">) {
  const { city } = await params;
  const area = getCoreArea(city);
  if (!area) notFound();
  const path = `/service-area/${area.slug}`;

  return (
    <>
      <JsonLd data={cityServiceSchema(area, path)} />
      <PageHeader
        crumbs={[{ name: "Service Area", path: "/service-area" }, { name: area.name, path }]}
        title={`${area.name} Wheelchair Transportation`}
        answer={`Northline gives door-to-door wheelchair van rides in ${area.name} and across ${area.county}. ${area.summary}`}
      />
      <Section id="local" tone="white" eyebrow={`In and around ${area.name}`} title={`Where we drive ${area.name} riders`}>
        <div className="mt-8 grid gap-10 md:grid-cols-3">
          {([
            ["Hospitals and clinics", area.facilities],
            ["Neighborhoods we pick up in", area.neighborhoods],
            ["Typical trips", area.typicalTrips],
          ] as const).map(([h, list]) => (
            <div key={h}>
              <h3 className="text-xl font-bold">{h}</h3>
              <ul className="mt-3 space-y-2">
                {list.map((x) => (
                  <li key={x} className="flex gap-2"><CheckIcon className="mt-1 h-5 w-5 shrink-0 text-success" />{x}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>
      <Section id="services" eyebrow="Services" title={`Wheelchair van services in ${area.name}`}>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {services.map((s) => (
            <li key={s.slug}>
              <Link href={`/services/${s.slug}`} className="lift-card flex min-h-16 items-center justify-between gap-3 rounded-xl border border-hairline bg-white px-5 py-3 font-bold text-navy-900 no-underline">
                {s.name}
                <ArrowRightIcon className="h-5 w-5 shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
        {hospitals.some((h) => h.nearestAreas.includes(area.slug)) && (
          <p className="mt-6 text-lg">
            Hospital drop-off notes:{" "}
            {hospitals.filter((h) => h.nearestAreas.includes(area.slug)).map((h, i, arr) => (
              <span key={h.slug}>
                <Link href={`/service-area/hospitals/${h.slug}`} className="font-bold text-navy-700 underline">{h.name}</Link>
                {i < arr.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>
        )}
        <p className="mt-6 text-lg">
          Nearby:{" "}
          {coreAreas.filter((a) => a.slug !== area.slug).map((a, i, arr) => (
            <span key={a.slug}>
              <Link href={`/service-area/${a.slug}`} className="font-bold text-navy-700 underline">{a.name} wheelchair transportation</Link>
              {i < arr.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>
      </Section>
      <FinalCta title={`Book a wheelchair van in ${area.name}`} />
    </>
  );
}
