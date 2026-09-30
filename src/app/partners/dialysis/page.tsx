import type { Metadata } from "next";
import { site, telHref } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { PartnerLines } from "@/components/partners/PartnerLines";

export const metadata: Metadata = buildMetadata({
  title: "Dialysis Transportation Contracts in North Houston",
  description: "For dialysis clinics and social workers in north Houston: what to send us to set up standing wheelchair van rides around chair times, and how to start a facility account.",
  path: "/partners/dialysis",
});

export default function DialysisPartnersPage() {
  return (
    <>
      <PageHeader
        crumbs={[
          { name: "For Facilities", path: "/partners" },
          { name: "Dialysis contracts", path: "/partners/dialysis" },
        ]}
        title="Dialysis transportation contracts in north Houston"
        answer="For dialysis clinics and the social workers who set up rides for their patients."
        cta={false}
      />

      <Section id="chair-times" tone="white" title="Chair times, and how they change">
        <div className="mt-6 max-w-3xl space-y-4 text-lg">
          <p>
            Dialysis runs on the chair schedule. Each patient has set treatment days and a chair time, and a late arrival can cut a treatment short. Schedules
            also move: a patient changes shifts, goes into the hospital, travels, or stops treatment.
          </p>
          <p>To start a standing ride, send us:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>the patient&apos;s initials and pickup ZIP (we take the full address by phone)</li>
            <li>treatment days and chair time</li>
            <li>whether the patient rides in their own wheelchair</li>
            <li>the name and direct number of the person at your clinic who handles chair changes</li>
          </ul>
          <p>
            When a chair time moves, tell us the new days, the new time and the date it starts. Please keep names, dates of birth and diagnoses out of the
            online form. The account form has a place for standing schedules, initials only.
          </p>
        </div>
      </Section>

      <Section id="how-it-works" title="How it works for a facility">
        <div className="mt-8 max-w-3xl">
          <PartnerLines keys={["standingSchedules", "confirmations", "directLine"]} />
        </div>
        {/* ASK JAY: do you take early chairs, and what is the earliest pickup? Same driver on standing rides? */}
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
