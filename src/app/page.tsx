import type { Metadata } from "next";
import Link from "next/link";
import { site, areaList, hoursSummary } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { homeFaqs } from "@/content/faq";
import { Hero } from "@/components/home/Hero";
import { StatsStrip } from "@/components/home/StatsStrip";
import { ServiceList } from "@/components/home/ServiceList";
import { HowItWorks } from "@/components/home/HowItWorks";
import { OwnerNote } from "@/components/home/OwnerNote";
import { ReviewStrip } from "@/components/home/ReviewStrip";
import { AreasPreview } from "@/components/home/AreasPreview";
import { PricingTeaser } from "@/components/home/PricingTeaser";
import { FinalCta } from "@/components/home/FinalCta";
import { Section } from "@/components/ui/Section";
import { Accordion } from "@/components/ui/Accordion";
import { ArrowRightIcon } from "@/components/ui/Icons";

export const metadata: Metadata = buildMetadata({
  title: "Wheelchair Transportation in North Houston",
  description: `On-time, door-to-door wheelchair van rides in ${areaList()}. Doctor visits, dialysis, hospital discharge. ${hoursSummary()}. Call ${site.phone.display} or book online.`,
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsStrip />

      <Section
        id="services"
        eyebrow="How we can help"
        title="Wheelchair van rides for every kind of trip"
        intro="From a Monday dialysis chair to a ride home from the hospital, we get you there on time and walk you to the right door."
      >
        <ServiceList />
        <div className="mt-8 flex flex-col gap-3 rounded-[var(--radius-card)] bg-morning p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-lg">
            <strong className="text-navy">Discharge planners and case managers:</strong> one direct line, standing schedules, monthly invoicing.
          </p>
          <Link href="/partners" className="inline-flex min-h-12 shrink-0 items-center gap-2 font-bold text-navy underline decoration-2 underline-offset-4">
            See how facilities work with us <ArrowRightIcon />
          </Link>
        </div>
      </Section>

      <HowItWorks />
      <PricingTeaser />
      <OwnerNote />
      <ReviewStrip />
      <AreasPreview />

      <Section id="faq" tone="sandPattern" eyebrow="Questions" title="Common questions">
        <div className="mt-8 max-w-3xl">
          <Accordion items={homeFaqs} />
          <Link href="/faq" className="mt-6 inline-flex min-h-12 items-center gap-2 font-bold text-navy underline decoration-2 underline-offset-4">
            All sixteen questions, answered <ArrowRightIcon />
          </Link>
        </div>
      </Section>

      <FinalCta />
    </>
  );
}
