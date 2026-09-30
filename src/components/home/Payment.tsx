import { site, telHref } from "@/config/site";

/** Payment options. Every line is CONFIRM in site.ts before launch. */
export function Payment() {
  return (
    <section id="payment" aria-labelledby="payment-heading" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="container-page">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-navy-700">Paying for your ride</p>
        <h2 id="payment-heading" className="max-w-3xl text-[2rem] font-bold sm:text-[2.5rem]">Clear prices, and help with the paperwork</h2>
        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {site.payment.options.map((o) => (
            <li key={o.title} className="rounded-[var(--radius-card)] border border-hairline bg-cream p-6">
              <h3 className="text-xl font-bold">{o.title}</h3>
              <p className="mt-2 text-muted">{o.body}</p>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-lg">
          Not sure how your ride will be paid for?{" "}
          <a href={telHref} className="font-bold text-navy-700 underline decoration-2 underline-offset-4">
            Call {site.phone.display}
          </a>{" "}
          and we&apos;ll help you figure it out.
        </p>
      </div>
    </section>
  );
}
