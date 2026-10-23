# Handoff

Last updated: 2026-10-23

Repository: https://github.com/3mrNour/yuzersef (public)

This document summarizes what is built, how it was verified, what is still open, and where to start next.

## Status

The site is functionally complete for a competition build.

- Arabic-first RTL marketing site with an English toggle
- Services, portfolio, process, about, FAQ, and contact on the home page
- Request form with validation and a generated tracking code
- Order tracking with a demo code
- Studio preview page, clearly labelled as a placeholder
- Privacy, terms, and 404 pages
- Express API with JSON persistence, validation, and in-memory rate limiting
- Placeholder brand mark and ten portfolio SVGs
- Root, frontend, backend, and scripts documentation

Build and typechecks pass. Core flows were exercised in a browser against the running API.

## What was done

### Frontend

- Vite + React 19 + TypeScript + Tailwind CSS v4
- Design tokens, dark theme, forest/bone/sand palette, shape system
- RTL by default and LTR in English via `LanguageProvider`
- Language preference stored in `localStorage` under `yuzersef.lang`
- Sections:
  - Hero with print-proof collage and rotating Arabic/English word
  - Asymmetric services bento with two large and two small cards
  - Studio teaser and studio page with demo label
  - Process rail with scroll-linked progress
  - Portfolio gallery with category filters and DEMO tags
  - About, FAQ accordion, contact section
- Request page with `?service=` prefill, inline validation, success state, tracking CTA
- Track page with `?code=` prefill, auto lookup, status rail, not-found and error states
- Contact form with validation, success/error states, privacy link, WhatsApp fallback
- Header with mobile menu, language toggle in the mobile menu, desktop request CTA
- Footer with navigation, contact links, social links, legal links
- Scroll manager for hash navigation
- Reduced-motion support
- Fonts: Reem Kufi Arabic subsets, IBM Plex Sans Arabic, Space Grotesk Latin subsets

### Backend

- Express 5 API with Zod validation
- Egyptian phone normalization for Arabic and Persian digits
- Request creation with generated code
- Public tracking lookup
- Contact message storage
- In-memory rate limiting per IP
- JSON store with temp file and rename writes
- Seed request with code `YZ-DEMO-0001`
- Health and services endpoints

### Assets and docs

- Placeholder logo and ten portfolio SVGs
- Generator script at `scripts/generate-placeholders.mjs`
- Root README, frontend README, backend README, scripts README
- This handoff document

## Verification performed

### Commands

From `frontend/`:

```powershell
node "..\node_modules\typescript\bin\tsc" --noEmit
node "..\node_modules\vite\bin\vite.js" build
```

From `backend/`:

```powershell
node "..\node_modules\typescript\bin\tsc" --noEmit
```

Results:

- Both TypeScript checks pass.
- Vite production build passes.
- Build output: 5035 modules, `index.js` 538.55 kB minified, 163.39 kB gzip.
- One Vite warning about chunks larger than 500 kB. No errors.

### Browser checks

Checked at 360x800 and 1440x1000 with the Vite dev server and the API running.

- No horizontal page overflow (`scrollWidth` 345 at 360, 1425 at 1440).
- No clipped text detected outside intentionally hidden `sr-only` content.
- No interactive controls under 44px tall on the home page after fixes.
- Header fits at 360. Logo, menu button, and language menu all usable.
- Mobile menu links are 52px tall. Language toggle in the menu is 44px.
- Hero collage stays inside the viewport at both widths.
- Services grid is balanced at 1440. Large cards and small cards each have equal row heights.
- Portfolio filter works and preserves layout.
- FAQ accordion opens one item at a time and closes the previous item.
- Language toggle changes `lang`, `dir`, title, navigation, form labels, and validation messages.
- Request form: empty submission shows errors and focuses the first invalid field.
- Request form: valid submission returns a code, focuses the success panel, and the track CTA loads the created request.
- Track page: valid code displays status, date, service, and quantity.
- Track page: unknown code shows the localized not-found message.
- Contact form: valid submission clears fields, shows success, and focuses the status message.
- Studio page shows demo labels and placeholder framing.
- Privacy, terms, and 404 pages render without overflow.
- No console errors or warnings on the home page after final reload.

Screenshots cannot be visually inspected by the agent that built this. Layout checks used DOM geometry and accessibility data. A human design review is still recommended.

## Current home page metrics

At 1440:

- Page height: about 9,820px
- Services section: about 1,272px, four cards of 442px height
- Footer: about 793px

At 360:

- Page height: about 14,017px
- Services section: about 1,929px
- Portfolio section: about 4,735px with ten single-column cards
- Footer: about 1,400px

The mobile page is long. This is a design choice, not a bug. See remaining work for options.

## Important constraints

- Do not invent a founding year, client counts, statistics, testimonials, prices, address, email, opening hours, or delivery promises.
- Real contact data:
  - WhatsApp: `01116891025`
  - Instagram: `@yuzersef___`
  - Location: Aswan
- TikTok and Facebook links are search URLs, not confirmed profiles.
- All copy is in `frontend/src/content/index.ts`. Keep Arabic and English in sync.
- All placeholder visuals must keep a DEMO label until replaced.
- The brand voice is Egyptian Arabic, direct and playful. Avoid em dashes in copy.
- The site is dark-theme only by design.
- Do not replace the asymmetric hero or bento with a generic centered hero or three equal cards.

## Known issues and limitations

1. Real logo and portfolio artwork are missing. Current files are generated placeholders.
2. TikTok and Facebook profile URLs are unverified search links.
3. The studio preview is a placeholder. No interactive product mockup exists.
4. No automated tests. Verification was manual.
5. JSON storage is single-process and not production-grade.
6. Rate limiting is in memory and resets on restart.
7. There is no admin UI or API to list requests or contact messages. Leads are stored but not readable from the app.
8. Per-route titles and social metadata are not implemented. The title depends on language, not page.
9. There is no OG image. The Twitter card is `summary`.
10. The production bundle is 538 kB minified. A route split would reduce the initial payload.
11. Windows npm workspace scripts fail when the repository path contains `&`. Use the direct commands in the README files.
12. One transient Vite HMR error (`ERR_NO_BUFFER_SPACE` for `@react-refresh`) was seen once during development. A reload fixed it and it did not reproduce.
13. English display headings use Space Grotesk because only the Arabic Reem Kufi subset is loaded. This is intentional.

## Recommended next work

Priority order:

1. Replace the placeholder logo and portfolio images with real brand assets. Update alt text and paths in the content file.
2. Confirm TikTok and Facebook profile URLs, then update `frontend/src/content/index.ts`.
3. Decide whether the studio preview is in scope. If not, keep it clearly labelled. If yes, scope a separate interactive build.
4. Add an admin path for reviewing requests and contact messages, or forward submissions to email/CRM.
5. Replace JSON storage with a database. Add migrations, backups, and a retention policy.
6. Add automated tests:
   - API validation and rate limiting
   - Request creation and tracking
   - Contact submission
   - Language toggle and direction
   - Portfolio filters and FAQ
   - Keyboard and mobile menu behavior
7. Add per-route metadata and an OG image if the site is shared on social platforms.
8. Review mobile page length. Options: two-column portfolio with redesigned compact captions, show six items with a load-more control, or collapse some footer groups.
9. Add route-level code splitting if the initial bundle size matters.
10. Deploy with HTTPS, set `ALLOWED_ORIGINS`, and persist backend data.
11. Have a native Arabic speaker proofread both languages.

## Key files

| File | Why it matters |
| --- | --- |
| `frontend/src/content/index.ts` | All copy, services, portfolio, legal content |
| `frontend/src/index.css` | Tokens, base styles, animations, reduced motion |
| `frontend/src/main.tsx` | Fonts and providers |
| `frontend/src/App.tsx` | Routes and shell |
| `frontend/src/components/Header.tsx` | Sticky header, mobile menu, language access |
| `frontend/src/sections/Hero.tsx` | Hero layout |
| `frontend/src/components/HeroCollage.tsx` | Print-proof collage and tile positions |
| `frontend/src/sections/Services.tsx` | Bento layout |
| `frontend/src/components/PortfolioGallery.tsx` | Filters, masonry, DEMO tags |
| `frontend/src/components/ContactForm.tsx` | Contact validation and submission |
| `frontend/src/pages/RequestPage.tsx` | Request form and success flow |
| `frontend/src/pages/TrackPage.tsx` | Tracking lookup and URL prefill |
| `frontend/src/components/TrackStatus.tsx` | Status rail |
| `frontend/src/providers/LanguageProvider.tsx` | Language, direction, metadata |
| `frontend/src/lib/api.ts` | API client |
| `backend/src/app.ts` | Routes, schemas, rate limits |
| `backend/src/store.ts` | Persistence |
| `backend/src/data/seed.ts` | Demo request |
| `scripts/generate-placeholders.mjs` | Placeholder asset generator |

## Local reset

To reset requests and contact messages:

1. Stop the API.
2. Delete `backend/data/store.json`.
3. Start the API again. The seed request is recreated.

The JSON store is gitignored. Test data created during development was removed before the initial commit.

## Repository

Public repository: https://github.com/3mrNour/yuzersef

Default branch: `main`.

Use `npm install` at the root before running either workspace.
