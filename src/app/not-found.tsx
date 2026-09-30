import type { Metadata } from "next";
import Link from "next/link";
import { site, telHref, bookHref } from "@/config/site";
import { ButtonLink } from "@/components/ui/Button";
import { RouteMotif } from "@/components/ui/RouteMotif";
import { PhoneIcon } from "@/components/ui/Icons";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section aria-labelledby="page-heading" className="bg-cream py-16 sm:py-24">
      <div className="container-page max-w-2xl text-center">
        <RouteMotif className="mx-auto h-auto w-64" />
        <h1 id="page-heading" className="mt-8 text-[2.25rem] font-bold sm:text-[3rem]">This road doesn&apos;t go anywhere</h1>
        <p className="mt-4 text-xl">We couldn&apos;t find that page. You can still book a ride or call us, and we&apos;ll get you where you need to go.</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink href={bookHref} size="lg" className="w-full sm:w-auto sm:min-w-56">Book a Ride</ButtonLink>
          <a href={telHref} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full px-4 text-lg font-bold text-navy-900 underline decoration-2 underline-offset-4 hover:bg-navy-100">
            <PhoneIcon /> Call {site.phone.display}
          </a>
        </div>
        <p className="mt-8">
          <Link href="/" className="inline-flex min-h-12 items-center font-bold text-navy-700 underline">Go to the home page</Link>
        </p>
      </div>
    </section>
  );
}
