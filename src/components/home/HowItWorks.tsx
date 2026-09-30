import { site, bookHref, telHref } from "@/config/site";
import { ButtonLink } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/Icons";
import { HowItWorksMotion } from "@/components/home/HowItWorksMotion";

const steps = [
  {
    title: "Book your ride",
    short: "Call, or send a request online.",
    body: `Call us or send a ride request online. It takes about two minutes. Tell us where, when, and how we can help.`,
  },
  {
    title: "We call to confirm",
    short: `Within ${site.responseTime}, with the time and price.`,
    body: `We call back within ${site.responseTime} during business hours with the pickup time and the price.`,
  },
  {
    title: "Door-to-door ride",
    short: "From your door to the right suite.",
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
    <section id="how-it-works" aria-labelledby="how-heading" className={`${tone === "sand" ? "bg-sand" : "bg-cream"} py-12 sm:py-20 lg:py-24`}>
      <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:row-span-2 lg:self-start">
          <p className="mb-3 label text-navy">How it works</p>
          <h2 id="how-heading" className="text-[2rem] font-bold sm:text-[2.5rem]">Three simple steps from your door to theirs</h2>
          <p className="mt-4 text-lg text-ink/85">No apps, no accounts.</p>
          {/* Phones: three plain lines, no timeline art (keeps Home short). */}
          <ol data-how-compact className="mt-6 space-y-3 text-lg lg:hidden">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-3">
                <span aria-hidden="true" className="font-display font-bold text-navy">{i + 1}.</span>
                <span><strong>{s.title}.</strong> {s.short}</span>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href={bookHref} size="lg">Book a Ride</ButtonLink>
            <a href={telHref} className="inline-flex min-h-14 items-center justify-center rounded-full px-4 text-lg font-bold text-navy underline decoration-2 underline-offset-4 hover:bg-white">
              or call {site.phone.display}
            </a>
          </div>
        </div>

        <ol data-how-steps className="relative hidden lg:block">
          {steps.map((s, i) => {
            const last = i === steps.length - 1;
            return (
              <li key={s.title} data-how-step className={`relative flex gap-5 ${last ? "" : "pb-12"}`}>
                {!last && (
                  <>
                    {/* Route segment to the next step: dotted navy track (the Ride Card's route) + progress line (scaleY only). */}
                    <span aria-hidden="true" className="absolute left-7 top-14 bottom-0 w-1.5 -translate-x-1/2 bg-[radial-gradient(circle,var(--color-navy)_2px,transparent_2.5px)] bg-[length:6px_12px] bg-repeat-y" />
                    <span aria-hidden="true" data-how-line className="absolute left-7 top-14 bottom-0 w-1 origin-top -translate-x-1/2 rounded-full bg-navy" />
                  </>
                )}
                <span aria-hidden="true" className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-full border-4 border-navy bg-white font-display text-xl font-bold text-navy">
                  {i + 1}
                  <span data-how-lit className="absolute inset-[-4px] grid place-items-center rounded-full bg-navy text-cream">
                    {last ? <CheckIcon className="h-7 w-7" /> : <span className="font-display text-xl font-bold">{i + 1}</span>}
                  </span>
                </span>
                <div className="pt-2">
                  <h3 className="text-2xl font-bold">
                    <span className="sr-only">Step {i + 1}: </span>
                    {s.title}
                  </h3>
                  <p className="mt-2 text-lg text-ink/85">{s.body}</p>
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
