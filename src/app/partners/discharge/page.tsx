import type { Metadata } from "next";
import { site, telHref } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { PartnerLines } from "@/components/partners/PartnerLines";

export const metadata: Metadata = buildMetadata({
  title: "Hospital Discharge Transportation for Case Managers in North Houston",
  description: "For hospital case managers and discharge planners in north Houston: how to time a wheelchair van ride home, what to have ready when you call, and how to set up an account.",
  path: "/partners/discharge",
});

export default function DischargePartnersPage() {
  return (
    <>
      <PageHeader
        crumbs={[
          { name: "For Facilities", path: "/partners" },
          { name: "Discharge rides", path: "/partners/discharge" },
        ]}
        title="Hospital discharge transportation for case managers in north Houston"
        answer="For case managers and discharge planners who need a patient home in a wheelchair van."
        cta={false}
      />

      <Section id="timing" tone="white" title="Timing a discharge ride">
        <div className="mt-6 max-w-3xl space-y-4 text-lg">
          <p>
            A discharge time moves. The order is written, then come pharmacy, teaching, paperwork and a final sign-off. The time the family hears in the
            morning is often not the time the patient is ready to leave.
          </p>
          <p>
            Call{" "}
            <a href={telHref} className="font-bold text-navy underline decoration-2 underline-offset-4">{site.phone.display}</a>{" "}
            as soon as you know the discharge is likely today, and again when the patient is ready. For a patient who is waiting now, call. The online form is
            for setting up an account.
          </p>
          <p>Have this ready when you call:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>the campus, the unit, and the entrance where the patient will wait</li>
            <li>the earliest time the patient could be ready, and who will call when they are</li>
            <li>whether the patient has their own wheelchair</li>
            <li>where they are going, and who will meet them there</li>
            <li>who is paying: your facility, the patient or family, or another payer</li>
          </ul>
          <p>If you book discharges often, send us your team&apos;s names and your billing contact once, through the account form.</p>
        </div>
      </Section>

      <Section id="how-it-works" title="How it works for a facility">
        <div className="mt-8 max-w-3xl">
          <PartnerLines keys={["directLine", "confirmations", "invoicing"]} />
        </div>
        {/* ASK JAY: same-day discharges: how late in the day can a case manager call and still get a van? */}
      </Section>

      <Section id="start" tone="white" title="Start with an account">
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <ButtonLink href="/partners#account" size="lg" className="sm:min-w-56">Set up a facility account</ButtonLink>
          <a href={telHref} className="inline-flex min-h-14 items-center justify-center rounded-full px-4 text-lg font-bold text-navy underline decoration-2 underline-offset-4 hover:bg-morning">
            or call {site.phone.display}
          </a>
        </div>
      </Section>
    </>
  );
}
