import { site } from "@/config/site";
import { LogoMark } from "@/components/ui/Logo";

/**
 * The confirmation text (Brand Guidelines 3.3): written the way Jay talks, in
 * his name, with a time and a promise to text again. Sample data.
 */
export function SmsMock({ className = "" }: { className?: string }) {
  return (
    <figure data-sms-mock className={`mx-auto w-full max-w-[20rem] ${className}`}>
      <div className="rounded-[2.5rem] bg-ink p-2.5 shadow-[var(--shadow-lift)]">
        <div className="overflow-hidden rounded-[2rem] bg-white px-3.5 pt-4 pb-6 text-[15px] leading-snug text-ink">
          <div className="border-b border-ink/15 pb-3 text-center">
            <p className="font-bold">{site.shortName}</p>
            <p className="text-sm text-ink/85">{site.phone.display}</p>
          </div>
          <div className="mt-4 space-y-3">
            <p className="max-w-[88%] rounded-2xl rounded-bl-md bg-morning px-3.5 py-2.5">
              Hi Denise, this is Jay with Northline. Your mom&apos;s ride is set: <strong>Mon 7:15 AM</strong>, Spring to DaVita Cypress Creek. I&apos;ll text when I&apos;m on the way.
            </p>
            <div className="max-w-[88%] overflow-hidden rounded-xl bg-white shadow-[var(--shadow-soft)] ring-1 ring-ink/15">
              <p className="flex items-center gap-2 bg-navy px-3 py-2 text-[11px] font-bold uppercase leading-none tracking-[0.14em] text-white [--logo-dot:var(--color-navy)]">
                <LogoMark className="h-4 w-4" /> Ride Card
              </p>
              <dl className="grid grid-cols-[auto_1fr] gap-x-1.5 px-3 py-2.5 text-[13px]">
                <dt className="font-bold">Pickup</dt><dd>Spring, TX</dd>
                <dt className="font-bold">Drop-off</dt><dd>DaVita Cypress Creek</dd>
                <dt className="font-bold">When</dt><dd>Mon 7:15 AM</dd>
                <dt className="font-bold">Driver</dt><dd>Jay</dd>
              </dl>
            </div>
            <p className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-navy px-3.5 py-2.5 text-white">Thank you Jay, she&apos;ll be ready.</p>
            <p className="max-w-[88%] rounded-2xl rounded-bl-md bg-morning px-3.5 py-2.5">On my way, about 12 minutes out.</p>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-ink/85">A sample confirmation text. Names are examples.</figcaption>
    </figure>
  );
}
