import { site } from "@/config/site";
import { Unconfirmed } from "@/components/ui/Unconfirmed";

type Key = keyof typeof site.partners;

const headings: Record<Key, string> = {
  directLine: "One direct line",
  standingSchedules: "Standing schedules",
  confirmations: "Confirmations",
  invoicing: "Invoicing",
};

/**
 * "How it works for a facility": each site.partners line renders only when Jay
 * has confirmed it (non-null). With none set, the whole block is <Unconfirmed />.
 */
export function PartnerLines({ keys = ["directLine", "standingSchedules", "confirmations", "invoicing"], className = "" }: { keys?: Key[]; className?: string }) {
  const lines = keys.flatMap((k) => {
    const v = site.partners[k];
    return v ? [{ k, heading: headings[k], body: v }] : [];
  });
  if (!lines.length) return <Unconfirmed className={className} />;
  return (
    <ul className={`grid gap-8 md:grid-cols-2 ${className}`}>
      {lines.map((l) => (
        <li key={l.k} className="border-t-4 border-navy pt-4">
          <h3 className="text-xl font-bold">{l.heading}</h3>
          <p className="mt-2 text-lg">{l.body}</p>
        </li>
      ))}
    </ul>
  );
}
