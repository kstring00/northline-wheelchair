import { site, realReviews, hasRealReviews, type Review } from "@/config/site";
import { t } from "@/content/dictionary";
import { DraftLabel } from "@/components/ui/Badges";
import { buttonClass } from "@/components/ui/Button";

/*
 * Reviews. Northline is new: until reviews[] holds a real entry
 * (isPlaceholder: false) no review, quote or star renders anywhere. The
 * section says what we do instead, and shows the Google badge and the
 * "Leave a review" button only when googleRating / googleReviewUrl are set.
 */

const Stars = ({ n }: { n: number }) => (
  <span data-review-stars className="flex gap-0.5" role="img" aria-label={`${n} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <svg key={i} viewBox="0 0 20 20" className={`h-5 w-5 ${i <= n ? "text-navy" : "text-ink/20"}`} aria-hidden="true">
        <path fill="currentColor" d="m10 1.5 2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L10 14.9l-5.3 2.8 1.1-5.9L1.5 7.7l5.9-.8z" />
      </svg>
    ))}
  </span>
);

const fmtDate = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "long", year: "numeric" });

function RealReview({ r }: { r: Review }) {
  return (
    <li data-review className="flex">
      <figure className="flex flex-1 flex-col rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-soft)]">
        <Stars n={r.rating} />
        <blockquote className="mt-4 flex-1 text-lg"><p>{r.text}</p></blockquote>
        <figcaption className="mt-5 flex items-end justify-between gap-3">
          <span>
            <span className="block font-bold text-navy">{r.author}</span>
            <span className="text-sm text-ink/85">{fmtDate(r.date)}</span>
          </span>
          {r.sourceUrl && <a href={r.sourceUrl} rel="noopener" className="inline-flex min-h-12 items-center text-sm font-bold text-navy underline">On Google</a>}
        </figcaption>
      </figure>
    </li>
  );
}

export function ReviewStrip({ limit = 3 }: { limit?: number }) {
  const reviews = realReviews.slice(0, limit);
  return (
    <section id="reviews" aria-labelledby="reviews-heading" data-reviews={reviews.length ? "real" : "empty"} className="bg-sand py-12 sm:py-20 lg:py-24">
      <div className="container-page">
        <div className="max-w-3xl">
          <p className="label mb-3 text-navy">What riders and families say</p>
          <h2 id="reviews-heading" className="text-[2rem] font-bold sm:text-[2.5rem]">We ask every rider for a review after the ride.</h2>
          <p className="mt-4 text-lg">
            Northline is new.{" "}
            {site.smsEnabled ? "After every ride we send a text with a link to leave a Google review" : "After every ride we ask for a Google review"}, and we&apos;ll show them here as they come in — the good and the honest.
          </p>
        </div>

        {reviews.length > 0 && (
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {reviews.map((r) => <RealReview key={r.author + r.date} r={r} />)}
          </ul>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-4">
          {hasRealReviews && (
            <div data-google-rating className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[var(--shadow-soft)]">
              <span className="font-display text-4xl font-bold text-navy">{site.googleRating?.toFixed(1)}</span>
              <span className="text-sm leading-tight">
                <Stars n={Math.round(site.googleRating ?? 0)} />
                <span className="mt-1 block text-ink/85">{site.googleReviewCount ?? realReviews.length} Google reviews</span>
              </span>
            </div>
          )}
          {site.googleReviewUrl ? (
            <a href={site.googleReviewUrl} rel="noopener" className={buttonClass("secondary", "lg")}>{t.actions.leaveReview}</a>
          ) : (
            <DraftLabel what="Google review link: CONFIRM" />
          )}
        </div>
        {/* CONFIRM: googleReviewUrl, googleRating and real reviews come from Jay's Google Business Profile. */}
      </div>
    </section>
  );
}
