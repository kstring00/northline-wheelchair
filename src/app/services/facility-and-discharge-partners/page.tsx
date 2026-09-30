import type { Metadata } from "next";
import Link from "next/link";
import { site, getService } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { ServicePage, type ServiceCopy } from "@/components/layout/ServicePage";
import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";

const service = getService("facility-and-discharge-partners")!;

export const metadata: Metadata = buildMetadata({
  title: "Wheelchair Transportation for Facilities in North Houston",
  description: `Patient rides for hospitals, skilled nursing, assisted living and dialysis clinics in north Houston. One direct dispatch line, standing schedules, facility invoicing. Call ${site.phone.display}.`,
  path: `/services/${service.slug}`,
});

const copy: ServiceCopy = {
  audiences: [
    { title: "Hospital discharge planners", body: "Same-day rides home timed to the discharge. One number, a person answers, and a real pickup window." },
    { title: "Skilled nursing and assisted living", body: "Residents to appointments and back, with a driver who signs them in and out at your desk." },
    { title: "Dialysis and outpatient clinics", body: "Standing schedules for your patients, set up once. Changes are one call." },
    { title: "Home health and case management", body: "Rides for clients on your caseload, billed to your agency, with a text to you at pickup and drop-off." },
  ],
  steps: [
    { title: "Set up a facility account", body: "One short form or one call. We set up invoicing and the names of everyone who can book." },
    { title: "Call dispatch directly", body: "No portal, no hold queue. You get the same line Jay answers." },
    { title: "We report back", body: "A text or email at pickup and drop-off, so your notes are done and the family stops calling you." },
  ],
  included: [
    { title: "Monthly invoicing", body: "One invoice per facility, with rider names, dates and destinations." }, // CONFIRM
    { title: "Standing schedules", body: "Dialysis, wound care, therapy. Set once, then it runs." },
    { title: "Same-day discharges", body: "Our afternoons are built around them." },
    { title: "Sign-in and sign-out", body: "Drivers sign at your desk and take the paperwork you need sent." },
    { title: "Pickup and drop-off texts", body: "To you, the family, or both." },
    { title: "Trained, screened drivers", body: "Background-checked, CPR-certified, PASS-trained. Details on our safety page." },
  ],
  onTheDay: [
    "You call dispatch with the patient's name, room, destination and time. We confirm the pickup window on the phone. No callback needed for account holders.",
    "Your driver arrives early, signs in at the desk, and comes to the room or the discharge lounge. They secure the patient in their own chair or ours, and text you when they're rolling.",
    "At the destination, the driver walks the patient to the right suite or unit and hands off to staff. You get a drop-off text. The ride goes on the monthly invoice, itemized.",
  ],
  extra: (
    <Section id="account" tone="white" eyebrow="Get started" title="One line for your whole team">
      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <p className="max-w-2xl text-lg">
          Set up an account and every discharge planner, social worker and charge nurse on your floor can book with one call. Invoicing, standing rides and reporting are on the <Link href="/partners" className="font-bold text-navy underline">facilities page</Link>.
        </p>
        <ButtonLink href="/partners#account" size="lg">Set up a facility account</ButtonLink>
      </div>
      {/* CONFIRM invoicing terms and whether account holders skip the callback. */}
    </Section>
  ),
};

export default function Page() {
  return <ServicePage service={service} title="Wheelchair Transportation for Facilities in North Houston" copy={copy} />;
}
