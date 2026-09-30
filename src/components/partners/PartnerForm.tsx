"use client";

import { useRef, useState, type FormEvent } from "react";
import { site, telHref } from "@/config/site";
import { t } from "@/content/dictionary";
import { trackEvent } from "@/lib/analytics";
import { buttonClass } from "@/components/ui/Button";
import { AlertIcon, CheckIcon, PhoneIcon } from "@/components/ui/Icons";
import { SelectField, TextArea, TextField } from "@/components/booking/fields";
import { phoneDigits } from "@/components/booking/model";

type P = { facility: string; facilityType: string; contact: string; role: string; phone: string; email: string; volume: string; notes: string; website: string };
type Errors = Partial<Record<keyof P, string>>;
const empty: P = { facility: "", facilityType: "", contact: "", role: "", phone: "", email: "", volume: "", notes: "", website: "" };

/**
 * "Set up a facility account." PHASE 2 (CONFIRM): server action via Resend
 * with the `website` honeypot and the same rate limit as /book.
 */
async function submitPartner(data: P) {
  void data;
  await new Promise((r) => setTimeout(r, 600));
}

export function PartnerForm() {
  const [d, setD] = useState<P>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const summaryRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);
  const update = <K extends keyof P>(k: K, v: P[K]) => setD((x) => ({ ...x, [k]: v }));

  const validate = (): Errors => {
    const e: Errors = {};
    if (d.facility.trim().length < 2) e.facility = "Please enter the facility name.";
    if (!d.facilityType) e.facilityType = "Please choose the kind of facility.";
    if (d.contact.trim().length < 2) e.contact = "Please enter your name.";
    if (phoneDigits(d.phone).length !== 10) e.phone = "Please enter a 10-digit direct phone number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email.trim())) e.email = "Please enter your work email.";
    if (!d.volume) e.volume = "Please pick a rough number of rides.";
    return e;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) { requestAnimationFrame(() => summaryRef.current?.focus()); return; }
    setStatus("sending");
    await submitPartner(d);
    setStatus("sent");
    trackEvent("booking_submitted", "partner");
    requestAnimationFrame(() => doneRef.current?.focus());
  };

  if (status === "sent") {
    return (
      <div className="rounded-[var(--radius-card)] border-2 border-navy bg-white p-6 sm:p-8">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-navy text-cream" aria-hidden="true"><CheckIcon className="h-7 w-7" /></span>
        <h3 ref={doneRef} tabIndex={-1} className="mt-4 text-2xl font-bold focus:outline-none">Thanks, {d.contact.split(" ")[0]}. Jay will call you.</h3>
        <p className="mt-2 text-lg">{t.response.callback} Need a ride before then? Call dispatch directly.</p>
        <a href={telHref} className={buttonClass("secondary", "lg", "mt-5")}><PhoneIcon /> {t.actions.callNumber}</a>
      </div>
    );
  }
  const errorList = Object.entries(errors).filter(([, v]) => v) as [keyof P, string][];

  return (
    <form noValidate onSubmit={onSubmit} data-clarity-mask="true" aria-labelledby="partner-form-heading" className="rounded-[var(--radius-card)] border border-ink/15 bg-white p-5 shadow-[var(--shadow-soft)] sm:p-8">
      <h3 id="partner-form-heading" className="text-2xl font-bold">Set up a facility account</h3>
      <p className="mt-1 text-ink/85">Takes a minute. Jay calls you back to set up billing and your first ride.</p>
      {errorList.length > 0 && (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="mt-5 rounded-xl border-[3px] border-navy bg-white p-4">
          <p className="flex items-center gap-2 font-bold text-ink"><AlertIcon /> Please fix {errorList.length === 1 ? "this" : `these ${errorList.length} things`}:</p>
          <ul className="mt-1 space-y-1">
            {errorList.map(([k, m]) => (
              <li key={k}><a href={`#p-${k}`} className="font-bold text-ink underline" onClick={(ev) => { ev.preventDefault(); document.getElementById(`p-${k}`)?.focus(); }}>{m}</a></li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <TextField id="p-facility" name="facility" label="Facility name" autoComplete="organization" value={d.facility} error={errors.facility} onChange={(e) => update("facility", e.target.value)} />
        <SelectField id="p-facilityType" name="facilityType" label="Kind of facility" value={d.facilityType} error={errors.facilityType} onChange={(e) => update("facilityType", e.target.value)}>
          <option value="">Choose one</option>
          <option value="hospital">Hospital or rehab</option>
          <option value="snf">Skilled nursing or assisted living</option>
          <option value="dialysis">Dialysis or outpatient clinic</option>
          <option value="agency">Home health or agency</option>
          <option value="other">Other</option>
        </SelectField>
        <TextField id="p-contact" name="contact" label="Your name" autoComplete="name" value={d.contact} error={errors.contact} onChange={(e) => update("contact", e.target.value)} />
        <TextField id="p-role" name="role" label="Your role" optional autoComplete="organization-title" placeholder="Discharge planner, social worker…" value={d.role} onChange={(e) => update("role", e.target.value)} />
        <TextField id="p-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" label="Direct phone" hint="Not the main switchboard, if you can." value={d.phone} error={errors.phone} onChange={(e) => update("phone", e.target.value)} />
        <TextField id="p-email" name="email" type="email" inputMode="email" autoComplete="email" label="Work email" value={d.email} error={errors.email} onChange={(e) => update("email", e.target.value)} />
        <SelectField id="p-volume" name="volume" label="Rides you'd expect" value={d.volume} error={errors.volume} onChange={(e) => update("volume", e.target.value)}>
          <option value="">Choose one</option>
          <option value="few">A few a month</option>
          <option value="weekly">A few a week</option>
          <option value="daily">Daily</option>
          <option value="standing">Standing dialysis or therapy schedules</option>
        </SelectField>
      </div>
      <div className="mt-6">
        <TextArea id="p-notes" name="notes" label="Anything else?" optional hint="Typical destinations, discharge times, billing contact." value={d.notes} onChange={(e) => update("notes", e.target.value)} />
      </div>
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="p-website">Leave this field empty</label>
        <input id="p-website" name="website" tabIndex={-1} autoComplete="off" value={d.website} onChange={(e) => update("website", e.target.value)} />
      </div>
      <button type="submit" disabled={status === "sending"} className={buttonClass("primary", "lg", "mt-8 w-full sm:w-auto sm:min-w-64")}>
        {status === "sending" ? "Sending…" : "Set up an account"}
      </button>
      <p className="mt-4 text-sm text-ink/85">Or skip the form and call dispatch at {site.phone.display}.</p>
    </form>
  );
}
