import type { Metadata } from "next";
import { site } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { faqSchema } from "@/lib/schema";
import { faqs } from "@/content/faq";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/layout/PageHeader";
import { Accordion } from "@/components/ui/Accordion";
import { CanAndCant } from "@/components/home/CanAndCant";
import { FinalCta } from "@/components/home/FinalCta";

export const metadata: Metadata = buildMetadata({
  title: "Wheelchair Transportation Questions for Houston Riders",
  description: `Sixteen plain answers about wheelchair van rides in Houston: booking, prices, Medicaid, waiting, stairs, oxygen and more. Still stuck? Call ${site.phone.display}.`,
  path: "/faq",
});

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqSchema(faqs)} />
      <PageHeader
        crumbs={[{ name: "FAQ", path: "/faq" }]}
        title="Wheelchair transportation questions, answered for Houston"
        answer="Sixteen questions families and case managers ask us, with the answers we give on the phone. Non-emergency medical transportation, in plain words."
        cta={false}
      />
      <section aria-label="Questions and answers" className="bg-cream pb-8">
        <div className="container-page max-w-3xl">
          <Accordion items={faqs} headingLevel={2} />
        </div>
      </section>
      <CanAndCant />
      <FinalCta title="Still have a question?" body={`Call ${site.phone.display} and talk to a real person, or book your ride online.`} />
    </>
  );
}
