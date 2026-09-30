import type { Metadata } from "next";
import Link from "next/link";
import { site, areaList } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { faqSchema } from "@/lib/schema";
import { faqsFor } from "@/content/faq";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { Accordion } from "@/components/ui/Accordion";
import { PricingRules } from "@/components/pricing/PricingRules";
import { QuoteForm } from "@/components/pricing/QuoteForm";
import { FinalCta } from "@/components/home/FinalCta";

export const metadata: Metadata = buildMetadata({
  title: "Wheelchair Van Ride Prices in North Houston",
  description: `Wheelchair van ride prices in ${areaList()}. Call ${site.phone.display} or send a quote request and Jay will give you the price before you book.`,
  path: "/pricing",
});

const faqs = faqsFor([3, 15, 9, 4]);

export default function PricingPage() {
  return (
    <>
      <JsonLd data={faqSchema(faqs)} />
      <PageHeader
        crumbs={[{ name: "Pricing", path: "/pricing" }]}
        title="Wheelchair van ride prices in north Houston"
        answer="Call or send a quote request and Jay will give you the price before you book."
        cta={false}
      />

      <Section id="rules" tone="white" eyebrow="The rules" title="How a fare is built">
        <div className="mt-8">
          <PricingRules />
        </div>
      </Section>

      <Section id="quote" eyebrow="Your trip" title="Get a quote in 2 minutes" intro="Tell us about the trip. Jay calls you back with the price before you book.">
        <div className="mt-8 max-w-3xl">
          <QuoteForm />
        </div>
      </Section>

      <Section id="questions" tone="sand" eyebrow="Questions" title="Money questions, answered">
        <div className="mt-8 max-w-3xl">
          <Accordion items={faqs} />
          <p className="mt-6 text-lg">
            Case managers and facilities:{" "}
            <Link href="/partners" className="inline-flex min-h-12 items-center font-bold text-navy underline">see how facilities work with us</Link>.
          </p>
        </div>
      </Section>

      <FinalCta title="Ready to ride?" body="Send a ride request or call. Jay confirms the price with you before your ride is booked." />
    </>
  );
}
