import type { Metadata } from "next";
import { site, getService, areaList } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { ServicePageStub } from "@/components/layout/ServicePageStub";

const service = getService("senior-transportation")!;

export const metadata: Metadata = buildMetadata({
  title: "Senior Transportation in Houston, TX",
  description: `Assisted, door-to-door rides for older adults in ${areaList()}. A steady arm from your door to theirs. Call ${site.phone.display}.`,
  path: `/services/${service.slug}`,
});

export default function Page() {
  return <ServicePageStub service={service} title="Senior Transportation in Houston" />;
}
