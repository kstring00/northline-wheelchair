import Link from "next/link";
import { site, telHref, bookHref, hoursSummary } from "@/config/site";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { PhoneIcon } from "@/components/ui/Icons";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { ServicesMenu } from "@/components/layout/ServicesMenu";
import { mainLinks, moreLinks } from "@/components/layout/nav";
import { t } from "@/content/dictionary";
import { TextUsLink } from "@/components/ui/Badges";

/**
 * Mobile: static header (the sticky action bar at the bottom carries Call/Book).
 * Desktop: sticky header that always shows the phone number and Book button.
 */
export function Header() {
  const label = `${site.name}, home page`;
  return (
    <>
      {/* Desktop: the phone number gets its own bar, big enough to read at a glance. */}
      <div className="on-dark hidden bg-navy text-white lg:block">
        <div className="container-page flex min-h-12 items-center justify-end gap-6 text-lg">
          <span className="text-cream/85">{hoursSummary()}</span>
          <a href={telHref} className="inline-flex min-h-12 items-center gap-2 font-bold text-white underline decoration-cream/50 underline-offset-4 hover:decoration-white">
            <PhoneIcon />
            <span>
              <span className="sr-only">Call </span>
              {site.phone.display}
            </span>
          </a>
          <TextUsLink variant="onDark" className="!min-h-10 whitespace-nowrap" />
        </div>
      </div>
    <header className="relative z-40 border-b border-ink/15 bg-cream/95 lg:sticky lg:top-0 lg:backdrop-blur">
      <div className="container-page flex min-h-20 items-center justify-between gap-3">
        {/*
          "Wheelchair Transportation" stays readable at every width (15px floor):
          two lines under a 26px wordmark on phones, one line at 28px on tablets
          and 32px on desktop. Each is padded by its protection area.
        */}
        <Link href="/" className="shrink-0 rounded-lg">
          <Logo variant="wordmark" size={26} withTagline taglineBreak clear label={label} className="sm:hidden" />
          <Logo variant="wordmark" size={28} withTagline clear label={label} className="max-sm:hidden lg:hidden" />
          <Logo variant="wordmark" size={28} withTagline taglineBreak clear label={label} className="max-lg:hidden xl:hidden" />
          <Logo variant="wordmark" size={32} withTagline clear label={label} className="max-xl:hidden" />
        </Link>

        <nav aria-label={t.nav.main} className="hidden lg:block">
          <ul className="flex items-center gap-0.5">
            <li><ServicesMenu label={t.nav.services} /></li>
            {mainLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-12 items-center whitespace-nowrap rounded-lg px-2 font-bold text-navy hover:bg-morning xl:px-3">
                  {l.shortLabel ? (
                    <>
                      <span className="xl:hidden" aria-hidden="true">{l.shortLabel}</span>
                      <span className="max-xl:sr-only">{l.label}</span>
                    </>
                  ) : (
                    l.label
                  )}
                </Link>
              </li>
            ))}
            <li><ServicesMenu label="More" links={moreLinks} /></li>
          </ul>
        </nav>

        <div className="hidden items-center lg:flex">
          <ButtonLink href={bookHref} className="whitespace-nowrap">{t.actions.book}</ButtonLink>
        </div>

        <MobileMenu />
      </div>
    </header>
    </>
  );
}
