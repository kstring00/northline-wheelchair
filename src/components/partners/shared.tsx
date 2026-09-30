"use client";

import type { RefObject } from "react";
import { site } from "@/config/site";
import { AlertIcon } from "@/components/ui/Icons";
import type { Errors } from "@/components/partners/model";

export type SendResult = { ok: true; ref?: string } | { ok: false; errors?: Errors; message: string };

/** POST to /api/partner. Never throws: every failure comes back as a message to show. */
export async function sendPartner(body: Record<string, unknown>): Promise<SendResult> {
  const generic = `Sorry, something went wrong. Please call us at ${site.phone.display}.`;
  try {
    const res = await fetch("/api/partner", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = (await res.json().catch(() => ({}))) as { ok?: boolean; ref?: string; errors?: Errors; message?: string };
    if (res.ok && j.ok) return { ok: true, ref: typeof j.ref === "string" ? j.ref : undefined };
    if (res.status === 429) return { ok: false, message: `You've sent a few requests in a row. Please wait a few minutes, or call us at ${site.phone.display}.` };
    if (res.status === 400 && j.errors && Object.keys(j.errors).length) return { ok: false, errors: j.errors, message: "" };
    return { ok: false, message: typeof j.message === "string" && j.message ? j.message : generic };
  } catch {
    return { ok: false, message: generic };
  }
}

/**
 * Error summary: role=alert, receives focus, one link per error. `idFor` maps
 * an error key to the field's DOM id; `beforeFocus` opens anything hiding it.
 */
export function ErrorSummary({
  summaryRef,
  titleId,
  errors,
  sendError,
  idFor,
  beforeFocus,
}: {
  summaryRef: RefObject<HTMLDivElement | null>;
  titleId: string;
  errors: Errors;
  sendError: string;
  idFor: (key: string) => string;
  beforeFocus?: (key: string) => void;
}) {
  const list = Object.entries(errors).filter(([, v]) => v);
  if (!list.length && !sendError) return null;
  return (
    <div ref={summaryRef} tabIndex={-1} role="alert" aria-labelledby={titleId} className="mb-8 rounded-xl border-[3px] border-navy bg-white p-5">
      <h3 id={titleId} className="flex items-center gap-2 !font-sans text-lg font-bold !text-ink">
        <AlertIcon />
        {sendError ? "We couldn't send your request" : `Please fix ${list.length === 1 ? "this" : `these ${list.length} things`} to continue`}
      </h3>
      {sendError && <p className="mt-2 font-bold">{sendError}</p>}
      {list.length > 0 && (
        <ul className="mt-2 space-y-1">
          {list.map(([k, msg]) => (
            <li key={k}>
              <a
                href={`#${idFor(k)}`}
                className="inline-flex min-h-12 items-center font-bold text-ink underline"
                onClick={(e) => {
                  e.preventDefault();
                  beforeFocus?.(k);
                  requestAnimationFrame(() => document.getElementById(idFor(k))?.focus());
                }}
              >
                {msg}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export const firstNameOf = (name: string) => (name.trim().split(/\s+/)[0] ?? "").replace(/[^\p{L}'-]/gu, "");

/** Focus a success heading and bring it into view. */
export function focusHeading(el: HTMLElement | null) {
  if (!el) return;
  el.focus({ preventScroll: true });
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
}
