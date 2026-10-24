# Backend

Express 5 API for requests, order tracking, and contact messages. Validation is handled with Zod. Data is stored in MongoDB through Mongoose.

## Run

From the repository root:

```bash
npm run dev
```

Or only the API:

```bash
npm run dev --workspace backend
```

The API listens on http://localhost:8787 by default.

If the project path contains `&` and npm workspace scripts fail on Windows, run the API directly:

```powershell
node ..\node_modules\tsx\dist\cli.mjs src\index.ts
```

## Build and start

```bash
npm run build --workspace backend
npm run start --workspace backend
```

The build compiles TypeScript to `backend/dist`. Start expects `backend/dist/index.js`.

Run backend tests:

```bash
npm run test --workspace backend
```

The tests cover request/contact validation and admin API-key authorization. Database integration tests should run against a dedicated test database before deployment.

Direct alternative for typecheck:

```powershell
node "..\node_modules\typescript\bin\tsc" --noEmit
```

## Environment

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `8787` | HTTP port |
| `ALLOWED_ORIGINS` | any origin | Comma-separated CORS allowlist |
| `MONGODB_URI` | required | MongoDB connection string |
| `MONGODB_DB` | `yuzersef` | MongoDB database name |
| `ADMIN_API_KEY` | required for admin routes | Secret sent in the `x-admin-api-key` header |

Example:

```bash
PORT=8787
ALLOWED_ORIGINS=https://yuzersef.example,https://www.yuzersef.example
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
MONGODB_DB=yuzersef
ADMIN_API_KEY=replace-with-a-long-random-secret
```

Set `ALLOWED_ORIGINS` in production. With no value, the API reflects the request origin.
Set `MONGODB_URI` in `backend/.env` for local development. Do not commit credentials.

## Endpoints

### `GET /api/health`

Returns service status and the current server time.

### `GET /api/services`

Returns the five service slugs with Arabic and English labels.

### `POST /api/requests`

Creates a print request and returns a tracking code.

```json
{
  "name": "Ahmed",
  "phone": "01012345678",
  "service": "clothing",
  "quantity": 2,
  "items": [
    {
      "productId": "tee-classic",
      "productName": "Classic Tee",
      "size": "M",
      "color": "Bone",
      "style": "Classic",
      "specialRequest": "Small chest print"
    },
    {
      "productId": "tee-classic",
      "productName": "Classic Tee",
      "size": "L",
      "color": "Forest",
      "style": "Oversized",
      "specialRequest": "Large back print"
    }
  ],
  "artworkUrl": "https://example.com/artwork.pdf"
}
```

Response `201`:

```json
{
  "code": "YZ-2610-BYU5",
  "status": "review",
  "service": "clothing",
  "createdAt": "2026-10-23T19:10:56.000Z"
}
```

Rules:

- `name`: 2 to 80 characters
- `phone`: Egyptian mobile number, Arabic and Persian digits normalized
- `service`: `clothing`, `mugs`, `caps`, `stickers`, or `cases`
- `quantity`: integer from 1 to 500
- `items`: one entry per physical piece; its length must equal `quantity`
- `items[].size`: selected size for that piece
- `items[].color`: selected colour for that piece
- `items[].style`: style or fabric for that piece
- `items[].specialRequest`: optional placement or production note for that piece
- `artworkUrl`: optional `http(s)` link, up to 500 characters
- `designPreviewUrl`: optional exported Studio image stored as an image data URL for Admin review
- `designFileName`: original uploaded logo filename
- `logoDataUrl`: the original uploaded logo, stored separately from the composed Studio preview
- `items[].printPlacement`: selected production position (`front`, `back`, `left-sleeve`, `right-sleeve`, or `custom`)
- Rate limit: 10 requests per IP per 10 minutes

The Studio and customer-facing request form read product-specific print profiles from
`GET /api/settings/print-placements`. For example, sleeve positions are
available for the Classic Tee but not for the Classic Mug. Requests using a
position disabled for that exact product are rejected, and a product cannot be
submitted under a different service category.

### `GET /api/requests/:code`

Returns the public tracking fields for a code: status, service, quantity, item details, and creation date.

- Invalid code length: `400`
- Unknown code: `404`

### `POST /api/contact`

Stores a contact message.

```json
{
  "name": "Sara",
  "phone": "01123456789",
  "message": "I would like details about printing 20 shirts."
}
```

- `message`: 5 to 1200 characters
- Rate limit: 6 messages per IP per 10 minutes

Unknown routes return JSON `404`. Zod validation errors return `400` with an `issues` array. Unexpected errors return `500`.

## Admin API

Admin routes require the `x-admin-api-key` header to match `ADMIN_API_KEY`. They return `401` when the key is missing or invalid.

```text
GET   /api/admin/requests?page=1&limit=25
GET   /api/admin/requests?page=1&limit=25&status=review
GET   /api/admin/summary
PATCH /api/admin/requests/:id/status
GET   /api/admin/print-settings
PATCH /api/admin/print-settings
GET   /api/admin/contacts?page=1&limit=25
```

The dashboard is available at `/admin` and stores the admin key only in the browser session. The list endpoints return `{ items, page, limit, total, pages }`. The status endpoint accepts
`{ "status": "received" | "review" | "confirmed" | "closed" }`. Print settings use `{ "placements": { "clothing": ["front", "back"] }, "profiles": { "mug-classic": { "productId": "mug-classic", "service": "mugs", "productName": "Classic Mug", "placements": ["front"], "guidance": "Front panel only." } } }`.

## MongoDB structure

- `src/db.ts` connects to MongoDB before the API starts.
- `src/models/PrintRequest.ts` defines the print request schema and indexes.
- `src/models/ContactMessage.ts` defines the contact message schema and indexes.
- `src/models/PrintSettings.ts` stores the Admin-controlled print-position rules.
- `src/routes/requests.ts` handles request creation and tracking.
- `src/routes/contact.ts` handles contact message creation.

The `PrintRequest` collection has unique indexes for `id` and `code`. The `ContactMessage` collection has a unique index for `id`. Both collections store ISO timestamp strings to preserve the existing API shape.

## Security and production notes

- Rate limiting is in memory and resets on restart.
- The Admin API is protected by `ADMIN_API_KEY`; rotate it if it has been shared.
- Contact details and request details are stored in MongoDB. Add access control and retention rules before public use.
- Set `ALLOWED_ORIGINS` and serve the API behind HTTPS.
- Configure MongoDB backups and durable storage for production.
- Studio previews are stored in the request document as image data URLs; keep the
  request body and MongoDB document limits aligned with the chosen export size.
- Add automated tests and structured logging before relying on this in production.
