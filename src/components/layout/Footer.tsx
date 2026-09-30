import Link from "next/link";
import { site, coreAreas, telHref, bookHref } from "@/config/site";
import { t } from "@/content/dictionary";
import { Logo } from "@/components/ui/Logo";
import { RouteMotif } from "@/components/ui/RouteMotif";
import { SeHablaBadge } from "@/components/ui/Badges";
import { CopyrightYear } from "@/components/layout/CopyrightYear";
import { serviceLinks, moreLinks } from "@/components/layout/nav";

const BUILD_YEAR = new Date().getFullYear();

export function Footer() {
  const link = "inline-flex min-h-12 min-w-12 items-center text-cream underline decoration-mist/60 underline-offset-4 hover:decoration-cream";
  const heading = "font-display text-lg font-bold text-cream";
  return (
    <footer className="on-dark bg-navy-950 text-mist">
      <div className="container-page py-14">
        <RouteMotif tone="dark" className="mb-10 h-10 w-56 opacity-80" />
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* NAP block: must match Google Business Profile exactly. */}
          <div>
            <Link href="/" className="inline-flex min-h-12 items-center rounded-lg py-1">
              <Logo onDark />
            </Link>
            <address className="mt-5 not-italic">
              <p className="font-bold text-cream">{site.name}</p>
              {site.address.showStreet && <p>{site.address.street}</p>}
              <p>{site.address.city}, {site.address.region} {site.address.postalCode}</p>
              <p className="mt-2"><a href={telHref} className={`${link} text-lg font-bold`}>{site.phone.display}</a></p>
              <p><a href={`mailto:${site.email}`} className={link}>{site.email}</a></p>
            </address>
            <SeHablaBadge className="mt-4" />
          </div>

          <div>
            <h2 className={heading}>{t.labels.hours}</h2>
            <dl className="mt-3 space-y-2">
              {site.hours.map((h) => (
                <div key={h.label}>
                  <dt className="font-bold text-cream">{h.label}</dt>
                  <dd>{h.display}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm"><strong className="text-cream">{t.labels.afterHours}</strong> {t.response.afterHours}</p>
          </div>

          <nav aria-label={t.footer.services}>
            <h2 className={heading}>{t.footer.services}</h2>
            <ul className="mt-2">
              {serviceLinks.map((l) => <li key={l.href}><Link href={l.href} className={link}>{l.label}</Link></li>)}
              <li><Link href="/pricing" className={link}>{t.nav.pricing}</Link></li>
              <li><Link href={bookHref} className={link}>{t.actions.bookLong}</Link></li>
            </ul>
          </nav>

          <div>
            <nav aria-label={t.footer.areas}>
              <h2 className={heading}>{t.footer.areas}</h2>
              <ul className="mt-2">
                {coreAreas.map((a) => (
                  <li key={a.slug}><Link href={`/service-area/${a.slug}`} className={link}>{a.name}</Link></li>
                ))}
                <li><Link href="/service-area" className={link}>{t.footer.allAreas}</Link></li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-navy-700 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>© <CopyrightYear buildYear={BUILD_YEAR} /> {site.legalName}. {t.footer.rights}</p>
          <ul className="flex flex-wrap gap-x-6">
            <li><Link href="/about" className={link}>{t.nav.about}</Link></li>
            <li><Link href="/partners" className={link}>{t.nav.partners}</Link></li>
            {moreLinks.map((l) => <li key={l.href}><Link href={l.href} className={link}>{l.label}</Link></li>)}
            <li><Link href="/privacy" className={link}>{t.footer.privacy}</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
