# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CourtOps is a multi-tenant SaaS platform for managing padel/sports club operations (bookings, payments, clients, tournaments, kiosk sales, cash register, QR check-in, digital waivers, referral system). Built with Next.js App Router, deployed on Vercel with Neon PostgreSQL.

The main application lives in `/courtops/`. The `/design-system/` directory is a placeholder.

## Commands

All commands run from the `courtops/` directory:

```bash
npm run dev          # Dev server (Turbopack)
npm run build        # prisma generate && next build --webpack
npm run lint         # ESLint 9
npm run test         # Playwright E2E tests
npm run test:unit    # Vitest unit tests
npm run db:migrate   # prisma migrate deploy (run locally, NOT in Vercel build)
npx prisma generate  # Regenerate Prisma client after schema changes
npx prisma db seed   # Seed demo data (uses tsx prisma/seed.ts)
```

**Important:** `prisma migrate deploy` is NOT in the build script — Vercel can't reach Neon during build (P1002 error). Run migrations locally with `npm run db:migrate`.

## Architecture

### Multi-Tenancy

Every data model includes a `clubId` column as tenant discriminator. **All database queries MUST filter by `clubId`.**

- `getCurrentClubId()` from `src/lib/tenant.ts` — reads clubId from NextAuth session; redirects to `/login` if missing. Use this at the start of every server action.
- `getOptionalClubId()` — returns null instead of redirecting (for public pages).
- `getOrCreateTodayCashRegister(clubId)` — ensures a cash register exists for today before recording transactions.
- `getEffectivePrice(clubId, date, ...)` — resolves the correct price using PriceRule priority matching (court-specific rules take precedence over global ones).
- `enforceActiveSubscription(clubId)` — throws if club subscription is not active.

### Backend Pattern: Server Actions + Route Handlers

- **Server Actions** (`src/actions/`) — primary backend logic (42 files). Always start with `getCurrentClubId()`.
- **Route Handlers** (`src/app/api/`) — used for webhooks (MercadoPago, WhatsApp), cron jobs (reminders, no-show, membership-expiry, audit-cleanup, trial-expiry, webhook-retry), auth (NextAuth), exports, and dashboard data endpoints.
- **Services** (`src/services/`) — extracted business logic shared across actions and routes (currently `booking.service.ts`).

### Authentication & Roles

NextAuth 4 with Credentials provider (`src/lib/auth.ts`). Session contains `{ id, email, name, clubId, role }`.

Roles: `GOD` > `SUPER_ADMIN` > `ADMIN` > `STAFF`. Use `isSuperAdmin(user)` to check elevated access.

Special flows: impersonation via HMAC-signed tokens (60s expiry), emergency bypass via `MASTER_ADMIN_EMAIL`/`MASTER_ADMIN_PASSWORD` env vars.

**Super admin actions** (`src/actions/super-admin.ts`): Every exported function MUST call `checkOnlyDellorsif()` for auth. The layout auth only protects page rendering, not direct server action invocations.

### Routing

**Protected routes** (under `src/app/(protected)/`):
`/dashboard`, `/dashboard/billing`, `/dashboard/suscripcion`, `/reservas`, `/clientes`, `/clientes/[id]`, `/caja`, `/caja/stats`, `/torneos`, `/torneos/[id]`, `/torneos/nuevo`, `/configuracion`, `/configuracion/academia`, `/reportes`, `/actividad`, `/auditoria`, `/check-in`, `/setup`, `/diagnostics`

**Public routes**: `/[slug]` and `/p/[slug]` (white-label booking), `/login`, `/register`, `/forgot-password`, `/pay/[id]`, `/torneo/[id]`, `/check-in/[token]`, `/calculator`, `/reservar`, `/tv`, `/legal/privacy`, `/legal/terms`

**Super admin**: `/god-mode` (requires GOD role)

**API routes** (`src/app/api/`):
- `/auth/[...nextauth]` — NextAuth credential provider
- `/bookings`, `/bookings/[id]/*` — Booking CRUD + payment link generation
- `/cron/*` — `audit-cleanup`, `membership-expiry`, `no-show`, `reminders`, `trial-expiry`, `webhook-retry`
- `/dashboard/*` — `alerts`, `courts`, `daily-financials`, `debts`, `heatmap`, `settings`, `turnero`, `weekly-revenue`
- `/export/*` — CSV/Excel exports: `bookings`, `caja`, `clients`
- `/mercadopago/oauth/*` — OAuth flow
- `/webhooks/mercadopago`, `/webhooks/whatsapp`

### State Management

- Server Components by default (direct Prisma access).
- React Query (`@tanstack/react-query`) for client-side server state.
- React Context for app state: `LanguageContext` (i18n), `EmployeeContext`, `PerformanceContext`.
- Pusher for real-time updates (channels: `club-${clubId}`).

### Caching

Dual-layer: in-memory LRU (dev/fallback) + Redis via `REDIS_URL` (production). Default TTL: 5 minutes. See `src/lib/cache.ts`. Club-specific cache in `src/lib/club-cache.ts`. Circuit breaker pattern (`src/lib/circuit-breaker.ts`) wraps external API calls.

### Key Integrations

- **MercadoPago** — payment processing & SaaS subscriptions. Club-specific access tokens stored in `Club.mpAccessToken`. Webhooks at `/api/webhooks/mercadopago`. Payment module in `src/lib/payment/`.
- **WhatsApp Cloud API** — booking reminders & notifications via Meta Business Platform. Uses `WHATSAPP_TOKEN` and `WHATSAPP_PHONE_ID` env vars. Falls back to simulation if not configured. See `src/lib/whatsapp.ts`.
- **Resend** — transactional email via `src/lib/email.ts` (3,000 free/month).
- **Pusher** — real-time WebSocket updates via `src/lib/pusher.ts`.
- **Sentry** — error tracking (configured in `next.config.ts`).

### Feature Modules

| Module | Actions | Components | Description |
|--------|---------|------------|-------------|
| Bookings | `createBooking.ts`, `manageBooking.ts` | `BookingModal`, `BookingManagementModal` | Core reservation system with dynamic pricing |
| Check-in | `checkin.ts` | `BookingQRCode`, check-in pages | QR-based attendance tracking |
| Kiosco/POS | `kiosco.ts` | `DesktopKiosco`, `MobileKiosco` | Point of sale with stock management |
| Tournaments | `tournaments.ts` | `BracketView`, `FlyerGenerator` | Brackets, zones, categories, public signup |
| Memberships | `memberships.ts`, `club-memberships.ts` | `MembershipPlansConfig` | Subscription plans with MercadoPago auto-debit |
| Waivers | `waivers.ts` | `SignaturePad`, `WaiversTab` | Digital liability agreements with e-signature |
| Referrals | `referrals.ts` | `ReferralSection` in ClientDetailView | 6-char referral codes with tracking |
| Cash Register | `cash-register.ts` | `CashRegisterReport` | Daily open/close with transaction tracking |
| Reports | `reports.ts` | Report components | Financial analytics, occupancy, exports |
| Matchmaking | `matchmaking.ts`, `open-matches.ts` | — | Open match listing and player matching |
| Academy | `teachers.ts`, `team.ts` | — | Teacher/coach management |
| Turnero | `turnero.ts` | `TurneroGrid`, `MobileTurnero` | Waiting list and court turnover management |
| AI Assistant | `ai-assistant.ts` | `ai/` components | In-app AI chat with club knowledge base |
| Notifications | `notifications.ts` | `NotificationsSheet` | In-app notifications with Pusher real-time |
| Audit | `audit.ts` | Audit log page | User action tracking with IP/user agent |

## Tech Stack

Next.js 16 (React 19) · TypeScript 5 (strict) · Tailwind CSS 4 · Radix UI · Prisma 5 · PostgreSQL (Neon) · Zod 4 · Framer Motion · React Query 5 · Recharts · PWA via `@ducanh2912/next-pwa` · qrcode.react · Sonner (toasts) · IORedis 5

Path alias: `@/*` → `./src/*`

## Directory Structure

```
courtops/src/
├── actions/          # 42 server action files
├── app/              # Next.js App Router
│   ├── (protected)/  # Auth-guarded routes
│   ├── api/          # Route handlers (webhooks, cron, exports)
│   └── [public]/     # Public-facing pages
├── components/
│   ├── ai/           # AI assistant UI
│   ├── booking/      # Booking modals and forms
│   ├── clients/      # Client management UI
│   ├── config/       # Configuration panels
│   ├── dashboard/    # Dashboard widgets and charts
│   ├── help/         # Help components
│   ├── kiosco/       # POS/Kiosk interfaces
│   ├── landing/      # Landing page sections
│   ├── layout/       # Header, Sidebar, MobileBottomNav, AppShell
│   ├── onboarding/   # Setup wizard
│   ├── providers/    # React providers and context wrappers
│   ├── public/       # Public-facing booking components
│   ├── pwa/          # Progressive Web App features
│   ├── setup/        # Setup flow components
│   ├── subscription/ # Plan selection, billing
│   ├── super-admin/  # God-mode admin tools
│   ├── tournaments/  # Tournament bracket views
│   └── ui/           # Base UI components (Radix UI wrappers)
├── contexts/         # LanguageContext, EmployeeContext, PerformanceContext
├── hooks/            # Custom React hooks
├── lib/              # 25 utility/service files
├── schemas/          # Zod validation schemas
├── services/         # booking.service.ts
└── types/            # TypeScript type definitions
```

### Key Layout Files

- `src/app/layout.tsx` — Root layout: Space Grotesk font, dynamic club theming, GTM, PWA
- `src/app/(protected)/layout.tsx` — Protected wrapper: AppShell, ThemeRegistry, SystemAlerts, TrialBanner, GlobalModals, AiAssistant, CommandPalette
- `src/components/layout/AppShell.tsx` — Main flex container
- `src/components/layout/Sidebar.tsx` — Desktop sidebar (`hidden md:flex`), auto-collapses on <1280px, width `w-[78px]` collapsed / `w-68` expanded
- `src/components/layout/MobileBottomNav.tsx` — Mobile bottom nav (`md:hidden`), fixed bottom with `pb-[env(safe-area-inset-bottom)]`
- `src/components/layout/Header.tsx` — Sticky header with breadcrumbs, search (`hidden lg:flex`), mobile search button (`lg:hidden`), notifications

### Responsive Layout Pattern

```
Desktop (md+):
┌─────────────────────────────────────┐
│ Header (sticky, z-40)               │
├──────────┬──────────────────────────┤
│ Sidebar  │ Main Content (scrollable) │
│ (78-272px│ overflow-y-auto           │
│ collapse)│                           │
└──────────┴──────────────────────────┘

Mobile (<md):
┌──────────────────────────────┐
│ Header (sticky)              │
├──────────────────────────────┤
│ Main Content + pb-28         │
├──────────────────────────────┤
│ Bottom Nav (fixed, z-80)     │
└──────────────────────────────┘
```

## Data Models (40+ Prisma models)

Core: `Club`, `User`, `Employee`
Booking: `Booking`, `BookingItem`, `BookingPlayer`, `Court`, `WaitingList`
Clients: `Client`, `MembershipPlan`, `Membership`, `Teacher`
Pricing: `PriceRule`, `Product`, `Transaction`, `TransactionItem`, `CashRegister`
Tournaments: `Tournament`, `TournamentCategory`, `TournamentTeam`, `TournamentGroup`, `TournamentMatch`
Legal: `Waiver`, `WaiverSignature`
Platform: `Referral`, `PlatformPlan`, `Notification`, `SystemNotification`, `AuditLog`, `PasswordResetToken`, `WebhookQueue`

## Environment Variables

```
DATABASE_URL          # PostgreSQL connection (Neon)
DIRECT_URL            # Direct DB URL for migrations
NEXTAUTH_SECRET       # Session signing key
NEXTAUTH_URL          # Callback URL
REDIS_URL             # Redis (optional, falls back to in-memory LRU)
WHATSAPP_TOKEN        # WhatsApp Business API token
WHATSAPP_PHONE_ID     # WhatsApp Business phone ID
SENTRY_ORG            # Sentry org slug
SENTRY_PROJECT        # Sentry project name
MASTER_ADMIN_EMAIL    # Emergency bypass credentials
MASTER_ADMIN_PASSWORD # Emergency bypass credentials
```

No `.env.example` in repo — credentials managed via Vercel project settings.

## Conventions

- **Language**: codebase mixes Spanish (UI text, comments, some filenames) and English (code identifiers, component names). User-facing text is always in Spanish.
- **Dates/times**: always handle in Argentina timezone (`America/Argentina/Buenos_Aires`). Use `nowInArg()` and `fromUTC()` from `src/lib/date-utils.ts`. Client-side formatting in `src/lib/client-date-utils.ts`.
- **Pricing**: uses PriceRule model with priority-based matching, not static price fields. Supports court-specific overrides and member discounts.
- **Validation**: Zod schemas in `src/schemas/` for both client and server validation.
- **Images**: use native `<img>` for user-uploaded URLs (logos, etc.) — NOT `next/image`, to avoid `remotePatterns` config issues. Always add `onError` fallback.
- **Design system**: dark theme default. Key classes: `bg-card`, `border-border`, `text-foreground`, `text-muted-foreground`, `btn-primary`, `input-theme`. Rounded corners: `rounded-2xl` to `rounded-3xl`. Dynamic theming via CSS variables (`--primary`, etc.) injected per club at root layout.
- **Icons**: `lucide-react` exclusively. No emoji in code unless user requests it.
- **Toasts**: `sonner` via `toast.success()` / `toast.error()`.
- **Auth guards**: Every server action in `src/actions/` must start with `getCurrentClubId()`. Every super-admin action must call `checkOnlyDellorsif()`.
- **Error handling**: use `src/lib/safe-action.ts` wrapper for consistent server action error handling.
- **Logging**: use `src/lib/logger.ts` for structured logging, `src/lib/app-logger.ts` for app-level logs.
- **Responsive breakpoints**: `sm:` 640px, `md:` 768px, `lg:` 1024px, `xl:` 1280px. Mobile-first. Touch targets minimum 44x44px. Data grids/heatmaps need `overflow-x-auto` wrappers with `min-w-[Npx]` inner containers on mobile.

## Common Pitfalls

- **Vercel build fails with P1002**: Don't add `prisma migrate deploy` to the build script. Run migrations locally.
- **next/image with external URLs**: Use `<img>` instead, with `onError` fallback. `remotePatterns` config is fragile with user-uploaded URLs.
- **Missing clubId filter**: NEVER query without `clubId` in a tenant-scoped action. This leaks data across clubs.
- **Server action auth bypass**: Layout-level auth checks DON'T protect server actions from direct invocation. Always add auth inside the action itself.
- **UTC vs Argentina time**: `new Date()` on Vercel returns UTC. Always convert with `nowInArg()` for user-facing dates.
- **Missing subscription enforcement**: Use `enforceActiveSubscription(clubId)` in premium feature actions.
- **Real-time updates**: After mutations affecting the court grid or bookings, emit a Pusher event on `club-${clubId}` so other connected clients update.
- **Horizontal overflow on mobile**: Heatmaps and wide grids must be wrapped in `overflow-x-auto` with a `min-w-[Npx]` inner div. Never use `grid-cols-[repeat(N,1fr)]` without a minimum width constraint for mobile.
