import { site } from "@/config/site";
import { CountUpMotion } from "@/components/home/CountUpMotion";

/** Three numbers from site.ts. Each renders only when set. Counts up once in view. */
export function StatsStrip({ tone = "sand" }: { tone?: "sand" | "navy" }) {
  const s = site.stats;
  const items = [
    s.years !== null && { value: s.years, suffix: "", label: "years driving Houston riders" },
    s.rides !== null && { value: s.rides, suffix: "+", label: "rides completed" },
    s.onTimeRate !== null && { value: s.onTimeRate, suffix: "%", label: "on-time pickups" },
  ].filter(Boolean) as { value: number; suffix: string; label: string }[];
  if (!items.length) return null;
  const dark = tone === "navy";
  return (
    <section aria-label="Northline by the numbers" className={dark ? "on-dark bg-navy text-cream" : "bg-sand"}>
      <div className="container-page">
        <dl data-countup className={`grid gap-6 border-y py-8 sm:grid-cols-3 ${dark ? "border-cream/25" : "border-ink/15"}`}>
          {items.map((it) => (
            <div key={it.label} className="flex flex-col-reverse">
              <dt className={`mt-1 ${dark ? "text-cream/80" : "text-ink/85"}`}>{it.label}</dt>
              <dd className={`font-display text-5xl font-bold tabular-nums sm:text-6xl ${dark ? "text-cream" : "text-navy"}`}>
                <span className="sr-only">{`${it.value.toLocaleString("en-US")}${it.suffix}`}</span>
                <span aria-hidden="true">
                  <span data-countup-value={it.value}>{it.value.toLocaleString("en-US")}</span>
                  {it.suffix}
                </span>
              </dd>
            </div>
          ))}
        </dl>
        {/* CONFIRM: placeholder numbers until Jay provides real ones. */}
      </div>
      <CountUpMotion />
    </section>
  );
}
