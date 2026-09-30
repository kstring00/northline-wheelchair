import { site, telHref, bookHref } from "@/config/site";
import { ButtonLink } from "@/components/ui/Button";

export function FinalCta({ title = "Ready when you are.", body }: { title?: string; body?: string }) {
  return (
    <section aria-labelledby="final-cta-heading" className="bg-cream py-12 sm:py-20 lg:py-24">
      <div className="container-page">
        <div className="on-dark relative overflow-hidden rounded-[2rem] bg-navy px-6 py-10 text-center sm:px-12 sm:py-16">
          <h2 id="final-cta-heading" className="text-[2.25rem] font-bold !text-white sm:text-[2.75rem]">{title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-cream/80">
            {body ?? `Book online in about two minutes, or call and talk to a real person. We call back within ${site.responseTime} during business hours to confirm.`}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href={bookHref} size="lg" className="w-full sm:w-auto sm:min-w-56">Book a Ride</ButtonLink>
            <a href={telHref} className="inline-flex min-h-14 items-center justify-center rounded-full px-4 text-lg font-bold text-cream underline decoration-2 underline-offset-4 hover:bg-cream/10">
              or call {site.phone.display}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
