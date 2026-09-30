import type { Metadata } from "next";
import { site, getService } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { ServicePage, type ServiceCopy } from "@/components/layout/ServicePage";
import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";

const service = getService("medical-appointments")!;
const promise = site.onTimePromise;

export const metadata: Metadata = buildMetadata({
  title: "Rides to Medical Appointments in North Houston",
  description: `Wheelchair van rides to doctor visits, therapy and imaging across north Houston. Your driver waits and brings you home. Call ${site.phone.display}.`,
  path: `/services/${service.slug}`,
});

const copy: ServiceCopy = {
  audiences: [
    { title: "Regular doctor visits", body: "Primary care, the heart doctor, the eye clinic. The visits that come every few months and can't be missed." },
    { title: "Physical and occupational therapy", body: "Two or three times a week for a stretch of weeks. We set the whole run up in one call." },
    { title: "Imaging and labs", body: "MRI, CT, bloodwork. Short visits where the ride takes longer than the appointment. We wait." },
    { title: "Infusion and cancer treatment", body: "Long days. We drop you off, keep the phone on, and come when you're ready." },
  ],
  steps: [
    { title: "Book with the suite number", body: "Give us the address and the suite. We take you to that door, not the parking lot." },
    { title: "We plan the pickup backward", body: "Tell us the appointment time. We pick you up early enough to be checked in with time to spare." },
    { title: "Choose wait & return", body: "Your driver stays through the visit, walks you back out, and drives you home. Or we come back later, your choice." },
  ],
  included: [
    { title: "Walking you to the right suite", body: "Medical buildings are confusing. Your driver takes you to the check-in desk." },
    { title: "A driver who waits", body: "Book wait & return and they're right outside when you're done." },
    { title: "Help with the paperwork stop", body: "Need to stop at the pharmacy on the way home? A short stop is fine." },
    { title: "Companions ride along", body: `Up to ${site.capabilities.maxCompanions ?? 2} people can come with you.` },
    { title: "Late appointments are fine", body: "Doctors run behind. We plan for it. You won't be rushed." },
  ],
  onTheDay: [
    [
      promise.confirmationCall ? "We call the day before to confirm." : "",
      promise.enRouteText ? `We ${site.smsEnabled ? "text" : "call"} you when your driver is on the way.` : "",
      promise.arriveEarlyMinutes !== null ? `Your driver arrives ${promise.arriveEarlyMinutes} minutes early.` : "",
      "They help you into the van and secure your chair.",
    ]
      .filter(Boolean)
      .join(" "),
    "At the clinic, they walk you inside, find the suite, and make sure you're checked in. If you asked them to wait, they stay nearby. If the visit runs long, that's fine. They've planned for it.",
    "When you're done, the front desk calls us or you do, and the driver is at the suite door within a few minutes. Then home, and a hand up the steps if you need it.",
  ],
  extra: (
    <Section id="wait-and-return" tone="white" eyebrow="Wait & return" title="The driver who stays">
      <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4 text-lg">
          <p>Most ride services drop you at the curb and leave. If your appointment runs long, you call and wait. Sometimes for an hour.</p>
          <p>Wait &amp; return means your driver stays. They walk you in, wait outside the suite or in the lobby, walk you back out, and drive you home. You never wonder whether the ride is coming.</p>
          {/* ASK JAY: is wait & return what riders ask for most? Add one line in Jay's words once it's true (and reviews are real). */}
        </div>
        <div className="rounded-[var(--radius-card)] bg-morning p-6">
          <h3 className="text-xl font-bold">Ask for it when you book</h3>
          <p className="mt-2">Choose wait &amp; return on the booking form, or ask for it when you call. Jay will give you the price before you book.</p>
          <ButtonLink href="/book" className="mt-5">Book a wait & return ride</ButtonLink>
        </div>
      </div>
      {/* ASK JAY: wait-and-return pricing. It renders on /pricing from site.pricing once set; no wait-time price is written here. */}
    </Section>
  ),
  image: site.images.driverHelping,
};

export default function Page() {
  return <ServicePage service={service} title="Rides to medical appointments in north Houston" copy={copy} />;
}
