import { site } from "@/config/site";
import { t } from "@/content/dictionary";
import { CheckIcon, CloseIcon } from "@/components/ui/Icons";

type Row = { can: boolean | null; yes: string; no: string; unknown: string };

/**
 * "We can / We can't", driven by site.capabilities. A null capability lands
 * in a third "Ask us" list rather than being guessed. All CONFIRM.
 */
function List({ title, items, tone }: { title: string; items: string[]; tone: "can" | "cant" | "ask" }) {
  return (
    <div className={`rounded-[var(--radius-card)] p-6 ${tone === "can" ? "bg-white" : tone === "cant" ? "bg-navy text-cream on-dark" : "border border-ink/15 bg-cream"}`}>
      <h3 className={`text-xl font-bold ${tone === "cant" ? "!text-cream" : ""}`}>{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((x) => (
          <li key={x} className={`flex gap-3 ${tone === "cant" ? "text-cream/80" : ""}`}>
            <span aria-hidden="true" className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${tone === "can" ? "bg-navy text-cream" : tone === "cant" ? "bg-cream text-navy" : "bg-morning text-navy"}`}>
              {tone === "cant" ? <CloseIcon className="h-4 w-4" /> : tone === "can" ? <CheckIcon className="h-4 w-4" /> : <span className="text-sm font-bold">?</span>}
            </span>
            <span>{x}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CanAndCant({ heading = "What we can and can't do" }: { heading?: string }) {
  const c = site.capabilities;
  const rows: Row[] = [
    { can: c.ownChair, yes: "You stay in your own manual or power wheelchair", no: "Carry riders in their own power chair", unknown: "Riding in your own power chair" },
    { can: c.provideChair, yes: "Bring a wheelchair if you don't have one", no: "Provide a wheelchair", unknown: "Providing a wheelchair" },
    { can: c.walker, yes: "Help riders who use a walker or cane", no: "Take riders who use a walker", unknown: "Riders with a walker" },
    { can: c.walkWithHelp, yes: "Give a steady arm to riders who can walk with help", no: "Assist riders who walk with help", unknown: "Riders who walk with help" },
    { can: c.bariatricMaxLbs !== null, yes: `Carry riders and chairs up to ${c.bariatricMaxLbs} lbs on the lift`, no: "", unknown: "Weight limit for the lift" },
    { can: c.oxygen, yes: "Ride with portable oxygen, secured beside you", no: "Carry oxygen on board", unknown: "Portable oxygen" },
    { can: c.serviceAnimals, yes: "Welcome service animals", no: "Take service animals", unknown: "Service animals" },
    { can: c.maxCompanions !== null && c.maxCompanions > 0, yes: `Bring up to ${c.maxCompanions} companions along`, no: "Take companions", unknown: "Companions" },
    { can: c.stretcher, yes: "Take stretcher rides", no: "Take stretcher rides. We'll help you find who does.", unknown: "Stretcher rides" },
    { can: c.stairs, yes: "Help with a few steps at the door", no: "Carry riders up or down stairs", unknown: "Stairs at your door" },
    { can: c.driversLift, yes: "Lift riders for a short transfer", no: "Lift riders. You ride in your chair, on our ramp or lift.", unknown: "Lifting riders" },
  ];
  const can = rows.filter((r) => r.can === true);
  const cant = rows.filter((r) => r.can === false);
  const ask = rows.filter((r) => r.can === null);

  return (
    <section aria-labelledby="canandcant-heading" className="bg-sand py-16 sm:py-20 lg:py-24">
      <div className="container-page">
        <p className="mb-3 label text-navy">Plain answers</p>
        <h2 id="canandcant-heading" className="max-w-3xl text-[2rem] font-bold sm:text-[2.5rem]">{heading}</h2>
        <p className="mt-4 max-w-3xl text-lg text-ink/85">We&apos;d rather tell you now than surprise you at the door. If your situation isn&apos;t here, call and ask.</p>
        <div className={`mt-10 grid gap-5 ${ask.length ? "lg:grid-cols-3" : "md:grid-cols-2"}`}>
          <List title={t.labels.weCan} items={can.map((r) => r.yes)} tone="can" />
          <List title={t.labels.weCant} items={cant.map((r) => r.no)} tone="cant" />
          {ask.length > 0 && <List title={t.labels.askUs} items={ask.map((r) => r.unknown)} tone="ask" />}
        </div>
        {/* CONFIRM every capability with Jay. */}
      </div>
    </section>
  );
}
