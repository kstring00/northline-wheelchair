import Image from "next/image";
import { site, telHref, bookHref } from "@/config/site";
import { ButtonLink } from "@/components/ui/Button";
import { Pin } from "@/components/ui/Logo";
import { HeroPattern } from "@/components/brand/HeroPattern";
import { OnTimePromise } from "@/components/home/OnTimePromise";
import { SeHablaBadge } from "@/components/ui/Badges";

/**
 * The 5-second test: WHAT (wheelchair van rides), FOR WHOM (you or someone
 * you love), WHERE (north Houston), HOW (Book a Ride / call). Three type styles
 * only: the headline, one line under it, the CTA row. The right column is the
 * interactive map demo (or the real photo once it arrives).
 */
export function Hero() {
  const img = site.images.hero;
  return (
    <section id="hero" aria-labelledby="hero-heading" className="relative overflow-hidden bg-cream">
      <div className="container-page grid items-center gap-10 pt-6 pb-6 sm:pt-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pt-16 lg:pb-10">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-morning px-3 py-1.5 text-sm font-bold text-navy [--logo-dot:var(--color-morning)]">
            <Pin className="h-4 w-auto" /> Houston & the north side
          </p>
          <SeHablaBadge className="ml-2" />
          <h1 id="hero-heading" className="mt-5 text-[2.75rem] font-extrabold leading-[1.02] tracking-[-0.03em] text-navy sm:text-[3.5rem] lg:text-[4rem]">
            Wheelchair van rides in north Houston.
          </h1>
          <p className="mt-4 font-display text-[1.375rem] font-medium leading-snug tracking-[-0.01em] text-ink">
            On time, every ride. We call you back within {site.responseTime}.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href={bookHref} size="lg" data-hero-cta className="sm:min-w-56">
              Book a Ride
            </ButtonLink>
            <a href={telHref} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full px-4 text-lg font-bold text-navy underline decoration-2 underline-offset-4 hover:bg-morning">
              or call {site.phone.display}
            </a>
          </div>

          <div className="mt-7 lg:hidden">
            <OnTimePromise compact />
          </div>
        </div>

        <div className="relative">
          {site.images.heroPhotoReady ? (
            <div className="relative overflow-hidden rounded-[2rem] bg-navy shadow-[var(--shadow-lift)]">
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
          ) : (
            <HeroPattern />
          )}
        </div>
      </div>
      <div className="container-page hidden pb-12 lg:block lg:pb-16">
        <OnTimePromise compact />
      </div>
    </section>
  );
}
