"use client";

import { useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { site, telHref } from "@/config/site";
import { t } from "@/content/dictionary";
import { chicagoToday } from "@/lib/dates";
import { trackEvent } from "@/lib/analytics";
import { buttonClass } from "@/components/ui/Button";
import { AlertIcon, CheckIcon, PhoneIcon } from "@/components/ui/Icons";
import { ChoiceGroup, TextField } from "@/components/booking/fields";
import {
  emptyQuote,
  formatPhone,
  quoteMobilityOptions,
  quoteTripTypeOptions,
  validateQuote,
  type QuoteData,
  type QuoteErrors,
} from "@/components/pricing/quote-model";

type Sent = { ref: string; phone: string };

/** POST to /api/quote. Resolves with the reference; rejects with a message to show. */
async function submitQuote(data: QuoteData): Promise<string> {
  let res: Response;
  try {
    res = await fetch("/api/quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  } catch {
    throw new Error(`Sorry, something went wrong. Please call us at ${site.phone.display}.`);
  }
  const body = (await res.json().catch(() => ({}))) as { ok?: boolean; ref?: string; message?: string };
  if (res.ok && body.ok) return body.ref ?? "";
  if (res.status === 429) throw new Error(`You've sent a few requests in a row. Please wait a few minutes, or call us at ${site.phone.display}.`);
  if (res.status === 503 && body.message) throw new Error(body.message);
  throw new Error(`Sorry, something went wrong. Please call us at ${site.phone.display}.`);
}

const noop = () => () => {};
const tripOptions = quoteTripTypeOptions.filter((o) => o.value !== "wait-and-return" || site.onTimePromise.waitAndReturn);

export function QuoteForm() {
  const [d, setD] = useState<QuoteData>(emptyQuote);
  const [errors, setErrors] = useState<QuoteErrors>({});
  const [sendError, setSendError] = useState("");
  const [status, setStatus] = useState<"idle" | "sending">("idle");
  const [sent, setSent] = useState<Sent | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);
  const minDate = useSyncExternalStore(noop, () => chicagoToday(), () => undefined);

  const update = <K extends keyof QuoteData>(k: K, v: QuoteData[K]) => setD((x) => ({ ...x, [k]: v }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validateQuote(d, chicagoToday());
    setErrors(errs);
    setSendError("");
    if (Object.keys(errs).length) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setStatus("sending");
    try {
      const ref = await submitQuote(d);
      setSent({ ref, phone: formatPhone(d.phone) });
      trackEvent("booking_submitted", "quote");
      requestAnimationFrame(() => doneRef.current?.focus());
    } catch (err) {
      setSendError(err instanceof Error ? err.message : `Sorry, something went wrong. Please call us at ${site.phone.display}.`);
      requestAnimationFrame(() => summaryRef.current?.focus());
    } finally {
      setStatus("idle");
    }
  };

  if (sent) {
    return (
      <div data-quote-success className="rounded-[var(--radius-card)] border-2 border-navy bg-white p-6 sm:p-8">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-navy text-cream" aria-hidden="true"><CheckIcon className="h-7 w-7" /></span>
        <h3 ref={doneRef} tabIndex={-1} className="mt-4 text-2xl font-bold focus:outline-none">Thanks. Your quote request reached Jay.</h3>
        {sent.ref && (
          <p className="mt-2 text-lg">
            Reference <strong data-quote-ref className="tabular-nums">{sent.ref}</strong>.
          </p>
        )}
        <p className="mt-2 text-lg">He&apos;ll call you at {sent.phone} within {site.responseTime} during business hours with the price.</p>
        <a href={telHref} className={buttonClass("secondary", "lg", "mt-5")}><PhoneIcon /> {t.actions.callNumber}</a>
      </div>
    );
  }

  const errorList = Object.entries(errors).filter(([, v]) => v) as [keyof QuoteData, string][];
  const summaryVisible = errorList.length > 0 || sendError;
  const fieldId = (k: keyof QuoteData) => `q-${k}`;

  return (
    <form noValidate onSubmit={onSubmit} data-clarity-mask="true" aria-labelledby="quote-heading" className="rounded-[var(--radius-card)] border border-ink/15 bg-white p-5 shadow-[var(--shadow-soft)] sm:p-8">
      <h3 id="quote-heading" className="text-2xl font-bold">{t.actions.quote}</h3>
      <p className="mt-1 text-ink/85">A few quick answers, and a number to call you back on.</p>

      {summaryVisible && (
        <div ref={summaryRef} tabIndex={-1} role="alert" data-quote-errors className="mt-5 rounded-xl border-[3px] border-navy bg-white p-4">
          <p className="flex items-center gap-2 font-bold text-ink">
            <AlertIcon />
            {sendError ? "We couldn't send your request" : `Please fix ${errorList.length === 1 ? "this" : `these ${errorList.length} things`}:`}
          </p>
          {sendError && <p className="mt-1 font-bold">{sendError}</p>}
          {errorList.length > 0 && (
            <ul className="mt-1">
              {errorList.map(([k, m]) => (
                <li key={k}>
                  <a
                    href={`#${fieldId(k)}`}
                    className="inline-flex min-h-12 items-center font-bold text-ink underline"
                    onClick={(ev) => {
                      ev.preventDefault();
                      document.getElementById(fieldId(k))?.focus();
                    }}
                  >
                    {m}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <TextField id="q-pickupZip" name="pickupZip" label="Pickup ZIP code" inputMode="numeric" autoComplete="postal-code" maxLength={5} value={d.pickupZip} error={errors.pickupZip} onChange={(e) => update("pickupZip", e.target.value)} />
        <TextField id="q-destZip" name="destZip" label="Destination ZIP code" inputMode="numeric" autoComplete="off" maxLength={5} value={d.destZip} error={errors.destZip} onChange={(e) => update("destZip", e.target.value)} />
        <TextField id="q-date" name="date" type="date" label="Date of the ride" min={minDate} value={d.date} error={errors.date} onChange={(e) => update("date", e.target.value)} />
        <TextField id="q-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" label="Phone number for the callback" value={d.phone} error={errors.phone} onChange={(e) => update("phone", e.target.value)} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChoiceGroup
          name="q-mobility"
          legend="How does the rider get around?"
          optional
          error={errors.mobility}
          columns={1}
          options={[...quoteMobilityOptions]}
          value={d.mobility}
          onChange={(v) => update("mobility", v)}
        />
        <ChoiceGroup
          name="q-tripType"
          legend="One-way or round trip?"
          optional
          error={errors.tripType}
          columns={1}
          options={tripOptions}
          value={d.tripType}
          onChange={(v) => update("tripType", v)}
        />
      </div>
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="q-website">Leave this field empty</label>
        <input id="q-website" name="website" tabIndex={-1} autoComplete="off" value={d.website} onChange={(e) => update("website", e.target.value)} />
      </div>
      <button type="submit" disabled={status === "sending"} aria-disabled={status === "sending"} className={buttonClass("primary", "lg", "mt-8 w-full sm:w-auto sm:min-w-64")}>
        {status === "sending" ? "Sending…" : "Get my price"}
      </button>
    </form>
  );
}
