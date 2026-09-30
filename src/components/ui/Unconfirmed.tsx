import { site, telHref } from "@/config/site";

/**
 * The one honest line shown where a section's facts are not confirmed yet.
 * Nothing else renders in its place: no placeholder sentence, no guess.
 */
export function Unconfirmed({ className = "", tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  return (
    <p data-unconfirmed className={`text-lg ${tone === "dark" ? "text-cream" : ""} ${className}`}>
      Jay is confirming these details. Call{" "}
      <a href={telHref} className={`font-bold underline decoration-2 underline-offset-4 ${tone === "dark" ? "text-white" : "text-navy"}`}>{site.phone.display}</a>{" "}
      and we&apos;ll answer directly.
    </p>
  );
}
