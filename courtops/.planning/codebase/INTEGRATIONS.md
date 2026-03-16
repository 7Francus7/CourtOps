# External Integrations

## Payment Processing — MercadoPago
- **SDK:** `mercadopago` v2.12.0
- **Config:** `src/lib/mercadopago.ts`
- **Actions:** `src/actions/mercadopago.ts`
- **Webhook:** `src/app/api/webhooks/mercadopago/route.ts`
- **Features:** Preferences (one-time), PreApproval (subscriptions), refunds
- **Multi-tenant:** per-club access tokens stored encrypted in `Club.mpAccessToken`
- **Webhook security:** HMAC-SHA256 signature verification
- **Env vars:** `MP_ACCESS_TOKEN`, `NEXT_PUBLIC_MP_PUBLIC_KEY`, `MP_WEBHOOK_SECRET`

## Email — Resend
- **SDK:** `resend` v6.9.2
- **Config:** `src/lib/email.ts`
- **Templates:** welcome, password reset, booking reminder
- **Language:** Spanish (HTML templates with CourtOps branding)
- **Env vars:** `RESEND_API_KEY`, `EMAIL_FROM`
- **Fallback:** simulates sends with console.warn if API key missing

## WhatsApp — Meta Cloud API
- **Client:** `src/lib/whatsapp.ts`
- **Service:** `src/lib/messaging.ts` (MessagingService class)
- **Webhook:** `src/app/api/webhooks/whatsapp/route.ts`
- **Features:** text messages (24h window), template messages (business-initiated)
- **Phone normalization:** Argentina numbers (54 prefix, handles 0XX local format)
- **Env vars:** `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`, `WHATSAPP_VERIFY_TOKEN`
- **Fallback:** simulates sends if not configured

## Real-time — Pusher
- **SDK:** `pusher` v5.3.2 (server), `pusher-js` v8.4.0 (client)
- **Config:** `src/lib/pusher.ts`
- **Channels:** `club-${clubId}` (per-tenant isolation)
- **Events:** `booking-update`, `notification`
- **Env vars:** `PUSHER_APP_ID`, `NEXT_PUBLIC_PUSHER_KEY`, `PUSHER_SECRET`, `NEXT_PUBLIC_PUSHER_CLUSTER`
- **Fallback:** stub (noop) if env vars missing

## Database — PostgreSQL (Neon)
- **ORM:** Prisma 5.22.0
- **Client:** `src/lib/db.ts` (singleton pattern)
- **Schema:** `prisma/schema.prisma` (20+ models, all with clubId)
- **Connection:** pooled via Neon serverless driver
- **Migrations:** run locally (`npx prisma migrate dev`), NOT in Vercel build
- **Env vars:** `DATABASE_URL`, `DIRECT_URL`, `POSTGRES_URL`

## Caching — Redis + LRU
- **Config:** `src/lib/cache.ts`
- **Production:** Redis via `REDIS_URL`
- **Dev/fallback:** in-memory LRU (100 keys max)
- **Default TTL:** 5 minutes
- **Pattern invalidation:** supported

## Monitoring — Sentry
- **SDK:** `@sentry/nextjs` v10.43.0
- **Config:** `sentry.client.config.ts`, `sentry.server.config.ts`, `next.config.ts`
- **Features:** global error handler, source map uploads
- **Env vars:** `SENTRY_ORG`, `SENTRY_PROJECT`

## Analytics — Google Tag Manager
- **GTM ID:** `GTM-5J6QTJSP`
- **Loaded in:** root layout
- **Google Analytics** via GTM script

## Authentication — NextAuth 4
- **Config:** `src/lib/auth.ts`
- **Provider:** Credentials (email + password)
- **Session strategy:** JWT (30-day max age)
- **Roles:** GOD > SUPER_ADMIN > ADMIN > STAFF
- **Special flows:** HMAC impersonation tokens (60s), emergency bypass
- **Env vars:** `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `MASTER_ADMIN_EMAIL`, `MASTER_ADMIN_PASSWORD`

## Deployment — Vercel
- **Platform:** Vercel (serverless)
- **Cron jobs:** `vercel.json` — reminders (12:00 UTC), no-show (every hour)
- **Build:** `prisma generate && next build --webpack`
- **PWA:** `@ducanh2912/next-pwa` (service worker, offline support)
- **Env vars:** `CRON_SECRET` (protects cron endpoints)

## Image Processing — Sharp
- **SDK:** `sharp` v0.34.5
- **Remote patterns:** MercadoLibre, Google, Vercel Blob, courtops.net
- **Convention:** use native `<img>` for user-uploaded URLs (not next/image)
