import Link from "next/link";
import { site, coreAreas } from "@/config/site";
import { PinIcon, ArrowRightIcon } from "@/components/ui/Icons";

export function AreasPreview() {
  return (
    <section id="areas" aria-labelledby="areas-heading" className="bg-cream py-16 sm:py-20 lg:py-24">
      <div className="container-page">
        <p className="mb-3 label text-navy">Where we drive</p>
        <h2 id="areas-heading" className="max-w-3xl text-[2rem] font-bold sm:text-[2.5rem]">Wheelchair transportation across north Houston</h2>
        <p className="mt-4 max-w-3xl text-lg text-ink/85">
          We pick up across the north side and drive anywhere in the Houston area, including the Texas Medical Center.
        </p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coreAreas.map((a) => (
            <li key={a.slug} className="lift-card rounded-[var(--radius-card)] border border-ink/15 bg-white">
              <Link
                href={`/service-area/${a.slug}`}
                className="flex min-h-24 items-start gap-4 rounded-[var(--radius-card)] p-5 no-underline"
              >
                <PinIcon className="mt-1 h-6 w-6 shrink-0 text-navy" />
                <span>
                  <span className="block text-xl font-bold text-navy">{a.name} wheelchair transportation</span>
                  <span className="mt-1 block text-ink/85">{a.summary}</span>
                </span>
              </Link>
            </li>
          ))}
          <li className="rounded-[var(--radius-card)] border-2 border-dashed border-ink/15 p-5">
            <p className="font-bold text-navy">Also serving</p>
            <p className="mt-1 text-ink/85">{site.moreAreas.join(", ")} and more.</p>
            <Link href="/service-area" className="mt-3 inline-flex min-h-12 items-center gap-2 font-bold text-navy underline decoration-2 underline-offset-4">
              See the full service area <ArrowRightIcon />
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
