# Technology Stack

## Runtime & Language
- **Node.js** (serverless via Vercel)
- **TypeScript 5** (strict mode enabled)
- Path alias: `@/*` → `./src/*`
- Config: `tsconfig.json`

## Framework
- **Next.js 16.1.6** (App Router)
- **React 19.2.3** (Server Components by default)
- Turbopack for dev (`npm run dev`)
- Webpack for production builds (`next build --webpack`)
- PWA via `@ducanh2912/next-pwa`

## Key Dependencies

### UI & Styling
- `tailwindcss` 4.0 — utility-first CSS
- `@radix-ui/*` — accessible primitives (dialog, dropdown, tabs, tooltip, etc.)
- `framer-motion` — animations
- `lucide-react` — icons (exclusive icon library)
- `sonner` — toast notifications
- `recharts` — data visualizations (dashboard charts)
- `next-themes` — dark/light mode

### Data & State
- `@prisma/client` 5.22.0 — ORM
- `@tanstack/react-query` — client-side server state
- `zod` 4.3.5 — schema validation
- `pusher` 5.3.2 / `pusher-js` 8.4.0 — real-time WebSocket

### Auth & Security
- `next-auth` 4 — authentication (Credentials provider, JWT sessions)
- `bcryptjs` — password hashing

### Payments & Email
- `mercadopago` 2.12.0 — payment processing
- `resend` 6.9.2 — transactional email

### Utilities
- `date-fns` — date manipulation (with `es` locale)
- `uuid` — UUID generation
- `qrcode.react` — QR code rendering
- `sharp` 0.34.5 — image optimization
- `xlsx` — Excel export

### Monitoring
- `@sentry/nextjs` 10.43.0 — error tracking

## Build & Dev Tools
- `eslint` 9 — linting (`npm run lint`)
- `playwright` — E2E testing (`npm run test`)
- `vitest` — unit testing (`npm run test:unit`)
- `tsx` — TypeScript execution (seed scripts)
- `prisma` 5.22.0 — DB migrations & generation

## Configuration Files
- `next.config.ts` — Sentry, PWA, image optimization, webpack config
- `tsconfig.json` — strict TypeScript
- `tailwind.config.ts` — theme customization
- `prisma/schema.prisma` — database schema (20+ models)
- `vercel.json` — cron jobs configuration
- `.env` / `.env.local` — environment variables
- `sentry.client.config.ts` / `sentry.server.config.ts` — error tracking
