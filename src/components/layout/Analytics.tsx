"use client";

import Script from "next/script";
import { useEffect } from "react";
import { site } from "@/config/site";
import { trackEvent } from "@/lib/analytics";

/**
 * Microsoft Clarity (only when a project ID is set in site.ts) plus a single
 * delegated listener that reports every tel: link click as an event.
 * Form inputs are masked: Clarity masks input values by default, and the
 * booking form is also wrapped in data-clarity-mask="true".
 */
export function Analytics() {
  const id = site.analytics.clarityProjectId;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href^="tel:"]');
      if (a) trackEvent("tel_click", a.closest("[aria-label]")?.getAttribute("aria-label") ?? undefined);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  if (!id) return null;
  return (
    <Script id="clarity" strategy="lazyOnload">
      {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script",${JSON.stringify(id)});`}
    </Script>
  );
}
