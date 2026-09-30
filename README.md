# Northline Wheelchair Transportation

Website for Northline Wheelchair Transportation, a non-emergency wheelchair van service in north Houston.

**Stack:** Next.js 16 (App Router, every page statically generated), Tailwind CSS v4, GSAP 3 (lazy-loaded, only where used), `next/image`, `next/font`. Deploy target: Vercel.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Where things live

| What | Where |
| --- | --- |
| **Every business fact** (name, phone, hours, areas, services, stats, reviews, analytics IDs) | `src/config/site.ts` |
| FAQ copy | `src/content/faq.ts`, `src/content/services.ts` |
| Design tokens (colors, type, spacing) | `src/app/globals.css` (`@theme`) |
| JSON-LD builders | `src/lib/schema.ts` |
| Page metadata helper | `src/lib/seo.ts` |
| Booking flow | `src/components/booking/` |
| Animations (GSAP) | `src/components/**/*Motion.tsx`, loader in `src/components/motion/gsap.ts` |

Every unconfirmed value is marked `// CONFIRM`. List them with:

```bash
grep -rn "CONFIRM" src
```

### Swap the hero photo

Put the photo in `public/images/`, then change `images.hero` in `src/config/site.ts`: `src`, `alt`, `width`, `height`. Nothing else changes. The other photo slots (`owner.photo`, `images.vanRamp`, `images.driverHelping`) work the same way.

### Testimonials

Placeholder reviews have `isPlaceholder: true`, which shows a visible **Sample review** tag. Replace them with real Google reviews (with permission) and set `isPlaceholder: false`.

## Launch switch: `NEXT_PUBLIC_SITE_LIVE`

Default is **off** (unset or `false`). While off:

- `robots.txt` disallows all crawlers.
- Every page has `<meta name="robots" content="noindex, nofollow">`.
- The sitemap is not advertised in `robots.txt` (it still exists at `/sitemap.xml`).

On launch day, set `NEXT_PUBLIC_SITE_LIVE=true` in Vercel → Project → Settings → Environment Variables (**Production** only), then redeploy. See `.env.example`.

## Analytics

- **Microsoft Clarity:** set `analytics.clarityProjectId` in `site.ts`. Empty means no script. The booking form is wrapped in `data-clarity-mask="true"`. Events: `tel_click` (every `tel:` link), `booking_step`, `booking_submitted`.
- **Google Search Console:** set `analytics.googleSiteVerification` in `site.ts`. The `<meta name="google-site-verification">` tag is rendered by the root layout (`src/app/layout.tsx`) only when set.

## Quality checks

Run against a production build (`npm run build && npm start`):

| Command | Checks |
| --- | --- |
| `npm run test:site` | Crawls every internal link; per page: status, title/description/canonical/OG, one H1, alt text, JSON-LD types, 360px overflow, 48px tap targets, Call/Book bar, axe (WCAG 2.2 AA) |
| `npm run test:booking` | Keyboard-only walkthrough of `/book` (focus management, validation, success, no-JS fallback) |
| `npm run test:motion` | Reduced motion shows final states instantly; full motion animates and settles |
| `npm run test:inp` | Interaction latency on a 4× CPU-throttled phone |
| `npm run test:schema` | JSON-LD against the schema.org vocabulary (set `SCHEMA_VOCAB` to a local copy of `schemaorg-current-https.jsonld`) |
| `npm run test:contrast` | Palette contrast ratios (body text AAA) |
| `npm run lighthouse` | Lighthouse mobile ×3 runs (median) for Home, `/book` and the wheelchair service page |

Scripts use Chromium at `/opt/pw-browsers/...` by default; override with `CHROME_PATH`.

## Placeholder assets

`npm run assets:placeholders` regenerates the duotone placeholder photos. `npm run assets:icons` regenerates the favicon, apple-touch icon, manifest icons and `logo.png` from the brand mark.
