import { site } from "@/config/site";

/**
 * Testimonials. Every placeholder is visibly tagged "Sample" until it is
 * replaced by a real Google review (set isPlaceholder: false in site.ts).
 */
export function Testimonials() {
  return (
    <section id="reviews" aria-labelledby="reviews-heading" className="bg-sand py-16 sm:py-20 lg:py-24">
      <div className="container-page">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-navy-700">What riders and families say</p>
        <h2 id="reviews-heading" className="max-w-3xl text-[2rem] font-bold sm:text-[2.5rem]">Rides people look forward to</h2>
        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {site.testimonials.map((t) => (
            <li key={t.name} className="flex">
              <figure className="flex flex-1 flex-col rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-soft)]">
                {t.isPlaceholder && (
                  <span className="mb-4 self-start rounded-full border-2 border-dashed border-navy-700 px-3 py-0.5 text-sm font-bold text-navy-700">
                    Sample review
                  </span>
                )}
                <svg aria-hidden="true" viewBox="0 0 32 24" className="h-6 w-8 text-navy-700"><path fill="currentColor" d="M0 24V14C0 6 4 1 12 0l1 4c-4 1-6 4-6 8h6v12H0zm19 0V14c0-8 4-13 12-14l1 4c-4 1-6 4-6 8h6v12H19z" /></svg>
                <blockquote className="mt-3 flex-1 text-lg">
                  <p>{t.quote}</p>
                </blockquote>
                <figcaption className="mt-5">
                  <span className="block font-bold text-navy-900">{t.name}</span>
                  <span className="text-muted">{t.context}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
