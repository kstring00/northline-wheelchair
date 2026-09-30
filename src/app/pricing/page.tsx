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
  title: "Wheelchair Van Ride Prices in Houston",
  description: `What a wheelchair van ride costs in ${areaList()}: base fare, miles, wait time, companions, nights and weekends. You'll know the price before you ride.`,
  path: "/pricing",
});

const faqs = faqsFor([3, 15, 9, 4]);
const mode = site.pricing.displayMode;

export default function PricingPage() {
  return (
    <>
      <JsonLd data={faqSchema(faqs)} />
      <PageHeader
        crumbs={[{ name: "Pricing", path: "/pricing" }]}
        title="No surprises. You'll know the price before you ride."
        answer={
          mode === "quoteOnly"
            ? `Wheelchair van ride prices in ${areaList()} depend on distance, wait time and the time of day. We give you the exact number when we confirm, before you're charged a dollar. Here are the rules we price by.`
            : `Wheelchair van rides in ${areaList()} start at a base fare that covers the first miles and help from your door to the right suite. Here is every rule we price by, so the number we quote is the number you pay.`
        }
        cta={false}
      />

      <Section id="rules" tone="white" eyebrow="The rules" title="How a fare is built">
        <div className="mt-8">
          <PricingRules />
        </div>
      </Section>

      <Section id="quote" eyebrow="Your trip" title="Get a quote in 2 minutes" intro="Six quick answers. We call back with the exact price for your trip.">
        <div className="mt-8 max-w-3xl">
          <QuoteForm />
        </div>
      </Section>

      <Section id="questions" tone="sand" eyebrow="Questions" title="Money questions, answered">
        <div className="mt-8 max-w-3xl">
          <Accordion items={faqs} />
          <p className="mt-6 text-lg">
            Case managers: facility accounts are invoiced monthly. <Link href="/partners" className="font-bold text-navy-700 underline">See how facilities work with us</Link>.
          </p>
        </div>
      </Section>

      <FinalCta title="Ready to ride?" body="Book online or call. Either way, you'll hear the price before the ride." />
    </>
  );
}
