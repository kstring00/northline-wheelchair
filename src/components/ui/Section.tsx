import type { ReactNode } from "react";

type Props = {
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  /** `sandPattern`: the map pattern on Sand. At most one patterned section ground per page. */
  tone?: "cream" | "sand" | "sandPattern" | "white" | "navy";
  className?: string;
  headingId?: string;
};

const tones = {
  cream: "bg-cream",
  sand: "bg-sand",
  sandPattern: "pattern-sand",
  white: "bg-white",
  navy: "bg-navy text-cream on-dark",
};

/** Standard page section with an accessible heading (aria-labelledby). */
export function Section({ id, eyebrow, title, intro, children, tone = "cream", className = "", headingId }: Props) {
  const hid = headingId ?? (id ? `${id}-heading` : undefined);
  const dark = tone === "navy";
  return (
    <section id={id} aria-labelledby={hid} className={`${tones[tone]} py-16 sm:py-20 lg:py-24 ${className}`}>
      <div className="container-page">
        <div className="max-w-3xl">
          {eyebrow && (
            <p className={`mb-3 label ${dark ? "text-cream/80" : "text-navy"}`}>{eyebrow}</p>
          )}
          <h2 id={hid} className={`text-[2rem] font-bold sm:text-[2.5rem] ${dark ? "!text-cream" : ""}`}>
            {title}
          </h2>
          {intro && <div className={`mt-4 text-lg ${dark ? "text-cream/80" : "text-ink/85"}`}>{intro}</div>}
        </div>
        {children}
      </div>
    </section>
  );
}
