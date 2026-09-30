import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";
import { ArrowRightIcon } from "@/components/ui/Icons";

export function OwnerNote() {
  const { owner } = site;
  return (
    <section id="meet-jay" aria-labelledby="owner-heading" className="bg-cream py-16 sm:py-20 lg:py-24">
      <div className="container-page grid items-center gap-10 md:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="relative mx-auto w-full max-w-sm md:max-w-none">
          <Image
            src={owner.photo.src}
            alt={owner.photo.alt}
            width={owner.photo.width}
            height={owner.photo.height}
            sizes="(min-width: 768px) 40vw, 90vw"
            className="h-auto w-full rounded-[2rem] shadow-[var(--shadow-lift)]"
          />
        </div>
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-navy-700">A note from the owner</p>
          <h2 id="owner-heading" className="text-[2rem] font-bold sm:text-[2.5rem]">Hi, I&apos;m {owner.firstName}. I drive your family like my own.</h2>
          <div className="mt-6 space-y-4 text-lg">
            {owner.note.map((p) => <p key={p}>{p}</p>)}
          </div>
          <p className="mt-6 font-display text-2xl font-bold text-navy-900">— {owner.firstName}</p>
          <p className="text-muted">{owner.role}, {site.name}</p>
          <Link href="/about" className="mt-6 inline-flex min-h-12 items-center gap-2 font-bold text-navy-700 underline decoration-2 underline-offset-4">
            Read Jay&apos;s story and our safety standards <ArrowRightIcon />
          </Link>
        </div>
      </div>
    </section>
  );
}
