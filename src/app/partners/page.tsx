import type { Metadata } from "next";
import Link from "next/link";
import { site, hospitals, telHref } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { PartnerForm } from "@/components/partners/PartnerForm";
import { FinalCta } from "@/components/home/FinalCta";
import { CheckIcon, PhoneIcon } from "@/components/ui/Icons";
import { buttonClass } from "@/components/ui/Button";

export const metadata: Metadata = buildMetadata({
  title: "Patient Transportation for Facilities in North Houston",
  description: `One direct dispatch line for discharge planners, skilled nursing, assisted living and dialysis clinics in north Houston. Standing rides, monthly invoicing. Call ${site.phone.display}.`,
  path: "/partners",
});

const groups = [
  {
    id: "discharge",
    title: "Hospital discharge planners",
    lead: "You need a van that answers the phone and shows up when you said it would.",
    points: ["Same-day rides home, timed to the discharge, with a real pickup window", "A driver who meets the patient at the entrance you name", `Drop-off notes on file for ${hospitals.length} north-side campuses`, "A text to you and the family at pickup and drop-off"],
  },
  {
    id: "snf",
    title: "Skilled nursing and assisted living",
    lead: "Residents to appointments and back, without tying up your staff.",
    points: ["Drivers sign residents in and out at your desk", "Wait & return so residents are never left at a clinic", "Standing rides for therapy and wound care", "One monthly invoice with resident names and dates"],
  },
  {
    id: "dialysis",
    title: "Dialysis and outpatient clinics",
    lead: "Standing schedules for your patients, set once, changed with one call.",
    points: ["Early chairs. Our first vans roll before 5 AM", "The same driver most days, so patients settle in", "Walked to the treatment floor, not the front door", "No-show and delay updates straight to your desk"],
  },
];

export default function PartnersPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ name: "For Facilities", path: "/partners" }]}
        title="Patient rides for facilities in North Houston"
        answer="Northline gives hospitals, nursing facilities and clinics in north Houston one direct dispatch line for patient rides. No portal, no hold queue. Standing schedules set once. One monthly invoice."
        cta={false}
      >
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a href={telHref} className={buttonClass("primary", "lg", "sm:min-w-56")}><PhoneIcon /> Call dispatch</a>
          <Link href="#account" className="inline-flex min-h-14 items-center justify-center rounded-full px-4 text-lg font-bold text-navy-900 underline decoration-2 underline-offset-4 hover:bg-navy-100">or set up an account</Link>
        </div>
      </PageHeader>

      <section aria-label="Who we work with" className="bg-white py-16 sm:py-20">
        <div className="container-page grid gap-12 lg:grid-cols-3 lg:gap-8">
          {groups.map((g) => (
            <article key={g.id} id={g.id} aria-labelledby={`${g.id}-h`} className="border-t-4 border-navy-900 pt-6">
              <h2 id={`${g.id}-h`} className="text-2xl font-bold">{g.title}</h2>
              <p className="mt-2 text-lg text-muted">{g.lead}</p>
              <ul className="mt-5 space-y-3">
                {g.points.map((pt) => (
                  <li key={pt} className="flex gap-3"><CheckIcon className="mt-1 h-5 w-5 shrink-0 text-success" /> {pt}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <Section id="promise" tone="navy" eyebrow="The direct-line promise" title="Call dispatch directly. No portal, no hold queue.">
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {[
            ["A person answers", `${site.phone.display} rings to dispatch, and Jay still takes most calls himself. After hours, ${site.afterHoursPolicy.charAt(0).toLowerCase()}${site.afterHoursPolicy.slice(1)}`],
            ["Recurring rides, set up once", "Give us the patient, the days, the chair time and the end date. We hold the schedule and confirm changes by text."],
            ["Facility invoicing", "One invoice a month, itemized by rider, date and destination. Net-30 terms for account holders."], // CONFIRM terms
          ].map(([h, b]) => (
            <div key={h}>
              <h3 className="text-xl font-bold !text-cream">{h}</h3>
              <p className="mt-2 text-mist">{b}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="account" eyebrow="Get started" title="Set up a facility account">
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <PartnerForm />
          <aside className="space-y-5 lg:pt-2">
            <div className="rounded-[var(--radius-card)] border border-hairline bg-white p-6">
              <h3 className="text-xl font-bold">What happens next</h3>
              <ol className="mt-3 list-decimal space-y-2 pl-5">
                <li>Jay calls you back within {site.responseTime} during business hours.</li>
                <li>We set up billing and the list of people who can book.</li>
                <li>Your first ride can be the same day.</li>
              </ol>
            </div>
            <div className="rounded-[var(--radius-card)] bg-navy-100 p-6">
              <h3 className="text-xl font-bold">Hospitals we serve most</h3>
              <ul className="mt-3 space-y-1">
                {hospitals.map((h) => (
                  <li key={h.slug}><Link href={`/service-area/hospitals/${h.slug}`} className="inline-flex min-h-12 items-center font-bold text-navy-700 underline">{h.name}</Link></li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </Section>

      <FinalCta title="Need a ride for a patient today?" body={`Call dispatch at ${site.phone.display}. Account or not, we'll get them home.`} />
    </>
  );
}
