import type { Metadata } from "next";
import { site, telHref } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { BookingForm } from "@/components/booking/BookingForm";
import { buttonClass } from "@/components/ui/Button";
import { ClockIcon, PhoneIcon, ShieldIcon } from "@/components/ui/Icons";

export const metadata: Metadata = buildMetadata({
  title: "Book a Wheelchair Van Ride in Houston",
  description: `Request a wheelchair van ride in the Houston area in about two minutes. We'll call you within ${site.booking.callbackWindow} to confirm. Or call ${site.phone.display}.`,
  path: "/book",
});

export default function BookPage() {
  return (
    <section aria-labelledby="page-heading" className="bg-cream pb-16 sm:pb-24">
      <div className="container-page pt-4">
        <Breadcrumbs items={[{ name: "Book a Ride", path: "/book" }]} />
        <div className="mt-4 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
          <div>
            <h1 id="page-heading" className="text-[2.25rem] font-bold sm:text-[3rem]">Book a wheelchair van ride</h1>
            <p className="mt-3 max-w-2xl text-xl">
              Three short steps, about two minutes. We&apos;ll call you within {site.booking.callbackWindow} {site.booking.callbackHoursNote} to confirm.
            </p>

            <div className="mt-8 rounded-[1.5rem] border border-hairline bg-white p-5 shadow-[var(--shadow-soft)] sm:p-8">
              <div className="no-js-only">
                <p className="text-lg font-bold text-navy-900">Online booking needs JavaScript turned on.</p>
                <p className="mt-2">Please call us instead. We&apos;re happy to book your ride over the phone.</p>
                <a href={telHref} className={buttonClass("primary", "lg", "mt-4")}>
                  <PhoneIcon /> Call {site.phone.display}
                </a>
              </div>
              <div className="js-only">
                <BookingForm />
              </div>
            </div>
          </div>

          <aside aria-labelledby="call-heading" className="space-y-5 lg:pt-24">
            <div className="rounded-[1.5rem] bg-navy-900 p-6 text-cream on-dark">
              <h2 id="call-heading" className="text-xl font-bold !text-cream">Rather talk to a person?</h2>
              <p className="mt-2 text-mist">Call and we&apos;ll book your ride over the phone.</p>
              <a href={telHref} className="mt-4 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full border-2 border-cream text-lg font-bold text-cream no-underline hover:bg-navy-700">
                <PhoneIcon /> {site.phone.display}
              </a>
            </div>
            <div className="rounded-[1.5rem] border border-hairline bg-white p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold"><ClockIcon /> Hours</h2>
              <dl className="mt-3 space-y-1">
                {site.hours.map((h) => (
                  <div key={h.label} className="flex justify-between gap-4">
                    <dt className="font-bold">{h.label}</dt>
                    <dd className="text-muted">{h.display}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="rounded-[1.5rem] border border-hairline bg-white p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold"><ShieldIcon /> Your privacy</h2>
              <p className="mt-2 text-muted">We only ask what we need to plan the ride. We never ask about medical conditions.</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
