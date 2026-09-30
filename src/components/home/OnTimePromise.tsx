import { site } from "@/config/site";
import { t } from "@/content/dictionary";

/**
 * The brand promise, drawn as a route with a stop for each true flag.
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

const icons: Record<string, React.ReactNode> = {
  call: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />,
  text: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  early: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
  wait: <><path d="M3 11l18-1-2 8H5z" /><path d="M7 18v3M17 18v3M3 11V7a2 2 0 0 1 2-2h4" /></>,
};

export function OnTimePromise({ compact = false }: { compact?: boolean }) {
  const lines = promiseLines();
  if (!lines.length) return null;
  return (
    <section aria-labelledby="promise-heading" className={compact ? "" : "bg-cream"}>
      <div className={compact ? "" : "container-page pb-14 sm:pb-16"}>
        <div className="rounded-[1.5rem] border border-hairline bg-white p-5 shadow-[var(--shadow-soft)] sm:p-7">
          <h2 id="promise-heading" className="text-xl font-bold sm:text-2xl">{t.promise.heading}</h2>
          <ol data-promise className="relative mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {lines.map((l, i) => (
              <li key={l.key} className="relative flex gap-3">
                <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-navy-900 text-cream">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icons[l.key]}</svg>
                </span>
                {i < lines.length - 1 && (
                  <span aria-hidden="true" className="absolute left-5 top-11 hidden h-[calc(100%-1rem)] w-0.5 bg-[repeating-linear-gradient(to_bottom,var(--color-line)_0_6px,transparent_6px_12px)] opacity-50 sm:block lg:hidden" />
                )}
                <p className="pt-2 leading-snug">{l.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
