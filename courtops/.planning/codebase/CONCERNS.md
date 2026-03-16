# Technical Concerns

## Critical Issues

### Security
- **Server action auth bypass risk:** Layout-level auth only protects page rendering. Server actions can be invoked directly via POST. Every action MUST call `getCurrentClubId()` internally. Audit needed to verify all 152+ exported functions.
- **`$executeRawUnsafe` in diagnostic.ts:** `repairDatabase()` uses raw SQL — currently hardcoded (safe), but the pattern is risky if extended.
- **SQL Explorer in god-mode:** `admin-query.ts` uses `$queryRawUnsafe` with user-provided SQL. Has keyword blocking + GOD role check, but SQL injection via creative bypasses is possible. Consider read-only database role.
- **Impersonation tokens:** 60s expiry is good, but HMAC secret is derived from `NEXTAUTH_SECRET` — if leaked, all impersonation tokens are compromised.

### Data Integrity
- **Missing clubId filter risk:** Any server action that forgets `clubId` in a Prisma query leaks data across tenants. No database-level RLS (Row Level Security) enforcement.
- **Soft delete inconsistency:** Some models have `deletedAt`, others use hard delete. No middleware to auto-filter soft-deleted records.

## Technical Debt

### Type Safety
- **`any` types widespread:** `club?: any` used in many components (`AppShell`, `MobileBottomNav`, `Sidebar`). Should be typed with Prisma-generated types.
- **Inconsistent error types:** Some actions return `{ success, error: string }`, others return `{ success, error: Error }`.
- **Missing Prisma relation types:** Cron route `reminders/route.ts` had type errors with `booking.client`, `booking.court` (pre-existing, not from our changes).

### Code Organization
- **Large files:**
  - `src/services/booking.service.ts` (~677 lines) — handles create + cancel + pricing
  - `src/actions/manageBooking.ts` (~546 lines) — multiple booking operations
  - `src/actions/super-admin.ts` (~500+ lines) — all god-mode operations
  - `src/components/BookingManagementModal.tsx` (~400+ lines)
  - `src/components/clients/ClientsDashboard.tsx` (~400+ lines)
- **Duplicated phone normalization:** Both `messaging.ts:getWhatsAppUrl()` and `whatsapp.ts:normalizePhone()` handle Argentina phone formatting independently.

### Dependencies
- **MercadoPago SDK v2:** Using older API patterns. Meta SDK may have newer versions.
- **next-auth v4:** v5 (Auth.js) available with better App Router support.

## Performance Concerns

### Database
- **No explicit indexes audit:** Prisma auto-creates indexes on `@id` and `@unique`, but composite queries (e.g., bookings by clubId + date range) may need manual indexes.
- **N+1 potential:** `Promise.all(bookings.map(async (b) => { ... }))` pattern in cron jobs — each iteration makes individual DB calls.
- **No connection pooling config:** Using default Prisma connection pool. Neon serverless may need `@prisma/adapter-neon` for optimal performance.

### Frontend
- **265+ components:** Bundle size could be large. No code splitting analysis done.
- **Framer Motion on every page:** Animation library loaded even on simple pages.
- **Recharts full import:** Chart library imported for dashboard — heavy bundle.

### Caching
- **Redis not configured in production yet:** Falling back to in-memory LRU (lost on serverless cold start).
- **No cache warming strategy:** First request after cold start always hits DB.

## Missing Features / TODOs
- `src/lib/messaging.ts:101` — ~~WhatsApp API integration~~ (DONE — implemented via `whatsapp.ts`)
- **Waitlist auto-notification:** `notifyWaitingList()` now calls WhatsApp API, but no email fallback.
- **SMS notifications:** No SMS provider integrated.
- **Google Calendar sync:** Referenced in UI but not implemented.
- **Advanced analytics:** LTV, churn prediction, booking forecasting — not built.
- **GDPR/compliance:** No data export or deletion flow for end users.
- **Rate limiting on server actions:** Middleware handles API routes but not server action invocations.

## Fragile Areas

### Booking Creation Flow (`booking.service.ts`)
- Complex transaction: creates booking + optional payment + cash register entry + WhatsApp notification + Pusher event
- If any step fails mid-flow, partial state can result (booking created but payment not recorded)
- No database transaction wrapping the full flow

### Price Resolution (`getEffectivePrice`)
- Priority-based matching with many conditions (time, day, date range, court-specific, member discount)
- Edge cases: overlapping rules, missing rules, timezone mismatches
- No unit tests

### MercadoPago Webhooks
- Webhook handler processes payment notifications
- If Vercel function times out or crashes mid-processing, payment status can desync
- No idempotency check (same webhook could be processed twice)

## Hardcoded Values
- `GTM-5J6QTJSP` — Google Tag Manager ID in layout
- `courtops.saas@gmail.com` — replyTo email in email templates
- `https://wa.me/5493524421497` — WhatsApp support number in welcome email
- `v4.1.0` — version string in god-mode page
- `90` — default booking duration in minutes (should be per-club setting)
- `60` — impersonation token TTL seconds
- `5 * 60 * 1000` — cache TTL (5 minutes)

## Recommendations (Prioritized)

1. **Add database-level RLS** or a Prisma middleware to enforce `clubId` filtering automatically
2. **Type the `club` prop** across all components (replace `any`)
3. **Add unit tests** for pricing engine, booking service, and auth helpers
4. **Wrap booking creation in a database transaction** (`prisma.$transaction`)
5. **Add idempotency** to MercadoPago webhook handler
6. **Configure Redis** for production caching
7. **Audit all server actions** for proper `getCurrentClubId()` usage
8. **Split large files** (booking.service.ts, manageBooking.ts, super-admin.ts)
9. **Add Prisma composite indexes** for common query patterns
10. **Upgrade to next-auth v5** for better App Router integration
