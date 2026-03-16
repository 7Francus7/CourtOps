# Testing

## Frameworks
- **Playwright** — E2E browser testing (`npm run test`)
- **Vitest** — unit testing (`npm run test:unit`)

## Test Structure & Location
- E2E tests: `tests/` or `e2e/` directory (minimal coverage currently)
- Unit tests: colocated or in `__tests__/` (minimal coverage currently)
- Config: `playwright.config.ts`, `vitest.config.ts`

## E2E Test Patterns
- Playwright configured but limited test coverage
- Tests target the dev server
- Browser: Chromium default

## Unit Test Patterns
- Vitest for isolated function testing
- Limited coverage — most logic tested manually via the app

## Mocking Strategy
- No established mocking patterns yet
- Prisma queries tested against real database (no mocks)
- External APIs (MercadoPago, Resend, WhatsApp) have built-in fallbacks when env vars missing

## Coverage
- No coverage thresholds configured
- Testing is minimal — most validation happens through:
  - TypeScript strict mode (compile-time)
  - Zod schema validation (runtime)
  - Manual testing via dev server

## CI Integration
- No CI test pipeline configured
- Vercel deploys on push (build-only, no test step)
- Linting available via `npm run lint` (ESLint 9)

## Recommendation
Testing is the biggest gap in the project. Priority areas for test coverage:
1. Server actions (auth + tenant isolation)
2. Pricing engine (`getEffectivePrice`)
3. Booking creation/cancellation flow
4. WhatsApp message generation
5. MercadoPago webhook handling
