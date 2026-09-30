import { site, telHref } from "@/config/site";
import { Logo, LogoMark, Pin } from "@/components/ui/Logo";

/*
 * The Ride Card (Brand Guidelines 2.4): the brand's signature element. Every
 * booked ride produces one, in the same shape, on every surface. Pickup,
 * drop-off, when, who is driving. Nothing else.
 *
 * Copy stays literal in the markup so it can be retyped by hand.
 */

type RideCardProps = {
  /** Amber pill in the header: "Every Mon · Wed · Fri", "Hospital discharge", "Round trip · wait & return". */
  tag?: string;
  pickup: string;
  dropoff: string;
  when: string;
  driver: string;
  phone?: string;
  className?: string;
  /** Heading level for the card title, for the page outline. */
  titleAs?: "h2" | "h3" | "p";
  /** Not backed by a real booking: renders a small SAMPLE corner tag. */
  sample?: boolean;
};

export function RideCard({ tag, pickup, dropoff, when, driver, phone = site.phone.display, className = "", titleAs: Title = "p", sample = false }: RideCardProps) {
  return (
    <article
      data-ride-card
      data-sample={sample ? "true" : undefined}
      className={`relative w-full max-w-[330px] overflow-hidden rounded-[14px] bg-white font-sans text-ink shadow-[var(--shadow-lift)] [--logo-dot:var(--color-white)] ${className}`}
    >
      {sample && (
        <span data-sample-tag className="absolute right-0 bottom-0 rounded-tl-lg bg-morning px-2 py-1 text-[9.5px] font-bold uppercase leading-none tracking-[0.12em] text-navy">
          Sample
        </span>
      )}
      {/* Header strip: logomark, RIDE CARD, tag. */}
      <div className="flex items-center gap-2 bg-navy px-3.5 py-2.5 text-white [--logo-dot:var(--color-navy)]">
        <LogoMark className="h-5 w-5 shrink-0" />
        <Title className="!m-0 whitespace-nowrap font-sans text-[11px] font-bold uppercase leading-none tracking-[0.14em] !text-white">Ride Card</Title>
        {tag && (
          <span data-ride-card-tag className="ml-auto max-w-[62%] rounded-full bg-amber px-2.5 py-1 text-right text-[10px] font-bold uppercase leading-[1.25] tracking-[0.1em] text-ink">
            {tag}
          </span>
        )}
      </div>

      <div className="px-3.5 pt-3 pb-3.5">
        <dl className="grid grid-cols-2 gap-x-4">
          <div>
            <dt className="text-[9.5px] font-bold uppercase leading-tight tracking-[0.12em] text-ink/85">Pickup</dt>
            <dd className="mt-0.5 text-[14px] font-bold leading-snug break-words">{pickup}</dd>
          </div>
          <div className="text-right">
            <dt className="text-[9.5px] font-bold uppercase leading-tight tracking-[0.12em] text-ink/85">Drop-off</dt>
            <dd className="mt-0.5 text-[14px] font-bold leading-snug break-words">{dropoff}</dd>
          </div>
        </dl>

        {/* Route: start ring, dotted navy line, amber pin. */}
        <div className="mt-2 flex items-end gap-1" aria-hidden="true" data-route>
          <span className="h-2.5 w-2.5 shrink-0 rounded-full border-[2.5px] border-navy" />
          <span className="mb-[3.5px] h-[3px] flex-1 bg-[radial-gradient(circle,var(--color-navy)_1.2px,transparent_1.6px)] bg-[length:7px_3px] bg-repeat-x" />
          <Pin className="h-[22px] w-auto shrink-0" />
        </div>

        <hr className="mt-2.5 border-0 border-t border-dashed border-ink/30" />

        <dl className="mt-2.5 grid grid-cols-2 gap-x-4">
          <div>
            <dt className="text-[9.5px] font-bold uppercase leading-tight tracking-[0.12em] text-ink/85">When</dt>
            <dd className="mt-0.5 text-[14px] font-bold leading-snug">{when}</dd>
          </div>
          <div className="text-right">
            <dt className="text-[9.5px] font-bold uppercase leading-tight tracking-[0.12em] text-ink/85">Your driver</dt>
            <dd className="mt-0.5 text-[14px] font-bold leading-snug">{driver}</dd>
          </div>
        </dl>

        <p className="mt-2.5 text-[12.5px] leading-snug text-ink/85">
          We text you when your driver is on the way. Questions:{" "}
          <a href={telHref} className="font-bold text-ink no-underline">{phone}</a>
        </p>
      </div>
    </article>
  );
}

/** Back of the Ride Card: the map pattern with the stacked lockup in its clear-space box. */
export function RideCardBack({ className = "" }: { className?: string }) {
  return (
    <div data-ride-card-back aria-hidden="true" className={`pattern-navy grid aspect-[3.5/2.5] w-full max-w-[330px] place-items-center rounded-[14px] shadow-[var(--shadow-lift)] ${className}`}>
      <div className="rounded-lg bg-navy">
        <Logo variant="stacked" tone="white" size={22} withTagline clear label="" />
      </div>
    </div>
  );
}

const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Tag text from a booking: repeat days win, then the trip type. */
export function rideCardTag({ repeat, repeatDays, tripType }: { repeat: string; repeatDays: string[]; tripType: string }) {
  if (repeat === "repeat" && repeatDays.length) {
    return `Every ${[...repeatDays].sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b)).join(" · ")}`;
  }
  if (tripType === "wait-and-return") return "Round trip · wait & return";
  if (tripType === "round-trip") return "Round trip";
  if (tripType === "one-way") return "One way";
  return undefined;
}

/** "Thu Oct 9" from an ISO date. */
export function rideCardDate(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return `${dt.toLocaleDateString("en-US", { weekday: "short" })} ${dt.toLocaleDateString("en-US", { month: "short" })} ${d}`;
}
