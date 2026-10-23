# Yuzersef | يوزرسيف

Arabic-first, RTL website for **Yuzersef**, a print and personalisation studio in Aswan. The site presents services, a filterable portfolio, a request flow, order tracking, and studio contact details.

This is a competition build. Portfolio artwork and the logo mark are placeholders, and the interactive studio preview is intentionally marked as a demo.

## Stack

- **Frontend:** Vite, React 19, TypeScript, Tailwind CSS v4, Motion, React Router, Phosphor Icons
- **Backend:** Node.js, Express 5, Zod, JSON file storage
- **Fonts:** Reem Kufi (display), IBM Plex Sans Arabic (body), Space Grotesk (Latin labels)

## Project structure

```
.
├── frontend/
│   ├── public/
│   │   ├── brand/logo-mark.svg          # placeholder mark
│   │   └── portfolio/*.svg              # 10 placeholder product visuals
│   ├── src/
│   │   ├── components/                  # layout, forms, gallery, header/footer
│   │   │   ├── reactbits/               # RotatingText, SpotlightCard
│   │   │   └── ui/                      # buttons, logo, reveal, demo tag
│   │   ├── content/index.ts             # all Arabic and English copy
│   │   ├── lib/                         # API client, validation, styles
│   │   ├── pages/                       # home, request, track, studio, legal, 404
│   │   ├── providers/                   # language and RTL/LTR handling
│   │   └── sections/                    # home page sections
│   └── vite.config.ts                   # dev proxy: /api -> localhost:8787
├── backend/
│   ├── data/                            # JSON store (gitignored, created at runtime)
│   └── src/
│       ├── app.ts                       # routes, validation, rate limiting
│       ├── data/seed.ts                 # demo request: YZ-DEMO-0001
│       ├── index.ts                     # server entry
│       ├── store.ts                     # JSON persistence
│       └── types.ts
└── scripts/generate-placeholders.mjs    # regenerates placeholder SVGs
```

## Getting started

Requirements: Node.js 20 or newer, npm 10 or newer.

```bash
npm install
npm run dev
```

- Web app: http://localhost:5173
- API: http://localhost:8787
- Health check: http://localhost:8787/api/health

The Vite dev server proxies `/api` to the backend, so no frontend environment variable is needed in development.

## Documentation

- [Frontend guide](frontend/README.md)
- [Backend guide](backend/README.md)
- [Asset scripts](scripts/README.md)
- [Handoff: done, verified, remaining](docs/HANDOFF.md)

## Environment variables

| Variable | Where | Default | Purpose |
| --- | --- | --- | --- |
| `PORT` | backend | `8787` | API port |
| `ALLOWED_ORIGINS` | backend | any origin | Comma-separated allowed CORS origins |
| `VITE_API_URL` | frontend | empty | Absolute API base URL for a split deployment |

Example production values:

```bash
# backend
PORT=8787
ALLOWED_ORIGINS=https://yuzersef.example

# frontend build
VITE_API_URL=https://api.yuzersef.example
```

## Scripts

Root:

```bash
npm run dev        # frontend and backend together
npm run build      # typecheck and build both workspaces
npm run typecheck  # typecheck both workspaces
npm run preview    # preview the built frontend
npm run assets     # regenerate placeholder SVGs
```

Workspace commands:

```bash
npm run dev --workspace frontend
npm run build --workspace frontend
npm run typecheck --workspace frontend

npm run dev --workspace backend
npm run build --workspace backend
npm run start --workspace backend
```

### Windows path note

If the project folder path contains `&` (for example `C:\Projects\Brand & Build`), npm workspace scripts can fail while resolving `node_modules\.bin` in `cmd`. Move the project to a path without `&`, or run the tools directly:

```powershell
# from frontend/
node "..\node_modules\typescript\bin\tsc" --noEmit
node "..\node_modules\vite\bin\vite.js" build
node "..\node_modules\vite\bin\vite.js" --host 127.0.0.1 --port 5173

# from backend/
node "..\node_modules\typescript\bin\tsc" --noEmit
node ..\node_modules\tsx\dist\cli.mjs src\index.ts
```

## Routes

| Route | Description |
| --- | --- |
| `/` | Home: hero, services, studio teaser, process, portfolio, about, FAQ, contact |
| `/request` | Request form, optional `?service=clothing` prefill |
| `/track` | Order tracking, optional `?code=YZ-DEMO-0001` lookup |
| `/studio` | Mockup studio preview placeholder |
| `/privacy` | Privacy policy |
| `/terms` | Terms of use |
| `*` | Arabic 404 page |

## API

```text
GET  /api/health           Health check
GET  /api/services         Service slugs and labels
POST /api/requests         Create a print request
GET  /api/requests/:code   Look up a request by code
POST /api/contact          Send a contact message
```

Create a request:

```bash
curl -X POST http://localhost:8787/api/requests \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ahmed",
    "phone": "01012345678",
    "service": "clothing",
    "quantity": 12,
    "details": "Black tees with a chest print",
    "artworkUrl": "https://example.com/artwork.pdf"
  }'
```

Service slugs: `clothing`, `mugs`, `caps`, `stickers`, `cases`.

Validation highlights:

- Egyptian mobile numbers only (`01` followed by 10 digits, with Arabic or Persian digit normalization)
- Quantity between 1 and 500
- Artwork link must be `http(s)`
- Request and contact endpoints are rate limited in memory

## Content and assets

All copy lives in `frontend/src/content/index.ts`. Both Arabic and English content are typed, so adding a field requires updating both languages.

To regenerate the placeholder logo and portfolio SVGs:

```bash
npm run assets
```

Replace these files with the real brand assets when available:

- `frontend/public/brand/logo-mark.svg`
- `frontend/public/portfolio/*.svg`

Then update image paths, alt text, and portfolio titles in `frontend/src/content/index.ts`.

## Placeholders and limitations

- The logo mark and all portfolio images are generated placeholders.
- The social links for TikTok and Facebook are search URLs, not confirmed profile URLs.
- The studio page is a labelled demo placeholder. No interactive mockup editor is implemented.
- There is no pricing, online payment, account system, or file upload. Customers submit details and an optional artwork link.
- Requests and contact messages are stored in a JSON file on the server. Use a database and durable storage for real traffic.
- Rate limiting is per-process and resets when the API restarts.
- Demo data is seeded when the store is empty. Use code `YZ-DEMO-0001` to test tracking. Delete `backend/data/store.json` to reset local data.
- The document title is set per language, not per route.

## Deployment notes

1. Build the frontend with `npm run build --workspace frontend`, then serve `frontend/dist`.
2. Build and run the API with `npm run build --workspace backend` and `npm run start --workspace backend`.
3. Route `/api` to the API process on the same origin, or set `VITE_API_URL` at build time and configure `ALLOWED_ORIGINS` on the backend.
4. Persist `backend/data/` on a volume if you keep file storage. Replace it with a real database for production.
5. Add real privacy and retention rules before collecting customer data publicly.

## Accessibility and behaviour

- Full RTL layout with an Arabic default and an English toggle.
- Visible focus styles, labelled form fields, inline validation, and live regions for form status.
- Touch targets of at least 44px for controls and footer links.
- Reduced-motion support for entrance and rotating text animations.
- Portfolio filters expose `aria-pressed`; the FAQ uses `aria-expanded` and `aria-controls`.
