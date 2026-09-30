import type { Metadata } from "next";
import Link from "next/link";
import { site, telHref } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { PartnerForm } from "@/components/partners/PartnerForm";
import { PacketForm } from "@/components/partners/PacketForm";
import { PartnerLines } from "@/components/partners/PartnerLines";
import { FinalCta } from "@/components/home/FinalCta";
import { PhoneIcon } from "@/components/ui/Icons";
import { buttonClass } from "@/components/ui/Button";
import { RideCard, RideCardBack } from "@/components/brand/RideCard";
import { SmsMock } from "@/components/brand/SmsMock";

export const metadata: Metadata = buildMetadata({
  title: "Wheelchair Transportation for Facilities in North Houston",
  description: `Patient rides for discharge planners, nursing and assisted living staff, dialysis clinics and case managers in north Houston. Set up a facility account or call ${site.phone.display}.`,
  path: "/partners",
});

/* What each referral source needs. Their problem, in their words: no Northline claims here. */
const audiences = [
  {
    id: "discharge",
    title: "Hospital discharge planners",
    need: "You need a ride home booked before the discharge paperwork is done.",
    link: { href: "/partners/discharge", label: "Discharge rides: what to send us" },
  },
  {
    id: "snf",
    title: "Skilled nursing and assisted living",
    need: "You need residents at their appointments and back without pulling staff off the floor.",
  },
  {
    id: "dialysis",
    title: "Dialysis and outpatient clinics",
    need: "You need patients in the chair at their set time, on every treatment day.",
    link: { href: "/partners/dialysis", label: "Dialysis contracts: what to send us" },
  },
  {
    id: "case-managers",
    title: "Case managers",
    need: "You need a client's ride set up without chasing three phone numbers.",
    link: { href: "/partners/discharge", label: "Timing a discharge ride" },
  },
];

const dispatch = site.dispatchPhone;

export default function PartnersPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ name: "For Facilities", path: "/partners" }]}
        title="Patient rides for facilities in north Houston"
        answer="For discharge planners, nursing and assisted living staff, dialysis clinics and case managers. Set up an account, ask for the paperwork your office needs, or call for a ride today."
        cta={false}
      >
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a href={telHref} className={buttonClass("primary", "lg", "sm:min-w-56")}>
            <PhoneIcon /> Call {site.phone.display}
          </a>
          <Link href="#account" className="inline-flex min-h-14 items-center justify-center rounded-full px-4 text-lg font-bold text-navy underline decoration-2 underline-offset-4 hover:bg-morning">
            or set up a facility account
          </Link>
        </div>
      </PageHeader>

      {/* 1. Who it's for */}
      <Section id="who" tone="white" title="Who it's for">
        <ul className="mt-8 grid gap-10 md:grid-cols-2">
          {audiences.map((a) => (
            <li key={a.id} id={a.id} className="border-t-4 border-navy pt-5">
              <h3 className="text-2xl font-bold">{a.title}</h3>
              <p className="mt-2 text-lg">{a.need}</p>
              {a.link && (
                <Link href={a.link.href} className="mt-2 inline-flex min-h-12 items-center font-bold text-navy underline decoration-2 underline-offset-4">
                  {a.link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
        {/* ASK JAY: which north-side campuses do you have confirmed drop-off notes for? */}
        {/* ASK JAY: do drivers sign residents in and out at the facility desk? */}
        {/* ASK JAY: what time does the first van leave, and do you take early dialysis chairs? */}
        {/* ASK JAY: do patients get the same driver on standing rides, and how often? */}
        {/* ASK JAY: do you text the facility and the family at pickup and drop-off? */}
        {/* ASK JAY: do drivers walk dialysis patients to the treatment floor? Do you send no-show or delay updates to the clinic? */}
      </Section>

      {/* 2. How it works for a facility: site.partners lines, each only when confirmed. */}
      <Section id="how-it-works" title="How it works for a facility">
        <div className="mt-8 max-w-3xl">
          <PartnerLines />
        </div>
        {/* ASK JAY: who answers facility calls, and when? */}
        {/* ASK JAY: monthly invoicing? What terms? */}
      </Section>

      {/* 3. Phone for facilities */}
      <Section id="facility-phone" tone="white" title="Phone for facilities">
        <div className="mt-6">
          {dispatch ? (
            <a href={`tel:${dispatch.e164}`} className="inline-flex min-h-12 items-center gap-3 text-[1.75rem] font-bold text-navy underline decoration-2 underline-offset-4">
              <PhoneIcon className="h-7 w-7" /> Dispatch: {dispatch.display}
            </a>
          ) : (
            <>
              <a href={telHref} className="inline-flex min-h-12 items-center gap-3 text-[1.75rem] font-bold text-navy underline decoration-2 underline-offset-4">
                <PhoneIcon className="h-7 w-7" /> {site.phone.display}
              </a>
              <p className="mt-2 text-lg">Ask for dispatch.</p>
            </>
          )}
        </div>
      </Section>

      {/* 4. What you can request now: the packet. Nothing is hosted or linked. */}
      <Section id="request" title="What you can request now">
        <PacketForm />
      </Section>

      {/* 5. The account form */}
      <Section id="account" tone="white" title="Set up a facility account">
        <div className="mt-8 max-w-3xl">
          <PartnerForm />
        </div>
        {/* ASK JAY: what happens after the call (billing setup, list of bookers, how soon a first ride can run)? */}
        {/* ASK JAY: which hospitals do you serve most? */}
      </Section>

      {/* 6. What you get back. The one patterned section ground on this page. */}
      <section id="sample-ride-card" aria-labelledby="sample-ride-card-heading" className="pattern-sand py-16 sm:py-20">
        <div className="container-page grid items-center gap-12 lg:grid-cols-[1fr_1fr]">
          <div className="max-w-xl rounded-2xl bg-sand/90 p-6 sm:p-8">
            <p className="label mb-3 text-navy">What you get back</p>
            <h2 id="sample-ride-card-heading" className="text-[2rem] font-bold sm:text-[2.5rem]">A Ride Card for every patient</h2>
            <p className="mt-4 text-lg">Every booked ride gets a Ride Card: pickup, drop-off, when, and who is driving. Nothing else.</p>
            {/* ASK JAY: how does the facility get the Ride Card (text, email, printed)? Does the family get a copy? */}
            <p className="mt-3 text-ink/85">Sample Ride Card. Names, times and driver are examples.</p>
          </div>
          <div className="relative mx-auto grid w-full max-w-[400px] place-items-center gap-10 py-6">
            <div className="relative grid w-full place-items-center">
              <RideCardBack className="absolute right-0 top-0 hidden rotate-3 sm:grid" />
              <RideCard
                className="relative -rotate-1"
                titleAs="p"
                sample
                tag="Hospital discharge"
                pickup="HCA Northwest, Rm 412"
                dropoff="Home, Humble"
                when="Today, ready at 2 PM"
                driver="Jay"
              />
            </div>
            {site.smsEnabled && <SmsMock />}
          </div>
        </div>
      </section>

      {/* 7. The old "direct-line promise" section is gone: every line in it was unconfirmed. */}

      <FinalCta title="Need a ride for a patient today?" body={`Call ${site.phone.display}. Account or not, we'll help.`} />
    </>
  );
}
