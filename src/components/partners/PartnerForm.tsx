"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { site, telHref } from "@/config/site";
import { trackEvent } from "@/lib/analytics";
import { buttonClass } from "@/components/ui/Button";
import { ChevronIcon, PhoneIcon } from "@/components/ui/Icons";
import { ChoiceGroup, SelectField, TextArea, TextField } from "@/components/booking/fields";
import {
  MAX_ROWS,
  days,
  emptyAccount,
  emptyRow,
  facilityTypes,
  poOptions,
  standingOptions,
  validateAccount,
  volumeOptions,
  type AccountData,
  type Errors,
  type ScheduleRow,
} from "@/components/partners/model";
import { ErrorSummary, firstNameOf, focusHeading, sendPartner } from "@/components/partners/shared";

/*
 * "Set up a facility account." Posts { kind: "account", ... } to /api/partner.
 * Same UX as BookingForm: noValidate, a focused error summary with links,
 * aria-invalid fields with a visible "Error:" prefix, and an optional
 * standing-schedule expander (aria-expanded / aria-controls / hidden).
 */

const P = "acct-";
const idFor = (key: string) => `${P}${key}`;

export function PartnerForm() {
  const [d, setD] = useState<AccountData>(emptyAccount);
  const [rowKeys, setRowKeys] = useState<number[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [showErrors, setShowErrors] = useState(false);
  const [sendError, setSendError] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [ref, setRef] = useState<string | undefined>();
  const [open, setOpen] = useState(false);

  const summaryRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);
  const nextKey = useRef(0);
  const pendingFocus = useRef<string | null>(null);

  const apply = (next: AccountData) => {
    setD(next);
    if (showErrors) setErrors(validateAccount(next));
  };
  const update = <K extends keyof AccountData>(k: K, v: AccountData[K]) => apply({ ...d, [k]: v });
  const updateRow = (i: number, patch: Partial<ScheduleRow>) => apply({ ...d, schedules: d.schedules.map((r, j) => (j === i ? { ...r, ...patch } : r)) });

  const addRow = (focus = true) => {
    if (d.schedules.length >= MAX_ROWS) return;
    const i = d.schedules.length;
    setRowKeys((k) => [...k, nextKey.current++]);
    apply({ ...d, schedules: [...d.schedules, emptyRow()] });
    if (focus) pendingFocus.current = idFor(`schedule-${i}-initials`);
  };
  const removeRow = (i: number) => {
    setRowKeys((k) => k.filter((_, j) => j !== i));
    apply({ ...d, schedules: d.schedules.filter((_, j) => j !== i) });
    pendingFocus.current = d.schedules.length - 1 > 0 ? `${P}add-row` : `${P}standing-toggle`;
  };

  // Focus after the DOM has the new row (or has lost the removed one).
  useEffect(() => {
    if (!pendingFocus.current) return;
    document.getElementById(pendingFocus.current)?.focus();
    pendingFocus.current = null;
  });

  useEffect(() => {
    if (status === "sent") focusHeading(doneRef.current);
  }, [status]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && d.schedules.length === 0) addRow(false);
  };

  const showSummary = () => requestAnimationFrame(() => summaryRef.current?.focus());

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSendError("");
    const found = validateAccount(d);
    if (Object.keys(found).length) {
      setErrors(found);
      setShowErrors(true);
      if (Object.keys(found).some((k) => k.startsWith("schedule-"))) setOpen(true);
      showSummary();
      return;
    }
    setStatus("sending");
    const r = await sendPartner({ kind: "account", ...d });
    if (r.ok) {
      setRef(r.ref);
      setStatus("sent");
      trackEvent("booking_submitted", "partner");
      return;
    }
    setStatus("idle");
    setErrors(r.errors ?? {});
    setSendError(r.message);
    setShowErrors(true);
    if (r.errors && Object.keys(r.errors).some((k) => k.startsWith("schedule-"))) setOpen(true);
    showSummary();
  };

  if (status === "sent") {
    return (
      <div data-partner-success className="rounded-[var(--radius-card)] border-2 border-navy bg-white p-6 sm:p-8">
        <h3 ref={doneRef} tabIndex={-1} className="text-2xl font-bold focus:outline-none">
          Thanks{firstNameOf(d.contactName) ? `, ${firstNameOf(d.contactName)}` : ""}. Your request reached Jay.
        </h3>
        {ref && <p className="mt-3 text-lg">Reference <strong data-ref>{ref}</strong>.</p>}
        <p className="mt-2 text-lg">
          He&apos;ll call you at <strong>{d.phone.trim()}</strong> within {site.responseTime} during business hours.
        </p>
        <a href={telHref} className={buttonClass("secondary", "lg", "mt-6")}>
          <PhoneIcon /> Call {site.phone.display}
        </a>
      </div>
    );
  }

  const shown = showErrors ? errors : {};
  const err = (k: string) => shown[k];

  return (
    <form noValidate onSubmit={onSubmit} data-clarity-mask="true" aria-label="Facility account" className="rounded-[var(--radius-card)] border border-ink/15 bg-white p-5 sm:p-8">
      {showErrors && <ErrorSummary summaryRef={summaryRef} titleId={`${P}error-title`} errors={errors} sendError={sendError} idFor={idFor} beforeFocus={(k) => k.startsWith("schedule-") && setOpen(true)} />}

      <div className="grid gap-8 sm:grid-cols-2">
        <TextField id={`${P}facility`} name="facility" label="Facility name" autoComplete="organization" value={d.facility} error={err("facility")} onChange={(e) => update("facility", e.target.value)} />
        <SelectField id={`${P}facilityType`} name="facilityType" label="Facility type" required value={d.facilityType} error={err("facilityType")} onChange={(e) => update("facilityType", e.target.value)}>
          <option value="">Choose one</option>
          {facilityTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </SelectField>
        <TextField id={`${P}contactName`} name="contactName" label="Your name" autoComplete="name" value={d.contactName} error={err("contactName")} onChange={(e) => update("contactName", e.target.value)} />
        <TextField id={`${P}role`} name="role" label="Your role" optional autoComplete="organization-title" value={d.role} onChange={(e) => update("role", e.target.value)} />
        <TextField
          id={`${P}phone`}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          label="Direct phone"
          hint="The number that reaches you, not the main switchboard."
          value={d.phone}
          error={err("phone")}
          onChange={(e) => update("phone", e.target.value)}
        />
        <TextField
          id={`${P}email`}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          spellCheck={false}
          label="Work email"
          value={d.email}
          error={err("email")}
          onChange={(e) => update("email", e.target.value)}
        />
      </div>

      <fieldset className="mt-8">
        <legend className="text-lg font-bold text-navy">
          Billing or accounts payable contact<span className="ml-2 font-normal text-ink/85">(optional)</span>
        </legend>
        <div className="mt-3 grid gap-8 sm:grid-cols-2">
          <TextField id={`${P}billingName`} name="billingName" label="Name" optional autoComplete="off" value={d.billingName} onChange={(e) => update("billingName", e.target.value)} />
          <TextField
            id={`${P}billingEmail`}
            name="billingEmail"
            type="email"
            inputMode="email"
            label="Email"
            optional
            autoComplete="off"
            spellCheck={false}
            value={d.billingEmail}
            error={err("billingEmail")}
            onChange={(e) => update("billingEmail", e.target.value)}
          />
        </div>
      </fieldset>

      <div className="mt-8 space-y-8">
        <ChoiceGroup name={`${P}poRequired`} legend="Does your facility require a PO number?" optional columns={3} options={poOptions} value={d.poRequired} onChange={(v) => update("poRequired", v)} />
        <TextArea
          id={`${P}bookers`}
          name="bookers"
          label="Authorized bookers"
          optional
          hint="Names of people who can book rides for your facility"
          value={d.bookers}
          onChange={(e) => update("bookers", e.target.value)}
        />
        <SelectField id={`${P}volume`} name="volume" label="Typical weekly volume" required value={d.volume} error={err("volume")} onChange={(e) => update("volume", e.target.value)}>
          <option value="">Choose one</option>
          {volumeOptions.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </SelectField>
        <ChoiceGroup name={`${P}standing`} legend="Will you need standing schedules?" optional columns={3} options={standingOptions} value={d.standing} onChange={(v) => update("standing", v)} />
      </div>

      {/* Standing-schedule intake. Initials only: no PHI in this form. */}
      <div className="mt-8 border-t-2 border-ink/15 pt-6">
        <button
          id={`${P}standing-toggle`}
          type="button"
          aria-expanded={open}
          aria-controls={`${P}standing-rows`}
          onClick={toggle}
          className="flex min-h-12 w-full items-start gap-3 rounded-xl px-1 py-2 text-left text-navy hover:bg-morning"
        >
          <ChevronIcon className={`mt-1 h-6 w-6 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          <span className="block text-lg font-bold underline decoration-2 underline-offset-4">Add a standing schedule (optional)</span>
        </button>

        <div id={`${P}standing-rows`} data-standing-rows data-state={open ? "open" : "closed"} hidden={!open} className="mt-6">
          <p data-phi-notice className="rounded-xl bg-morning p-4 text-lg font-bold text-navy">
            Initials only. Please don&apos;t send names, dates of birth, diagnoses or street addresses here. We&apos;ll take the pickup address by phone.
          </p>
          <div className="mt-6 space-y-6">
            {d.schedules.map((r, i) => {
              const base = `schedule-${i}`;
              return (
                <fieldset key={rowKeys[i] ?? i} data-schedule-row className="rounded-xl border-2 border-ink/15 p-4 sm:p-5">
                  <legend className="px-1 text-lg font-bold text-navy">Patient {i + 1}</legend>
                  <div className="grid gap-6 sm:grid-cols-3">
                    <TextField
                      id={idFor(`${base}-initials`)}
                      name={`${base}-initials`}
                      label="Patient initials"
                      hint="2 or 3 letters."
                      autoComplete="off"
                      autoCapitalize="characters"
                      spellCheck={false}
                      maxLength={3}
                      value={r.initials}
                      error={err(`${base}-initials`)}
                      onChange={(e) => updateRow(i, { initials: e.target.value })}
                    />
                    <TextField
                      id={idFor(`${base}-time`)}
                      name={`${base}-time`}
                      type="time"
                      label="Chair or appointment time"
                      optional
                      value={r.time}
                      error={err(`${base}-time`)}
                      onChange={(e) => updateRow(i, { time: e.target.value })}
                    />
                    <TextField
                      id={idFor(`${base}-zip`)}
                      name={`${base}-zip`}
                      label="Pickup ZIP"
                      optional
                      inputMode="numeric"
                      autoComplete="off"
                      maxLength={5}
                      value={r.zip}
                      error={err(`${base}-zip`)}
                      onChange={(e) => updateRow(i, { zip: e.target.value })}
                    />
                  </div>
                  <div className="mt-6">
                    <DayPicker
                      id={idFor(`${base}-days`)}
                      value={r.days}
                      onChange={(v, checked) => updateRow(i, { days: checked ? days.filter((x) => x === v || r.days.includes(x)) : r.days.filter((x) => x !== v) })}
                    />
                  </div>
                  <div className="mt-6">
                    <TextField
                      id={idFor(`${base}-notes`)}
                      name={`${base}-notes`}
                      label="Notes"
                      optional
                      hint="Which entrance, who to ask for. No medical details."
                      autoComplete="off"
                      value={r.notes}
                      onChange={(e) => updateRow(i, { notes: e.target.value })}
                    />
                  </div>
                  <button type="button" onClick={() => removeRow(i)} className="mt-4 inline-flex min-h-12 items-center font-bold text-navy underline decoration-2 underline-offset-4">
                    Remove patient {i + 1}
                  </button>
                </fieldset>
              );
            })}
          </div>
          {d.schedules.length < MAX_ROWS ? (
            <button id={`${P}add-row`} type="button" onClick={() => addRow()} className={buttonClass("secondary", "md", "mt-6")}>
              {d.schedules.length === 0 ? "Add a patient" : "Add another patient"}
            </button>
          ) : (
            <p className="mt-6 text-ink/85">That&apos;s {MAX_ROWS} patients, the most this form takes. Add the rest in the notes or on the phone.</p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <TextArea id={`${P}notes`} name="notes" label="Anything else?" optional hint="Please don't include patient names or medical details." value={d.notes} onChange={(e) => update("notes", e.target.value)} />
      </div>

      {/* Honeypot (spam trap). Hidden from people and assistive tech. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${P}website`}>Leave this field empty</label>
        <input id={`${P}website`} name="website" tabIndex={-1} autoComplete="off" value={d.website} onChange={(e) => update("website", e.target.value)} />
      </div>

      <button type="submit" disabled={status === "sending"} aria-disabled={status === "sending"} className={buttonClass("primary", "lg", "mt-8 w-full sm:w-auto sm:min-w-64 disabled:opacity-80")}>
        {status === "sending" ? "Sending…" : "Send account request"}
      </button>
      <p className="mt-4 text-ink/85">
        Jay calls you back within {site.responseTime} during business hours. Or skip the form and call{" "}
        <a href={telHref} className="font-bold text-navy underline">{site.phone.display}</a>.
      </p>
    </form>
  );
}

/** Mon–Sun as a wrapping row of checkboxes: each is a 48px target, and seven fit a phone in two lines. */
function DayPicker({ id, value, onChange }: { id: string; value: string[]; onChange: (day: string, checked: boolean) => void }) {
  return (
    <fieldset id={id} tabIndex={-1} className="focus:outline-none">
      <legend className="text-lg font-bold text-navy">
        Days<span className="ml-2 font-normal text-ink/85">(optional)</span>
      </legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {days.map((day) => {
          const checked = value.includes(day);
          return (
            <label
              key={day}
              htmlFor={`${id}-${day}`}
              className={`flex min-h-12 min-w-[5.25rem] cursor-pointer items-center gap-2 rounded-xl border-2 bg-white px-3 has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-navy ${
                checked ? "border-navy bg-morning" : "border-ink/60"
              }`}
            >
              <input id={`${id}-${day}`} type="checkbox" name={id} value={day} checked={checked} onChange={(e) => onChange(day, e.target.checked)} className="h-6 w-6 shrink-0 accent-navy focus:outline-none" />
              <span className="text-lg font-bold text-navy">{day}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
