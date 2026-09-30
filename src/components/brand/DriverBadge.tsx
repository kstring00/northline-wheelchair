import Image from "next/image";
import { site, telHref } from "@/config/site";
import type { TeamMember } from "@/config/site";
import { Logo } from "@/components/ui/Logo";

/**
 * Driver badge (Brand Guidelines 3.2): photo circle, first name big, one line
 * of role, certifications in muted text, the phone number at the bottom.
 */
export function DriverBadge({ m }: { m: TeamMember }) {
  return (
    <article data-driver-badge className="flex h-full flex-col overflow-hidden rounded-2xl bg-white text-center shadow-[var(--shadow-lift)]">
      <div className="flex items-center justify-between bg-navy px-5 py-3 text-white">
        <Logo tone="white" size={24} label="" />
        <span className="label text-white">Your driver</span>
      </div>
      <div className="flex flex-1 flex-col items-center px-6 pt-7 pb-6">
        <div className="relative grid h-36 w-36 place-items-center overflow-hidden rounded-full bg-sand">
          {m.photo ? (
            <Image src={m.photo.src} alt={m.photo.alt} width={m.photo.width} height={m.photo.height} sizes="9rem" className="h-full w-full object-cover" />
          ) : (
            <span className="px-4 text-sm text-ink/85">{m.firstName}&apos;s photo</span>
          )}
        </div>
        <h3 className="mt-5 text-[44px] font-extrabold leading-none tracking-[-0.03em] !text-ink">{m.firstName}</h3>
        <p className="mt-2 text-lg">{m.role}</p>
        {m.certifications.length > 0 && (
          <p className="mt-1 text-ink/85">
            <span className="sr-only">Certifications: </span>
            {m.certifications.join(" · ")}
          </p>
        )}
        <div className="mt-auto w-full border-t border-ink/15 pt-4">
          <p className="text-sm font-bold">{site.name}</p>
          <a href={telHref} className="inline-flex min-h-12 items-center text-lg font-bold text-navy underline underline-offset-4">{site.phone.display}</a>
        </div>
      </div>
    </article>
  );
}
