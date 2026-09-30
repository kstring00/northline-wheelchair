import type { Metadata } from "next";
import { site, getService } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { ServicePageStub } from "@/components/layout/ServicePageStub";

const service = getService("hospital-discharge")!;

export const metadata: Metadata = buildMetadata({
  title: "Hospital Discharge Transportation in Houston, TX",
  description: `Wheelchair van rides home from Houston-area hospitals and rehab centers, timed to discharge. For families and discharge planners. Call ${site.phone.display}.`,
  path: `/services/${service.slug}`,
});

export default function Page() {
  return <ServicePageStub service={service} title="Hospital Discharge Transportation in Houston" />;
}
