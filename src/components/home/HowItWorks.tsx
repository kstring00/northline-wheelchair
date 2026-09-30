import { site, bookHref, telHref } from "@/config/site";
import { ButtonLink } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/Icons";
import { HowItWorksMotion } from "@/components/home/HowItWorksMotion";

const steps = [
  {
    title: "Book your ride",
    body: `Call us or send a ride request online. It takes about two minutes. Tell us where, when, and how we can help.`,
  },
  {
    title: "We call to confirm",
    body: `We call back within ${site.responseTime} during business hours with the pickup time and the exact price. No surprises.`,
  },
  {
    title: "Door-to-door ride",
    body: "Your driver comes to your door, helps you into the van, secures your wheelchair, and walks you all the way inside when you arrive.",
  },
];

/**
 * "How it works": a vertical route line draws as you scroll (scrubbed) and each
 * step's marker lights up as the line reaches it. With no JS or reduced motion
 * the line is fully drawn and every step is lit. Step text is never dimmed.
 */
export function HowItWorks({ tone = "sand" }: { tone?: "sand" | "cream" }) {
  return (
    <section id="how-it-works" aria-labelledby="how-heading" className={`${tone === "sand" ? "bg-sand" : "bg-cream"} py-16 sm:py-20 lg:py-24`}>
      <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-navy-700">How it works</p>
          <h2 id="how-heading" className="text-[2rem] font-bold sm:text-[2.5rem]">Three simple steps from your door to theirs</h2>
          <p className="mt-4 text-lg text-muted">No apps, no accounts. A real person answers, and the same care comes with every ride.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href={bookHref} size="lg">Book a Ride</ButtonLink>
            <a href={telHref} className="inline-flex min-h-14 items-center justify-center rounded-full px-4 text-lg font-bold text-navy-900 underline decoration-2 underline-offset-4 hover:bg-white">
              or call {site.phone.display}
            </a>
          </div>
        </div>

        <ol data-how-steps className="relative">
          {steps.map((s, i) => {
            const last = i === steps.length - 1;
            return (
              <li key={s.title} data-how-step className={`relative flex gap-5 ${last ? "" : "pb-12"}`}>
                {!last && (
                  <>
                    {/* Route segment to the next step: static dashed track + progress line (scaleY only). */}
                    <span aria-hidden="true" className="absolute left-7 top-14 bottom-0 w-1 -translate-x-1/2 bg-[repeating-linear-gradient(to_bottom,var(--color-line)_0_8px,transparent_8px_18px)] opacity-60" />
                    <span aria-hidden="true" data-how-line className="absolute left-7 top-14 bottom-0 w-1 origin-top -translate-x-1/2 rounded-full bg-navy-900" />
                  </>
                )}
                <span aria-hidden="true" className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-full border-4 border-navy-900 bg-white font-display text-xl font-bold text-navy-900">
                  {i + 1}
                  <span data-how-lit className="absolute inset-[-4px] grid place-items-center rounded-full bg-navy-900 text-cream">
                    {last ? <CheckIcon className="h-7 w-7" /> : <span className="font-display text-xl font-bold">{i + 1}</span>}
                  </span>
                </span>
                <div className="pt-2">
                  <h3 className="text-2xl font-bold">
                    <span className="sr-only">Step {i + 1}: </span>
                    {s.title}
                  </h3>
                  <p className="mt-2 text-lg text-muted">{s.body}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
      <HowItWorksMotion />
    </section>
  );
}
