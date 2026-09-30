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
  description: `Standing wheelchair van rides to dialysis in north Houston: same days, same times, same driver. Early chairs welcome. Call ${site.phone.display}.`,
  path: `/services/${service.slug}`,
});

const copy: ServiceCopy = {
  audiences: [
    { title: "Riders starting dialysis", body: "The first weeks are hard enough. We take the ride off your list for good, three times a week." },
    { title: "Families who can't drive every session", body: "Three rides a week, every week, is a part-time job. Hand it to us and go back to being family." },
    { title: "Riders with an early chair", body: "5 AM chairs are common and most ride services won't take them. We start early on purpose." },
    { title: "Clinic social workers", body: "One call sets up a standing schedule for a patient. Changes are one call, too. See our page for clinics." },
  ],
  steps: [
    { title: "Give us the chair time", body: "Not the appointment time. Tell us when you need to be in the chair and we plan the pickup backward." },
    { title: "Pick the days", body: "Monday, Wednesday, Friday, or Tuesday, Thursday, Saturday. Tell us how long the session runs so we plan the return." },
    { title: "We set it and keep it", body: "After the first week, the schedule runs itself. Hospital stay? Clinic moved you? One call pauses or changes it." },
  ],
  included: [
    { title: "The same driver, most days", body: "Riders do better with a familiar face. Drivers learn the routine, the door, the chair." },
    { title: "Early pickups", body: "Our first vans roll before 5 AM. Early chairs are our specialty, not an exception." },
    { title: "A slow, careful ride home", body: "You're tired and unsteady after a session. Your driver knows it and goes at your pace." },
    { title: "Texts to the family", body: "Picked up, dropped off, home. Whoever you name gets the texts." },
    { title: "Walked to the chair", body: "Your driver takes you inside to the treatment floor, not the front door." },
    { title: "One weekly price", body: "Told to you before the first ride. The same every week." },
  ],
  onTheDay: [
    "The first week, we call the day before each ride, like any new ride. After that we stop calling unless something changes, and you still get the text when your driver is on the way.",
    "Your driver arrives early and helps you into the van. Dialysis mornings are quiet rides. At the clinic, they walk you to the treatment floor and make sure the nurses have you.",
    "Because a session runs three to four hours, we usually come back rather than wait. When you're done, the clinic or you call, and the driver is there. The ride home is slower on purpose. A hand up the steps, and inside to a chair.",
  ],
  extra: (
    <Section id="clinics" tone="white" eyebrow="Where we drive" title="Dialysis centers across north Houston">
      <p className="mt-4 max-w-3xl text-lg text-muted">
        We drive to every dialysis clinic in our service area. These are the corridors we run most days. Don&apos;t see yours? We still go there.
      </p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {coreAreas.map((a) => {
          const dialysis = [...a.facilities, ...a.typicalTrips].filter((x) => /dialysis/i.test(x));
          return (
            <li key={a.slug} className="rounded-[var(--radius-card)] border border-hairline bg-cream p-5">
              <Link href={`/service-area/${a.slug}`} className="inline-flex min-h-12 items-center gap-2 text-xl font-bold text-navy-900 underline decoration-2 underline-offset-4">
                {a.name} <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <p className="mt-1 text-muted">{dialysis[0] ?? "Dialysis centers and clinics"}</p>
            </li>
          );
        })}
      </ul>
      {/* CONFIRM Jay's list of dialysis centers he serves regularly, e.g. DaVita, Fresenius, US Renal Care locations. */}
    </Section>
  ),
};

export default function Page() {
  return <ServicePage service={service} title="Dialysis Rides in North Houston" copy={copy} />;
}
