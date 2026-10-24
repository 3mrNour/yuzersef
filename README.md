# Yuzersef | يوزرسيف

Arabic-first, RTL website for **Yuzersef**, a print and personalisation studio in Aswan. The site presents services, a filterable portfolio, a request flow, order tracking, and studio contact details.

This is a competition build. Portfolio artwork and the logo mark are placeholders. The interactive studio is a client-side demo built on generated product artwork, and it is clearly labelled as a demo.

## Stack

- **Frontend:** Vite, React 19, TypeScript, Tailwind CSS v4, Motion, React Router, Phosphor Icons
- **3D prototyping (dev routes only):** Three.js r186, @react-three/fiber, @react-three/drei
- **Backend:** Node.js, Express 5, Zod, MongoDB via Mongoose
- **Fonts:** Reem Kufi (display), IBM Plex Sans Arabic (body), Space Grotesk (Latin labels)

## Project structure

```
.
├── frontend/
│   │   │   ├── public/
│   │   │   ├── brand/logo-mark.svg          # placeholder mark
│   │   │   ├── portfolio/*.svg              # 10 placeholder product visuals
│   │   │   ├── mock/*.svg                   # generated studio product artwork
│   │   │   └── models/shirt_baked.glb       # placeholder 3D tee for the 3D prototype
│   │   ├── src/
│   │   │   ├── components/                  # layout, forms, gallery, header/footer
│   │   │   │   ├── reactbits/               # RotatingText, SpotlightCard
│   │   │   │   └── ui/                      # buttons, logo, reveal, demo tag
│   │   │   ├── content/index.ts             # all Arabic and English copy
│   │   │   ├── features/studio/             # mockup editor, canvas renderer, geometry
│   │   │   ├── lib/                         # API client, validation, styles
│   │   │   ├── pages/                       # home, request, track, studio, legal, 404
│   │   │   ├── pages/DevStudio3D.tsx        # dev-only 3D print-placement prototype
│   │   │   ├── providers/                   # language and RTL/LTR handling
│   │   │   └── sections/                    # home page sections
│   └── vite.config.ts                   # dev proxy: /api -> localhost:8787
├── backend/
│   ├── models/                          # MongoDB schemas
│   ├── routes/                          # API route modules
│   └── src/
│       ├── app.ts                       # app setup and rate limiting
│       ├── db.ts                        # MongoDB connection
│       ├── index.ts                     # server entry
│       └── types.ts
└── scripts/
    ├── generate-placeholders.mjs        # placeholder logo and portfolio SVGs
    └── generate-mock-products.mjs       # studio product artwork
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
| `MONGODB_URI` | backend | required | MongoDB connection string |
| `MONGODB_DB` | backend | `yuzersef` | MongoDB database name |
| `ADMIN_API_KEY` | backend | required for admin routes | Secret for the protected admin API |
| `APP_URL` | backend | `http://localhost:5173` | Frontend URL used in auth links |
| `RESEND_API_KEY` | backend | required | Resend API key for auth email |
| `AUTH_EMAIL_FROM` | backend | required | Verified Resend sender |
| `VITE_API_URL` | frontend | empty | Absolute API base URL for a split deployment |

Example production values:

```bash
# backend
PORT=8787
ALLOWED_ORIGINS=https://yuzersef.example
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
MONGODB_DB=yuzersef
ADMIN_API_KEY=replace-with-a-long-random-secret
APP_URL=http://localhost:5173
RESEND_API_KEY=re_xxxxxxxxx
AUTH_EMAIL_FROM=Yuzersef <no-reply@example.com>

# frontend build
VITE_API_URL=https://api.yuzersef.example
```

## Scripts

Root:

```bash
npm run dev        # frontend and backend together
npm run build      # typecheck and build both workspaces
npm run typecheck  # typecheck both workspaces
npm run test --workspace backend # backend validation and admin-auth tests
npm run preview    # preview the built frontend
npm run assets     # regenerate placeholder logo and portfolio SVGs
npm run assets:studio # regenerate studio product artwork
```

Workspace commands:

```bash
npm run dev --workspace frontend
npm run build --workspace frontend
npm run typecheck --workspace frontend

npm run dev --workspace backend
npm run build --workspace backend
npm run start --workspace backend

npm run test --workspace frontend
```

### Windows path note

If the project folder path contains `&` (for example `C:\Projects\Brand & Build`), npm workspace scripts can fail while resolving `node_modules\.bin` in `cmd`. Move the project to a path without `&`, or run the tools directly:

```powershell
# from frontend/
node "..\node_modules\typescript\bin\tsc" --noEmit
node "..\node_modules\vite\bin\vite.js" build
node "..\node_modules\vite\bin\vite.js" --host 127.0.0.1 --port 5173
node "..\node_modules\vitest\vitest.mjs" run

# from backend/
node "..\node_modules\typescript\bin\tsc" --noEmit
node ..\node_modules\tsx\dist\cli.mjs src\index.ts
```

## Routes

| Route | Description |
| --- | --- |
| `/` | Home: hero, services, studio teaser, process, portfolio, about, FAQ, contact |
| `/request` | Request form, optional `?service=clothing` prefill |
| `/track` | Order tracking by a real request code |
| `/studio` | Interactive mockup studio with PNG export and request handoff |
| `/privacy` | Privacy policy |
| `/terms` | Terms of use |
| `*` | Arabic 404 page |

`/dev/print-area` (print-area calibration) and `/dev/studio-3d` (3D print-placement prototype) are development-only pages. They are not registered in production builds.

## API

```text
GET  /api/health           Health check
GET  /api/services         Service slugs and labels
POST /api/requests         Create a print request
GET  /api/requests/:code   Look up a request by code
POST /api/contact          Send a contact message
GET  /api/admin/requests   List requests (requires `x-admin-api-key`)
GET  /api/admin/contacts   List contact messages (requires `x-admin-api-key`)
GET  /api/admin/summary    Dashboard totals (requires `x-admin-api-key`)
```

The protected admin dashboard is available at `/admin`. It keeps the admin key in `sessionStorage`, lists requests and contact messages, and allows request status updates.

Create a request:

```bash
curl -X POST http://localhost:8787/api/requests \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ahmed",
    "phone": "01012345678",
    "service": "clothing",
    "quantity": 1,
    "items": [
      {
        "productId": "tee-classic",
        "productName": "Classic Tee",
        "size": "M",
        "color": "Bone",
        "style": "Classic",
        "specialRequest": "Small chest print"
      }
    ],
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

To regenerate the studio product artwork:

```bash
npm run assets:studio
```

Replace these files with the real brand assets when available:

- `frontend/public/brand/logo-mark.svg`
- `frontend/public/portfolio/*.svg`
- `frontend/public/mock/*.svg`

Then update image paths, alt text, product data, and portfolio titles.

The studio product data lives in `frontend/src/features/studio/mockProducts.ts`. Print areas are normalized `{ x, y, w, h }` values. Use the development-only `/dev/print-area` page to calibrate them against the artwork.

## Placeholders and limitations

- The logo mark and all portfolio images are generated placeholders.
- The social links for TikTok and Facebook are search URLs, not confirmed profile URLs.
- The studio uses generated SVG product artwork, not photographed products. The preview, colours, and print areas are demo data.
- The 3D prototype at `/dev/studio-3d` uses an educational-license placeholder tee model (`frontend/public/models/shirt_baked.glb`). Production needs a purchased, print-ready garment model with clean UV drape. The prototype is not wired to the backend and keeps its per-face designs in memory only.
- The studio exports a 1200px PNG and keeps the `DesignState` in memory for the request page. The PNG and design JSON are not uploaded to the backend, so the shop does not receive them after a reload.
- There is no pricing, online payment, account system, or file upload. Customers submit details and an optional artwork link.
- Requests and contact messages are stored in MongoDB. Configure backups and durable storage for real traffic.
- Rate limiting is per-process and resets when the API restarts.
- The document title is set per language, not per route.

## Deployment notes

1. Set `MONGODB_URI` in `backend/.env`; never commit the credentials.

The home page `أعمالنا` portfolio is managed from the admin dashboard. Open `/admin`, enter the admin key, and use the **Portfolio / أعمالنا** section to create, edit, hide, reorder, or delete items. Portfolio images are currently entered as URLs.
2. Build the frontend with `npm run build --workspace frontend`, then serve `frontend/dist`.
3. Build and run the API with `npm run build --workspace backend` and `npm run start --workspace backend`.
4. Route `/api` to the API process on the same origin, or set `VITE_API_URL` at build time and configure `ALLOWED_ORIGINS` on the backend.
5. Add real privacy and retention rules before collecting customer data publicly.

## Accessibility and behaviour

- Full RTL layout with an Arabic default and an English toggle.
- Visible focus styles, labelled form fields, inline validation, and live regions for form status.
- Touch targets of at least 44px for controls and footer links.
- Reduced-motion support for entrance and rotating text animations.
- Portfolio filters expose `aria-pressed`; the FAQ uses `aria-expanded` and `aria-controls`.
