# Global Aviation Services Directory — Frontend

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · zod · Vitest.
Built from the Figma file "Global Aviation Website".

## Run

```bash
cp .env.example .env.local   # everything defaults to mock data — no keys needed
npm install
npm run dev -- -p 3100       # http://localhost:3100
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests |

Mock mode demo account: `demo@globalaviation.test` / `Demo1234` · email/reset OTP: `123456`.

## Configuration (`.env.local`)

| Variable | Values | Effect |
| --- | --- | --- |
| `DATA_SOURCE` | `mock` \| `api` | Server-side data: in-repo mock data or `API_BASE_URL/api/v1/...` |
| `NEXT_PUBLIC_DATA_SOURCE` | `mock` \| `api` | Browser forms & auth: simulated locally or sent to `NEXT_PUBLIC_API_BASE_URL` |
| `WEATHER_PROVIDER` | `mock` \| `aviationweather` \| `checkwx` | METAR/TAF source (`CHECKWX_API_KEY` for CheckWX) |
| `NOTAM_PROVIDER` | `mock` \| `faa` | NOTAMs (`FAA_NOTAM_CLIENT_ID` / `FAA_NOTAM_CLIENT_SECRET`) |
| `AIRPORT_DATA_PROVIDER` | `mock` \| `airportdb` | Runway/frequency enrichment (`AIRPORTDB_API_TOKEN`) |
| `NEXT_PUBLIC_MAP_PROVIDER` | `osm` \| `google` | Maps (`NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY` for Google / satellite) |

Secrets are only read server-side (`src/lib/config.ts`, `import "server-only"`); third-party calls run in Server Components and never reach the browser.

## Structure

```text
src/app/(site)/        public pages (header/footer layout)
src/app/(auth)/        login, signup, verify-email, forgot/reset-password (split-screen layout)
src/components/<area>/ page-specific components; ui/, ads/, layout/ are shared
src/lib/types.ts       domain types = future /api/v1 contract
src/lib/data/          server data access (mock ↔ backend switch)
src/lib/integrations/  weather, NOTAM, airportdb adapters (mock ↔ real)
src/lib/api/           browser API client + zod form schemas
src/lib/auth/          auth context (mock ↔ backend)
src/lib/mock/          demo data
```

## Routes

`/` · `/directory` · `/providers/[slug]` (`?tab=`) · `/charter-operators` (+ `/results`) · `/airports` · `/airports/[code]` (`?tab=`, `?service=`) ·
`/tools` · `/tools/{weather,notams,runway-diagram,satellite-map,nearby-airports,distance}` · `/news` · `/news/[slug]` · `/pricing` · `/advertise` · `/contact` ·
`/about` · `/request-demo` · `/data-licence` · `/faq` · `/legal/{privacy,terms,refund,cookies,gdpr}` · `/login` · `/signup` · `/verify-email` · `/forgot-password` · `/reset-password` · `/account` · `/search?q=`

## Backend endpoints the frontend expects (`/api/v1`)

Reads: `GET /providers`, `/providers/:slug`, `/providers/:slug/related`, `/airports`, `/airports/featured`, `/airports/:code`, `/airports/:icao/nearby`, `/news`, `/news/:slug`, `/faqs`, `/pricing/plans`, `/ads/serve?placement=`.
Writes: `POST /enquiries`, `/providers/:slug/reviews`, `/contact`, `/contact/email-otp`, `/contact/email-otp/verify`, `/demo-requests`, `/demo-requests/email-otp`, `/demo-requests/email-otp/verify`, `/data-licence/requests`, `/advertising/enquiries`, `/newsletter/subscriptions`.
Auth: `POST /auth/register`, `/auth/login`, `/auth/logout`, `/auth/verify-email`, `/auth/resend-verification`, `/auth/forgot-password`, `/auth/reset-password`, `GET /auth/me`, `GET /auth/oauth/{google,linkedin}`.
Responses: `{ data: T }` on success, `{ error: { code, message, fieldErrors? } }` on failure; auth uses cookies (`credentials: "include"`).
