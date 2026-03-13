# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CourtOps is a multi-tenant SaaS platform for managing padel/sports club operations (bookings, payments, clients, tournaments, kiosk sales, cash register). Built with Next.js App Router, deployed on Vercel with Neon PostgreSQL.

The main application lives in `/courtops/`. The `/design-system/` directory is a placeholder.

## Commands

All commands run from the `courtops/` directory:

```bash
npm run dev          # Dev server (Turbopack)
npm run build        # prisma generate && next build --webpack
npm run lint         # ESLint 9
npm run test         # Playwright E2E tests
npm run test:unit    # Vitest unit tests
npx prisma migrate dev    # Run pending migrations
npx prisma generate       # Regenerate Prisma client after schema changes
npx prisma db seed        # Seed demo data (uses tsx prisma/seed.ts)
```

## Architecture

### Multi-Tenancy

Every data model includes a `clubId` column as tenant discriminator. **All database queries MUST filter by `clubId`.**

- `getCurrentClubId()` from `src/lib/tenant.ts` — reads clubId from NextAuth session; redirects to `/login` if missing. Use this at the start of every server action.
- `getOptionalClubId()` — returns null instead of redirecting (for public pages).
- `getOrCreateTodayCashRegister(clubId)` — ensures a cash register exists for today before recording transactions.
- `getEffectivePrice(clubId, date, ...)` — resolves the correct price using PriceRule priority matching (court-specific rules take precedence over global ones).

### Backend Pattern: Server Actions + Route Handlers

- **Server Actions** (`src/actions/`) — primary backend logic, called from client components. Always start with `getCurrentClubId()`.
- **Route Handlers** (`src/app/api/`) — used for webhooks (MercadoPago), cron jobs (reminders, no-show), auth (NextAuth), exports, and dashboard data endpoints.
- **Services** (`src/services/`) — extracted business logic shared across actions and routes.

### Authentication & Roles

NextAuth 4 with Credentials provider (`src/lib/auth.ts`). Session contains `{ id, email, name, clubId, role }`.

Roles: `GOD` > `SUPER_ADMIN` > `ADMIN` > `STAFF`. Use `isSuperAdmin(user)` to check elevated access.

Special flows: impersonation via HMAC-signed tokens (60s expiry), emergency bypass via `MASTER_ADMIN_EMAIL`/`MASTER_ADMIN_PASSWORD` env vars.

### Routing

- **Protected routes** under `src/app/(protected)/` — layout checks `getServerSession()`.
- **Public routes**: `/[slug]` (white-label booking pages), `/login`, `/register`, `/pay`, `/torneo/[id]`.
- **Super admin**: `/god-mode` (requires GOD role).

### State Management

- Server Components by default (direct Prisma access).
- React Query (`@tanstack/react-query`) for client-side server state.
- React Context for app state: `LanguageContext` (i18n), `EmployeeContext`, `PerformanceContext`.
- Pusher for real-time updates (channels: `club-${clubId}`).

### Caching

Dual-layer: in-memory LRU (dev/fallback) + Redis via `REDIS_URL` (production). Default TTL: 5 minutes. See `src/lib/cache.ts`.

### Key Integrations

- **MercadoPago** — payment processing & SaaS subscriptions. Club-specific access tokens stored in `Club.mpAccessToken`. Webhooks at `/api/webhooks/mercadopago`.
- **Resend** — transactional email.
- **Pusher** — real-time WebSocket updates.

## Tech Stack

Next.js 16 (React 19) · TypeScript 5 (strict) · Tailwind CSS 4 · Radix UI · Prisma 5 · PostgreSQL (Neon) · Zod 4 · Framer Motion · PWA via `@ducanh2912/next-pwa`

Path alias: `@/*` → `./src/*`

## Conventions

- Language: codebase mixes Spanish (UI text, comments, some filenames) and English (code identifiers, component names).
- Dates/times: always handle in Argentina timezone (`America/Argentina/Buenos_Aires`). Use `nowInArg()` and `fromUTC()` from `src/lib/date-utils.ts`.
- Pricing: uses PriceRule model with priority-based matching, not static price fields. Supports court-specific overrides and member discounts.
- Validation: Zod schemas in `src/schemas/` for both client and server validation.
