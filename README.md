# deya-app

Public website of the Deya confectionery factory — https://deya.uz.
Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4. Content comes
from the Django/DRF API at `/api/v1/` in three languages (`uz`, `ru`, `en`).

## Getting started

```bash
cp .env.example .env.local   # then fill in the values, see Configuration
npm install
npm run dev                  # http://localhost:3000 (redirects to /ru)
```

| Script          | What it does                                              |
| --------------- | --------------------------------------------------------- |
| `npm run dev`   | Development server                                        |
| `npm run build` | Production build (prerenders every page, see Caching)     |
| `npm run start` | Serve the production build                                |
| `npm run lint`  | ESLint                                                    |
| `npm test`      | Unit tests for the pure helpers in `src/lib` (`node:test`) |

## Configuration

All configuration is environment variables. `.env.example` lists them; set
every one explicitly in each environment rather than relying on defaults.

| Variable               | Public? | Example            | Used for |
| ---------------------- | ------- | ------------------ | -------- |
| `NEXT_PUBLIC_API_URL`  | yes     | `https://deya.uz`  | Backend origin. Scheme + host only — the code adds `/api/v1/...`. |
| `NEXT_PUBLIC_SITE_URL` | yes     | `https://deya.uz`  | Public origin of this site: canonical URLs, hreflang, `og:url`, `sitemap.xml`, `robots.txt`. Falls back to `https://deya.uz` if unset; a preview deploy should point at itself. |
| `REVALIDATION_SECRET`  | **no**  | `openssl rand -hex 32` | Bearer token for `POST /api/revalidate`. Server-only — never prefix it with `NEXT_PUBLIC_`. Unset = the endpoint refuses every request. |

`NEXT_PUBLIC_*` values are inlined into the browser bundle at build time and
are public. On Netlify the public ones are in `netlify.toml`; set
`REVALIDATION_SECRET` in the Netlify UI.

## Caching

Every page is prerendered at build time (all products included) and
regenerated in the background at most every 5 minutes (ISR). On top of that,
the Django admin can refresh content immediately after a change by calling
`POST /api/revalidate` — the request format and what each event refreshes are
documented at the top of `src/app/api/revalidate/route.ts`. The 5-minute
refresh stays as the fallback if a call is missed.
