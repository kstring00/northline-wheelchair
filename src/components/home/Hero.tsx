import Image from "next/image";
import Link from "next/link";
import { site, telHref, bookHref, areaList } from "@/config/site";
import { ButtonLink } from "@/components/ui/Button";
import { Pin } from "@/components/ui/Logo";
import { HeroPattern } from "@/components/brand/HeroPattern";
import { OnTimePromise } from "@/components/home/OnTimePromise";
import { SeHablaBadge } from "@/components/ui/Badges";

/**
 * The 5-second test: WHAT (wheelchair van rides), FOR WHOM (you or someone
 * you love), WHERE (Houston area), HOW (Book a Ride / call). The headline is the
 * brand's poster style: all caps, one word in Navy, a plain fact under it.
 * Until the real photo arrives the right-hand slot is the map pattern.
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
          <h1 id="hero-heading" className="poster mt-5 text-[2.75rem] sm:text-[3.75rem] lg:text-[4.5rem]">
            Wheelchair rides in North <em>Houston.</em>
          </h1>
          <p className="poster-fact mt-4 text-[1.625rem] text-ink sm:text-[2rem]">
            On time, every ride. We call back in {site.responseTime}.
          </p>
          <p className="mt-4 max-w-xl text-lg text-ink/85">
            On-time, door-to-door wheelchair van rides to doctor visits, dialysis and home from the hospital. We serve {areaList()}. Non-emergency medical transportation, in plain words.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href={bookHref} size="lg" data-hero-cta className="sm:min-w-56">
              Book a Ride
            </ButtonLink>
            <a href={telHref} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full px-4 text-lg font-bold text-navy underline decoration-2 underline-offset-4 hover:bg-morning">
              or call {site.phone.display}
            </a>
          </div>

          <p className="mt-5 text-ink/85">
            You&apos;ll know the price before you ride. <Link href="/pricing" className="font-bold text-navy underline">See how pricing works</Link>.
          </p>
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
