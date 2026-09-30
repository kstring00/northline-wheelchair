import Link from "next/link";
import { site, services } from "@/config/site";

/**
 * Home services: one editorial row per service. The name is the link; the
 * description sits beside it. Ordered by what brings in rides. Nothing else:
 * no numbers, cards, shadows or arrows.
 */
export function ServiceList() {
  const list = site.homeServiceOrder.map((slug) => services.find((s) => s.slug === slug)).filter((s) => s !== undefined);
  return (
    <ul data-service-list className="mt-10 border-t border-ink/15">
      {list.map((s) => (
        <li key={s.slug} className="grid gap-2 border-b border-ink/15 py-7 md:grid-cols-[minmax(0,18rem)_1fr] md:gap-10 lg:grid-cols-[minmax(0,22rem)_1fr]">
          <h3 className="text-[1.75rem] font-bold leading-tight">
            <Link href={`/services/${s.slug}`} className="text-navy no-underline underline-offset-4 hover:underline focus-visible:underline">
              {s.shortName}
            </Link>
          </h3>
          <p className="max-w-2xl text-lg">{s.cardSummary}</p>
        </li>
      ))}
    </ul>
  );
}
