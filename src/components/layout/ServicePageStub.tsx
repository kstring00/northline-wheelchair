import type { Service } from "@/config/site";
import { serviceSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { ServiceCards } from "@/components/home/ServiceCards";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FinalCta } from "@/components/home/FinalCta";

/**
 * PHASE 2: replace with a full page like /services/wheelchair-transportation.
 * Phase 1 ships correct metadata, H1, direct answer, schema and internal links.
 */
export function ServicePageStub({ service, title }: { service: Service; title: string }) {
  const path = `/services/${service.slug}`;
  return (
    <>
      <JsonLd data={serviceSchema(service, path)} />
      <PageHeader crumbs={[{ name: service.name, path }]} title={title} answer={service.answer} />
      <HowItWorks tone="sand" />
      <Section id="related" tone="white" eyebrow="More ways we help" title="Related services">
        <ServiceCards exclude={service.slug} />
      </Section>
      <FinalCta />
    </>
  );
}
