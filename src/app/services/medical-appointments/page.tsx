import type { Metadata } from "next";
import { site, getService, areaList } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { ServicePageStub } from "@/components/layout/ServicePageStub";

const service = getService("medical-appointments")!;

export const metadata: Metadata = buildMetadata({
  title: "Medical Appointment & Dialysis Transportation in Houston",
  description: `Wheelchair van rides to doctor visits, dialysis and physical therapy in ${areaList()}. Repeating rides on your schedule. Call ${site.phone.display}.`,
  path: `/services/${service.slug}`,
});

export default function Page() {
  return <ServicePageStub service={service} title="Rides to Medical Appointments and Dialysis in Houston" />;
}
