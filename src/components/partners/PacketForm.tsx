"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { site, telHref } from "@/config/site";
import { trackEvent } from "@/lib/analytics";
import { buttonClass } from "@/components/ui/Button";
import { CheckIcon, PhoneIcon } from "@/components/ui/Icons";
import { ChoiceGroup, TextField } from "@/components/booking/fields";
import { emptyPacket, joinAnd, packetItems, packetLabel, validatePacket, type Errors, type PacketData } from "@/components/partners/model";
import { ErrorSummary, focusHeading, sendPartner } from "@/components/partners/shared";

/*
 * "What you can request now." Five buttons tick the matching box in the form
 * and move focus to its first empty field. Nothing is hosted or linked: the
 * request goes to Jay, who emails what was asked for when it's ready.
 * Posts { kind: "packet", ... } to /api/partner.
 */

const P = "pk-";
const idFor = (key: string) => `${P}${key}`;
const fieldOrder = ["name", "facility", "role", "email"] as const;

function focusField(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.focus({ preventScroll: true });
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
}

export function PacketForm() {
  const [d, setD] = useState<PacketData>(emptyPacket);
  const [errors, setErrors] = useState<Errors>({});
  const [showErrors, setShowErrors] = useState(false);
  const [sendError, setSendError] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [ref, setRef] = useState<string | undefined>();

  const summaryRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);
  const pendingFocus = useRef<string | null>(null);

  const apply = (next: PacketData) => {
    setD(next);
    if (showErrors) setErrors(validatePacket(next));
  };
  const update = <K extends keyof PacketData>(k: K, v: PacketData[K]) => apply({ ...d, [k]: v });
  const setItem = (v: string, checked: boolean) =>
    apply({ ...d, items: checked ? packetItems.map((p) => p.value).filter((x) => x === v || d.items.includes(x)) : d.items.filter((x) => x !== v) });

  // Runs after the render that ticked the box.
  useEffect(() => {
    const id = pendingFocus.current;
    if (!id) return;
    pendingFocus.current = null;
    focusField(id);
  });

  useEffect(() => {
    if (status === "sent") focusHeading(doneRef.current);
  }, [status]);

  /** A request button: tick its box, then go to the first field still empty. */
  const request = (v: string) => {
    const firstEmpty = fieldOrder.find((k) => !d[k].trim());
    const target = firstEmpty ? idFor(firstEmpty) : idFor("submit");
    if (d.items.includes(v)) return focusField(target); // already ticked: nothing re-renders
    pendingFocus.current = target;
    setItem(v, true);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSendError("");
    const found = validatePacket(d);
    if (Object.keys(found).length) {
      setErrors(found);
      setShowErrors(true);
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setStatus("sending");
    const r = await sendPartner({ kind: "packet", ...d });
    if (r.ok) {
      setRef(r.ref);
      setStatus("sent");
      trackEvent("booking_submitted", "packet");
      return;
    }
    setStatus("idle");
    setErrors(r.errors ?? {});
    setSendError(r.message);
    setShowErrors(true);
    requestAnimationFrame(() => summaryRef.current?.focus());
  };

  const shown = showErrors ? errors : {};

  return (
    <div data-packet-root className="mt-8">
      <p className="max-w-2xl text-lg">We&apos;ll email what you ask for as soon as it&apos;s ready. Nothing is posted here.</p>

      <ul className="mt-6 flex flex-wrap gap-3" aria-label="Request a document">
        {packetItems.map((p) => {
          const on = d.items.includes(p.value);
          return (
            <li key={p.value}>
              <button type="button" data-packet-button={p.value} onClick={() => request(p.value)} disabled={status === "sent"} className={buttonClass("secondary", "md", "disabled:opacity-60")}>
                {on && <CheckIcon className="h-5 w-5" />}
                {p.label}
                {on && <span className="sr-only"> (added to your request)</span>}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 max-w-3xl">
        {status === "sent" ? (
          <div data-packet-success className="rounded-[var(--radius-card)] border-2 border-navy bg-white p-6 sm:p-8">
            <h3 ref={doneRef} tabIndex={-1} className="text-2xl font-bold focus:outline-none">
              Thanks. Your request for {joinAnd(d.items.map(packetLabel))} reached Jay.
            </h3>
            {ref && <p className="mt-3 text-lg">Reference <strong data-ref>{ref}</strong>.</p>}
            <p className="mt-2 text-lg">
              We&apos;ll email <strong>{d.email.trim()}</strong> when it&apos;s ready.
            </p>
            <a href={telHref} className={buttonClass("secondary", "lg", "mt-6")}>
              <PhoneIcon /> Call {site.phone.display}
            </a>
          </div>
        ) : (
          <form noValidate onSubmit={onSubmit} data-clarity-mask="true" aria-label="Packet request" className="rounded-[var(--radius-card)] border border-ink/15 bg-white p-5 sm:p-8">
            {showErrors && <ErrorSummary summaryRef={summaryRef} titleId={`${P}error-title`} errors={errors} sendError={sendError} idFor={idFor} />}
            <ChoiceGroup
              name={idFor("items")}
              type="checkbox"
              legend="What should we send?"
              hint="Choose at least one."
              error={shown.items}
              columns={2}
              options={packetItems.map((p) => ({ value: p.value, label: p.label }))}
              value={d.items}
              onChange={setItem}
            />
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              <TextField id={idFor("name")} name="name" label="Your name" autoComplete="name" value={d.name} error={shown.name} onChange={(e) => update("name", e.target.value)} />
              <TextField id={idFor("facility")} name="facility" label="Facility" autoComplete="organization" value={d.facility} error={shown.facility} onChange={(e) => update("facility", e.target.value)} />
              <TextField id={idFor("role")} name="role" label="Your role" autoComplete="organization-title" value={d.role} error={shown.role} onChange={(e) => update("role", e.target.value)} />
              <TextField
                id={idFor("email")}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                spellCheck={false}
                label="Work email"
                value={d.email}
                error={shown.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>

            {/* Honeypot (spam trap). Hidden from people and assistive tech. */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label htmlFor={idFor("website")}>Leave this field empty</label>
              <input id={idFor("website")} name="website" tabIndex={-1} autoComplete="off" value={d.website} onChange={(e) => update("website", e.target.value)} />
            </div>

            <button id={idFor("submit")} type="submit" disabled={status === "sending"} aria-disabled={status === "sending"} className={buttonClass("primary", "lg", "mt-8 w-full sm:w-auto sm:min-w-64 disabled:opacity-80")}>
              {status === "sending" ? "Sending…" : "Send packet request"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
