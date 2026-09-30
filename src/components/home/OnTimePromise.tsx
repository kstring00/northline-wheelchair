import { site } from "@/config/site";
import { t } from "@/content/dictionary";

/**
 * The brand promise: one line per true flag, type only.
 * Each line is a site.ts flag; false or null renders nothing. If every flag
 * is off the whole block disappears.
 */
export function promiseLines() {
  const p = site.onTimePromise;
  const lines: { key: string; text: string }[] = [];
  if (p.confirmationCall) lines.push({ key: "call", text: t.promise.confirmationCall });
  if (p.enRouteText) lines.push({ key: "text", text: t.promise.enRouteText });
  if (p.arriveEarlyMinutes) lines.push({ key: "early", text: t.promise.arriveEarly(p.arriveEarlyMinutes) });
  if (p.waitAndReturn) lines.push({ key: "wait", text: t.promise.waitAndReturn });
  return lines;
}

export function OnTimePromise({ compact = false }: { compact?: boolean }) {
  const lines = promiseLines();
  if (!lines.length) return null;
  return (
    <section aria-labelledby="promise-heading" className={compact ? "" : "bg-cream"}>
      <div className={compact ? "" : "container-page pb-14 sm:pb-16"}>
        <div className="rounded-[1.5rem] border border-ink/15 bg-white p-5 shadow-[var(--shadow-soft)] sm:p-7">
          <h2 id="promise-heading" className="text-xl font-bold sm:text-2xl">{t.promise.heading}</h2>
          <ol data-promise className="relative mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {lines.map((l) => (
              <li key={l.key} className="border-l-4 border-navy pl-3">
                <p className="leading-snug">{l.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
