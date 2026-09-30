import Link from "next/link";
import { site, money } from "@/config/site";
import { pricingLines } from "@/components/pricing/PricingRules";
import { ArrowRightIcon } from "@/components/ui/Icons";

/** Home page pricing block: the headline promise plus three rules. Numbers follow displayMode. */
export function PricingTeaser() {
  const p = site.pricing;
  const lines = pricingLines().filter((l) => ["Base fare", "Companions", "Nights, weekends, holidays"].includes(l.label));
  return (
    <section id="pricing" aria-labelledby="pricing-heading" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-navy-700">Pricing</p>
          <h2 id="pricing-heading" className="text-[2rem] font-bold sm:text-[2.5rem]">No surprises. You&apos;ll know the price before you ride.</h2>
          <p className="mt-4 text-lg text-muted">
            {p.displayMode === "quoteOnly"
              ? "We tell you the exact price when we confirm, before you're charged a dollar. The rules we price by are public."
              : `Rides start at ${money(p.base ?? 0)}. Every rule we price by is public, and the number we quote is the number you pay.`}
          </p>
          <Link href="/pricing" className="mt-6 inline-flex min-h-12 items-center gap-2 font-bold text-navy-700 underline decoration-2 underline-offset-4">
            See every pricing rule and get a quote <ArrowRightIcon />
          </Link>
        </div>
        <dl className="divide-y divide-hairline rounded-[var(--radius-card)] border border-hairline bg-cream">
          {lines.map((l) => (
            <div key={l.label} className="grid gap-1 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-6">
              <dt className="font-bold text-navy-900 sm:col-start-1">{l.label}</dt>
              {l.amount && <dd className="font-display text-2xl font-bold tabular-nums text-navy-900 sm:col-start-2 sm:row-span-2 sm:row-start-1">{l.amount}</dd>}
              <dd className="text-muted sm:col-start-1">{l.rule}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
