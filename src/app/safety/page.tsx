import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { CanAndCant } from "@/components/home/CanAndCant";
import { TeamGrid } from "@/components/home/TeamGrid";
import { FinalCta } from "@/components/home/FinalCta";
import { CheckIcon } from "@/components/ui/Icons";

export const metadata: Metadata = buildMetadata({
  title: "Wheelchair Van Safety Standards in Houston",
  description: `How Northline screens and trains drivers, secures every wheelchair, and checks every van before a ride in Houston. Only claims we can back up.`,
  path: "/safety",
});

const s = site.safety;

const blocks = [
  { title: "Before a driver is hired", items: s.driverScreening, note: "Repeated on a schedule, not just once." },
  { title: "What every driver is trained in", items: s.driverTraining, note: "PASS is the Community Transportation Association's passenger assistance course." },
  { title: "On every single ride", items: s.everyRide, note: "The pre-trip checklist is signed and kept." },
  { title: "Our vans", items: s.vehicles, note: s.insurance },
];

export default function SafetyPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Safety", path: "/safety" }]}
        title="Wheelchair van safety in Houston, spelled out"
        answer="Every Northline driver is background-checked, drug-screened and trained in wheelchair securement. Every ride uses four-point tie-downs and a shoulder belt. Every van is checked before its first pickup. Here is exactly what that means."
        cta={false}
      />

      <section aria-label="Standards" className="bg-white py-16 sm:py-20">
        <div className="container-page grid gap-12 md:grid-cols-2">
          {blocks.map((b) => (
            <div key={b.title} className="border-t-4 border-navy pt-6">
              <h2 className="text-2xl font-bold">{b.title}</h2>
              <ul className="mt-5 space-y-3">
                {b.items.map((it) => (
                  <li key={it} className="flex gap-3 text-lg"><CheckIcon className="mt-1 h-5 w-5 shrink-0 text-navy" /> {it}</li>
                ))}
              </ul>
              {b.note && <p className="mt-4 text-ink/85">{b.note}</p>}
            </div>
          ))}
        </div>
        {/* CONFIRM every line above with Jay. Do not publish an insurance carrier or limits until verified. */}
      </section>

      <Section id="securement" eyebrow="Two minutes at the ramp" title="How your chair is secured">
        <ol className="mt-8 grid gap-6 md:grid-cols-4">
          {[
            ["Ramp or lift down", "The driver lowers the ramp to the curb, or the lift to the ground, and locks it."],
            ["Roll on, brakes on", "You roll up in your own chair. The driver sets your brakes and turns off a power chair."],
            ["Four straps to the floor", "Two front, two rear, ratcheted tight. The chair can't roll, tip or slide."],
            ["Lap and shoulder belt", "For you, not the chair. Same as a car seat belt, anchored to the van."],
          ].map(([h, b], i) => (
            <li key={h} className="rounded-[var(--radius-card)] bg-white p-6">
              <span aria-hidden="true" className="font-display text-3xl font-bold text-navy">0{i + 1}</span>
              <h3 className="mt-2 text-xl font-bold">{h}</h3>
              <p className="mt-1 text-ink/85">{b}</p>
            </li>
          ))}
        </ol>
      </Section>

      <CanAndCant />
      <TeamGrid />

      <section className="bg-cream py-12">
        <div className="container-page">
          <p className="text-lg">
            Questions we get about safety are answered on the <Link href="/faq" className="font-bold text-navy underline">FAQ page</Link>, including what drivers don&apos;t do.
          </p>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
