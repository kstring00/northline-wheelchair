import { site, money, telHref } from "@/config/site";
import { CheckIcon } from "@/components/ui/Icons";

const p = site.pricing;

/**
 * The fare rules as a ledger, not a card grid. In "full" mode every number
 * shows. In "startingAt" only the base fare shows. In "quoteOnly" no numbers
 * show, but every rule still reads in plain words.
 */
type Line = { label: string; rule: string; amount?: string | null };

export function pricingLines(mode = p.displayMode): Line[] {
  const full = mode === "full";
  const some = mode !== "quoteOnly";
  const n = (v: number | null, f: (x: number) => string) => (v === null ? null : f(v));
  return [
    {
      label: "Base fare",
      rule: `One pickup, one drop-off${p.baseIncludesMiles ? `, and the first ${p.baseIncludesMiles} miles` : ""}. Help from your door to the right suite is always included.`,
      amount: some ? n(p.base, (v) => `${mode === "startingAt" ? "from " : ""}${money(v)}`) : null,
    },
    {
      label: "Distance",
      rule: p.baseIncludesMiles ? `After the first ${p.baseIncludesMiles} miles, each extra mile is added.` : "Longer trips cost more per mile.",
      amount: full ? n(p.perMile, (v) => `${money(v)} / mile`) : null,
    },
    {
      label: "Wait time",
      rule: `${p.waitFreeMinutes ? `The first ${p.waitFreeMinutes} minutes are free. ` : ""}If your driver waits during the appointment, the rest is billed by the quarter hour.`,
      amount: full ? n(p.waitPerHour, (v) => `${money(v)} / hour`) : null,
    },
    {
      label: "Companions",
      rule: p.companionFee === 0 ? `Up to ${site.capabilities.maxCompanions ?? 2} family members or caregivers ride free.` : `Each extra rider is added to the fare.`,
      amount: full ? n(p.companionFee, (v) => (v === 0 ? "Free" : `${money(v)} each`)) : p.companionFee === 0 ? "Free" : null,
    },
    { label: "Round trips", rule: p.roundTripRule, amount: null },
    {
      label: "Nights, weekends, holidays",
      rule: p.afterHoursRule,
      amount: full ? n(p.afterHoursFee, (v) => `+${money(v)}`) : null,
    },
    { label: "Cancelling", rule: p.cancellationWindow, amount: null },
  ];
}

export function PricingRules({ mode = p.displayMode }: { mode?: typeof p.displayMode }) {
  const lines = pricingLines(mode);
  return (
    <div>
      <dl className="divide-y divide-ink/15 rounded-[var(--radius-card)] border border-ink/15 bg-white">
        {lines.map((l) => (
          <div key={l.label} className="grid gap-2 px-5 py-5 sm:grid-cols-[11rem_1fr_auto] sm:items-baseline sm:gap-6 sm:px-7">
            <dt className="text-lg font-bold text-navy">{l.label}</dt>
            <dd className="text-ink/85">{l.rule}</dd>
            {l.amount && <dd className="font-display text-2xl font-bold tabular-nums text-navy sm:text-right">{l.amount}</dd>}
          </div>
        ))}
      </dl>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-[var(--radius-card)] bg-morning p-6">
          <h3 className="text-xl font-bold">How to pay</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {p.paymentMethods.map((m) => (
              <li key={m} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 font-bold text-navy">
                <CheckIcon className="h-4 w-4 text-navy" /> {m}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[var(--radius-card)] border border-ink/15 bg-white p-6">
          <h3 className="text-xl font-bold">Medicaid, Medicare and insurance</h3>
          <dl className="mt-3 space-y-3">
            <div><dt className="font-bold">Medicaid</dt><dd className="text-ink/85">{p.insurance.medicaid}</dd></div>
            <div><dt className="font-bold">Medicare</dt><dd className="text-ink/85">{p.insurance.medicare}</dd></div>
            <div><dt className="font-bold">Private insurance</dt><dd className="text-ink/85">{p.insurance.private}</dd></div>
            {p.insurance.brokers.length > 0 && (
              <div><dt className="font-bold">Ride brokers we work with</dt><dd className="text-ink/85">{p.insurance.brokers.join(", ")}</dd></div>
            )}
          </dl>
        </div>
      </div>

      <p className="mt-8 text-lg">
        {mode === "quoteOnly"
          ? "We give you the exact price when we confirm your ride, before you're ever charged. "
          : "These are the rules. The exact price for your trip depends on the addresses, and we tell you that number before you book. "}
        Questions?{" "}
        <a href={telHref} className="font-bold text-navy underline decoration-2 underline-offset-4">Call {site.phone.display}</a>.
      </p>
      {/* CONFIRM every number and rule above with Jay. */}
    </div>
  );
}
