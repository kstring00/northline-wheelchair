/** Small inline icons. Always paired with visible text; hidden from AT. */
type P = { className?: string };
const common = { "aria-hidden": true, focusable: false, fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", viewBox: "0 0 24 24" } as const;

export const PhoneIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...common} className={className}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" /></svg>
);
export const CalendarIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...common} className={className}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
);
export const CheckIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...common} className={className}><path d="M20 6 9 17l-5-5" /></svg>
);
export const ArrowRightIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...common} className={className}><path d="M5 12h14M13 5l7 7-7 7" /></svg>
);
export const AlertIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...common} className={className}><circle cx="12" cy="12" r="10" /><path d="M12 8v5M12 16h.01" /></svg>
);
export const ChevronIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...common} className={className}><path d="m6 9 6 6 6-6" /></svg>
);
export const PinIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...common} className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></svg>
);
export const ClockIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...common} className={className}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
);
export const ShieldIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...common} className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
);
export const MenuIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...common} className={className}><path d="M3 6h18M3 12h18M3 18h18" /></svg>
);
export const CloseIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...common} className={className}><path d="M18 6 6 18M6 6l12 12" /></svg>
);
