"use client";

import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";
import { AlertIcon } from "@/components/ui/Icons";

/*
 * Form primitives. Pattern: label → hint → error → control, all wired with
 * aria-describedby. Errors use an icon + "Error:" prefix so they never rely on
 * colour alone.
 */

export const controlClass =
  "block w-full min-h-14 rounded-xl border-2 border-ink/60 bg-white px-4 py-3 text-lg text-ink placeholder:text-ink/70 aria-[invalid=true]:border-navy aria-[invalid=true]:border-[3px]";

function describedBy(id: string, hint?: ReactNode, error?: string) {
  return [hint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined;
}

export function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={`${id}-error`} className="mt-2 flex items-start gap-2 font-bold text-ink">
      <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
      <span>Error: {error}</span>
    </p>
  );
}

type Base = { id: string; label: ReactNode; hint?: ReactNode; error?: string; optional?: boolean };

function Label({ id, label, optional }: { id: string; label: ReactNode; optional?: boolean }) {
  return (
    <label htmlFor={id} className="block text-lg font-bold text-navy">
      {label}
      {optional && <span className="ml-2 font-normal text-ink/85">(optional)</span>}
    </label>
  );
}

export function TextField({ id, label, hint, error, optional, ...rest }: Base & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <Label id={id} label={label} optional={optional} />
      {hint && <p id={`${id}-hint`} className="mt-1 text-ink/85">{hint}</p>}
      <FieldError id={id} error={error} />
      <input
        id={id}
        name={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        required={!optional}
        className={`${controlClass} mt-2`}
        {...rest}
      />
    </div>
  );
}

export function TextArea({ id, label, hint, error, optional, ...rest }: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <Label id={id} label={label} optional={optional} />
      {hint && <p id={`${id}-hint`} className="mt-1 text-ink/85">{hint}</p>}
      <FieldError id={id} error={error} />
      <textarea
        id={id}
        name={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        required={!optional}
        className={`${controlClass} mt-2 min-h-32`}
        {...rest}
      />
    </div>
  );
}

export function SelectField({ id, label, hint, error, optional, children, ...rest }: Base & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <Label id={id} label={label} optional={optional} />
      {hint && <p id={`${id}-hint`} className="mt-1 text-ink/85">{hint}</p>}
      <FieldError id={id} error={error} />
      <select
        id={id}
        name={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={`${controlClass} mt-2 appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2316284A%22 stroke-width=%222.5%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:1.5rem] bg-[right_1rem_center] bg-no-repeat pr-12`}
        {...rest}
      >
        {children}
      </select>
    </div>
  );
}

type ChoiceOption = { value: string; label: string; hint?: string };

/**
 * Large radio or checkbox cards inside a fieldset/legend. The native input
 * stays in the DOM (keyboard + screen reader behaviour for free); the whole
 * card is its label.
 */
export function ChoiceGroup({
  name,
  legend,
  hint,
  error,
  options,
  type = "radio",
  value,
  onChange,
  columns = 1,
  legendClassName = "text-lg",
  optional,
}: {
  name: string;
  legend: ReactNode;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  options: ChoiceOption[];
  type?: "radio" | "checkbox";
  value: string | string[];
  onChange: (value: string, checked: boolean) => void;
  columns?: 1 | 2 | 3 | 4 | 7;
  legendClassName?: string;
}) {
  const cols = { 1: "", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4", 7: "grid-cols-4 sm:grid-cols-7" }[columns];
  return (
    <fieldset id={name} tabIndex={-1} aria-describedby={describedBy(name, hint, error)} aria-invalid={error ? true : undefined} className="focus:outline-none">
      <legend className={`font-bold text-navy ${legendClassName}`}>
        {legend}
        {optional && <span className="ml-2 font-normal text-ink/85">(optional)</span>}
      </legend>
      {hint && <p id={`${name}-hint`} className="mt-1 text-ink/85">{hint}</p>}
      <FieldError id={name} error={error} />
      <div className={`mt-3 grid gap-3 ${cols}`}>
        {options.map((o) => {
          const checked = Array.isArray(value) ? value.includes(o.value) : value === o.value;
          const id = `${name}-${o.value}`;
          return (
            <label
              key={o.value}
              htmlFor={id}
              className={`relative flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border-2 bg-white p-4 transition-colors duration-150 has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-navy ${
                checked ? "border-navy bg-morning" : "border-ink/60 hover:border-cream/25"
              } ${error && !checked ? "border-navy" : ""}`}
            >
              <input
                id={id}
                type={type}
                name={name}
                value={o.value}
                checked={checked}
                onChange={(e) => onChange(o.value, e.target.checked)}
                className="mt-0.5 h-6 w-6 shrink-0 accent-navy focus:outline-none"
              />
              <span>
                <span className="block text-lg font-bold leading-snug text-navy">{o.label}</span>
                {o.hint && <span className="mt-0.5 block text-base text-ink/85">{o.hint}</span>}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
