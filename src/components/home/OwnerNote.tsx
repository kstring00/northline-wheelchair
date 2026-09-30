import Link from "next/link";
import { site } from "@/config/site";
import { ArrowRightIcon } from "@/components/ui/Icons";

/**
 * A note from the owner, in Jay's layout. Until Jay writes it (questionnaire
 * Q11) the section shows a marked placeholder. No draft copy about Jay's life
 * appears anywhere on the site; `npm run check:copy` fails the build if it does.
 */
export function OwnerNote() {
  const { owner } = site;
  const filled = owner.note.length > 0;
  return (
    <section id="meet-jay" aria-labelledby="owner-heading" data-owner-note={filled ? "filled" : "placeholder"} className="bg-cream py-12 sm:py-20 lg:py-24">
      <div className="container-page grid items-center gap-10 md:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="mx-auto grid aspect-[16/9] w-full max-w-sm md:aspect-[4/5] place-items-center rounded-[2rem] border-2 border-dashed border-ink/25 bg-sand md:max-w-none">
          <p className="text-ink/85">Jay&apos;s photo</p>
        </div>
        <div>
          <p className="label mb-3 text-navy">A note from the owner</p>
          <h2 id="owner-heading" className="text-[2rem] font-bold sm:text-[2.5rem]">
            {filled ? owner.noteHeadline : "[Jay's headline, in his words]"}
          </h2>
          {filled ? (
            <div className="mt-6 space-y-4 text-lg">
              {owner.note.map((p) => <p key={p}>{p}</p>)}
            </div>
          ) : (
            <div data-owner-placeholder className="mt-6 rounded-xl border-2 border-dashed border-ink/40 p-5 text-lg">
              <p>Jay&apos;s story goes here — how Northline started and why, in his own words, from questionnaire Q11. Nothing on this site describes Jay&apos;s life until he writes it.</p>
            </div>
          )}
          <p className="mt-6 font-display text-2xl font-bold text-navy">— {owner.firstName}, {owner.role}</p>
          <Link href="/about" className="mt-6 inline-flex min-h-12 items-center gap-2 font-bold text-navy underline decoration-2 underline-offset-4">
            Meet the drivers and read our safety standards <ArrowRightIcon />
          </Link>
        </div>
      </div>
    </section>
  );
}
