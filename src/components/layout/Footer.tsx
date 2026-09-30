import Link from "next/link";
import { site, coreAreas, bookHref } from "@/config/site";
import { t } from "@/content/dictionary";
import { Logo } from "@/components/ui/Logo";
import { SeHablaBadge } from "@/components/ui/Badges";
import { CopyrightYear } from "@/components/layout/CopyrightYear";
import { ContactBlock } from "@/components/brand/ContactBlock";
import { serviceLinks, moreLinks } from "@/components/layout/nav";

const BUILD_YEAR = new Date().getFullYear();

/**
 * Navy map pattern ground. The stacked lockup sits in a solid navy box sized
 * to its protection area (never directly on the pattern); the contact block
 * is the business-card back.
 */
export function Footer() {
  const link = "inline-flex min-h-12 min-w-12 items-center text-cream underline decoration-cream/50 underline-offset-4 hover:decoration-cream";
  const heading = "font-display text-lg font-bold text-cream";
  return (
    <footer className="on-dark pattern-navy text-cream/80" data-footer>
      <div className="container-page py-14">
        <div className="grid items-start gap-8 md:grid-cols-[auto_minmax(0,28rem)]">
          <Link href="/" className="inline-flex self-start rounded-xl bg-navy">
            <Logo variant="stacked" tone="white" size={28} withTagline clear label={`${site.name}, home page`} />
          </Link>
          <div>
            <ContactBlock />
            {/* NAP line: must match Google Business Profile exactly. */}
            <address className="mt-4 not-italic">
              <span className="font-bold text-cream">{site.name}</span>
              {site.address.showStreet && <>, {site.address.street}</>}, {site.address.city}, {site.address.region} {site.address.postalCode}
            </address>
            <SeHablaBadge className="mt-4" />
          </div>
        </div>

        <div className="mt-12 grid gap-10 rounded-2xl bg-navy p-6 sm:grid-cols-3 sm:p-8">
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

        <div className="mt-8 flex flex-col gap-4 rounded-2xl bg-navy px-6 py-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8">
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
