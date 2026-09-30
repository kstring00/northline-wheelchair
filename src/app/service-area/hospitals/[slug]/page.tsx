import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site, hospitals, getHospital, getCoreArea, telHref } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { hospitalServiceSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { OnTimePromise } from "@/components/home/OnTimePromise";
import { DraftLabel } from "@/components/ui/Badges";
import { Unconfirmed } from "@/components/ui/Unconfirmed";
import { isSiteLive } from "@/lib/env";
import { FinalCta } from "@/components/home/FinalCta";
import { ArrowRightIcon, CheckIcon, PinIcon } from "@/components/ui/Icons";

export const dynamicParams = false;
export const generateStaticParams = () => hospitals.map((h) => ({ slug: h.slug }));

export async function generateMetadata({ params }: PageProps<"/service-area/hospitals/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const h = getHospital(slug);
  if (!h) return {};
  return buildMetadata({
    title: `Wheelchair Transportation to ${h.name}`,
    description: `Wheelchair van rides to and from ${h.name} in ${h.city}: discharges, appointments and where we pull in. Call ${site.phone.display}.`,
    path: `/service-area/hospitals/${h.slug}`,
  });
}

export default async function HospitalPage({ params }: PageProps<"/service-area/hospitals/[slug]">) {
  const { slug } = await params;
  const h = getHospital(slug);
  if (!h) notFound();
  const path = `/service-area/hospitals/${h.slug}`;
  const areas = h.nearestAreas.map(getCoreArea).filter(Boolean);
  // A note shows on the live site only once Jay has confirmed it; unconfirmed notes show before launch, marked draft.
  const notes = h.dropOffNotes.filter((n) => n.confirmed || !isSiteLive);

  return (
    <>
      <JsonLd data={hospitalServiceSchema(h, path)} />
      <PageHeader
        crumbs={[{ name: "Service Area", path: "/service-area" }, { name: h.name, path }]}
        title={`Wheelchair transportation to ${h.name}`}
        answer={`Wheelchair van rides to and from ${h.name} in ${h.city}, for riders in ${areas.map((a) => a!.name).join(", ")}.${h.localNote ? ` ${h.localNote}` : ""}`}
      />
      <OnTimePromise />

      <Section id="dropoff" tone="white" eyebrow="Where we pull in" title={`Drop-off at ${h.system}`}>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            {notes.some((n) => !n.confirmed) && <div className="mb-4"><DraftLabel what="Drop-off notes: draft, to confirm with Jay" /></div>}
            {notes.length ? (
              <ul className="space-y-4">
                {notes.map((n) => (
                  <li key={n.text} className="flex gap-3 text-lg"><PinIcon className="mt-1 h-5 w-5 shrink-0 text-navy" /> {n.text}</li>
                ))}
              </ul>
            ) : (
              <Unconfirmed />
            )}
          </div>
          <div className="rounded-[var(--radius-card)] bg-morning p-6">
            <h3 className="text-xl font-bold">Campus address</h3>
            <p className="mt-1 text-lg">{h.address}</p>
            <h3 className="mt-5 text-xl font-bold">Typical trips</h3>
            <ul className="mt-2 space-y-2">
              {h.typicalTrips.map((tr) => (
                <li key={tr} className="flex gap-2"><CheckIcon className="mt-1 h-5 w-5 shrink-0 text-navy" /> {tr}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section id="discharge" eyebrow="Going home" title={`Discharge rides from ${h.name}`}>
        <div className="mt-6 max-w-3xl space-y-4 text-lg">
          {/* ASK JAY: do you hold a van for a discharge and adjust when the paperwork is done? Do drivers help up steps at home? */}
          <p>Call as soon as the nurse says a discharge is coming, and give us the window they gave you. <Link href="/services/hospital-discharge" className="font-bold text-navy underline">More about discharge rides</Link>.</p>
          <p>
            Discharge planners: call <a href={telHref} className="font-bold text-navy underline">{site.phone.display}</a>, or <Link href="/partners" className="font-bold text-navy underline">set up a facility account</Link>.
          </p>
        </div>
      </Section>

      <section aria-label="Nearby" className="bg-white py-12">
        <div className="container-page grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold">We pick up nearby in</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {areas.map((a) => (
                <li key={a!.slug}>
                  <Link href={`/service-area/${a!.slug}`} className="inline-flex min-h-12 items-center gap-1.5 rounded-full border-2 border-navy px-4 font-bold text-navy no-underline hover:bg-morning"><PinIcon className="h-4 w-4" /> {a!.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-bold">Other hospitals we serve</h2>
            <ul className="mt-3 space-y-1">
              {hospitals.filter((x) => x.slug !== h.slug).map((x) => (
                <li key={x.slug}><Link href={`/service-area/hospitals/${x.slug}`} className="inline-flex min-h-12 items-center gap-1 font-bold text-navy underline">{x.name} <ArrowRightIcon className="h-4 w-4" /></Link></li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <FinalCta title={`Book a ride to ${h.system}`} />
    </>
  );
}
