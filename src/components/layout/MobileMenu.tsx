"use client";

import Link from "next/link";
import { useId } from "react";
import { site, telHref, bookHref } from "@/config/site";
import { buttonClass } from "@/components/ui/Button";
import { CloseIcon, MenuIcon, PhoneIcon } from "@/components/ui/Icons";
import { mainLinks, moreLinks, serviceLinks } from "@/components/layout/nav";
import { TextUsLink } from "@/components/ui/Badges";
import { useDisclosure } from "@/components/layout/useDisclosure";

export function MobileMenu() {
  const { open, setOpen, rootRef, buttonRef } = useDisclosure();
  const id = useId();
  const linkClass = "flex min-h-12 items-center rounded-lg px-3 text-lg font-bold text-navy hover:bg-morning";

  return (
    <div ref={rootRef} className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
        className="js-only inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-navy px-4 font-bold text-navy"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
        {open ? "Close" : "Menu"}
      </button>
      <nav
        id={id}
        aria-label="Main"
        data-disclosure-panel
        data-state={open ? "open" : "closed"}
        className="js-only absolute inset-x-0 top-full border-b border-ink/15 bg-cream pb-6 shadow-[var(--shadow-lift)]"
      >
        <div className="container-page pt-2">
          <p className="px-3 pt-2 label text-ink/85">Services</p>
          <ul>
            {serviceLinks.map((l) => (
              <li key={l.href}><Link href={l.href} className={linkClass}>{l.label}</Link></li>
            ))}
          </ul>
          <hr className="my-3 border-ink/15" />
          <ul className="grid sm:grid-cols-2">
            {[...mainLinks, ...moreLinks].map((l) => (
              <li key={l.href}><Link href={l.href} className={linkClass}>{l.label}</Link></li>
            ))}
          </ul>
          <div className="mt-4 grid gap-3">
            <Link href={bookHref} className={buttonClass("primary", "lg")}>Book a Ride</Link>
            <a href={telHref} className={buttonClass("secondary", "lg")}>
              <PhoneIcon /> Call {site.phone.display}
            </a>
            <TextUsLink size="lg" />
          </div>
        </div>
      </nav>
    </div>
  );
}
