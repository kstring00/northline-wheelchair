"use client";

import { useId, useState } from "react";
import { ChevronIcon } from "@/components/ui/Icons";

type Item = { q: string; a: string };

/**
 * Accessible accordion: real <button>s with aria-expanded/aria-controls.
 * Without JS every answer is visible (CSS only collapses under `.js`).
 * Height animates smoothly via grid rows (see globals.css).
 */
export function Accordion({ items, headingLevel = 3 }: { items: Item[]; headingLevel?: 2 | 3 }) {
  const [open, setOpen] = useState<number | null>(null);
  const base = useId();
  const H = `h${headingLevel}` as "h2" | "h3";

  return (
    <div className="divide-y divide-hairline overflow-hidden rounded-[var(--radius-card)] border border-hairline bg-white">
      {items.map((item, i) => {
        const isOpen = open === i;
        const btnId = `${base}-b${i}`;
        const panelId = `${base}-p${i}`;
        return (
          <div key={item.q}>
            <H className="!font-sans !text-lg !leading-snug !tracking-normal">
              <button
                id={btnId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex min-h-16 w-full items-center justify-between gap-4 px-5 py-4 text-left font-bold text-navy-900 hover:bg-navy-100/60 sm:px-6"
              >
                <span>{item.q}</span>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-navy-900">
                  <ChevronIcon className={`h-5 w-5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </span>
              </button>
            </H>
            <div id={panelId} role="region" aria-labelledby={btnId} className="accordion-panel" data-state={isOpen ? "open" : "closed"}>
              <div>
                <p className="px-5 pb-6 text-muted sm:px-6">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
