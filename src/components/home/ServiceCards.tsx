import Link from "next/link";
import { services } from "@/config/site";
import { ArrowRightIcon } from "@/components/ui/Icons";

/** Service cards: whole card is one link; lifts softly on hover and keyboard focus. */
export function ServiceCards({ exclude }: { exclude?: string }) {
  const list = services.filter((s) => s.slug !== exclude);
  return (
    <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((s, i) => (
        <li key={s.slug} className="lift-card flex rounded-[var(--radius-card)] border border-ink/15 bg-white shadow-[var(--shadow-soft)]">
          {/* The whole card is the link, so the tap target is the full card. */}
          <Link href={`/services/${s.slug}`} className="flex flex-1 flex-col rounded-[var(--radius-card)] p-6 no-underline">
            <span aria-hidden="true" className="font-display text-sm font-bold text-navy">0{i + 1}</span>
            <h3 className="mt-2 text-xl font-bold">{s.shortName}</h3>
            <span className="mt-2 flex-1 text-ink/85">{s.cardSummary}</span>
            <span aria-hidden="true" className="mt-5 inline-flex items-center gap-2 font-bold text-navy">
              Learn more <ArrowRightIcon />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
