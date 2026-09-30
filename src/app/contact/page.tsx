import type { Metadata } from "next";
import { site, telHref, bookHref, fullAddress } from "@/config/site";
import { t } from "@/content/dictionary";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink, buttonClass } from "@/components/ui/Button";
import { TextUsLink, SeHablaBadge } from "@/components/ui/Badges";
import { PhoneIcon } from "@/components/ui/Icons";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  brandFirst: true,
  description: `Call, text or email ${site.name} in Houston. ${site.hours[0].label} ${site.hours[0].display}. We call back within ${site.responseTime} during business hours.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHeader crumbs={[{ name: "Contact", path: "/contact" }]} title="Talk to a person" answer={`Call, text or book online. ${t.response.callback}`} cta={false} />
      <section aria-label="Ways to reach us" className="bg-white py-16">
        <div className="container-page grid gap-10 md:grid-cols-2">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold">Phone</h2>
              <a href={telHref} className="mt-2 inline-flex min-h-12 items-center gap-2 font-display text-3xl font-bold text-navy-900 underline decoration-2 underline-offset-4"><PhoneIcon className="h-7 w-7" /> {site.phone.display}</a>
              <div className="mt-3 flex flex-wrap gap-3">
                <a href={telHref} className={buttonClass("primary", "md")}>{t.actions.call}</a>
                <TextUsLink />
              </div>
              <SeHablaBadge className="mt-3" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Email</h2>
              <a href={`mailto:${site.email}`} className="mt-1 inline-flex min-h-12 items-center text-lg font-bold text-navy-700 underline">{site.email}</a>
            </div>
            <div>
              <h2 className="text-xl font-bold">Address</h2>
              <address className="mt-1 not-italic text-lg">{site.address.showStreet ? fullAddress : `${site.address.city}, ${site.address.region}`}</address>
            </div>
            <ButtonLink href={bookHref} size="lg">{t.actions.bookLong}</ButtonLink>
          </div>
          <div className="rounded-[var(--radius-card)] border border-hairline bg-cream p-6">
            <h2 className="text-xl font-bold">{t.labels.hours}</h2>
            <dl className="mt-3 space-y-2">
              {site.hours.map((h) => (
                <div key={h.label} className="flex justify-between gap-4 border-b border-hairline pb-2">
                  <dt className="font-bold">{h.label}</dt>
                  <dd>{h.display}</dd>
                </div>
              ))}
            </dl>
            <h3 className="mt-6 text-lg font-bold">{t.labels.afterHours}</h3>
            <p className="mt-1 text-muted">{t.response.afterHours}</p>
          </div>
        </div>
      </section>
    </>
  );
}
