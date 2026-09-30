import { site, telHref, bookHref } from "@/config/site";
import { ButtonLink } from "@/components/ui/Button";
import { RouteMotif } from "@/components/ui/RouteMotif";

export function FinalCta({ title = "Ready when you are", body }: { title?: string; body?: string }) {
  return (
    <section aria-labelledby="final-cta-heading" className="bg-cream py-16 sm:py-20 lg:py-24">
      <div className="container-page">
        <div className="on-dark relative overflow-hidden rounded-[2rem] bg-navy-900 px-6 py-12 text-center sm:px-12 sm:py-16">
          <RouteMotif tone="dark" className="mx-auto mb-6 h-auto w-56 opacity-90" />
          <h2 id="final-cta-heading" className="text-[2rem] font-bold !text-cream sm:text-[2.75rem]">{title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-mist">
            {body ?? `Book online in about two minutes, or call and talk to a real person. We call back within ${site.responseTime} during business hours to confirm.`}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href={bookHref} size="lg" className="w-full sm:w-auto sm:min-w-56">Book a Ride</ButtonLink>
            <a href={telHref} className="inline-flex min-h-14 items-center justify-center rounded-full px-4 text-lg font-bold text-cream underline decoration-2 underline-offset-4 hover:bg-navy-700">
              or call {site.phone.display}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
