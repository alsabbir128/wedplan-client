# WedPlan Client

Responsive Next.js frontend for WedPlan, a wedding planning marketplace connecting couples with wedding service providers.

## Features

- Responsive wedding marketplace home page and directory backed by approved, active MongoDB services
- Search, category and location filtering, and ascending/descending price sorting
- Authenticated service details and booking requests, with customer and vendor booking dashboards
- Role-based customer, vendor, and administrator areas
- Vendor service management, profile settings, authenticated ImgBB image uploads, admin moderation, and transaction review
- Stripe Checkout Premium subscription flow with cancellation; activation is restricted to verified webhook events

## Technology

Next.js 16, React 19, TypeScript, Tailwind CSS 4, Lucide icons.

## Local setup

1. Install Node.js 20 or newer and pnpm.
2. Run `pnpm install`.
3. Run `pnpm dev` and open `http://localhost:3000`.

The directory and homepage display only approved, active services returned by the Express API. Booking, moderation, billing, and profile actions are performed through authenticated server endpoints.

## Environment variables

The client uses Better Auth and the shared MongoDB-backed user database. Configure these in the local environment (or deployment settings), never in source control:

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `BETTER_AUTH_SECRET` | Better Auth signing/encryption secret |
| `BETTER_AUTH_URL` | Canonical client URL; set this in production |
| `WEDPLAN_API_URL` | Base URL of the separately deployed Express API (without `/api`) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Optional Google sign-in credentials |
| `IMGBB_API_KEY` | Server-only key for authenticated profile and service image uploads |

Stripe secret and webhook credentials belong on the API server only. The browser never receives them.

## Repository links

- Client: https://github.com/alsabbir128/wedplan-client
- Server: https://github.com/alsabbir128/wedplan-server
- Live website: not deployed yet
