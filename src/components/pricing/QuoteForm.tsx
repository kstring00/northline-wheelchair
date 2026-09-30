"use client";

import { useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { site, telHref } from "@/config/site";
import { t } from "@/content/dictionary";
import { trackEvent } from "@/lib/analytics";
import { buttonClass } from "@/components/ui/Button";
import { AlertIcon, CheckIcon, PhoneIcon } from "@/components/ui/Icons";
import { ChoiceGroup, TextField } from "@/components/booking/fields";
import { phoneDigits, todayISO } from "@/components/booking/model";

type Q = { pickupZip: string; destZip: string; date: string; mobility: string; tripType: string; phone: string; website: string };
type Errors = Partial<Record<keyof Q, string>>;

const empty: Q = { pickupZip: "", destZip: "", date: "", mobility: "", tripType: "", phone: "", website: "" };

/**
 * "Get a quote in 2 minutes". Posts to the same backend as /book.
 * PHASE 2 (CONFIRM): server action with Resend, the `website` honeypot and
 * the same per-IP rate limit as the booking form.
 */
async function submitQuote(data: Q) {
  void data;
  await new Promise((r) => setTimeout(r, 600));
}

const zipOk = (z: string) => /^\d{5}$/.test(z.trim());

export function QuoteForm() {
  const [d, setD] = useState<Q>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const summaryRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);
  const minDate = useSyncExternalStore(() => () => {}, () => todayISO(), () => undefined);

  const update = <K extends keyof Q>(k: K, v: Q[K]) => setD((x) => ({ ...x, [k]: v }));

  const validate = (): Errors => {
    const e: Errors = {};
    if (!zipOk(d.pickupZip)) e.pickupZip = "Please enter the 5-digit pickup ZIP code.";
    if (!zipOk(d.destZip)) e.destZip = "Please enter the 5-digit ZIP code where you're going.";
    if (!d.date) e.date = "Please choose the date of the ride.";
    else if (d.date < todayISO()) e.date = "That date has passed. Please choose today or later.";
    if (!d.mobility) e.mobility = "Please choose how the rider gets around.";
    if (!d.tripType) e.tripType = "Please choose one-way or round trip.";
    if (phoneDigits(d.phone).length !== 10) e.phone = `Please enter a 10-digit phone number so we can call with the price.`;
    return e;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setStatus("sending");
    await submitQuote(d);
    setStatus("sent");
    trackEvent("booking_submitted", "quote");
    requestAnimationFrame(() => doneRef.current?.focus());
  };

  if (status === "sent") {
    return (
      <div className="rounded-[var(--radius-card)] border-2 border-success bg-white p-6 sm:p-8">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-success text-cream" aria-hidden="true"><CheckIcon className="h-7 w-7" /></span>
        <h3 ref={doneRef} tabIndex={-1} className="mt-4 text-2xl font-bold focus:outline-none">Got it. We&apos;ll call you with the price.</h3>
        <p className="mt-2 text-lg">{t.response.callback} The number we give you is the number you pay.</p>
        <a href={telHref} className={buttonClass("secondary", "lg", "mt-5")}><PhoneIcon /> {t.actions.callNumber}</a>
      </div>
    );
  }

  const errorList = Object.entries(errors).filter(([, v]) => v) as [keyof Q, string][];

  return (
    <form noValidate onSubmit={onSubmit} data-clarity-mask="true" aria-labelledby="quote-heading" className="rounded-[var(--radius-card)] border border-hairline bg-white p-5 shadow-[var(--shadow-soft)] sm:p-8">
      <h3 id="quote-heading" className="text-2xl font-bold">{t.actions.quote}</h3>
      <p className="mt-1 text-muted">Six quick answers. We call back with the exact price.</p>

      {errorList.length > 0 && (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="mt-5 rounded-xl border-[3px] border-error bg-white p-4">
          <p className="flex items-center gap-2 font-bold text-error"><AlertIcon /> Please fix {errorList.length === 1 ? "this" : `these ${errorList.length} things`}:</p>
          <ul className="mt-1 space-y-1">
            {errorList.map(([k, m]) => (
              <li key={k}><a href={`#q-${k}`} className="font-bold text-error underline" onClick={(ev) => { ev.preventDefault(); document.getElementById(`q-${k}`)?.focus(); }}>{m}</a></li>
            ))}
          </ul>
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
          error={errors.mobility}
          columns={1}
          options={[
            { value: "wheelchair", label: "Wheelchair" },
            { value: "walker", label: "Walker or cane" },
            { value: "ambulatory", label: "Walks with a little help" },
          ]}
          value={d.mobility}
          onChange={(v) => update("mobility", v)}
        />
        <ChoiceGroup
          name="q-tripType"
          legend="One-way or round trip?"
          error={errors.tripType}
          columns={1}
          options={[
            { value: "one-way", label: "One-way" },
            { value: "round-trip", label: "Round trip" },
            ...(site.onTimePromise.waitAndReturn ? [{ value: "wait-and-return", label: "Wait & return" }] : []),
          ]}
          value={d.tripType}
          onChange={(v) => update("tripType", v)}
        />
      </div>
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="q-website">Leave this field empty</label>
        <input id="q-website" name="website" tabIndex={-1} autoComplete="off" value={d.website} onChange={(e) => update("website", e.target.value)} />
      </div>
      <button type="submit" disabled={status === "sending"} className={buttonClass("primary", "lg", "mt-8 w-full sm:w-auto sm:min-w-64")}>
        {status === "sending" ? "Sending…" : "Get my price"}
      </button>
    </form>
  );
}
