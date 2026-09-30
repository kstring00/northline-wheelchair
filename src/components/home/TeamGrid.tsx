import Image from "next/image";
import { site } from "@/config/site";
import { ExampleTag } from "@/components/ui/Badges";

/**
 * "Meet your drivers." Jay first. Cards without a photo show a placeholder
 * silhouette and a CONFIRM tag until real photos and words arrive.
 */
export function TeamGrid() {
  const team = site.team;
  if (!team.length) return null;
  return (
    <section id="drivers" aria-labelledby="drivers-heading" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="container-page">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-navy-700">The people who drive you</p>
        <h2 id="drivers-heading" className="max-w-3xl text-[2rem] font-bold sm:text-[2.5rem]">Meet your drivers</h2>
        <p className="mt-4 max-w-3xl text-lg text-muted">
          Riders remember their driver&apos;s name. So do we. Every driver here has passed a background check and is trained to help you in and out safely.
        </p>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((m, i) => (
            <li key={m.firstName + i} className="grid grid-cols-[7rem_1fr] gap-5 rounded-[var(--radius-card)] border border-hairline bg-cream p-5">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-navy-900">
                {m.photo ? (
                  <Image src={m.photo.src} alt={m.photo.alt} width={m.photo.width} height={m.photo.height} sizes="7rem" className="h-full w-full object-cover" />
                ) : (
                  <svg viewBox="0 0 80 100" className="h-full w-full" aria-hidden="true">
                    <rect width="80" height="100" fill="#10284A" />
                    <circle cx="40" cy="36" r="18" fill="#F7C98C" />
                    <path d="M12 100c0-22 12-34 28-34s28 12 28 34z" fill="#0B1B33" />
                  </svg>
                )}
              </div>
              <div className="flex flex-col">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-2xl font-bold">{m.firstName}</h3>
                  {m.isPlaceholder && <ExampleTag label="Photo to come" />}
                </div>
                <p className="text-muted">
                  {m.role}
                  {m.yearsDriving !== null && ` · ${m.yearsDriving} years driving`}
                </p>
                {m.quote && <p className="mt-3 text-lg">“{m.quote}”</p>}
                {m.certifications.length > 0 && (
                  <ul className="mt-auto flex flex-wrap gap-2 pt-4" aria-label={`${m.firstName}'s certifications`}>
                    {m.certifications.map((c) => (
                      <li key={c} className="rounded-full bg-navy-100 px-3 py-1 text-sm font-bold text-navy-900">{c}</li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ul>
        {/* CONFIRM: names, years, quotes, certifications and photos for every driver. */}
      </div>
    </section>
  );
}
