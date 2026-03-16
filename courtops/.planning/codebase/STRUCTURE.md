# Directory Structure

## Top-Level Layout
```
courtops/
├── src/                    # Application source
├── prisma/                 # Database schema + migrations + seed
├── public/                 # Static assets (icons, manifest, sw.js)
├── scripts/                # Utility scripts (changelog generator)
├── .claude/                # Claude Code config + GSD system
├── .planning/              # GSD planning documents (this directory)
├── next.config.ts          # Next.js config (Sentry, PWA, images)
├── vercel.json             # Cron jobs
├── package.json            # Dependencies + scripts
└── tsconfig.json           # TypeScript config
```

## Source Organization (src/)
```
src/
├── app/                    # Next.js App Router pages + API
│   ├── (protected)/        # Auth-required pages (layout checks session)
│   │   ├── dashboard/      # Main dashboard + suscripcion
│   │   ├── reservas/       # Booking management
│   │   ├── clientes/       # Client management + [id] detail
│   │   ├── caja/           # Cash register + stats
│   │   ├── torneos/        # Tournaments + [id] + nuevo
│   │   ├── configuracion/  # Club settings
│   │   ├── reportes/       # Financial reports
│   │   ├── auditoria/      # Audit log
│   │   ├── check-in/       # QR check-in scanner
│   │   ├── actividad/      # Activity feed
│   │   ├── setup/          # Onboarding wizard
│   │   └── diagnostics/    # DB diagnostics
│   ├── api/                # Route handlers
│   │   ├── auth/           # NextAuth [...nextauth]
│   │   ├── webhooks/       # MercadoPago, WhatsApp
│   │   ├── cron/           # reminders, no-show
│   │   ├── dashboard/      # Data endpoints (turnero, financials, etc.)
│   │   ├── export/         # CSV exports (bookings, caja, clients)
│   │   └── bookings/       # Public booking API
│   ├── [slug]/             # White-label public booking pages
│   ├── p/[slug]/           # Alternative public booking route
│   ├── god-mode/           # Super admin panel
│   ├── login/              # Login page
│   ├── register/           # Registration
│   ├── pay/[id]/           # Payment page
│   ├── torneo/[id]/        # Public tournament page
│   └── page.tsx            # Landing page
├── actions/                # Server actions (36 files, ~152 functions)
├── components/             # React components (265+ files)
│   ├── layout/             # AppShell, Sidebar, MobileBottomNav
│   ├── booking/            # Booking-related components
│   ├── clients/            # Client management views
│   ├── dashboard/          # Dashboard widgets
│   ├── super-admin/        # God mode components
│   ├── onboarding/         # Setup wizard
│   ├── landing/            # Landing page sections
│   └── ui/                 # Shared primitives
├── contexts/               # React contexts
│   ├── LanguageContext.tsx  # i18n (Spanish/English)
│   ├── EmployeeContext.tsx  # Employee PIN session
│   └── PerformanceContext.tsx
├── lib/                    # Utility libraries
│   ├── auth.ts             # NextAuth config + role helpers
│   ├── db.ts               # Prisma singleton
│   ├── tenant.ts           # Multi-tenancy helpers
│   ├── cache.ts            # Redis/LRU caching
│   ├── email.ts            # Resend email templates
│   ├── messaging.ts        # WhatsApp message generation
│   ├── whatsapp.ts         # Meta Cloud API client
│   ├── pusher.ts           # Real-time setup
│   ├── date-utils.ts       # Argentina timezone helpers
│   ├── mercadopago.ts      # MercadoPago client
│   └── utils.ts            # cn() and misc helpers
├── schemas/                # Zod validation schemas
├── services/               # Business logic
│   └── booking.service.ts  # Booking creation/cancellation logic
├── types/                  # TypeScript type definitions
└── middleware.ts           # Rate limiting, security headers, CSP
```

## Routing Structure
| Route | Type | Auth | Purpose |
|-------|------|------|---------|
| `/dashboard` | Protected | Required | Main dashboard |
| `/dashboard?view=bookings` | Protected | Required | Booking grid/calendar |
| `/reservas` | Protected | Required | Booking management |
| `/clientes` | Protected | Required | Client list |
| `/clientes/[id]` | Protected | Required | Client detail |
| `/caja` | Protected | Required | Cash register |
| `/torneos` | Protected | Required | Tournament list |
| `/configuracion` | Protected | Required | Club settings |
| `/reportes` | Protected | Required | Reports |
| `/check-in` | Protected | Required | QR scanner |
| `/god-mode` | Super Admin | GOD/SUPER_ADMIN | Platform admin |
| `/[slug]` | Public | None | White-label booking |
| `/login` | Public | None | Authentication |
| `/pay/[id]` | Public | None | Payment page |
| `/torneo/[id]` | Public | None | Public tournament |

## Naming Conventions
- **Components:** PascalCase (`BookingModal.tsx`, `ClientsDashboard.tsx`)
- **Actions:** camelCase files (`manageBooking.ts`), camelCase exports (`createBooking`)
- **API routes:** kebab-case dirs (`/api/cron/no-show/`)
- **Lib files:** kebab-case (`date-utils.ts`, `cash-register.ts`)
- **Schemas:** camelCase (`bookingSchema.ts`)
- **UI text:** Spanish (user-facing), English (code identifiers)
