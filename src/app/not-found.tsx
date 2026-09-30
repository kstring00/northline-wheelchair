import type { Metadata } from "next";
import Link from "next/link";
import { site, telHref, bookHref } from "@/config/site";
import { ButtonLink } from "@/components/ui/Button";
import { PhoneIcon } from "@/components/ui/Icons";
import { ContactBlock } from "@/components/brand/ContactBlock";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section aria-labelledby="page-heading" className="bg-cream py-16 sm:py-24">
      <div className="container-page grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <h1 id="page-heading" className="poster text-[2.75rem] sm:text-[4rem]">
            This road doesn&apos;t go <em>anywhere.</em>
          </h1>
          <p className="poster-fact mt-4 text-[1.625rem] sm:text-[2rem]">We couldn&apos;t find that page.</p>
          <p className="mt-4 text-xl">You can still book a ride or call us, and we&apos;ll get you where you need to go.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href={bookHref} size="lg" className="w-full sm:w-auto sm:min-w-56">Book a Ride</ButtonLink>
            <a href={telHref} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full px-4 text-lg font-bold text-navy underline decoration-2 underline-offset-4 hover:bg-morning">
              <PhoneIcon /> Call {site.phone.display}
            </a>
          </div>
          <p className="mt-6">
            <Link href="/" className="inline-flex min-h-12 items-center font-bold text-navy underline">Go to the home page</Link>
          </p>
        </div>
        <ContactBlock className="mx-auto w-full max-w-md bg-white" />
      </div>
    </section>
  );
}
