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

## Build and typecheck

```bash
npm run build --workspace frontend
npm run typecheck --workspace frontend
```

Direct alternatives:

```powershell
node "..\node_modules\typescript\bin\tsc" --noEmit
node "..\node_modules\vite\bin\vite.js" build
```

The production build is written to `frontend/dist`.

## Structure

```
src/
├── components/          layout, header, footer, forms, gallery, process rail
│   ├── reactbits/       RotatingText, SpotlightCard
│   └── ui/              ButtonLink, CtaArrow, DemoTag, LanguageToggle, Logo, Reveal, SectionHeading
├── content/index.ts     all Arabic and English copy and data
├── lib/                 API client, class helper, style helpers, validation
├── pages/               Home, Request, Track, Studio, Privacy, Terms, 404
├── providers/           LanguageProvider (lang, dir, copy, localStorage)
├── sections/            home page sections
├── App.tsx              routes and shell
├── index.css            Tailwind v4 tokens, base styles, animations
└── main.tsx             font imports and providers
```

## Routes

| Route | Page |
| --- | --- |
| `/` | Home |
| `/request` | Request form |
| `/track` | Order tracking |
| `/studio` | Studio preview placeholder |
| `/privacy` | Privacy policy |
| `/terms` | Terms |
| `*` | NotFoundPage |

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

- TypeScript passes.
- Production build passes (one chunk-size warning, 538 kB minified, 163 kB gzip).
- Browser checks at 360px and 1440px: no horizontal overflow, no clipped text, no undersized controls on the home page.
- Request validation, request submission, tracking, contact submission, portfolio filters, FAQ, language toggle, and mobile menu were exercised manually.

There are no automated frontend tests yet.

## Known limitations

- The studio page is a labelled demo placeholder.
- Route-specific titles are not implemented. The title reflects the active language only.
- The home page is long on mobile: about 14,000px at 360px wide, largely because the portfolio is single-column and the footer is tall.
- No file uploads, payments, accounts, or admin screens.
