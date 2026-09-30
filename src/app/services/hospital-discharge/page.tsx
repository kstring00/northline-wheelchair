import type { Metadata } from "next";
import Link from "next/link";
import { site, getService, hospitals } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { ServicePage, type ServiceCopy } from "@/components/layout/ServicePage";
import { Section } from "@/components/ui/Section";
import { ArrowRightIcon } from "@/components/ui/Icons";

const service = getService("hospital-discharge")!;

export const metadata: Metadata = buildMetadata({
  title: "Hospital Discharge Rides in Houston",
  description: `Wheelchair van rides home from Houston hospitals and rehab, timed to the discharge, often same day. For families and discharge planners. Call ${site.phone.display}.`,
  path: `/services/${service.slug}`,
});

const copy: ServiceCopy = {
  audiences: [
    { title: "Families with a discharge tomorrow", body: "The nurse just said the word. You have a day to arrange a ride for someone who can't get into your car. Call us today." },
    { title: "Discharge planners and case managers", body: "You need a van that answers the phone and shows up at the time you said. We have one dispatch line and no hold queue." },
    { title: "Rehab and skilled nursing transfers", body: "Hospital to rehab, rehab to home, home to a skilled nursing stay. Any direction." },
    { title: "Riders going home alone", body: "We don't leave until you're inside and settled. If no one's home yet, tell us who to expect." },
  ],
  steps: [
    { title: "Call as soon as you hear", body: "Don't wait for the final paperwork. Give us the window the nurse gave you and we'll hold the spot." },
    { title: "We adjust when the time firms up", body: "Discharges slip. When the nurse calls with the real time, so do you, and we move the ride. No fee." },
    { title: "The driver meets you at the entrance", body: "Main lobby, discharge door, whichever the hospital uses. We know the big north-side campuses." },
  ],
  included: [
    { title: "Same-day rides, most days", body: "Discharges are what our afternoons are for." },
    { title: "The right entrance", body: "We keep drop-off notes for the hospitals we serve most." },
    { title: "Pharmacy on the way", body: "A short stop for prescriptions is fine. Tell us when you book." },
    { title: "Equipment rides too", body: "Walker, shower chair, portable oxygen. It all fits." },
    { title: "Inside, not to the curb", body: "Up the steps, through the door, to a chair or bed." },
    { title: "A price before the ride", body: "Told to you when we confirm, even on same-day rides." },
  ],
  onTheDay: [
    "You call when the nurse says the discharge is coming. We give you a real pickup window and hold a van. When the paperwork is done, you or the nurse call again, and we're on our way.",
    "Hospital transport usually wheels the patient down in a hospital chair. Your driver meets them at the entrance, helps them into their own chair or a seat in the van, secures everything, and you're on the road.",
    "At home, the driver helps up the steps and inside, to wherever your family member wants to sit. If you booked a pharmacy stop, it's already done. If the day slips to tomorrow, one call moves the ride.",
  ],
  extra: (
    <Section id="hospitals" tone="white" eyebrow="Hospitals we drive to" title="We know where to pull in">
      <p className="mt-4 max-w-3xl text-lg text-muted">Drop-off notes, the right entrance, and what to expect at the big north-side campuses.</p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {hospitals.map((h) => (
          <li key={h.slug}>
            <Link href={`/service-area/hospitals/${h.slug}`} className="lift-card flex min-h-16 items-center justify-between gap-3 rounded-xl border border-hairline bg-cream px-5 py-3 font-bold text-navy-900 no-underline">
              {h.name} <ArrowRightIcon className="h-5 w-5 shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-lg">
        Booking for a patient? <Link href="/partners" className="font-bold text-navy-700 underline">See how facilities work with us</Link>.
      </p>
    </Section>
  ),
};

export default function Page() {
  return <ServicePage service={service} title="Hospital Discharge Rides in Houston" copy={copy} />;
}
