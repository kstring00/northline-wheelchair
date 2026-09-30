import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Bricolage_Grotesque } from "next/font/google";
import { site, areaList, hoursSummary } from "@/config/site";
import { robotsMeta } from "@/lib/seo";
import { localBusinessSchema, organizationSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileActionBar } from "@/components/layout/MobileActionBar";
import { Analytics } from "@/components/layout/Analytics";
import "./globals.css";

// Atkinson Hyperlegible was designed by the Braille Institute for low-vision readers.
// Fallback faces are hand-tuned per weight in globals.css (measured against
// Arial and Android's Roboto) so the swap doesn't re-wrap lines (CLS).
const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  adjustFontFallback: false,
  fallback: ["Atkinson Fallback Arial", "Atkinson Fallback Roboto", "system-ui", "sans-serif"],
  variable: "--font-atkinson",
});

// Headings only: one static bold weight keeps the font payload small (LCP).
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
  adjustFontFallback: false,
  fallback: ["Bricolage Fallback Arial", "Bricolage Fallback Roboto", "system-ui", "sans-serif"],
  variable: "--font-bricolage",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `Wheelchair Transportation in North Houston | ${site.name}`,
    template: `%s | ${site.name}`,
  },
  description: `Door-to-door wheelchair van rides in ${areaList()}. ${hoursSummary()}. Call ${site.phone.display} or book online.`,
  applicationName: site.name,
  robots: robotsMeta,
  formatDetection: { telephone: true },
  // Google Search Console: the verification <meta name="google-site-verification">
  // tag is rendered here from site.analytics.googleSiteVerification (CONFIRM).
  ...(site.analytics.googleSiteVerification
    ? { verification: { google: site.analytics.googleSiteVerification } }
    : {}),
};

export const viewport: Viewport = {
  themeColor: "#10284A",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Runs before first paint: flags JS + motion preference so CSS can set initial
// animation states without ever hiding content from no-JS visitors.
const bootScript = `(function(d){var c=d.documentElement.classList;c.add('js');try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)c.add('motion-ok')}catch(e){}})(document)`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US" className={`${atkinson.variable} ${bricolage.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="min-h-dvh pb-[calc(5rem+env(safe-area-inset-bottom))] antialiased lg:pb-0">
        <a
          href="#main"
          className="fixed left-3 top-3 z-[100] -translate-y-24 rounded-full bg-navy-900 px-5 py-3 font-bold text-cream on-dark focus:translate-y-0"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main" tabIndex={-1} className="focus:outline-none">
          {children}
        </main>
        <Footer />
        <MobileActionBar />
        <JsonLd data={[organizationSchema(), localBusinessSchema()]} />
        <Analytics />
      </body>
    </html>
  );
}
