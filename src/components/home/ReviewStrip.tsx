import { site, hasRealReviews, type Review } from "@/config/site";
import { t } from "@/content/dictionary";
import { ExampleTag } from "@/components/ui/Badges";

const Stars = ({ n }: { n: number }) => (
  <span className="flex gap-0.5" role="img" aria-label={`${n} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <svg key={i} viewBox="0 0 20 20" className={`h-5 w-5 ${i <= n ? "text-navy-900" : "text-hairline"}`} aria-hidden="true">
        <path fill="currentColor" d="m10 1.5 2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L10 14.9l-5.3 2.8 1.1-5.9L1.5 7.7l5.9-.8z" />
      </svg>
    ))}
  </span>
);

/** Bold the driver's name inside the quote so it reads the way the review was written. */
function Quote({ r }: { r: Review }) {
  if (!r.driverName) return <p>{r.text}</p>;
  const parts = r.text.split(new RegExp(`(${r.driverName})`, "g"));
  return <p>{parts.map((part, i) => (part === r.driverName ? <strong key={i} className="text-navy-900">{part}</strong> : part))}</p>;
}

const fmtDate = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "long", year: "numeric" });

/**
 * Reviews from site.ts. Placeholders carry a visible "Example review" tag.
 * The Google badge and the "leave a review" link appear only when set.
 */
export function ReviewStrip({ limit = 3 }: { limit?: number }) {
  const reviews = site.reviews.slice(0, limit);
  if (!reviews.length) return null;
  return (
    <section id="reviews" aria-labelledby="reviews-heading" className="bg-sand py-16 sm:py-20 lg:py-24">
      <div className="container-page">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-navy-700">In their words</p>
            <h2 id="reviews-heading" className="text-[2rem] font-bold sm:text-[2.5rem]">On time, clean van, walked her to the right suite</h2>
          </div>
          {hasRealReviews && (
            <div className="flex items-center gap-3 rounded-2xl border border-hairline bg-white px-4 py-3">
              <span className="font-display text-4xl font-bold text-navy-900">{site.googleRating?.toFixed(1)}</span>
              <span className="text-sm leading-tight">
                <Stars n={Math.round(site.googleRating ?? 0)} />
                <span className="mt-1 block text-muted">{site.googleReviewCount ?? site.reviews.length} Google reviews</span>
              </span>
            </div>
          )}
        </div>

        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {reviews.map((r) => (
            <li key={r.author + r.date} className="flex">
              <figure className="flex flex-1 flex-col rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-soft)]">
                <div className="flex items-start justify-between gap-3">
                  <Stars n={r.rating} />
                  {r.isPlaceholder && <ExampleTag />}
                </div>
                <blockquote className="mt-4 flex-1 text-lg">
                  <Quote r={r} />
                </blockquote>
                <figcaption className="mt-5 flex items-end justify-between gap-3">
                  <span>
                    <span className="block font-bold text-navy-900">{r.author}</span>
                    <span className="text-sm text-muted">{fmtDate(r.date)}</span>
                  </span>
                  {r.sourceUrl && (
                    <a href={r.sourceUrl} rel="noopener" className="inline-flex min-h-12 items-center text-sm font-bold text-navy-700 underline">
                      On Google
                    </a>
                  )}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>

        {site.googleReviewUrl && (
          <p className="mt-8">
            Had a ride with us?{" "}
            <a href={site.googleReviewUrl} rel="noopener" className="inline-flex min-h-12 items-center font-bold text-navy-700 underline decoration-2 underline-offset-4">
              {t.actions.leaveReview}
            </a>
          </p>
        )}
        {/* CONFIRM: googleReviewUrl and real reviews come from Jay's Google Business Profile. */}
      </div>
    </section>
  );
}
