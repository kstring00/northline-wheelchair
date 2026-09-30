import type { Metadata } from "next";
import { site } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { faqSchema } from "@/lib/schema";
import { faqs } from "@/content/faq";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/layout/PageHeader";
import { Accordion } from "@/components/ui/Accordion";
import { FinalCta } from "@/components/home/FinalCta";

export const metadata: Metadata = buildMetadata({
  title: "Wheelchair Transportation FAQ for Houston Riders",
  description: `Answers about wheelchair van rides in Houston: booking, prices, Medicaid, companions and more. Still have questions? Call ${site.phone.display}.`,
  path: "/faq",
});

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqSchema(faqs)} />
      <PageHeader
        crumbs={[{ name: "FAQ", path: "/faq" }]}
        title="Wheelchair transportation questions"
        answer="Straight answers about booking, prices, and what to expect on the day of your ride."
        cta={false}
      />
      <section aria-label="Questions and answers" className="bg-cream pb-8">
        <div className="container-page max-w-3xl">
          <Accordion items={faqs} headingLevel={2} />
        </div>
      </section>
      <FinalCta title="Still have a question?" body={`Call ${site.phone.display} and talk to a real person, or book your ride online.`} />
    </>
  );
}
