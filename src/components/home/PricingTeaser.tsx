import Link from "next/link";
import { site, money } from "@/config/site";
import { pricingLines } from "@/components/pricing/PricingRules";
import { ArrowRightIcon } from "@/components/ui/Icons";

/**
 * Home page pricing block. With no base fare in site.ts it is a heading, one
 * sentence and a link: no numbers, no rules. Once Jay confirms the fare, the
 * base price and up to three rules render, all read from site.pricing.
 */
export function PricingTeaser() {
  const p = site.pricing;
  const showBase = p.base !== null && p.displayMode !== "quoteOnly";
  const lines = p.base === null ? [] : pricingLines().filter((l) => ["Base fare", "Companions", "Nights, weekends, holidays"].includes(l.label));
  return (
    <section id="pricing" aria-labelledby="pricing-heading" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className={`container-page grid gap-10 ${lines.length ? "lg:grid-cols-[1fr_1.2fr] lg:gap-16" : ""}`}>
        <div>
          <p className="mb-3 label text-navy">Pricing</p>
          <h2 id="pricing-heading" className="text-[2rem] font-bold sm:text-[2.5rem]">What a ride costs</h2>
          <p className="mt-4 text-lg text-ink/85">
            {showBase && p.base !== null ? `Rides start at ${money(p.base)}. ` : ""}Ask for a quote and Jay will give you the price before you book.
          </p>
          <Link href="/pricing" className="mt-6 inline-flex min-h-12 items-center gap-2 font-bold text-navy underline decoration-2 underline-offset-4">
            {lines.length ? "See pricing and get a quote" : "Get a quote"} <ArrowRightIcon />
          </Link>
        </div>
        {lines.length > 0 && (
          <dl className="divide-y divide-ink/15 rounded-[var(--radius-card)] border border-ink/15 bg-cream">
            {lines.map((l) => (
              <div key={l.label} className="grid gap-1 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-6">
                <dt className="font-bold text-navy sm:col-start-1">{l.label}</dt>
                {l.amount && <dd className="font-display text-2xl font-bold tabular-nums text-navy sm:col-start-2 sm:row-span-2 sm:row-start-1">{l.amount}</dd>}
                {l.rule && <dd className="text-ink/85 sm:col-start-1">{l.rule}</dd>}
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
