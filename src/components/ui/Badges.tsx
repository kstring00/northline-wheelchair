import { site, smsHref } from "@/config/site";
import { isSiteLive } from "@/lib/env";
import { t } from "@/content/dictionary";
import { buttonClass } from "@/components/ui/Button";

/** Renders only when Spanish is listed in site.languages (CONFIRM). */
export function SeHablaBadge({ className = "" }: { className?: string }) {
  if (!site.languages.includes("es")) return null;
  return (
    <span lang="es" className={`inline-flex min-h-8 items-center rounded-full bg-morning px-3 text-sm font-bold text-navy ${className}`}>
      {t.labels.seHabla}
    </span>
  );
}

/** Pre-launch marker for content Jay hasn't approved. Disappears when the site is live. */
export function DraftLabel({ what = t.labels.draft }: { what?: string }) {
  if (isSiteLive) return null;
  return (
    <span className="inline-flex items-center gap-2 rounded-full border-2 border-dashed border-cream/25 px-3 py-1 text-sm font-bold text-navy">
      <span aria-hidden="true" className="h-2 w-2 rounded-full bg-navy" />
      {what}
    </span>
  );
}

/** Visible "example" tag on placeholder reviews and team cards. */
export function ExampleTag({ label = t.labels.sample }: { label?: string }) {
  return <span className="inline-flex self-start rounded-full border-2 border-dashed border-cream/25 px-3 py-0.5 text-sm font-bold text-navy">{label}</span>;
}

/** "Text us" using an sms: link. Renders only when site.smsEnabled. */
export function TextUsLink({ variant = "secondary", size = "md", className = "" }: { variant?: "secondary" | "onDark" | "ghost"; size?: "md" | "lg"; className?: string }) {
  if (!site.smsEnabled) return null;
  return (
    <a href={smsHref} className={buttonClass(variant, size, className)}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
      {t.actions.text}
    </a>
  );
}
