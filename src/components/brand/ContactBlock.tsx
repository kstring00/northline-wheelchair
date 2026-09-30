import { site, coreAreas, telHref } from "@/config/site";
import { Pin } from "@/components/ui/Logo";

/**
 * The business-card back (Brand Guidelines 3.1), as the site's contact block:
 * the person, a number that answers, the five cities, the promise.
 */
export function ContactBlock({ className = "", nameAs: Name = "p" }: { className?: string; nameAs?: "h2" | "h3" | "p" }) {
  // The card lists Houston last: the suburbs are where the work is.
  const cities = [...coreAreas.filter((a) => a.name !== "Houston"), ...coreAreas.filter((a) => a.name === "Houston")].map((a) => a.name);
  return (
    <div data-contact-block className={`rounded-2xl bg-cream p-6 text-ink shadow-[var(--shadow-soft)] [--logo-dot:var(--color-cream)] [--focus-ring:var(--color-navy)] sm:p-8 ${className}`}>
      <Name className="!m-0 font-display text-[1.75rem] font-extrabold leading-none tracking-[-0.03em] !text-ink">{site.owner.fullName}</Name>
      <p className="mt-2 text-ink/85">{site.owner.role}</p>

      <p className="mt-5 flex flex-wrap items-center gap-x-2">
        <a href={telHref} className="inline-flex min-h-12 items-center text-xl font-bold text-navy underline decoration-2 underline-offset-4">{site.phone.display}</a>
        <span className="text-ink/85">{site.smsEnabled ? "· call or text" : "· call"}</span>
      </p>
      <p>
        <a href={`mailto:${site.email}`} className="inline-flex min-h-12 items-center break-all text-navy underline underline-offset-4">{site.email}</a>
      </p>
      <p className="mt-1">{cities.map((c, i) => (i < cities.length - 1 ? `${c}\u00a0· ` : c)).join("")}</p>

      <div className="mt-6 flex items-end justify-between gap-4">
        <p className="label text-ink">On time. Every ride.</p>
        <Pin className="h-7 w-auto shrink-0" />
      </div>
    </div>
  );
}
