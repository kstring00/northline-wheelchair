import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { site, coreAreas, getService, areaList } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { serviceSchema } from "@/lib/schema";
import { serviceFaqs, wheelchairIncluded, commonTrips } from "@/content/services";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { Accordion } from "@/components/ui/Accordion";
import { ServiceCards } from "@/components/home/ServiceCards";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Payment } from "@/components/home/Payment";
import { FinalCta } from "@/components/home/FinalCta";
import { ArrowRightIcon, CheckIcon, PinIcon } from "@/components/ui/Icons";

const SLUG = "wheelchair-transportation";
const PATH = `/services/${SLUG}`;
const service = getService(SLUG)!;

export const metadata: Metadata = buildMetadata({
  title: "Wheelchair Transportation in Houston, TX",
  description: `Door-to-door wheelchair van service in ${areaList()}. Ramp and lift vans, trained drivers, family can ride along. Call ${site.phone.display}.`,
  path: PATH,
});

const audiences = [
  { title: "Wheelchair users", body: "Manual or power chair, you roll right on and stay in your own seat." },
  { title: "Families booking for a parent", body: "Book for Mom or Dad from anywhere. We call you to confirm, and you can ride along." },
  { title: "Facilities and case managers", body: "Discharges, standing dialysis schedules and patient rides, with one number to call." },
];

export default function WheelchairTransportationPage() {
  const img = site.images.vanRamp;
  return (
    <>
      <JsonLd data={serviceSchema(service, PATH)} />
      <PageHeader
        crumbs={[{ name: "Wheelchair Transportation", path: PATH }]}
        title={<>Wheelchair Transportation in Houston</>}
        answer={service.answer}
        aside={
          <Image
            src={img.src}
            alt={img.alt}
            width={img.width}
            height={img.height}
            preload
            sizes="(min-width: 1024px) 560px, 100vw"
            className="h-auto w-full rounded-[2rem] shadow-[var(--shadow-lift)]"
          />
        }
      />

      <Section id="included" tone="white" eyebrow="Every ride includes" title="A wheelchair van service built around you">
        <ul className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {wheelchairIncluded.map((item) => (
            <li key={item.title} className="flex gap-4">
              <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-navy-100 text-navy-900">
                <CheckIcon className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="mt-1 text-muted">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="who" eyebrow="Who we drive" title="Rides for riders, families and care teams">
        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {audiences.map((a) => (
            <li key={a.title} className="rounded-[var(--radius-card)] border border-hairline bg-white p-6">
              <h3 className="text-xl font-bold">{a.title}</h3>
              <p className="mt-2 text-muted">{a.body}</p>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-lg">
          Booking for a patient?{" "}
          <Link href="/book?for=facility" className="font-bold text-navy-700 underline decoration-2 underline-offset-4">
            Request a facility or case-manager ride
          </Link>
          .
        </p>
      </Section>

      <Section id="trips" tone="white" eyebrow="Where people go" title="Common wheelchair van trips">
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {commonTrips.map((t) => (
            <li key={t.label}>
              <Link href={t.href} className="lift-card flex min-h-16 items-center justify-between gap-3 rounded-xl border border-hairline bg-cream px-5 py-3 font-bold text-navy-900 no-underline">
                {t.label}
                <ArrowRightIcon className="h-5 w-5 shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <HowItWorks tone="cream" />

      <Section id="safety" tone="navy" eyebrow="Safety first" title="Driver and van standards">
        <div className="mt-10 grid gap-10 md:grid-cols-2">
          {([["Our drivers", site.standards.drivers], ["Our vans", site.standards.vehicles]] as const).map(([h, list]) => (
            <div key={h}>
              <h3 className="text-xl font-bold !text-cream">{h}</h3>
              <ul className="mt-4 space-y-3">
                {list.map((x) => (
                  <li key={x} className="flex gap-3 text-mist">
                    <CheckIcon className="mt-1 h-5 w-5 shrink-0 text-cream" /> {x}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Link href="/about" className="mt-8 inline-flex min-h-12 items-center gap-2 font-bold text-cream underline decoration-2 underline-offset-4">
          Meet Jay and learn how we train drivers <ArrowRightIcon />
        </Link>
      </Section>

      <Payment />

      <Section id="areas" eyebrow="Near you" title="Wheelchair transportation across north Houston">
        <ul className="mt-8 flex flex-wrap gap-3">
          {coreAreas.map((a) => (
            <li key={a.slug}>
              <Link href={`/service-area/${a.slug}`} className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-navy-900 bg-white px-4 font-bold text-navy-900 no-underline hover:bg-navy-100">
                <PinIcon className="h-5 w-5 text-navy-700" /> {a.name} wheelchair transportation
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-lg text-muted">
          Also serving {site.moreAreas.join(", ")}.{" "}
          <Link href="/service-area" className="font-bold text-navy-700 underline">See our full service area</Link>.
        </p>
      </Section>

      <Section id="questions" tone="sand" eyebrow="Questions" title="Wheelchair van questions">
        <div className="mt-8 max-w-3xl">
          <Accordion items={serviceFaqs[SLUG]} />
          <Link href="/faq" className="mt-6 inline-flex min-h-12 items-center gap-2 font-bold text-navy-700 underline decoration-2 underline-offset-4">
            More answers in our FAQ <ArrowRightIcon />
          </Link>
        </div>
      </Section>

      <Section id="related" tone="white" eyebrow="More ways we help" title="Related services">
        <ServiceCards exclude={SLUG} />
      </Section>

      <FinalCta title="Book a wheelchair van ride" />
    </>
  );
}
