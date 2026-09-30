import { site } from "@/config/site";

/** Brand mark: pickup dot → road → destination pin, plus wordmark. */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false">
      <rect width="48" height="48" rx="12" fill="#10284A" />
      <circle cx="12" cy="34" r="4.5" fill="#FBF7F0" />
      <path d="M12 34 C 20 34, 20 22, 28 22 S 34 18, 34 16" fill="none" stroke="#FBF7F0" strokeWidth="3" strokeLinecap="round" strokeDasharray="0.1 5.5" />
      <path d="M34 7a7 7 0 0 1 7 7c0 5.2-7 12-7 12s-7-6.8-7-12a7 7 0 0 1 7-7z" fill="#F4A340" />
      <circle cx="34" cy="14" r="2.6" fill="#10284A" />
    </svg>
  );
}

export function Logo({ onDark = false }: { onDark?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark className="h-10 w-10 shrink-0" />
      <span className="flex flex-col leading-none">
        <span className={`font-display text-[1.375rem] font-bold tracking-tight ${onDark ? "text-cream" : "text-navy-900"}`}>
          {site.shortName}
        </span>{" "}
        <span className={`mt-1 text-[0.8125rem] font-bold uppercase tracking-[0.08em] ${onDark ? "text-mist" : "text-muted"}`}>
          Wheelchair Transportation
        </span>
        <span className="sr-only">, home page</span>
      </span>
    </span>
  );
}
