"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { site, telHref } from "@/config/site";
import { trackEvent } from "@/lib/analytics";
import { RideCard, rideCardDate } from "@/components/brand/RideCard";
import { buttonClass } from "@/components/ui/Button";
import { AlertIcon, ChevronIcon, PhoneIcon } from "@/components/ui/Icons";
import { ChoiceGroup, SelectField, TextArea, TextField } from "@/components/booking/fields";
import {
  copyFor,
  dayNames,
  days,
  emptyBooking,
  formatTime,
  mobilityOptions,
  todayISO,
  validateBooking,
  whoOptions,
  type BookingData,
  type Errors,
  type Who,
} from "@/components/booking/model";

const noop = () => () => {};
function useClientValue<T>(get: () => T, server: T) {
  return useSyncExternalStore(noop, get, () => server);
}

/** POST the request to /api/book. Resolves on 2xx, rejects with the status otherwise. */
async function submitRequest(data: BookingData): Promise<void> {
  const res = await fetch("/api/book", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(String(res.status));
}

export function BookingForm() {
  const [data, setData] = useState<BookingData>(emptyBooking);
  const [errors, setErrors] = useState<Errors>({});
  const [sendError, setSendError] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [moreOpen, setMoreOpen] = useState<boolean | null>(null);

  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  // ?for=facility|loved-one|self pre-selects "who" and opens the optional
  // section (e.g. "Book a patient ride" links from the facilities page).
  const presetWho = useClientValue<Who | "">(() => {
    const v = new URLSearchParams(window.location.search).get("for");
    return v === "self" || v === "loved-one" || v === "facility" ? v : "";
  }, "");
  const minDate = useClientValue(() => todayISO(), undefined);

  const d: BookingData = data.who ? data : { ...data, who: presetWho };
  const copy = copyFor(d.who);
  const isMoreOpen = moreOpen ?? presetWho !== "";

  const update = <K extends keyof BookingData>(key: K, value: BookingData[K]) => {
    const next = { ...d, [key]: value };
    setData(next);
    if (showErrors) setErrors(validateBooking(next));
  };

  // Sent: move focus to the thank-you heading and bring the card into view.
  useEffect(() => {
    if (status !== "sent") return;
    const heading = successRef.current;
    heading?.focus({ preventScroll: true });
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    heading?.closest("[data-booking-root]")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, [status]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validateBooking(d);
    setSendError("");
    if (Object.keys(found).length) {
      setErrors(found);
      setShowErrors(true);
      // Errors inside the optional section need it open to be reachable.
      if (found.email || found.repeatDays) setMoreOpen(true);
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setStatus("sending");
    try {
      await submitRequest(d);
      setStatus("sent");
      trackEvent("booking_submitted", d.who);
    } catch (err) {
      setStatus("idle");
      const code = err instanceof Error ? err.message : "";
      setSendError(
        code === "429"
          ? `You've sent a few requests in a row. Please wait a few minutes, or call us at ${site.phone.display}.`
          : `Sorry, something went wrong sending your request. Please call us at ${site.phone.display}.`,
      );
      setErrors({});
      setShowErrors(true);
      requestAnimationFrame(() => summaryRef.current?.focus());
    }
  };

  const reset = () => {
    setData(emptyBooking);
    setErrors({});
    setSendError("");
    setShowErrors(false);
    setMoreOpen(null);
    setStatus("idle");
  };

  const errorList = Object.entries(errors).filter(([, v]) => v) as [keyof BookingData, string][];
  const firstName = (d.contactName.trim().split(/\s+/)[0] ?? "").replace(/[^\p{L}'-]/gu, "");
  const summaryVisible = showErrors && (errorList.length > 0 || sendError);

  return (
    <div data-booking-root className="scroll-mt-28">
      {status === "sent" ? (
        <Success d={d} firstName={firstName} successRef={successRef} onReset={reset} />
      ) : (
        <form noValidate onSubmit={onSubmit} data-clarity-mask="true" aria-label="Ride request">
          {summaryVisible && (
            <div ref={summaryRef} tabIndex={-1} role="alert" aria-labelledby="error-summary-title" className="mb-8 rounded-xl border-[3px] border-navy bg-white p-5">
              <h2 id="error-summary-title" className="flex items-center gap-2 !font-sans text-lg font-bold !text-ink">
                <AlertIcon />
                {sendError
                  ? "We couldn't send your request"
                  : `Please fix ${errorList.length === 1 ? "this" : `these ${errorList.length} things`} to continue`}
              </h2>
              {sendError && <p className="mt-2 font-bold">{sendError}</p>}
              {errorList.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {errorList.map(([k, msg]) => (
                    <li key={k}>
                      <a
                        href={`#${k}`}
                        className="font-bold text-ink underline"
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById(k)?.focus();
                        }}
                      >
                        {msg}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="space-y-8">
            <TextField id="contactName" label="Your name" autoComplete="name" value={d.contactName} error={errors.contactName} onChange={(e) => update("contactName", e.target.value)} />
            <TextField
              id="phone"
              type="tel"
              inputMode="tel"
              label="Phone number"
              hint="We call this number to confirm the ride."
              autoComplete="tel"
              value={d.phone}
              error={errors.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
            <TextField
              id="pickupAddress"
              label="Pickup address"
              hint="Street address and city."
              autoComplete="street-address"
              value={d.pickupAddress}
              error={errors.pickupAddress}
              onChange={(e) => update("pickupAddress", e.target.value)}
            />
            <TextField
              id="destination"
              label="Drop-off address"
              hint="Place name and address, like “DaVita Dialysis, 123 Main St, Spring”."
              autoComplete="off"
              value={d.destination}
              error={errors.destination}
              onChange={(e) => update("destination", e.target.value)}
            />
            <div className="grid gap-8 sm:grid-cols-2">
              <TextField id="date" type="date" label="Date of the ride" min={minDate} value={d.date} error={errors.date} onChange={(e) => update("date", e.target.value)} />
              <TextField id="time" type="time" label="Appointment time" value={d.time} error={errors.time} onChange={(e) => update("time", e.target.value)} />
            </div>
          </div>

          {/* Optional details. Everything here can also be covered on the call. */}
          <div className="mt-8 border-t-2 border-ink/15 pt-6">
            <button
              ref={moreButtonRef}
              type="button"
              aria-expanded={isMoreOpen}
              aria-controls="booking-more"
              onClick={() => setMoreOpen(!isMoreOpen)}
              className="flex w-full items-start gap-3 rounded-xl px-1 py-2 text-left text-navy hover:bg-morning"
            >
              <ChevronIcon className={`mt-1 h-6 w-6 shrink-0 transition-transform duration-200 ${isMoreOpen ? "rotate-180" : ""}`} />
              <span>
                <span className="block text-lg font-bold underline decoration-2 underline-offset-4">Anything else we should know?</span>
                <span className="mt-1 block text-base font-normal text-ink/85">Optional. Who&apos;s riding, wheelchair type, round trip, repeating days, notes.</span>
              </span>
            </button>

            <div id="booking-more" data-booking-more data-state={isMoreOpen ? "open" : "closed"} hidden={!isMoreOpen} className="mt-6 space-y-8">
              <ChoiceGroup
                name="who"
                legend="Who is this ride for?"
                optional
                options={whoOptions}
                value={d.who}
                onChange={(v) => update("who", v as Who)}
              />
              {(d.who === "loved-one" || d.who === "facility") && (
                <TextField id="riderName" label={copy.riderLabel} optional autoComplete="off" value={d.riderName} onChange={(e) => update("riderName", e.target.value)} />
              )}
              {d.who === "facility" && (
                <TextField id="orgName" label="Facility or organization name" optional autoComplete="organization" value={d.orgName} onChange={(e) => update("orgName", e.target.value)} />
              )}
              <TextField
                id="pickupUnit"
                label="Apartment, building or room"
                optional
                autoComplete="address-line2"
                value={d.pickupUnit}
                onChange={(e) => update("pickupUnit", e.target.value)}
              />
              <ChoiceGroup
                name="mobility"
                legend={copy.mobilityLegend}
                optional
                hint="This helps us send the right van. We never ask about medical conditions."
                columns={2}
                options={mobilityOptions}
                value={d.mobility}
                onChange={(v) => update("mobility", v as BookingData["mobility"])}
              />
              {d.mobility === "own-wheelchair" && (
                <ChoiceGroup
                  name="chairType"
                  legend="What kind of wheelchair?"
                  optional
                  columns={3}
                  options={[
                    { value: "manual", label: "Manual" },
                    { value: "power", label: "Power" },
                    { value: "not-sure", label: "Not sure" },
                  ]}
                  value={d.chairType}
                  onChange={(v) => update("chairType", v as BookingData["chairType"])}
                />
              )}
              <SelectField
                id="companions"
                label="How many people are riding along?"
                optional
                hint={`Family or caregivers. Up to ${site.capabilities.maxCompanions ?? 2}.`}
                value={d.companions}
                onChange={(e) => update("companions", e.target.value)}
              >
                <option value="0">No one, just the rider</option>
                {Array.from({ length: site.capabilities.maxCompanions ?? 2 }, (_, i) => (
                  <option key={i + 1} value={String(i + 1)}>
                    {i + 1} {i === 0 ? "person" : "people"}
                  </option>
                ))}
              </SelectField>
              <ChoiceGroup
                name="tripType"
                legend="What kind of trip?"
                optional
                hint="Leave it and we'll ask on the call."
                columns={3}
                options={[
                  { value: "one-way", label: "One-way", hint: "Just the ride there." },
                  { value: "round-trip", label: "Round trip", hint: "We come back later for the ride home." },
                  ...(site.onTimePromise.waitAndReturn
                    ? [{ value: "wait-and-return", label: "Wait & return", hint: `Your driver waits, walks you out, and brings you home.${site.pricing.waitFreeMinutes ? ` First ${site.pricing.waitFreeMinutes} min free.` : ""}` }]
                    : []),
                ]}
                value={d.tripType}
                onChange={(v) => update("tripType", v as BookingData["tripType"])}
              />
              {d.tripType === "round-trip" && (
                <TextField
                  id="returnTime"
                  type="time"
                  label="Return pickup time"
                  optional
                  hint="Leave this blank if you'll call us when you're ready."
                  value={d.returnTime}
                  onChange={(e) => update("returnTime", e.target.value)}
                />
              )}
              <ChoiceGroup
                name="repeat"
                legend={d.who === "facility" ? "Is this a standing, repeating ride?" : "Is this a repeating ride?"}
                optional
                hint="For example, dialysis three times a week."
                columns={2}
                options={[
                  { value: "once", label: "Just this once" },
                  { value: "repeat", label: "Yes, it repeats every week" },
                ]}
                value={d.repeat}
                onChange={(v) => update("repeat", v as BookingData["repeat"])}
              />
              {d.repeat === "repeat" && (
                <>
                  <ChoiceGroup
                    name="repeatDays"
                    type="checkbox"
                    legend="Which days?"
                    hint="Choose all that apply."
                    error={errors.repeatDays}
                    columns={7}
                    options={days.map((day) => ({ value: day, label: day }))}
                    value={d.repeatDays}
                    onChange={(v, checked) =>
                      update("repeatDays", checked ? days.filter((x) => x === v || d.repeatDays.includes(x)) : d.repeatDays.filter((x) => x !== v))
                    }
                  />
                  {d.who === "facility" && (
                    <TextField
                      id="repeatUntil"
                      type="date"
                      label="Schedule end date"
                      optional
                      hint="Leave blank if the schedule is ongoing."
                      min={d.date || minDate}
                      value={d.repeatUntil}
                      onChange={(e) => update("repeatUntil", e.target.value)}
                    />
                  )}
                </>
              )}
              <TextField
                id="email"
                type="email"
                inputMode="email"
                label="Email"
                optional
                hint="Only if you'd like an email copy of your Ride Card."
                autoComplete="email"
                spellCheck={false}
                value={d.email}
                error={errors.email}
                onChange={(e) => update("email", e.target.value)}
              />
              <TextArea
                id="notes"
                label="Notes for Jay"
                optional
                hint="Gate codes, steps at the door, which entrance to use. Please don't include medical details."
                value={d.notes}
                onChange={(e) => update("notes", e.target.value)}
              />
            </div>
          </div>

          {/* Honeypot (spam trap). Hidden from people and assistive tech. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor="website">Leave this field empty</label>
            <input id="website" name="website" tabIndex={-1} autoComplete="off" value={d.website} onChange={(e) => update("website", e.target.value)} />
          </div>

          <div className="mt-8">
            <button type="submit" disabled={status === "sending"} aria-disabled={status === "sending"} className={buttonClass("primary", "lg", "w-full sm:w-auto sm:min-w-64 disabled:opacity-80")}>
              {status === "sending" ? "Sending your request…" : "Send ride request"}
            </button>
            <p className="mt-4 text-ink/85">
              Jay calls you back within {site.responseTime} during business hours. We only use these details to plan your ride. See our{" "}
              <a href="/privacy" className="font-bold text-navy underline">privacy policy</a>.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}

function Success({ d, firstName, successRef, onReset }: { d: BookingData; firstName: string; successRef: React.RefObject<HTMLHeadingElement | null>; onReset: () => void }) {
  // The draft Ride Card, filled from what they entered. The price and the
  // driver are settled on the confirmation call: this is a request until we talk.
  const date = rideCardDate(d.date);
  const time = formatTime(d.time);
  const when = d.repeat === "repeat" ? `From ${date} · ${time} appt` : `${date} · ${time} appt`;

  return (
    <div data-booking-success className="bg-white sm:rounded-[var(--radius-card)] sm:border-2 sm:border-navy sm:p-8">
      <h2 ref={successRef} tabIndex={-1} className="text-[1.75rem] font-bold focus:outline-none sm:text-[2rem]">
        Thank you{firstName ? `, ${firstName}` : ""}. Your ride request is in.
      </h2>
      <p className="mt-3 text-lg">
        <strong>Jay will call you within {site.responseTime}</strong> during business hours to confirm the price and details. Your ride is not booked until we talk.
      </p>

      <div className="-mx-2 mt-6 grid place-items-center rounded-xl bg-sand px-2 py-6 sm:mx-0 sm:px-4 sm:py-8">
        <RideCard
          titleAs="h3"
          tag={`Pending — Jay will call you within ${site.responseTime} to confirm the price and details`}
          pickup={[d.pickupAddress, d.pickupUnit].filter(Boolean).join(", ")}
          dropoff={d.destination}
          when={when}
          driver="Named on our call"
        />
        <p data-draft-note className="mt-4 max-w-[330px] text-center text-ink/85">
          This is your draft Ride Card. You&apos;ll get the confirmed one by text.
        </p>
        {d.tripType === "round-trip" && d.returnTime && <p className="mt-4 text-center">Return pickup at {formatTime(d.returnTime)}.</p>}
        {d.repeat === "repeat" && d.repeatDays.length > 0 && (
          <p className="mt-4 text-center">Repeats every {d.repeatDays.map((x) => dayNames[x]).join(", ")}.</p>
        )}
        <p className="mt-4 text-center">We&apos;ll call you at <strong>{d.phone}</strong>.</p>
      </div>

      <div className="mt-6 rounded-xl bg-morning p-5">
        <p className="text-lg font-bold text-navy">Rather talk now?</p>
        <a href={telHref} className={buttonClass("secondary", "lg", "mt-3 w-full sm:w-auto")}>
          <PhoneIcon /> Call {site.phone.display}
        </a>
      </div>
      <button type="button" onClick={onReset} className="mt-6 inline-flex min-h-12 items-center font-bold text-navy underline decoration-2 underline-offset-4">
        Request another ride
      </button>
    </div>
  );
}
