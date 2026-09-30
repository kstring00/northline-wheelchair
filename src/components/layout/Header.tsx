import Link from "next/link";
import { site, telHref, bookHref } from "@/config/site";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { PhoneIcon } from "@/components/ui/Icons";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { ServicesMenu } from "@/components/layout/ServicesMenu";
import { mainLinks } from "@/components/layout/nav";

/**
 * Mobile: static header (the sticky action bar at the bottom carries Call/Book).
 * Desktop: sticky header that always shows the phone number and Book button.
 */
export function Header() {
  return (
    <header className="relative z-40 border-b border-hairline bg-cream/95 lg:sticky lg:top-0 lg:backdrop-blur">
      <div className="container-page flex min-h-20 items-center justify-between gap-4">
        <Link href="/" className="-ml-1 rounded-lg p-1">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            <li><ServicesMenu /></li>
            {mainLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-12 items-center rounded-lg px-3 font-bold text-navy-900 hover:bg-navy-100">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a href={telHref} className="inline-flex min-h-12 items-center gap-2 rounded-lg px-3 font-bold text-navy-900 hover:bg-navy-100">
            <PhoneIcon />
            <span>
              <span className="sr-only">Call </span>
              {site.phone.display}
            </span>
          </a>
          <ButtonLink href={bookHref}>Book a Ride</ButtonLink>
        </div>

        <MobileMenu />
      </div>
    </header>
  );
}
