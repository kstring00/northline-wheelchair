import Image from "next/image";
import Link from "next/link";
import { site, telHref, bookHref, areaList } from "@/config/site";
import { ButtonLink } from "@/components/ui/Button";
import { RouteMotif } from "@/components/ui/RouteMotif";
import { PinIcon } from "@/components/ui/Icons";
import { HeroMotion } from "@/components/home/HeroMotion";
import { OnTimePromise } from "@/components/home/OnTimePromise";
import { SeHablaBadge } from "@/components/ui/Badges";

/**
 * The 5-second test: WHAT (wheelchair van rides), FOR WHOM (you or someone
 * you love), WHERE (Houston area), HOW (Book a Ride / call). Headline and image
 * render instantly and are never animated (protects LCP).
 */
export function Hero() {
  const img = site.images.hero;
  return (
    <section id="hero" aria-labelledby="hero-heading" className="relative overflow-hidden bg-cream">
      <div className="container-page grid items-center gap-10 pt-6 pb-6 sm:pt-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pt-16 lg:pb-10">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-navy-100 px-3 py-1.5 text-sm font-bold text-navy-900">
            <PinIcon className="h-4 w-4" /> Houston & the north side
          </p>
          <SeHablaBadge className="ml-2" />
          <h1 id="hero-heading" className="mt-4 text-[2.375rem] font-bold sm:text-[3.25rem] lg:text-[3.75rem]">
            Wheelchair transportation in North Houston, <span className="text-navy-700">for you or someone you love.</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted">
            On-time, door-to-door wheelchair van rides to doctor visits, dialysis and home from the hospital. We serve {areaList()}. Non-emergency medical transportation, in plain words.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href={bookHref} size="lg" data-hero-cta className="overflow-hidden sm:min-w-56">
              <span className="shine" aria-hidden="true"><span className="shine-bar" /></span>
              Book a Ride
            </ButtonLink>
            <a href={telHref} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full px-4 text-lg font-bold text-navy-900 underline decoration-2 underline-offset-4 hover:bg-navy-100">
              or call {site.phone.display}
            </a>
          </div>

          <p className="mt-5 text-muted">
            You&apos;ll know the price before you ride. <Link href="/pricing" className="font-bold text-navy-700 underline">See how pricing works</Link>.
          </p>
          <div className="mt-7 lg:hidden">
            <OnTimePromise compact />
          </div>
        </div>

        <div className="relative">
          <div className="relative overflow-hidden rounded-[2rem] bg-navy-900 shadow-[var(--shadow-lift)]">
            <Image
              src={img.src}
              alt={img.alt}
              width={img.width}
              height={img.height}
              preload
              fetchPriority="high"
              quality={75}
              sizes="(min-width: 1024px) 560px, (min-width: 640px) 90vw, 100vw"
              className="h-auto w-full"
            />
          </div>
          {/* Brand route motif: draws once on load (decorative). */}
          <div className="relative -mt-8 ml-4 mr-4 rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)] sm:-mt-10 sm:ml-10 sm:mr-10">
            <div className="flex items-center justify-between text-sm font-bold text-navy-900" aria-hidden="true">
              <span>Your door</span>
              <span>Your appointment</span>
            </div>
            <RouteMotif hook="data-hero-route" className="mt-1 h-auto w-full" />
          </div>
        </div>
      </div>
      <div className="container-page hidden pb-12 lg:block lg:pb-16">
        <OnTimePromise compact />
      </div>
      <HeroMotion />
    </section>
  );
}
