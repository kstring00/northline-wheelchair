import { site, money, telHref } from "@/config/site";
import { CheckIcon } from "@/components/ui/Icons";
import { Unconfirmed } from "@/components/ui/Unconfirmed";

const p = site.pricing;

/**
 * The fare rules as a ledger, not a card grid. A row renders only when its
 * source in site.ts is set: nothing here is written as literal copy. Amounts
 * follow displayMode ("full" every number, "startingAt" the base fare only,
 * "quoteOnly" none). With no rule set, the whole ledger is one <Unconfirmed />.
 */
type Line = { label: string; rule: string; amount: string | null };

export function pricingLines(mode = p.displayMode): Line[] {
  const full = mode === "full";
  const some = mode !== "quoteOnly";
  const lines: (Line | null)[] = [
    p.base !== null
      ? {
          label: "Base fare",
          rule: `One pickup and one drop-off${p.baseIncludesMiles !== null ? `, including the first ${p.baseIncludesMiles} miles` : ""}.`,
          amount: some ? `${mode === "startingAt" ? "from " : ""}${money(p.base)}` : null,
        }
      : null,
    p.perMile !== null
      ? {
          label: "Distance",
          rule: p.baseIncludesMiles !== null ? `Each mile after the first ${p.baseIncludesMiles}.` : "Each mile of the trip.",
          amount: full ? `${money(p.perMile)} / mile` : null,
        }
      : null,
    p.waitPerHour !== null || p.waitFreeMinutes !== null
      ? {
          label: "Wait time",
          rule: [
            p.waitFreeMinutes !== null ? `The first ${p.waitFreeMinutes} minutes of waiting are free.` : "",
            p.waitPerHour !== null ? "Waiting during the appointment is charged by the hour." : "",
          ]
            .filter(Boolean)
            .join(" "),
          amount: full && p.waitPerHour !== null ? `${money(p.waitPerHour)} / hour` : null,
        }
      : null,
    p.companionFee !== null
      ? {
          label: "Companions",
          rule:
            p.companionFee === 0
              ? `${site.capabilities.maxCompanions !== null ? `Up to ${site.capabilities.maxCompanions} family` : "Family"} members or caregivers ride free.`
              : "Each extra rider is added to the fare.",
          amount: p.companionFee === 0 ? "Free" : full ? `${money(p.companionFee)} each` : null,
        }
      : null,
    p.roundTripRule !== null ? { label: "Round trips", rule: p.roundTripRule, amount: null } : null,
    p.afterHoursRule !== null || p.afterHoursFee !== null
      ? {
          label: "Nights, weekends, holidays",
          rule: p.afterHoursRule ?? "",
          amount: full && p.afterHoursFee !== null ? `+${money(p.afterHoursFee)}` : null,
        }
      : null,
    p.cancellationWindow !== null ? { label: "Cancelling", rule: p.cancellationWindow, amount: null } : null,
  ];
  return lines.filter((l): l is Line => l !== null);
}

export function PricingRules({ mode = p.displayMode }: { mode?: typeof p.displayMode }) {
  const lines = pricingLines(mode);
  return (
    <div>
      {lines.length === 0 ? (
        <Unconfirmed />
      ) : (
        <>
          <dl className="divide-y divide-ink/15 rounded-[var(--radius-card)] border border-ink/15 bg-white">
            {lines.map((l) => (
              <div key={l.label} className="grid gap-2 px-5 py-5 sm:grid-cols-[11rem_1fr_auto] sm:items-baseline sm:gap-6 sm:px-7">
                <dt className="text-lg font-bold text-navy">{l.label}</dt>
                <dd className="text-ink/85">{l.rule}</dd>
                {l.amount && <dd className="font-display text-2xl font-bold tabular-nums text-navy sm:text-right">{l.amount}</dd>}
              </div>
            ))}
          </dl>
          <p className="mt-6 text-lg">
            Questions about a fare?{" "}
            <a href={telHref} className="inline-flex min-h-12 items-center font-bold text-navy underline decoration-2 underline-offset-4">Call {site.phone.display}</a>
          </p>
        </>
      )}

      <div className={`mt-8 grid gap-6 ${p.paymentMethods.length > 0 ? "md:grid-cols-2" : ""}`}>
        {p.paymentMethods.length > 0 && (
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
        )}
        <div className="rounded-[var(--radius-card)] border border-ink/15 bg-white p-6">
          <h3 className="text-xl font-bold">Medicaid and insurance</h3>
          <p className="mt-3 text-ink/85">
            {p.insurance.brokers.length > 0
              ? `Ride brokers we work with: ${p.insurance.brokers.join(", ")}.`
              : "We're currently private-pay and facility-billed. If you use a Medicaid transportation broker, call us and we'll tell you where we stand."}
          </p>
        </div>
      </div>
      {/* CONFIRM every number and rule above with Jay (site.pricing in src/config/site.ts). */}
    </div>
  );
}
