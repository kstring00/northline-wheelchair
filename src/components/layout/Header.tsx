import Link from "next/link";
import { site, telHref, bookHref } from "@/config/site";
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
  return (
    <header className="relative z-40 border-b border-ink/15 bg-cream/95 lg:sticky lg:top-0 lg:backdrop-blur">
      <div className="container-page flex min-h-20 items-center justify-between gap-3">
        {/* Wordmark + tagline at 28px; logomark alone below 400px. Both padded by their protection area. */}
        <Link href="/" className="shrink-0 rounded-lg">
          <Logo variant="mark" size={32} clear label={`${site.name}, home page`} className="min-[400px]:hidden" />
          <Logo variant="wordmark" size={28} withTagline clear label={`${site.name}, home page`} className="max-[399px]:hidden" />
        </Link>

        <nav aria-label={t.nav.main} className="hidden lg:block">
          <ul className="flex items-center gap-0.5">
            <li><ServicesMenu label={t.nav.services} /></li>
            {mainLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-12 items-center whitespace-nowrap rounded-lg px-2.5 font-bold text-navy hover:bg-morning xl:px-3">
                  {l.label}
                </Link>
              </li>
            ))}
            <li><ServicesMenu label="More" links={moreLinks} /></li>
          </ul>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <a href={telHref} className="inline-flex min-h-12 items-center gap-2 whitespace-nowrap rounded-lg px-2 font-bold text-navy hover:bg-morning">
            <PhoneIcon />
            <span>
              <span className="sr-only">Call </span>
              {site.phone.display}
            </span>
          </a>
          <TextUsLink variant="ghost" className="!no-underline whitespace-nowrap max-2xl:hidden" />
          <ButtonLink href={bookHref} className="whitespace-nowrap">{t.actions.book}</ButtonLink>
        </div>

        <MobileMenu />
      </div>
    </header>
  );
}
