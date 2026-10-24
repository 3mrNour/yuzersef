# Handoff

Last updated: 2026-10-24

Repository: https://github.com/3mrNour/yuzersef (public)

This document summarizes what is built, how it was verified, what is still open, and where to start next.

## Status

The site is functionally complete for a competition build.

- Arabic-first RTL marketing site with an English toggle
- Services, portfolio, process, about, FAQ, and contact on the home page
- Request form with validation and a generated tracking code
- Order tracking with generated request codes
- Interactive mockup studio with logo upload, canvas preview, PNG export, and request handoff
- Privacy, terms, and 404 pages
- Express API with MongoDB persistence, validation, and in-memory rate limiting
- Placeholder brand mark, ten portfolio SVGs, and generated studio product artwork
- 11 geometry tests for the studio
- Root, frontend, backend, and scripts documentation

Build, typechecks, tests, and production preview pass. Core flows were exercised in a browser against the running API.

## What was done

### Frontend

- Vite + React 19 + TypeScript + Tailwind CSS v4
- Design tokens, dark theme, forest/bone/sand palette, shape system
- RTL by default and LTR in English via `LanguageProvider`
- Language preference stored in `localStorage` under `yuzersef.lang`
- Sections:
  - Hero with print-proof collage and rotating Arabic/English word
  - Asymmetric services bento with two large and two small cards
  - Studio teaser with lightweight preview and a full interactive `/studio` workspace
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

### Studio

- `StudioSlot` has a lightweight `preview` variant for the home teaser and a `full` variant for `/studio`.
- The full variant lazy-loads `MockupStudio`, so the home page does not ship the canvas editor.
- `/dev/print-area` is registered only in development for print-area calibration.
- Product data is in `frontend/src/features/studio/mockProducts.ts` with three demo products: tee, mug, and cap.
- `studioApi.ts` validates the data and adds a short fake delay. The API contract is unchanged.
- `renderMockup.ts` draws a tinted product base, logo, shading, and optional guides, then exports a 1200px PNG.
- `DesignDraft.tsx` keeps the exported PNG and `DesignState` in memory.
- The studio CTA exports the PNG, stores the draft, and navigates to `/request?service=...` when the product category maps to a service.
- `RequestPage` shows the attached design, product, colour, view, and logo name, with actions to try another design or remove it.
- The exported Studio preview is converted to an image data URL during request submission and persisted on the print request with the uploaded logo filename. The Admin detail panel can preview and download it.
- `PrintAreaEditor.tsx` is shared by the studio and the dev-only calibration page; it has no `LanguageProvider` dependency.

### Backend

- Express 5 API with Zod validation
- Egyptian phone normalization for Arabic and Persian digits
- Request creation with generated code
- Public tracking lookup
- Contact message storage
- In-memory rate limiting per IP
- Mongoose models for requests and contact messages
- Protected admin API for reviewing requests and contact messages
- Admin dashboard at `/admin` with session-only key access, summaries, pagination, filtering, and status updates
- Admin-controlled print-position settings per service, consumed by the customer request form
- Per-item print placement and saved Studio preview metadata for production review
- Backend validation and admin authorization tests
- Health and services endpoints

### Assets and docs

- Placeholder logo and ten portfolio SVGs
- Studio product artwork and preview SVGs in `frontend/public/mock/`
- Generator scripts at `scripts/generate-placeholders.mjs` and `scripts/generate-mock-products.mjs`
- Root README, frontend README, backend README, scripts README
- This handoff document

## Verification performed

### Commands

From `frontend/`:

```powershell
node "..\node_modules\typescript\bin\tsc" --noEmit
node "..\node_modules\vitest\vitest.mjs" run
node "..\node_modules\vite\bin\vite.js" build
```

From `backend/`:

```powershell
node "..\node_modules\typescript\bin\tsc" --noEmit
```

Results:

- Both TypeScript checks pass.
- Vitest: 11 of 11 geometry tests pass.
- Vite production build passes.
- Build output: 5045 modules, `index.js` 560.46 kB minified, 169.70 kB gzip.
- Studio chunks: `MockupStudio` 30.81 kB, `DevPrintAreaPage` 8.06 kB, `geometry` 0.99 kB.
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
- Studio page renders the product switcher, editor canvas, and demo labels.
- Studio logo upload renders on the tee and enables the request CTA.
- Studio product switching keeps the logo and updates the product/view label.
- Studio colour and view switching work; the canvas stays inside its stage.
- Studio export produces a blob image (`1200x1467` for the tee) and navigates to the request page.
- The attached design card shows product, colour, view, logo name, preview, and demo tag.
- `/request?service=clothing` prefills the service from the studio handoff.
- Mobile studio at 390px has no horizontal overflow; canvas width is 309px.
- `/dev/print-area` renders in development and falls through to 404 in the production preview.
- Production preview serves `/studio`; no console errors were recorded.
- English mode, privacy, terms, and 404 pages render without overflow.
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
- The studio must not claim backend persistence. The PNG and `DesignState` are client-side only until an upload endpoint exists.
- Studio product artwork is generated, not photographed. Keep the demo framing clear.
- Do not change the `Product`, `ProductView`, or `DesignState` contract without a migration plan for `mockProducts.ts`, the renderer, and the draft handoff.

## Known issues and limitations

1. Real logo and portfolio artwork are missing. Current files are generated placeholders.
2. TikTok and Facebook profile URLs are unverified search links.
3. Studio product artwork is generated SVG, not photographed products. Print areas are calibrated for these demo assets only.
4. Studio PNG and `DesignState` are not uploaded or persisted. The request page preview is in memory and is lost on reload.
5. Automated tests cover geometry only. API, request, tracking, contact, language, and UI flows are still manual.
6. MongoDB persistence is configured, but production backups and retention rules still need to be established.
7. Rate limiting is in memory and resets on restart.
8. The `/admin` UI uses the protected admin API to review requests/contact messages and update request status.
9. Per-route titles and social metadata are not implemented. The title depends on language, not page.
10. There is no OG image. The Twitter card is `summary`.
11. The production bundle is about 560 kB minified. The home route still ships the request/track/studio preview code. Further route-level splitting would reduce the initial payload.
12. Windows npm workspace scripts fail when the repository path contains `&`. Use the direct commands in the README files.
13. One transient Vite HMR error (`ERR_NO_BUFFER_SPACE` for `@react-refresh`) was seen once during development. A reload fixed it and it did not reproduce.
14. English display headings use Space Grotesk because only the Arabic Reem Kufi subset is loaded. This is intentional.

## Recommended next work

Priority order:

1. Replace the placeholder logo and portfolio images with real brand assets. Update alt text and paths in the content file.
2. Confirm TikTok and Facebook profile URLs, then update `frontend/src/content/index.ts`.
3. Decide how studio designs should reach the shop:
   - Add authenticated artwork upload and attach the file/design to the request, or
   - Keep the current client-only demo and state the limitation clearly in the UI.
   Any backend change needs a storage plan, file limits, and cleanup policy.
4. Replace studio mock products with photographed products and recalibrate print areas in `/dev/print-area`.
5. Add email/CRM forwarding and richer operational tools if the admin workflow needs them.
6. Configure MongoDB backups and a retention policy.
7. Expand automated tests:
   - Studio geometry is covered; add image/export behavior and request handoff
   - API validation and rate limiting
   - Request creation and tracking
   - Contact submission
   - MongoDB-backed request/contact route integration
   - Admin list and status-update routes
   - Language toggle and direction
   - Portfolio filters and FAQ
   - Keyboard and mobile menu behavior
8. Add per-route metadata and an OG image if the site is shared on social platforms.
9. Review mobile page length. Options: two-column portfolio with redesigned compact captions, show six items with a load-more control, or collapse some footer groups.
10. Add route-level code splitting if the initial bundle size matters.
11. Deploy with HTTPS, set `ALLOWED_ORIGINS`, and persist backend data.
12. Have a native Arabic speaker proofread both languages.

## Key files

| File | Why it matters |
| --- | --- |
| `frontend/src/content/index.ts` | All copy, services, portfolio, legal content |
| `frontend/src/index.css` | Tokens, base styles, animations, reduced motion |
| `frontend/src/main.tsx` | Fonts and providers |
| `frontend/src/App.tsx` | Routes, shell, design draft provider, dev route |
| `frontend/src/components/StudioSlot.tsx` | Studio preview/full variants and request handoff |
| `frontend/src/pages/StudioPage.tsx` | Full-width studio workspace |
| `frontend/src/pages/DevPrintAreaPage.tsx` | Development-only print-area calibration |
| `frontend/src/pages/RequestPage.tsx` | Request form, success flow, attached design card |
| `frontend/src/features/studio/MockupStudio.tsx` | Upload, canvas controls, export UI |
| `frontend/src/features/studio/renderMockup.ts` | Canvas renderer and PNG export |
| `frontend/src/features/studio/geometry.ts` | Print-area math and clamping |
| `frontend/src/features/studio/mockProducts.ts` | Studio product data and print areas |
| `frontend/src/features/studio/DesignDraft.tsx` | In-memory PNG/DesignState handoff |
| `frontend/src/features/studio/PrintAreaEditor.tsx` | Shared editor and calibration control |
| `frontend/src/components/Header.tsx` | Sticky header, mobile menu, language access |
| `frontend/src/sections/Hero.tsx` | Hero layout |
| `frontend/src/components/HeroCollage.tsx` | Print-proof collage and tile positions |
| `frontend/src/sections/Services.tsx` | Bento layout |
| `frontend/src/components/PortfolioGallery.tsx` | Filters, masonry, DEMO tags |
| `frontend/src/components/ContactForm.tsx` | Contact validation and submission |
| `frontend/src/pages/TrackPage.tsx` | Tracking lookup and URL prefill |
| `frontend/src/components/TrackStatus.tsx` | Status rail |
| `frontend/src/providers/LanguageProvider.tsx` | Language, direction, metadata |
| `frontend/src/lib/api.ts` | API client |
| `backend/src/app.ts` | App setup and rate limits |
| `backend/src/db.ts` | MongoDB connection |
| `backend/src/models/PrintRequest.ts` | Print request schema |
| `backend/src/models/ContactMessage.ts` | Contact message schema |
| `backend/src/routes/requests.ts` | Request creation and tracking routes |
| `backend/src/routes/contact.ts` | Contact message route |
| `backend/src/routes/admin.ts` | Protected lead review routes |
| `scripts/generate-placeholders.mjs` | Placeholder asset generator |
| `scripts/generate-mock-products.mjs` | Studio product artwork generator |

## Local reset

To reset requests and contact messages, stop the API and remove the documents from the `PrintRequest` and `ContactMessage` collections in MongoDB.

## Repository

Public repository: https://github.com/3mrNour/yuzersef

Default branch: `main`.

Use `npm install` at the root before running either workspace.
