import { Pin } from "@/components/ui/Logo";

/**
 * The hero's right-hand slot until the real photo arrives: the navy map
 * pattern with the one amber A-to-B route allowed per page (hero only).
 */
export function HeroPattern() {
  return (
    <div data-hero-pattern className="pattern-navy relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] shadow-[var(--shadow-lift)] [--logo-dot:var(--color-navy)]">
      <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" aria-hidden="true" focusable="false" data-route="hero">
        <path d="M84 238 H150 V110 H286" fill="none" stroke="#E8A33D" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="0.1 9" />
        <circle cx="72" cy="238" r="8" fill="none" stroke="#E8A33D" strokeWidth="3.5" />
      </svg>
      {/* Pin sits at the route's end (x 296/400, y 110/300), tip on the line. */}
      <Pin className="absolute h-[13%] w-auto -translate-x-1/2 -translate-y-full" style={{ left: "74%", top: "37.5%" }} />
    </div>
  );
}
