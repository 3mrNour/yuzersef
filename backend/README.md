# Backend

Express 5 API for requests, order tracking, and contact messages. Validation is handled with Zod. Data is stored in a JSON file for this competition build.

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

Direct alternative for typecheck:

```powershell
node "..\node_modules\typescript\bin\tsc" --noEmit
```

## Environment

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `8787` | HTTP port |
| `ALLOWED_ORIGINS` | any origin | Comma-separated CORS allowlist |

Example:

```bash
PORT=8787
ALLOWED_ORIGINS=https://yuzersef.example,https://www.yuzersef.example
```

Set `ALLOWED_ORIGINS` in production. With no value, the API reflects the request origin.

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
  "quantity": 12,
  "details": "Black tees with a chest print",
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
- `details`: up to 1200 characters
- `artworkUrl`: optional `http(s)` link, up to 500 characters
- Rate limit: 10 requests per IP per 10 minutes

### `GET /api/requests/:code`

Returns the public tracking fields for a code: status, service, quantity, and creation date.

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

## Storage

`src/store.ts` keeps state in memory and persists to `backend/data/store.json` after writes.

- `backend/data/*.json` is gitignored.
- On first start, the store falls back to `src/data/seed.ts`.
- The seed contains one demo request with code `YZ-DEMO-0001`.
- Delete `backend/data/store.json` and restart to reset local data to the seed.
- Writes use a temporary file and rename to reduce partial-write risk.

This is single-process, file-based storage. It is not suitable for multiple instances or production traffic without a shared database.

## Demo tracking

Use `YZ-DEMO-0001` in `/track` or call:

```bash
curl http://localhost:8787/api/requests/YZ-DEMO-0001
```

## Security and production notes

- Rate limiting is in memory and resets on restart.
- There is no authentication, admin API, or request listing endpoint.
- Contact details and request details are stored in plain JSON. Add access control and retention rules before public use.
- Set `ALLOWED_ORIGINS` and serve the API behind HTTPS.
- Use a database, backups, and durable storage for production.
- The API does not upload or host artwork. It stores an optional link.
- Add automated tests and structured logging before relying on this in production.
