"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { site, telHref, money } from "@/config/site";
import { trackEvent } from "@/lib/analytics";
import { loadGsap, MOTION_OK } from "@/components/motion/gsap";
import { buttonClass } from "@/components/ui/Button";
import { AlertIcon, CheckIcon, PhoneIcon } from "@/components/ui/Icons";
import { ChoiceGroup, SelectField, TextArea, TextField } from "@/components/booking/fields";
import {
  copyFor,
  dayNames,
  days,
  emptyBooking,
  formatDate,
  formatTime,
  mobilityOptions,
  todayISO,
  validateStep,
  whoOptions,
  type BookingData,
  type Errors,
  type Step,
  type Who,
} from "@/components/booking/model";

const stepNames: Record<Step, string> = { 1: "Who is riding", 2: "The trip", 3: "Mobility and contact" };
const stepShort: Record<Step, string> = { 1: "Rider", 2: "Trip", 3: "Contact" };

const noop = () => () => {};
void money;
function useClientValue<T>(get: () => T, server: T) {
  return useSyncExternalStore(noop, get, () => server);
}

/**
 * CONFIRM Phase 2: replace with a server action that emails the request via
 * Resend, checks the `website` honeypot and rate-limits by IP. For the Phase 1
 * mockup the request is only simulated on the client.
 */
async function submitRequest(data: BookingData): Promise<void> {
  void data;
  await new Promise((r) => setTimeout(r, 700));
}

export function BookingForm() {
  const [data, setData] = useState<BookingData>(emptyBooking);
  const [step, setStep] = useState<Step>(1);
  const [errors, setErrors] = useState<Errors>({});
  const [showErrors, setShowErrors] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [direction, setDirection] = useState<1 | -1>(1);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const didMount = useRef(false);

  // ?for=facility|loved-one|self pre-selects step 1 (e.g. "Book a patient ride" links).
  const presetWho = useClientValue<Who | "">(() => {
    const v = new URLSearchParams(window.location.search).get("for");
    return v === "self" || v === "loved-one" || v === "facility" ? v : "";
  }, "");
  const minDate = useClientValue(() => todayISO(), undefined);

  const d: BookingData = data.who ? data : { ...data, who: presetWho };
  const copy = copyFor(d.who);

  const update = <K extends keyof BookingData>(key: K, value: BookingData[K]) => {
    const next = { ...d, [key]: value };
    setData(next);
    if (showErrors) setErrors(validateStep(step, next));
  };

  const view = status === "sent" ? "sent" : `step-${step}`;

  // Step change: move focus to the new step's heading, animate in, advance bar.
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    const heading = view === "sent" ? successRef.current : headingRef.current;
    heading?.focus({ preventScroll: true });
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    heading?.closest("[data-booking-root]")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

    let revert: (() => void) | undefined;
    loadGsap().then(({ gsap }) => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        if (stepRef.current) gsap.fromTo(stepRef.current, { opacity: 0, x: 28 * direction }, { opacity: 1, x: 0, duration: 0.32, ease: "power2.out", clearProps: "transform,opacity" });
      });
      revert = () => mm.revert();
    });
    return () => revert?.();
  }, [view, direction]);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const target = view === "sent" ? 1 : step / 3;
    loadGsap().then(({ gsap }) => {
      const reduce = !window.matchMedia(MOTION_OK).matches;
      gsap.to(bar, { scaleX: target, duration: reduce ? 0 : 0.45, ease: "power2.inOut" });
    });
  }, [view, step]);

  const goTo = (next: Step) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
    setShowErrors(false);
    setErrors({});
    trackEvent("booking_step", String(next));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const stepErrors = validateStep(step, d);
    if (Object.keys(stepErrors).length) {
      setErrors(stepErrors);
      setShowErrors(true);
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    if (step < 3) {
      setData(d);
      goTo((step + 1) as Step);
      return;
    }
    setStatus("sending");
    try {
      await submitRequest(d);
      setStatus("sent");
      trackEvent("booking_submitted", d.who);
    } catch {
      setStatus("idle");
      setErrors({ notes: `Sorry, something went wrong sending your request. Please call us at ${site.phone.display}.` });
      setShowErrors(true);
    }
  };

  const reset = () => {
    setData(emptyBooking);
    setStatus("idle");
    goTo(1);
  };

  const errorList = Object.entries(errors).filter(([, v]) => v) as [keyof BookingData, string][];
  const firstName = (d.contactName.trim().split(/\s+/)[0] ?? "").replace(/[^\p{L}'-]/gu, "");

  return (
    <div data-booking-root className="scroll-mt-28">
      {/* Progress indicator */}
      <div className="mb-8">
        <p className="text-base font-bold text-navy-900" aria-live="polite">
          {status === "sent" ? "Request sent" : `Step ${step} of 3: ${stepNames[step]}`}
        </p>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-navy-100" aria-hidden="true">
          <div ref={barRef} className="h-full origin-left rounded-full bg-navy-900" style={{ transform: `scaleX(${step / 3})` }} />
        </div>
        <ol className="mt-3 grid grid-cols-3 gap-2 text-sm">
          {([1, 2, 3] as Step[]).map((n) => {
            const done = status === "sent" || n < step;
            const current = status !== "sent" && n === step;
            return (
              <li key={n} aria-current={current ? "step" : undefined} className={`flex items-center gap-1.5 ${current ? "font-bold text-navy-900" : "text-muted"}`}>
                <span aria-hidden="true" className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-xs font-bold ${done ? "border-navy-900 bg-navy-900 text-cream" : current ? "border-navy-900 text-navy-900" : "border-line"}`}>
                  {done ? <CheckIcon className="h-3.5 w-3.5" /> : n}
                </span>
                <span>
                  <span className="sm:hidden">{stepShort[n]}</span>
                  <span className="hidden sm:inline">{stepNames[n]}</span>
                  {done && <span className="sr-only"> (done)</span>}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      {status === "sent" ? (
        <Success d={d} firstName={firstName} successRef={successRef} onReset={reset} />
      ) : (
        <form noValidate onSubmit={onSubmit} data-clarity-mask="true" aria-labelledby="booking-step-heading">
          <div ref={stepRef}>
            <h2 id="booking-step-heading" ref={headingRef} tabIndex={-1} className="text-[1.75rem] font-bold focus:outline-none sm:text-[2rem]">
              {step === 1 && "Who is this ride for?"}
              {step === 2 && copy.tripHeading}
              {step === 3 && "Mobility and contact"}
            </h2>

            {showErrors && errorList.length > 0 && (
              <div ref={summaryRef} tabIndex={-1} role="alert" aria-labelledby="error-summary-title" className="mt-6 rounded-xl border-[3px] border-error bg-white p-5">
                <h3 id="error-summary-title" className="flex items-center gap-2 !font-sans text-lg font-bold !text-error">
                  <AlertIcon /> Please fix {errorList.length === 1 ? "this" : `these ${errorList.length} things`} to continue
                </h3>
                <ul className="mt-2 space-y-1">
                  {errorList.map(([k, msg]) => (
                    <li key={k}>
                      <a href={`#${k}`} className="font-bold text-error underline" onClick={(e) => { e.preventDefault(); document.getElementById(k)?.focus(); }}>
                        {msg}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 space-y-8">
              {step === 1 && (
                <>
                  <ChoiceGroup
                    name="who"
                    legend={<span className="sr-only">Who is this ride for?</span>}
                    hint="Choose one. We'll only ask what we need to plan the ride."
                    error={errors.who}
                    options={whoOptions}
                    value={d.who}
                    onChange={(v) => update("who", v as Who)}
                  />
                  {d.who === "facility" && (
                    <p className="rounded-xl bg-navy-100 p-4">
                      Next, we&apos;ll ask about the trip. You can set up a <strong>repeating schedule</strong>, and we&apos;ll ask for your organization&apos;s name at the end.
                    </p>
                  )}
                </>
              )}

              {step === 2 && (
                <>
                  <TextField
                    id="pickupAddress"
                    label={copy.pickupLabel}
                    hint="Street address and city."
                    autoComplete={d.who === "self" ? "street-address" : "off"}
                    value={d.pickupAddress}
                    error={errors.pickupAddress}
                    onChange={(e) => update("pickupAddress", e.target.value)}
                  />
                  <TextField
                    id="pickupUnit"
                    label="Apartment, building or room"
                    optional
                    autoComplete={d.who === "self" ? "address-line2" : "off"}
                    value={d.pickupUnit}
                    onChange={(e) => update("pickupUnit", e.target.value)}
                  />
                  <TextField
                    id="destination"
                    label="Where are you going?"
                    hint="Place name and address, like “DaVita Dialysis, 123 Main St, Spring”."
                    autoComplete="off"
                    value={d.destination}
                    error={errors.destination}
                    onChange={(e) => update("destination", e.target.value)}
                  />
                  <div className="grid gap-8 sm:grid-cols-2">
                    <TextField id="date" type="date" label="Date of the ride" min={minDate} value={d.date} error={errors.date} onChange={(e) => update("date", e.target.value)} />
                    <TextField id="time" type="time" label="Appointment time" hint="We'll plan the pickup around it." value={d.time} error={errors.time} onChange={(e) => update("time", e.target.value)} />
                  </div>
                  <ChoiceGroup
                    name="tripType"
                    legend="What kind of trip?"
                    error={errors.tripType}
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
                </>
              )}

              {step === 3 && (
                <>
                  <ChoiceGroup
                    name="mobility"
                    legend={copy.mobilityLegend}
                    hint="This helps us send the right van. We never ask about medical conditions."
                    error={errors.mobility}
                    columns={2}
                    options={mobilityOptions}
                    value={d.mobility}
                    onChange={(v) => update("mobility", v as BookingData["mobility"])}
                  />
                  {d.mobility === "own-wheelchair" && (
                    <ChoiceGroup
                      name="chairType"
                      legend="What kind of wheelchair?"
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

                  {d.who !== "self" && (
                    <TextField id="riderName" label={copy.riderLabel} autoComplete="off" value={d.riderName} error={errors.riderName} onChange={(e) => update("riderName", e.target.value)} />
                  )}
                  <TextField id="contactName" label={copy.contactLabel} autoComplete="name" value={d.contactName} error={errors.contactName} onChange={(e) => update("contactName", e.target.value)} />
                  {d.who === "facility" && (
                    <TextField id="orgName" label="Facility or organization name" autoComplete="organization" value={d.orgName} error={errors.orgName} onChange={(e) => update("orgName", e.target.value)} />
                  )}
                  <TextField
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    label={copy.phoneLabel}
                    hint={copy.phoneHint}
                    autoComplete="tel"
                    value={d.phone}
                    error={errors.phone}
                    onChange={(e) => update("phone", e.target.value)}
                  />
                  <TextField
                    id="email"
                    type="email"
                    inputMode="email"
                    label={d.who === "facility" ? "Work email" : "Email"}
                    optional={d.who !== "facility"}
                    hint={d.who === "facility" ? "We'll send the ride confirmation here." : "Only if you'd like an email confirmation too."}
                    autoComplete="email"
                    spellCheck={false}
                    value={d.email}
                    error={errors.email}
                    onChange={(e) => update("email", e.target.value)}
                  />
                  <TextArea
                    id="notes"
                    label="Anything else we should know?"
                    optional
                    hint="Gate codes, steps at the door, which entrance to use. Please don't include medical details."
                    value={d.notes}
                    error={errors.notes}
                    onChange={(e) => update("notes", e.target.value)}
                  />
                  {/* Honeypot (spam trap). Hidden from people and assistive tech. */}
                  <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                    <label htmlFor="website">Leave this field empty</label>
                    <input id="website" name="website" tabIndex={-1} autoComplete="off" value={d.website} onChange={(e) => update("website", e.target.value)} />
                  </div>
                  <p className="text-muted">
                    We only use these details to plan your ride. See our{" "}
                    <a href="/privacy" className="font-bold text-navy-700 underline">privacy policy</a>.
                  </p>
                </>
              )}
            </div>

            <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              {step > 1 ? (
                <button type="button" onClick={() => goTo((step - 1) as Step)} className={buttonClass("secondary", "lg")}>
                  Back
                </button>
              ) : (
                <span />
              )}
              <button type="submit" disabled={status === "sending"} aria-disabled={status === "sending"} className={buttonClass("primary", "lg", "sm:min-w-64 disabled:opacity-80")}>
                {step < 3 ? `Continue to ${stepNames[(step + 1) as Step].toLowerCase()}` : status === "sending" ? "Sending your request…" : "Send ride request"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

function Success({ d, firstName, successRef, onReset }: { d: BookingData; firstName: string; successRef: React.RefObject<HTMLHeadingElement | null>; onReset: () => void }) {
  const rows: [string, string][] = [
    ["Pickup", [d.pickupAddress, d.pickupUnit].filter(Boolean).join(", ")],
    ["Going to", d.destination],
    ["When", `${formatDate(d.date)} at ${formatTime(d.time)}`],
    ["Trip", d.tripType === "wait-and-return" ? "Wait & return: your driver waits and brings you home" : d.tripType === "round-trip" ? `Round trip${d.returnTime ? `, return at ${formatTime(d.returnTime)}` : ", call when ready"}` : "One-way"],
  ];
  if (d.repeat === "repeat") rows.push(["Repeats", `Every ${d.repeatDays.map((x) => dayNames[x]).join(", ")}`]);
  rows.push(["We'll call", d.phone]);

  return (
    <div className="rounded-[var(--radius-card)] border-2 border-success bg-white p-6 sm:p-8">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-success text-cream" aria-hidden="true">
        <CheckIcon className="h-8 w-8" />
      </span>
      <h2 ref={successRef} tabIndex={-1} className="mt-5 text-[1.75rem] font-bold focus:outline-none sm:text-[2rem]">
        Thank you{firstName ? `, ${firstName}` : ""}. Your ride request is in.
      </h2>
      <p className="mt-3 text-lg">
        <strong>We call back within {site.responseTime}</strong> during business hours to confirm the pickup time and the price. Your ride is not booked until we talk.
      </p>
      <dl className="mt-6 divide-y divide-hairline rounded-xl bg-cream px-5">
        {rows.map(([k, v]) => (
          <div key={k} className="grid gap-1 py-3 sm:grid-cols-[8rem_1fr]">
            <dt className="font-bold text-navy-900">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 rounded-xl bg-navy-100 p-5">
        <p className="text-lg font-bold text-navy-900">Rather talk now?</p>
        <a href={telHref} className={buttonClass("secondary", "lg", "mt-3 w-full sm:w-auto")}>
          <PhoneIcon /> Call {site.phone.display}
        </a>
      </div>
      <button type="button" onClick={onReset} className="mt-6 inline-flex min-h-12 items-center font-bold text-navy-700 underline decoration-2 underline-offset-4">
        Request another ride
      </button>
    </div>
  );
}

