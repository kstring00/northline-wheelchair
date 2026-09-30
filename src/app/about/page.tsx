import type { Metadata } from "next";
import { site } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/layout/PageHeader";
import { OwnerNote } from "@/components/home/OwnerNote";
import { TrustStats } from "@/components/home/TrustStats";
import { FinalCta } from "@/components/home/FinalCta";

export const metadata: Metadata = buildMetadata({
  title: "About Jay & Northline Wheelchair Transportation, Houston",
  description: `Meet Jay, owner of ${site.name}. Why he started a Houston wheelchair van service, and the driver and vehicle standards behind every ride.`,
  path: "/about",
});

// PHASE 2: Jay's full story, team photos, and verified credentials.
export default function AboutPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ name: "About", path: "/about" }]}
        title="About Northline and Jay"
        answer={`${site.name} is a locally owned wheelchair van service on Houston's north side, started by Jay to give riders the kind of careful, on-time help he wanted for his own family.`}
        cta={false}
      />
      <OwnerNote />
      <TrustStats />
      <FinalCta />
    </>
  );
}
