# Frontend

Vite + React 19 + TypeScript client for the Yuzersef site. Arabic is the default language and the document renders RTL. English switches the document to LTR.

## Run

From the repository root:

```bash
npm run dev
```

Or only the web app:

```bash
npm run dev --workspace frontend
```

The app runs at http://localhost:5173 and proxies `/api` to http://localhost:8787.

If the project path contains `&` and npm workspace scripts fail on Windows, run Vite directly:

```powershell
node "..\node_modules\vite\bin\vite.js" --host 127.0.0.1 --port 5173
```

## Build, typecheck, and tests

```bash
npm run build --workspace frontend
npm run typecheck --workspace frontend
npm run test --workspace frontend
```

Direct alternatives:

```powershell
node "..\node_modules\typescript\bin\tsc" --noEmit
node "..\node_modules\vite\bin\vite.js" build
node "..\node_modules\vitest\vitest.mjs" run
```

The production build is written to `frontend/dist`. Tests cover the studio geometry helpers only.

## Structure

```
src/
├── components/          layout, header, footer, forms, gallery, process rail
│   ├── reactbits/       RotatingText, SpotlightCard
│   └── ui/              ButtonLink, CtaArrow, DemoTag, LanguageToggle, Logo, Reveal, SectionHeading
├── content/index.ts     all Arabic and English copy and data
├── features/studio/     mockup editor, canvas renderer, geometry, mock products
├── lib/                 API client, class helper, style helpers, validation
├── pages/               Home, Request, Track, Studio, Privacy, Terms, 404
│                         plus DevStudio3D (dev-only 3D prototype)
├── providers/           LanguageProvider (lang, dir, copy, localStorage)
├── sections/            home page sections
├── App.tsx              routes, shell, design draft provider
├── index.css            Tailwind v4 tokens, base styles, animations
└── main.tsx             font imports and providers
```

## Routes

| Route | Page |
| --- | --- |
| `/` | Home |
| `/request` | Request form |
| `/track` | Order tracking |
| `/studio` | Interactive mockup studio |
| `/privacy` | Privacy policy |
| `/terms` | Terms |
| `*` | NotFoundPage |

`/dev/print-area` (print-area calibration) and `/dev/studio-3d` (3D prototype) exist only in development. Both are gated behind `import.meta.env.DEV` and fall through to the 404 page in production builds.

Anchor links in the nav point to `/#services`, `/#work`, `/#process`, `/#contact`.

## Copy and data

`src/content/index.ts` is the single source of truth. It is typed as `Record<Lang, SiteCopy>`, so Arabic and English must stay in sync. It contains:

- Meta title and description
- Brand, nav, buttons, labels
- Services with image paths and alt text
- Portfolio items, categories, and alt text
- Process steps, FAQ, contact details, legal copy
- Request and tracking states

When you replace placeholder artwork, update `image` paths in the same file and keep alt text descriptive.

## Language and direction

`LanguageProvider`:

- Reads `yuzersef.lang` from `localStorage`
- Writes `document.documentElement.lang` and `dir`
- Updates the title and meta description for the active language
- Exposes `t`, `lang`, `dir`, `setLang`, `toggleLang`

The mobile header shows the language toggle inside the opened menu. From `sm` upward it is visible in the header.

## Studio

The studio is code-split: the home teaser renders a lightweight preview, and `/studio` lazy-loads the canvas editor.

- `src/features/studio/types.ts` defines the product, transform, and design contracts.
- `mockProducts.ts` contains three demo products: tee, mug, and cap.
- `studioApi.ts` validates the product data and adds a short fake loading delay.
- `geometry.ts` owns print-area math, clamping, rotation bounds, and scale limits.
- `imageCache.ts` loads, caches, tints, and processes logos and product images.
- `renderMockup.ts` draws the product, logo, shading, and guides, and exports a 1200px PNG.
- `MockupStudio.tsx` provides upload, drag, pinch, wheel, keyboard controls, colour/view switching, remove-white, white ink, reset, and download.
- `PrintAreaEditor.tsx` is a self-contained editor used by the dev-only calibration page.
- `DesignDraft.tsx` keeps the exported PNG and `DesignState` in memory for `/request`.

The studio does not change the backend contract. The PNG and raw `DesignState` are not uploaded or persisted. The request page displays the attached design from the in-memory draft, and a reload clears it.

## 3D studio prototype (dev only)

`/dev/studio-3d` lazy-loads `src/pages/DevStudio3D.tsx`: a Three.js / react-three-fiber prototype for print placement on a skinned tee. It exists to answer design questions for the real studio, nothing backend-facing.

- The tee is `public/models/shirt_baked.glb`, skinned with a vertex wind sway, and tinted to one of four shirt colours.
- Placement runs in drape space, so sleeve and body orbits never tear the decal off the mesh.
- Four print faces are independent: front, back, and both sleeves. Each has its own image upload, trash button, thumbnail, and placement status in the "جهات الطباعة" panel, with a live design counter.
- Uploaded images auto-place on their face. Front and back use a deterministic "drone camera" raycast in the direction of the face; sleeves use geometry-anchor scanning (upper sleeve band, facing outward) so a mid-flight camera never misplaces them.
- Designs can be dragged on the mesh, dragged across faces (ownership transfers, drop wins), scaled, rotated 90° steps, and resized in percent (display shows the decal height as a percentage of shirt height).
- Export: `تنزيل المنظر الحالي` saves the current camera view as a PNG; `تنزيل ورقة كل الجهات` composes a branded 2×2 sheet of all four faces (logo header, Reem Kufi title, labelled cells, footer).
- A dev hook `window.__ys3dComposeSheet` (import.meta.env.DEV only) returns the sheet PNG data URL for automation.

Dependencies added to `frontend/package.json`: `three`, `@react-three/fiber`, `@react-three/drei`, and `@types/three` (devDependency). Three.js is in a lazy-loaded route, so the main bundle is unaffected. The glb is an educational-license placeholder: production needs a licensed, print-ready garment model, and the prototype keeps designs in memory only (not wired to `PrintPlacement` or the API yet).

## Design system

Tokens and base styles live in `src/index.css`:

- Forest, bone, and sand palette
- Dark theme only
- Shape tokens for buttons, cards, and fields
- Focus-visible styles
- Reduced-motion rules
- Dot field, grid, and print-proof textures

Fonts are loaded in `src/main.tsx`:

- Reem Kufi, Arabic subsets only, for display Arabic
- IBM Plex Sans Arabic, Arabic and Latin subsets, for body
- Space Grotesk, Latin subsets, for Latin labels and English display fallback

English display headings fall back from Reem Kufi (Arabic subset) to Space Grotesk. This is intentional.

## API usage

`src/lib/api.ts`:

- Uses `VITE_API_URL` when set, otherwise same-origin `/api`
- `createRequest`, `trackRequest`, `sendContact`
- Throws `ApiError` with status for 404 handling

Set `VITE_API_URL` only for a split frontend/API deployment. See `.env.example`.

## Placeholders

- `public/brand/logo-mark.svg`
- `public/portfolio/*.svg`

Regenerate with `npm run assets` from the root. Replace them with real brand files before launch and update the copy file if names or alt text change.

## Accessibility notes

- Labels are associated with all inputs.
- Validation errors use `aria-invalid` and `aria-describedby`.
- Success and error states use live regions or `role="alert"`.
- FAQ buttons expose `aria-expanded` and `aria-controls`.
- Portfolio filters expose `aria-pressed`.
- Home page interactive elements and footer links are at least 44px tall.
- Reduced motion is respected by Motion components.

## Verification performed

- TypeScript passes in both frontend and backend.
- Production build passes (one chunk-size warning, 560 kB minified, 170 kB gzip).
- Vitest: 11 geometry tests pass.
- Studio browser checks: product switcher, logo upload, canvas render, colour/view switching, PNG export, design handoff, service prefill, mobile layout, and the dev print-area route.
- Production preview: `/studio` works, `/dev/print-area` falls through to the 404 page, and no console errors were recorded.
- 3D prototype browser checks: per-face upload and auto-placement for front, back, and both sleeves; simultaneous multi-face designs; drag including back-face drag without spin; cross-face drag transfer; face removal; branded sheet export composition; typecheck and production build pass.
- Request validation, request submission, tracking, contact submission, portfolio filters, FAQ, language toggle, and mobile menu were exercised manually.

## Known limitations

- Studio products use generated SVG artwork, not real product photos.
- The exported design is not uploaded or persisted. The request page preview is in memory and is lost on reload.
- The editor uses Canvas 2D. The renderer interface leaves room for a future Three.js renderer.
- The 3D prototype keeps designs in memory, uses a placeholder educational-license tee model, and is not wired to the request flow or backend yet.
- Route-specific titles are not implemented. The title reflects the active language only.
- The home page is long on mobile: about 14,000px at 360px wide, largely because the portfolio is single-column and the footer is tall.
- No file uploads, payments, accounts, or admin screens.
