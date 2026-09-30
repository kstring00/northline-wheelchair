import type { ReactNode } from "react";
import { site, telHref, bookHref } from "@/config/site";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import type { Crumb } from "@/lib/schema";

type Props = {
  crumbs: Crumb[];
  title: ReactNode;
  /** Direct-answer paragraph (quotable by search and AI answers). */
  answer?: ReactNode;
  children?: ReactNode;
  aside?: ReactNode;
  cta?: boolean;
};

export function PageHeader({ crumbs, title, answer, children, aside, cta = true }: Props) {
  return (
    <section aria-labelledby="page-heading" className="bg-cream">
      <div className={`container-page grid gap-10 pt-4 pb-12 sm:pb-16 ${aside ? "lg:grid-cols-[1.1fr_1fr] lg:items-center" : ""}`}>
        <div>
          <Breadcrumbs items={crumbs} />
          <h1 id="page-heading" className="mt-4 text-[2.25rem] font-bold sm:text-[3rem]">{title}</h1>
          {answer && <p className="mt-4 max-w-2xl text-xl text-ink">{answer}</p>}
          {children}
          {cta && (
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink href={bookHref} size="lg" className="sm:min-w-56">Book a Ride</ButtonLink>
              <a href={telHref} className="inline-flex min-h-14 items-center justify-center rounded-full px-4 text-lg font-bold text-navy-900 underline decoration-2 underline-offset-4 hover:bg-navy-100">
                or call {site.phone.display}
              </a>
            </div>
          )}
        </div>
        {aside}
      </div>
    </section>
  );
}
