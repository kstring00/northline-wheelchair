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

Put the photo in `public/images/`, then change `images.hero` in `src/config/site.ts` (`src`, `alt`, `width`, `height`) and set `images.heroPhotoReady: true`. Until then the hero shows the brand map pattern. The other photo slots (`owner.photo`, `images.vanRamp`, `images.driverHelping`) work the same way.

### Testimonials

Placeholder reviews have `isPlaceholder: true`, which shows a visible **Sample review** tag. Replace them with real Google reviews (with permission) and set `isPlaceholder: false`.

### Drafts

Guides (`src/content/guides/*.mdx`) carry `draft: true` in frontmatter until Jay approves them. Drafts never enter the sitemap, are always `noindex`, and show a "Draft, pending approval" label while `NEXT_PUBLIC_SITE_LIVE` is false. Hospital drop-off notes use `dropOffNotesDraft` the same way.

### Pricing display mode

`pricing.displayMode` in `site.ts` is Jay's choice: `"full"` (every number), `"startingAt"` (base fare only) or `"quoteOnly"` (rules in words, no numbers). Every mode shows every rule. `npm run test:pricing` renders all three.

### Reviews and ratings

`reviews[]` entries with `isPlaceholder: true` show an "Example review" tag and never enter schema. `AggregateRating`/`Review` JSON-LD appears only when `googleRating` is set and at least one real review exists.

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
| `npm run test:contrast` | Contrast of every text/ground pair, read from the six brand tokens in `globals.css` (body and muted text AAA; Ink on Amber ≥ 4.5) |
| `npm run test:brand` | Brand acceptance (below) |
| `npm run check:copy` | **prebuild.** Fails if draft copy about Jay's life ("my dad", "my own dad") is anywhere in the codebase, or if a claim (N years, rides completed, on-time, $N, Net-30, insured, certified, background-check) is written as literal copy in `src/` instead of coming from a `site.ts` field |
| `npm run check:launch` | **prebuild.** With `NEXT_PUBLIC_SITE_LIVE=true` only: fails on a placeholder phone (555) or street (12345), or if `RESEND_API_KEY`, `BOOKING_TO_EMAIL`, `BOOKING_FROM_EMAIL` or the lead store env is missing |
| `npm run check:claims` | **postbuild.** Reads every rendered page and fails if a claim shows while the `site.ts` field behind it is null (years ↔ `stats.years`, $ ↔ pricing, certified ↔ `safety.driverTraining`, "text you" ↔ `smsEnabled`, …) |
| `npm run test:quote` / `test:partner` | The quote form and `/api/quote`; the facility account + packet forms and `/api/partner` |
| `npm run build:map` | Regenerates `public/brand/service-map.svg` (tries OpenStreetMap Overpass, falls back to the hand-traced coordinates in `scripts/map-data/`) |
| `npm run test:email` | Sends one sample booking email through Resend to `BOOKING_TO_EMAIL` (needs `RESEND_API_KEY`) |
| `npm run test:pricing` | Pricing rules render correctly in all three display modes |
| `npm run test:acceptance` | Phase 1.5 acceptance: service + place in title/H1/first sentence, banned words, NEMT placement, no iframes or external scripts, drafts excluded, schema gating |
| `npm run lighthouse` | Lighthouse mobile ×3 runs (median) for Home, `/book`, `/pricing` and the wheelchair service page |

`npm run screenshots:brand` captures Home, `/about`, a filled-in `/book` success screen and the footer at 390 and 1440 px into `reports/screenshots/brand`.

CI (`.github/workflows/ci.yml`) runs lint, the build with every pre/post-build check, typecheck, contrast and the acceptance run, and asserts that a live build with placeholder contact details fails.

Scripts use Chromium at `/opt/pw-browsers/...` by default; override with `CHROME_PATH`.

## Brand

The site follows *Northline Brand Guidelines v1* (Stringham Web Design, September 2026). The internal sheet at `/brand` (not linked, not indexed) shows every logo tone and brand element.

- **Colour:** six tokens in `src/app/globals.css`: Navy `#16284A`, Signal Amber `#E8A33D`, Cream `#FAF6EE`, Ink `#1E2533`, Morning Blue `#DCE6F5`, Sand `#EFE6D6` (plus white for card surfaces). Tailwind's default palette is switched off, so any other colour class generates nothing. Muted text is `ink/85`, and `cream/80` on navy.
- **Amber** appears only on the pin, the primary button and a route line. The Ride Card's tag pill is amber by spec.
- **Logo:** `<Logo variant="wordmark|stacked|mark" tone="navy|white|ink" withTagline clear />` in `src/components/ui/Logo.tsx`. `clear` pads it by its protection area (height of the N). Never under 24 px tall. Never recolour the pin. Never place it on the pattern without its navy clear-space box.
- **Type:** headings are Bricolage 700–800 with tight tracking. `.poster` is the all-caps Bricolage 800 headline with one word in Navy (`<em>`), and `.poster-fact` is the Bricolage 500 line under it. `.label` is Atkinson 700 13 px uppercase. Body is Atkinson 18/28.
- **Pattern:** `public/brand/pattern-navy.svg` and `pattern-sand.svg`, used through `.pattern-navy` / `.pattern-sand`. They sit at natural size and are never tiled or stretched. They appear on the hero slot (until the photo arrives), the footer, the Ride Card back and at most one section ground per page. The amber A-to-B route is drawn once, over the hero only. **The files in the repo are provisional stand-ins; replace them with the brand book exports (under 60 KB each, no amber).**
- **Brand elements:** `src/components/brand/`: `RideCard` (booking success, `/partners` sample), `SmsMock` (how it works), `DriverBadge` (`/about` team), `ContactBlock` (business-card back: `/contact`, footer, 404).

### Brand launch checklist (`npm run test:brand`, server running)

- [ ] Logo renders in all three tones; pin fill is always `#E8A33D`; header and footer clear space ≥ height of the N with nothing inside it; every logo ≥ 24 px tall.
- [ ] Every colour literal in `src/`, `scripts/` and `public/*.svg` is one of the six tokens or white (stray list printed).
- [ ] Amber only on pin / primary button / route line (source lines and computed styles both listed).
- [ ] Favicon set and the 1200×630 share image are regenerated from the logomark and wordmark (`npm run assets:icons`; `/opengraph-image`).
- [ ] `npm run test:contrast` passes every pair.
- [ ] The booking success screen shows a Ride Card with the rider's own inputs (`npm run test:booking`).
- [ ] `/public` holds only brand SVGs, generated icons and photo placeholders (inventory printed).
- [ ] Pattern SVGs under 60 KB each and not provisional.
- [ ] Lighthouse mobile ≥ 90 on Home, `/book`, `/pricing` (`npm run lighthouse`).

## Owner copy, reviews and bookings

- **Owner note.** `owner.note` and `owner.noteHeadline` in `site.ts` are empty until Jay writes them (questionnaire Q11). While empty, the Home section shows a marked placeholder in his layout. Nothing on the site describes Jay's life until he writes it; `check:copy` enforces the two phrases from the old draft.
- **Reviews.** `reviews` in `site.ts` is empty. No review, quote or star renders anywhere until it holds an entry with `isPlaceholder: false`. The Google rating badge renders only when `googleRating` is set; the "Leave a review" button only when `googleReviewUrl` is set. The mechanism the section promises: `src/content/sms.ts` holds the post-ride text (`reviewRequestSms`), and `src/lib/sms.ts` has the "Send review request" action (`sendReviewRequest`) for the Phase 2 admin ride view. Sending is Twilio, Phase 2.
- **Unconfirmed facts render nothing.** Stats, pricing numbers and rules, every safety list, certifications, drop-off notes (live site: only notes with `confirmed: true`), local notes and `site.partners` lines are null/empty in `site.ts` until Jay confirms them. A section that would be empty shows one line instead: "Jay is confirming these details. Call (phone) and we'll answer directly." (`<Unconfirmed />`). FAQ answers whose facts are null are left out of the page and the schema. Each removed claim is an `ASK JAY:` comment at the spot it came from.
- **Texts.** `smsEnabled` is `false`. It drives every text promise: Text us buttons, "call or text", the SMS mock, the Ride Card footer and the confirmation wording. `src/content/sms.ts` and `src/lib/sms.ts` are Phase 2 code; nothing user-facing uses them until texts send.
- **Forms.** `/book` (five required fields; the pickup window is optional), `/pricing` quote form and the `/partners` account and packet forms post to `/api/book`, `/api/quote` and `/api/partner`. All three share `src/lib/leads.ts`: honeypot, per-IP rate limit, a reference number `NL-YYMMDD-XXXX` (Chicago date) shown to the sender and in Jay's email, then the lead is **stored** (Upstash Redis, one JSON record per lead on `leads:{kind}`) and **emailed** (Resend). A route answers `ok` when either succeeded. In production (`VERCEL_ENV=production`) it never answers `ok` without delivering: it returns 503 with the phone number. Booking "today" is Houston's today (America/Chicago), on the client and the server.
- **Env.** `RESEND_API_KEY`, `BOOKING_TO_EMAIL` (Jay's inbox, CONFIRM), `BOOKING_FROM_EMAIL` (a Resend-verified domain, CONFIRM), `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (or the `KV_REST_API_*` pair). A live build fails without them (`check:launch`).

## Placeholder assets

`npm run assets:placeholders` regenerates the photo placeholders. They are flat Sand cards naming the photo that goes there, with no illustration. `npm run assets:icons` regenerates the favicon, apple-touch icon, manifest icons and `logo.png` from the logomark (navy N on cream, amber pin).
