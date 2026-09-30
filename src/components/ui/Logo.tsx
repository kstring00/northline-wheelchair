import type { CSSProperties } from "react";

/*
 * Northline logo system (Brand Guidelines 1.1–1.5).
 *
 * Everything is drawn inline so `currentColor` sets the N and the wordmark:
 * navy on cream, white on navy, ink for single-colour use. `--logo-dot` is
 * the colour of the ground the logo sits on; it fills the start ring and the
 * pin's centre. The pin is always Signal Amber and is never recoloured.
 *
 * Protection area: the unit is the height of the N. Pass `clear` and the
 * logo pads itself by that amount (`.logo-clear`). Minimum 24px tall.
 */

export const PIN_AMBER = "#E8A33D";

type Tone = "navy" | "white" | "ink";
type Variant = "wordmark" | "stacked" | "mark";

const toneClass: Record<Tone, string> = { navy: "text-navy", white: "text-white", ink: "text-ink" };
const toneDot: Record<Tone, string> = { navy: "var(--color-cream)", white: "var(--color-navy)", ink: "var(--color-cream)" };

/** The logomark: the N drawn as one route, start ring bottom-left, amber pin top-right. */
export function LogoMark({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden="true" focusable="false" data-logo-mark>
      <path d="M22 84 L22 18 L78 84 L78 18" fill="none" stroke="currentColor" strokeWidth="17" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="22" cy="84" r="5.5" fill="var(--logo-dot)" />
      <path d="M78 2c-7.2 0-13 5.8-13 13 0 9.3 13 21 13 21s13-11.7 13-21c0-7.2-5.8-13-13-13z" fill={PIN_AMBER} data-pin />
      <circle cx="78" cy="15" r="4.6" fill="var(--logo-dot)" />
    </svg>
  );
}

/** The brand pin, reused wherever the brand points at something. Centre = ground colour. */
export function Pin({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 31" className={className} style={style} aria-hidden="true" focusable="false">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 8.5 12 19 12 19s12-10.5 12-19C24 5.4 18.6 0 12 0z" fill={PIN_AMBER} data-pin />
      <circle cx="12" cy="12" r="4.5" fill="var(--logo-dot, var(--color-cream))" />
    </svg>
  );
}

/**
 * "Northline" in Bricolage 800 where the dot of the i in "line" is the pin.
 * Built as HTML: "Northl" + dotless ı with the pin centred above it + "ne".
 * Screen readers get the plain word.
 */
function Wordmark({ size, withTagline }: { size: number; withTagline: boolean }) {
  return (
    <span className="flex flex-col items-start leading-none" style={{ fontSize: size }}>
      <span aria-hidden="true" className="whitespace-nowrap font-display font-extrabold leading-none tracking-[-0.03em]">
        Northl
        <span className="relative inline-block">
          {"ı"}
          <Pin className="absolute left-1/2 -translate-x-1/2" style={{ width: "0.19em", bottom: "0.76em" }} />
        </span>
        ne
      </span>
      {withTagline && (
        <span
          aria-hidden="true"
          className="whitespace-nowrap font-sans font-bold uppercase leading-none"
          style={{ fontSize: "0.17em", letterSpacing: "0.11em", marginTop: "0.9em" }}
        >
          Wheelchair Transportation
        </span>
      )}
    </span>
  );
}

type LogoProps = {
  variant?: Variant;
  tone?: Tone;
  withTagline?: boolean;
  /** Wordmark font size in px. The mark scales with it. */
  size?: number;
  /** Pad the logo by its protection area (height of the N). */
  clear?: boolean;
  /** Colour of the ground, for the start ring and pin centre. Defaults by tone. */
  ground?: string;
  className?: string;
  /** Accessible name. Pass "" when a parent already names the link. */
  label?: string;
};

export function Logo({ variant = "wordmark", tone = "navy", withTagline = false, size = 28, clear = false, ground, className = "", label = "Northline Wheelchair Transportation" }: LogoProps) {
  // Height of the N: cap height of Bricolage (0.66em) for the wordmark,
  // 0.83 of the mark's box for the logomark (stroke included).
  const markSize = variant === "mark" ? size : Math.round(size * 1.5);
  const nHeight = variant === "mark" ? markSize * 0.83 : variant === "stacked" ? markSize * 0.83 : size * 0.66;
  const style = {
    "--logo-dot": ground ?? toneDot[tone],
    "--logo-clear": clear ? `${Math.round(nHeight)}px` : "0px",
  } as CSSProperties;

  return (
    <span className={`inline-flex ${toneClass[tone]} ${clear ? "logo-clear" : ""} ${className}`} style={style} data-logo={variant} data-logo-tone={tone}>
      {label && <span className="sr-only">{label}</span>}
      {variant === "mark" && <LogoMark style={{ width: markSize, height: markSize }} />}
      {variant === "wordmark" && <Wordmark size={size} withTagline={withTagline} />}
      {variant === "stacked" && (
        <span className="flex flex-col items-start" style={{ gap: size * 0.45 }}>
          <LogoMark style={{ width: markSize, height: markSize, marginLeft: -markSize * 0.13 }} />
          <Wordmark size={size} withTagline={withTagline} />
        </span>
      )}
    </span>
  );
}
