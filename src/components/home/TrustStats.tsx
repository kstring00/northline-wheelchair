import Image from "next/image";
import { site } from "@/config/site";
import { CheckIcon } from "@/components/ui/Icons";
import { CountUpMotion } from "@/components/home/CountUpMotion";

/** Stats (count up once in view) + driver and vehicle standards. All CONFIRM in site.ts. */
export function TrustStats() {
  return (
    <section id="trust" aria-labelledby="trust-heading" className="on-dark bg-navy-900 py-16 text-cream sm:py-20 lg:py-24">
      <div className="container-page">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-mist">Why families trust us</p>
          <h2 id="trust-heading" className="text-[2rem] font-bold !text-cream sm:text-[2.5rem]">Careful drivers. Safe vans. Every single ride.</h2>
        </div>

        <dl data-countup className="mt-10 grid gap-6 border-y border-navy-700 py-8 sm:grid-cols-3">
          {site.stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse">
              <dt className="mt-1 text-lg text-mist">{s.label}</dt>
              <dd className="font-display text-5xl font-bold tabular-nums text-cream sm:text-6xl">
                <span className="sr-only">{`${s.value.toLocaleString("en-US")}${s.suffix}`}</span>
                <span aria-hidden="true">
                  <span data-countup-value={s.value}>{s.value.toLocaleString("en-US")}</span>
                  {s.suffix}
                </span>
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-[1fr_1fr]">
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="text-xl font-bold !text-cream">Our drivers</h3>
              <ul className="mt-4 space-y-3">
                {site.standards.drivers.map((d) => (
                  <li key={d} className="flex gap-3 text-mist">
                    <CheckIcon className="mt-1 h-5 w-5 shrink-0 text-cream" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold !text-cream">Our vans</h3>
              <ul className="mt-4 space-y-3">
                {site.standards.vehicles.map((d) => (
                  <li key={d} className="flex gap-3 text-mist">
                    <CheckIcon className="mt-1 h-5 w-5 shrink-0 text-cream" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Image
            src={site.images.driverHelping.src}
            alt={site.images.driverHelping.alt}
            width={site.images.driverHelping.width}
            height={site.images.driverHelping.height}
            sizes="(min-width: 1024px) 560px, 100vw"
            className="h-auto w-full rounded-[1.5rem]"
          />
        </div>
      </div>
      <CountUpMotion />
    </section>
  );
}
