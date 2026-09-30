import type { Metadata } from "next";
import { site, getService, money } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { ServicePage, type ServiceCopy } from "@/components/layout/ServicePage";
import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";

const service = getService("medical-appointments")!;
const p = site.pricing;

export const metadata: Metadata = buildMetadata({
  title: "Rides to Medical Appointments in North Houston",
  description: `Wheelchair van rides to doctor visits, therapy and imaging across north Houston. Your driver waits and brings you home. Call ${site.phone.display}.`,
  path: `/services/${service.slug}`,
});

const waitRule =
  p.displayMode === "quoteOnly"
    ? "We tell you the wait-time rule and the total when we confirm."
    : `${p.waitFreeMinutes ? `The first ${p.waitFreeMinutes} minutes are free. ` : ""}${p.displayMode === "full" && p.waitPerHour ? `After that, waiting is ${money(p.waitPerHour)} an hour, billed by the quarter hour.` : "After that, waiting is billed by the quarter hour, and we tell you the rate when we confirm."}`;

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
    { title: "One price, told up front", body: "Including the wait time. No adding it up after." },
  ],
  onTheDay: [
    "We call the day before to confirm. Your driver texts when they're on the way and arrives early. They help you into the van and secure your chair.",
    "At the clinic, they walk you inside, find the suite, and make sure you're checked in. If you asked them to wait, they stay nearby. If the visit runs long, that's fine. They've planned for it.",
    "When you're done, the front desk calls us or you do, and the driver is at the suite door within a few minutes. Then home, and a hand up the steps if you need it.",
  ],
  extra: (
    <Section id="wait-and-return" tone="white" eyebrow="Wait & return" title="The driver who stays">
      <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4 text-lg">
          <p>Most ride services drop you at the curb and leave. If your appointment runs long, you call and wait. Sometimes for an hour.</p>
          <p>Wait &amp; return means your driver stays. They walk you in, wait outside the suite or in the lobby, walk you back out, and drive you home. You never wonder whether the ride is coming.</p>
          <p>It&apos;s the thing riders mention most in reviews, so we named it and put it on the booking form.</p>
        </div>
        <div className="rounded-[var(--radius-card)] bg-morning p-6">
          <h3 className="text-xl font-bold">What it costs</h3>
          <p className="mt-2">{waitRule}</p>
          <p className="mt-2 text-ink/85">For dialysis and other long visits, it&apos;s usually cheaper to have us come back. We&apos;ll tell you which is better when you book.</p>
          <ButtonLink href="/book" className="mt-5">Book a wait & return ride</ButtonLink>
        </div>
      </div>
      {/* CONFIRM wait-and-return pricing rule with Jay. */}
    </Section>
  ),
  image: site.images.driverHelping,
};

export default function Page() {
  return <ServicePage service={service} title="Rides to Medical Appointments in North Houston" copy={copy} />;
}
