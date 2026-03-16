# Architecture

## Pattern
- **Next.js App Router** with Server Components by default
- **Server Actions** as primary backend (not REST APIs)
- **Multi-tenant SaaS** with per-row tenant isolation (`clubId`)

## Layers

```
UI (React Components)
  ↓ calls
Server Actions (src/actions/) — auth + business logic entry points
  ↓ delegates complex logic to
Services (src/services/) — reusable business logic
  ↓ queries
Prisma ORM → PostgreSQL (Neon)
  ↓ side effects
Integrations (MercadoPago, WhatsApp, Resend, Pusher)
```

## Data Flow

### Read Path (Server Component)
```
Page (server) → Prisma query with clubId filter → render HTML
```

### Write Path (Server Action)
```
Client Component → Server Action → getCurrentClubId() → validate (Zod) → Prisma mutation → revalidatePath → Pusher event
```

### Public Path (no auth)
```
/[slug] page → getOptionalClubId() → Prisma query by slug → render public booking UI
```

### Webhook Path
```
External service → /api/webhooks/* → verify signature → Prisma mutation → Pusher event
```

## Multi-Tenancy Pattern
- **Discriminator:** `clubId` column on every data model
- **Enforcement:** `getCurrentClubId()` at start of every server action
- **Public access:** `getOptionalClubId()` returns null instead of redirecting
- **Super admin:** bypasses clubId filter via GOD role
- **Risk:** direct server action invocation bypasses layout-level auth — must check inside action

## Authentication & Authorization

### Auth Flow
```
Login → NextAuth Credentials → JWT session → { id, email, name, clubId, role }
```

### Role Hierarchy
| Role | Access |
|------|--------|
| GOD | All clubs, god-mode panel, impersonation |
| SUPER_ADMIN | All clubs (same as GOD functionally) |
| ADMIN | Own club — full access |
| STAFF | Own club — limited by Employee permissions JSON |

### Special Auth
- **Impersonation:** `generateImpersonationToken(clubId)` → HMAC-signed token (60s TTL) → auto-login as club admin
- **Emergency bypass:** `MASTER_ADMIN_EMAIL` + `MASTER_ADMIN_PASSWORD` env vars → GOD role
- **Employee PIN login:** local PIN-based login within a club session

## Key Abstractions
- **`getCurrentClubId()`** — tenant gate for all server actions (`src/lib/tenant.ts`)
- **`getEffectivePrice()`** — resolves pricing via PriceRule priority matching
- **`getOrCreateTodayCashRegister()`** — ensures daily cash register exists
- **`MessagingService`** — unified WhatsApp message generation + sending (`src/lib/messaging.ts`)
- **`sendTextMessage()` / `sendTemplateMessage()`** — WhatsApp Cloud API client (`src/lib/whatsapp.ts`)
- **`pusherServer.trigger()`** — real-time event broadcasting (`src/lib/pusher.ts`)
- **`cache.get()` / `cache.set()`** — dual-layer caching (`src/lib/cache.ts`)

## Entry Points
- **Pages:** `src/app/(protected)/*/page.tsx` — 16 protected pages
- **Public pages:** `src/app/[slug]/page.tsx`, `src/app/p/[slug]/page.tsx`
- **API routes:** `src/app/api/` — webhooks, cron, auth, exports, dashboard data
- **Server actions:** `src/actions/` — 36 files, ~152 exported functions
- **God mode:** `src/app/god-mode/page.tsx`
