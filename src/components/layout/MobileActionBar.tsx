import Link from "next/link";
import { telHref, bookHref } from "@/config/site";
import { t } from "@/content/dictionary";
import { CalendarIcon, PhoneIcon } from "@/components/ui/Icons";

/** Sticky bottom bar on phones and tablets: two equal actions plus the callback promise. */
export function MobileActionBar() {
  const btn = "flex min-h-14 items-center justify-center gap-2 rounded-full text-lg font-bold no-underline";
  return (
    <nav
      aria-label={t.nav.quickActions}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-hairline bg-cream/95 px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur lg:hidden"
    >
      <p className="mb-1.5 text-center text-xs font-bold text-muted">{t.response.callbackShort} during business hours</p>
      <div className="mx-auto grid max-w-xl grid-cols-2 gap-3">
        <a href={telHref} className={`${btn} bg-navy-900 text-cream on-dark`}>
          <PhoneIcon /> {t.actions.call}
        </a>
        <Link href={bookHref} className={`${btn} bg-amber text-navy-950`}>
          <CalendarIcon /> {t.actions.book}
        </Link>
      </div>
    </nav>
  );
}
