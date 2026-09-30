"use client";

import Link from "next/link";
import { useId } from "react";
import { ChevronIcon } from "@/components/ui/Icons";
import { serviceLinks } from "@/components/layout/nav";
import { useDisclosure } from "@/components/layout/useDisclosure";

export function ServicesMenu() {
  const { open, setOpen, rootRef, buttonRef } = useDisclosure();
  const id = useId();
  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
        className="inline-flex min-h-12 items-center gap-1 rounded-lg px-3 font-bold text-navy-900 hover:bg-navy-100"
      >
        Services
        <ChevronIcon className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <div
        id={id}
        data-disclosure-panel
        data-state={open ? "open" : "closed"}
        className="absolute left-0 top-full mt-2 w-72 rounded-2xl border border-hairline bg-white p-2 shadow-[var(--shadow-lift)]"
      >
        <ul>
          {serviceLinks.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="flex min-h-12 items-center rounded-lg px-3 font-bold text-navy-900 hover:bg-navy-100">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
