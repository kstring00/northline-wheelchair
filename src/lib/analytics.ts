/** Thin wrapper over Microsoft Clarity custom events. No-ops if Clarity isn't loaded. */
type ClarityFn = (command: string, ...args: unknown[]) => void;

export function trackEvent(name: "tel_click" | "booking_submitted" | "booking_step", detail?: string) {
  if (typeof window === "undefined") return;
  const clarity = (window as unknown as { clarity?: ClarityFn }).clarity;
  if (!clarity) return;
  clarity("event", name);
  if (detail) clarity("set", name, detail);
}
