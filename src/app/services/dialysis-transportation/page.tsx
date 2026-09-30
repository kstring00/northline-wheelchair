import type { Metadata } from "next";
import Link from "next/link";
import { site, getService, coreAreas } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { ServicePage, type ServiceCopy } from "@/components/layout/ServicePage";
import { Section } from "@/components/ui/Section";
import { ArrowRightIcon } from "@/components/ui/Icons";

const service = getService("dialysis-transportation")!;

export const metadata: Metadata = buildMetadata({
  title: "Dialysis Rides in North Houston",
  description: `Standing wheelchair van rides to dialysis in north Houston, set up once for the same days and chair times each week. Call ${site.phone.display}.`,
  path: `/services/${service.slug}`,
});

const copy: ServiceCopy = {
  audiences: [
    { title: "Riders starting dialysis", body: "The first weeks are hard enough. We take the ride off your list for good, three times a week." },
    { title: "Families who can't drive every session", body: "Three rides a week, every week, is a part-time job. Hand it to us and go back to being family." },
    // ASK JAY: how early can pickups start? Do you take 5 AM chairs?
    { title: "Riders with an early chair", body: "Tell us your chair time, however early, and Jay will tell you on the call what he can do." },
    { title: "Clinic social workers", body: "One call sets up a standing schedule for a patient. Changes are one call, too. See our page for clinics." },
  ],
  steps: [
    { title: "Give us the chair time", body: "Not the appointment time. Tell us when you need to be in the chair and we plan the pickup backward." },
    { title: "Pick the days", body: "Monday, Wednesday, Friday, or Tuesday, Thursday, Saturday. Tell us how long the session runs so we plan the return." },
    { title: "We set it up once", body: "The ride repeats on your days each week. A hospital stay or a new chair time is one call to change." },
  ],
  included: [
    // ASK JAY: same driver most days? First van before 5 AM? Texts to family at pickup/drop-off? One weekly price?
    { title: "A standing schedule", body: "Your days and chair time, set once, repeating every week." },
    { title: "Door to door", body: "Your driver comes to your door and takes you inside at the clinic." },
    { title: "A ride home after every session", body: "Tell us how long your session runs and we plan the return." },
  ],
  onTheDay: [
    "The first week, we call the day before each ride, like any new ride. After that we stop calling unless something changes.",
    "Your driver arrives early and helps you into the van. Dialysis mornings are quiet rides. At the clinic, they walk you to the treatment floor and make sure the nurses have you.",
    "Because a session runs three to four hours, we usually come back rather than wait. When you're done, the clinic or you call, and the driver is there. The ride home is slower on purpose. A hand up the steps, and inside to a chair.",
  ],
  extra: (
    <Section id="clinics" tone="white" eyebrow="Where we drive" title="Dialysis centers across north Houston">
      <p className="mt-4 max-w-3xl text-lg text-ink/85">
        We drive to dialysis clinics across our service area. Don&apos;t see yours here? Call and ask.
      </p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {coreAreas.map((a) => {
          const dialysis = [...a.facilities, ...a.typicalTrips].filter((x) => /dialysis/i.test(x));
          return (
            <li key={a.slug} className="rounded-[var(--radius-card)] border border-ink/15 bg-cream p-5">
              <Link href={`/service-area/${a.slug}`} className="inline-flex min-h-12 items-center gap-2 text-xl font-bold text-navy underline decoration-2 underline-offset-4">
                {a.name} <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <p className="mt-1 text-ink/85">{dialysis[0] ?? "Dialysis centers and clinics"}</p>
            </li>
          );
        })}
      </ul>
      {/* CONFIRM Jay's list of dialysis centers he serves regularly, e.g. DaVita, Fresenius, US Renal Care locations. */}
    </Section>
  ),
};

export default function Page() {
  return <ServicePage service={service} title="Dialysis rides in north Houston" copy={copy} />;
}
