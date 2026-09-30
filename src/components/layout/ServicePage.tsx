import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { site, coreAreas, services, type Service, type ImageAsset } from "@/config/site";
import { faqsFor } from "@/content/faq";
import { serviceSchema, faqSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { Accordion } from "@/components/ui/Accordion";
import { OnTimePromise } from "@/components/home/OnTimePromise";
import { FinalCta } from "@/components/home/FinalCta";
import { ArrowRightIcon, CheckIcon, PinIcon } from "@/components/ui/Icons";

export type ServiceCopy = {
  /** "Who it's for": 2–4 short groups. */
  audiences: { title: string; body: string }[];
  /** How it works: exactly three steps. */
  steps: { title: string; body: string }[];
  /** What's included: 4–6 items. */
  included: { title: string; body: string }[];
  /** What to expect on the day: a short narrative, 2–4 paragraphs. */
  onTheDay: string[];
  /** Optional extra section rendered before the FAQ. */
  extra?: ReactNode;
  image?: ImageAsset;
};

/**
 * Shared skeleton for the six service pages. Each page brings its own copy;
 * the order (answer, who, how, included, on the day, FAQ, CTA) is fixed by
 * the brief so readers learn it once.
 */
export function ServicePage({ service, title, copy }: { service: Service; title: string; copy: ServiceCopy }) {
  const path = `/services/${service.slug}`;
  const faqs = faqsFor(service.faqIds);
  const img = copy.image ?? site.images.vanRamp;
  const related = services.filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <>
      <JsonLd data={[serviceSchema(service, path), faqSchema(faqs)]} />
      <PageHeader
        crumbs={[{ name: service.name, path }]}
        title={title}
        answer={service.answer}
        aside={<Image src={img.src} alt={img.alt} width={img.width} height={img.height} preload sizes="(min-width: 1024px) 560px, 100vw" className="h-auto w-full rounded-[2rem] shadow-[var(--shadow-lift)]" />}
      />
      <OnTimePromise />

      <Section id="who" tone="white" eyebrow="Who it's for" title={`Who books ${service.shortName.toLowerCase()}`}>
        <dl className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
          {copy.audiences.map((a) => (
            <div key={a.title} className="border-l-4 border-navy-900 pl-5">
              <dt className="text-xl font-bold text-navy-900">{a.title}</dt>
              <dd className="mt-1 text-muted">{a.body}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section id="how" eyebrow="How it works" title="Three steps, no app, no account">
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {copy.steps.map((s, i) => (
            <li key={s.title} className="relative rounded-[var(--radius-card)] bg-white p-6 pt-8">
              <span aria-hidden="true" className="absolute -top-5 left-6 grid h-10 w-10 place-items-center rounded-full bg-navy-900 font-display text-lg font-bold text-cream">{i + 1}</span>
              <h3 className="text-xl font-bold"><span className="sr-only">Step {i + 1}: </span>{s.title}</h3>
              <p className="mt-2 text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="included" tone="white" eyebrow="What's included" title="Every ride comes with">
        <ul className="mt-10 grid gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
          {copy.included.map((it) => (
            <li key={it.title} className="flex gap-4">
              <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy-100 text-navy-900"><CheckIcon className="h-5 w-5" /></span>
              <div>
                <h3 className="text-lg font-bold">{it.title}</h3>
                <p className="mt-1 text-muted">{it.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="day" tone="navy" eyebrow="On the day" title="What to expect">
        <div className="mt-8 max-w-3xl space-y-5 text-lg text-mist">
          {copy.onTheDay.map((para) => <p key={para.slice(0, 40)}>{para}</p>)}
        </div>
      </Section>

      {copy.extra}

      <Section id="questions" tone="sand" eyebrow="Questions" title={`${service.shortName} questions`}>
        <div className="mt-8 max-w-3xl">
          <Accordion items={faqs} />
          <Link href="/faq" className="mt-6 inline-flex min-h-12 items-center gap-2 font-bold text-navy-700 underline decoration-2 underline-offset-4">
            All sixteen questions, answered <ArrowRightIcon />
          </Link>
        </div>
      </Section>

      <section aria-label="Related pages" className="bg-cream py-12">
        <div className="container-page grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold">Other rides we give</h2>
            <ul className="mt-3 space-y-1">
              {related.map((s) => (
                <li key={s.slug}><Link href={`/services/${s.slug}`} className="inline-flex min-h-12 items-center font-bold text-navy-700 underline">{s.name}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-bold">Where we drive</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {coreAreas.map((a) => (
                <li key={a.slug}>
                  <Link href={`/service-area/${a.slug}`} className="inline-flex min-h-12 items-center gap-1.5 rounded-full border-2 border-navy-900 bg-white px-4 font-bold text-navy-900 no-underline hover:bg-navy-100">
                    <PinIcon className="h-4 w-4" /> {a.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <FinalCta title={`Book ${service.shortName.toLowerCase()}`} />
    </>
  );
}
