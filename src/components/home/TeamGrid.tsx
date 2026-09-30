import { site } from "@/config/site";
import { isSiteLive } from "@/lib/env";
import { DriverBadge } from "@/components/brand/DriverBadge";

/**
 * The team, as driver badges (Brand Guidelines 3.2). Jay first. Cards without
 * a photo show "[Name]'s photo" in the circle until real photos arrive.
 */
export function TeamGrid() {
  // Placeholder cards (e.g. "Driver 2") show before launch only.
  const team = site.team.filter((m) => !m.isPlaceholder || m.firstName === site.owner.firstName || !isSiteLive);
  if (!team.length) return null;
  return (
    <section id="drivers" aria-labelledby="drivers-heading" className="bg-morning py-16 sm:py-20 lg:py-24">
      <div className="container-page">
        <p className="label mb-3 text-navy">The people who drive you</p>
        <h2 id="drivers-heading" className="max-w-3xl text-[2rem] font-bold sm:text-[2.5rem]">Meet your drivers</h2>
        {/* ASK JAY: do riders name their driver in reviews? Do drivers wear a badge? Say so here once true. */}
        <p className="mt-4 max-w-3xl text-lg">
          A first name, a face and a phone number, so you know who is coming to the door.
        </p>
        <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((m, i) => (
            <li key={m.firstName + i} className="mx-auto w-full max-w-[22rem]">
              <DriverBadge m={m} />
            </li>
          ))}
        </ul>
        {/* CONFIRM: names, certifications and photos for every driver. */}
      </div>
    </section>
  );
}
