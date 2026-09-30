import type { Metadata } from "next";
import { Logo, LogoMark, Pin } from "@/components/ui/Logo";
import { RideCard, RideCardBack } from "@/components/brand/RideCard";
import { ContactBlock } from "@/components/brand/ContactBlock";
import { DriverBadge } from "@/components/brand/DriverBadge";
import { SmsMock } from "@/components/brand/SmsMock";
import { site } from "@/config/site";

// Internal brand sheet: every logo tone and brand element on one page, for
// review and for `npm run test:brand`. Not linked, not indexed, not in the sitemap.
export const metadata: Metadata = {
  title: "Brand sheet",
  robots: { index: false, follow: false },
};

const grounds = [
  { tone: "navy", bg: "bg-cream", ground: "var(--color-cream)", name: "Navy on Cream" },
  { tone: "white", bg: "bg-navy", ground: "var(--color-navy)", name: "White on Navy" },
  { tone: "ink", bg: "bg-white", ground: "var(--color-white)", name: "Ink on White" },
] as const;

const swatches = [
  ["Northline Navy", "bg-navy", "#16284A"], ["Signal Amber", "bg-amber", "#E8A33D"], ["Cream", "bg-cream", "#FAF6EE"],
  ["Ink", "bg-ink", "#1E2533"], ["Morning Blue", "bg-morning", "#DCE6F5"], ["Sand", "bg-sand", "#EFE6D6"],
] as const;

export default function BrandPage() {
  return (
    <div className="bg-cream py-12">
      <div className="container-page space-y-14">
        <h1 className="text-[2.5rem] font-bold">Northline brand sheet</h1>

        <section aria-labelledby="logos-h">
          <h2 id="logos-h" className="text-2xl font-bold">Logo, three tones</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {grounds.map((g) => (
              <div key={g.tone} data-brand-ground={g.tone} className={`${g.bg} space-y-8 rounded-2xl p-8 ring-1 ring-ink/15`}>
                <p className={`label ${g.tone === "white" ? "text-white" : "text-ink"}`}>{g.name}</p>
                <Logo tone={g.tone} ground={g.ground} variant="wordmark" withTagline size={40} clear />
                <Logo tone={g.tone} ground={g.ground} variant="stacked" withTagline size={28} clear />
                <Logo tone={g.tone} ground={g.ground} variant="mark" size={56} clear />
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-end gap-6 [--logo-dot:var(--color-cream)]">
            <LogoMark className="h-6 w-6 text-navy" />
            <Pin className="h-8 w-auto" />
            <p className="text-ink/85">Minimum logo size: 24px tall. The pin is always Signal Amber.</p>
          </div>
        </section>

        <section aria-labelledby="colours-h">
          <h2 id="colours-h" className="text-2xl font-bold">Colours</h2>
          <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {swatches.map(([n, c, h]) => (
              <li key={n} className="overflow-hidden rounded-xl bg-white ring-1 ring-ink/15">
                <div className={`${c} h-20`} />
                <p className="px-3 pt-2 font-bold">{n}</p>
                <p className="px-3 pb-3 text-ink/85">{h}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="type-h">
          <h2 id="type-h" className="text-2xl font-bold">Type</h2>
          <p className="poster mt-6 text-[4rem]">On time. <em>Every</em> ride.</p>
          <p className="poster-fact mt-3 text-[2rem]">We call back in {site.responseTime}.</p>
          <p className="label mt-6">Ride Card</p>
          <p className="mt-2 max-w-2xl">Body copy is Atkinson Hyperlegible at 18/28, Ink on Cream. It was designed for low-vision readers.</p>
        </section>

        <section aria-labelledby="elements-h">
          <h2 id="elements-h" className="text-2xl font-bold">Ride Card, badge, text, contact</h2>
          <div className="mt-6 grid items-start gap-10 lg:grid-cols-3">
            <div className="space-y-6">
              <RideCard tag="Every Mon · Wed · Fri" pickup="Spring, TX" dropoff="DaVita Cypress Creek" when="7:15 AM pickup" driver="Jay" />
              <RideCard tag="Hospital discharge" pickup="HCA Northwest, Rm 412" dropoff="Home, Humble" when="Today, ready at 2 PM" driver="[Driver]" />
              <RideCard tag="Round trip · wait & return" pickup="The Woodlands" dropoff="Methodist Willowbrook" when="Thu Oct 9 · 9:40 AM" driver="[Driver]" />
              <RideCardBack />
            </div>
            <div className="space-y-6">
              <DriverBadge m={site.team[0]} />
              <ContactBlock />
            </div>
            <SmsMock />
          </div>
        </section>
      </div>
    </div>
  );
}
