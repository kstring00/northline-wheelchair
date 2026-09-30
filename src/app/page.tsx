import type { Metadata } from "next";
import Link from "next/link";
import { site, areaList } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { homeFaqs } from "@/content/faq";
import { Hero } from "@/components/home/Hero";
import { ServiceCards } from "@/components/home/ServiceCards";
import { HowItWorks } from "@/components/home/HowItWorks";
import { TrustStats } from "@/components/home/TrustStats";
import { OwnerNote } from "@/components/home/OwnerNote";
import { Testimonials } from "@/components/home/Testimonials";
import { AreasPreview } from "@/components/home/AreasPreview";
import { Payment } from "@/components/home/Payment";
import { FinalCta } from "@/components/home/FinalCta";
import { Section } from "@/components/ui/Section";
import { Accordion } from "@/components/ui/Accordion";
import { ArrowRightIcon } from "@/components/ui/Icons";

export const metadata: Metadata = buildMetadata({
  title: `Wheelchair Transportation in Houston, TX | ${site.name}`,
  absoluteTitle: true,
  description: `Safe, door-to-door wheelchair van rides in ${areaList()}. Doctor visits, dialysis and hospital discharge. Call ${site.phone.display} or book online.`,
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <Hero />

      <Section
        id="services"
        eyebrow="How we can help"
        title="Wheelchair van service for every kind of trip"
        intro="From a weekly dialysis chair to a ride home from the hospital, we get you there safely and on time."
      >
        <ServiceCards />
        <div className="mt-8 flex flex-col gap-3 rounded-[var(--radius-card)] bg-navy-100 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-lg">
            <strong className="text-navy-900">Case managers and discharge planners:</strong> book patient rides and repeating schedules in one request.
          </p>
          <Link href="/book?for=facility" className="inline-flex min-h-12 shrink-0 items-center gap-2 font-bold text-navy-900 underline decoration-2 underline-offset-4">
            Book a patient ride <ArrowRightIcon />
          </Link>
        </div>
      </Section>

      <HowItWorks />
      <TrustStats />
      <OwnerNote />
      <Testimonials />
      <AreasPreview />
      <Payment />

      <Section id="faq" tone="sand" eyebrow="Questions" title="Common questions">
        <div className="mt-8 max-w-3xl">
          <Accordion items={homeFaqs} />
          <Link href="/faq" className="mt-6 inline-flex min-h-12 items-center gap-2 font-bold text-navy-700 underline decoration-2 underline-offset-4">
            See all wheelchair transportation questions <ArrowRightIcon />
          </Link>
        </div>
      </Section>

      <FinalCta />
    </>
  );
}
