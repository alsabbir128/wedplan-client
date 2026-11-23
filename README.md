# WedPlan Client

Responsive Next.js frontend for WedPlan, a wedding planning marketplace connecting couples with wedding service providers.

## Features

- Responsive wedding marketplace landing page and live service directory
- Category, keyword, location, and price sorting filters initialized from URL parameters
- Public service detail pages with customer-only booking requests
- Better Auth email/password accounts backed by MongoDB Atlas; new accounts default to customer
- Server-guarded customer, vendor, and admin dashboards backed by the Express API
- Vendor application and administrator approval flow, vendor-owned service management, and booking responses
- ImgBB image uploads proxied through the Express API
- Stripe-hosted monthly vendor subscription Checkout and subscription status from verified webhooks

## Technology

Next.js 16, React 19, TypeScript, Tailwind CSS 4, Better Auth, MongoDB Atlas, SWR, Lucide icons. The Express API is maintained in the separate `alsabbir128/wedplan-server` repository.

## Local setup

1. Install Node.js 20 or newer and pnpm.
2. Copy `.env.example` to `.env.local` and set MongoDB and Better Auth values. Keep the real values out of Git.
3. Install the client dependencies with `pnpm install`.
4. In the separate `wedplan-server` repository, configure its `.env` from that repository&apos;s `.env.example` and run `npm install`.
5. Start the API with `npm run dev` from the server repository, then start this client with `pnpm dev` and open `http://localhost:3000`.

The client does not seed or present sample listings as live records. It reads marketplace data from the Express API.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB Atlas connection string used by Better Auth; server-only |
| `MONGODB_DB` | Optional database name |
| `BETTER_AUTH_SECRET` | Better Auth signing secret; at least 32 random characters |
| `BETTER_AUTH_URL` | Optional canonical Better Auth URL; otherwise Vercel/runtime URL selection is used |
| `BETTER_AUTH_AUDIENCE` | JWT audience expected by the API; defaults to `wedplan-api` |
| `API_SERVER_ORIGIN` | Server-only Express API origin, such as `http://localhost:4000`; required on the deployed client so its same-origin proxy can reach the API |

The separate Express deployment also requires its own MongoDB, JWKS/issuer/audience, Stripe, ImgBB, and allowed-origin configuration. Stripe secret keys and webhook secrets belong only in the API deployment, never in browser code. The monthly Stripe Price ID is configured server-side; the marketplace has no agreed plan price hardcoded in this repository.

## Repository links

- Client: https://github.com/alsabbir128/wedplan-client
- Server: https://github.com/alsabbir128/wedplan-server
- Live website: not deployed yet
