import { site } from "@/config/site";
import { DriverBadge } from "@/components/brand/DriverBadge";

/**
 * The team, as driver badges (Brand Guidelines 3.2). Jay first. Cards without
 * a photo show "[Name]'s photo" in the circle until real photos arrive.
 */
export function TeamGrid() {
  const team = site.team;
  if (!team.length) return null;
  return (
    <section id="drivers" aria-labelledby="drivers-heading" className="bg-morning py-16 sm:py-20 lg:py-24">
      <div className="container-page">
        <p className="label mb-3 text-navy">The people who drive you</p>
        <h2 id="drivers-heading" className="max-w-3xl text-[2rem] font-bold sm:text-[2.5rem]">Reviews name the driver. So does the badge.</h2>
        <p className="mt-4 max-w-3xl text-lg">
          The happiest riders name their driver. Northline drivers wear a badge with a first name, a face and their certifications, so the family at the door knows who is helping before a word is said.
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
