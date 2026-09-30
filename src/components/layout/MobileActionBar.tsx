import Link from "next/link";
import { telHref, bookHref } from "@/config/site";
import { CalendarIcon, PhoneIcon } from "@/components/ui/Icons";

/** Sticky bottom bar on phones and tablets: two equal, always-reachable actions. */
export function MobileActionBar() {
  const btn = "flex min-h-14 items-center justify-center gap-2 rounded-full text-lg font-bold no-underline";
  return (
    <nav
      aria-label="Quick actions"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-hairline bg-cream/95 px-3 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] backdrop-blur lg:hidden"
    >
      <div className="mx-auto grid max-w-xl grid-cols-2 gap-3">
        <a href={telHref} className={`${btn} bg-navy-900 text-cream on-dark`}>
          <PhoneIcon /> Call Now
        </a>
        <Link href={bookHref} className={`${btn} bg-amber text-navy-950`}>
          <CalendarIcon /> Book a Ride
        </Link>
      </div>
    </nav>
  );
}
