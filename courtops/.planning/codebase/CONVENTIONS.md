# Code Conventions

## Language & Style
- **TypeScript strict mode** — no implicit any, strict null checks
- **Mixed language:** Spanish for UI text/comments, English for code identifiers
- **Semicolons:** inconsistent (some files use them, some don't)
- **Quotes:** single quotes preferred
- **Indentation:** tabs in some files, spaces in others (no enforced rule)

## Naming Patterns

### Files
- Components: `PascalCase.tsx` (`BookingModal.tsx`, `ClientsDashboard.tsx`)
- Actions: `camelCase.ts` (`manageBooking.ts`, `createBooking.ts`)
- Lib/utils: `kebab-case.ts` (`date-utils.ts`, `cash-register.ts`)
- API routes: `route.ts` inside kebab-case dirs

### Functions & Variables
- Server actions: `export async function createBooking()` — camelCase, verb-first
- Components: `export default function BookingModal()` — PascalCase
- Helpers: `camelCase` (`getCurrentClubId`, `getEffectivePrice`)
- Constants: `UPPER_SNAKE_CASE` (`BLOCKED_KEYWORDS`, `MAX_ROWS`)

### Database
- Models: `PascalCase` (`Booking`, `PriceRule`, `CashRegister`)
- Fields: `camelCase` (`clubId`, `startTime`, `reminderSent`)
- Relations: model name (`client`, `court`, `club`)

## Component Patterns

### Server Components (default)
```tsx
export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const data = await prisma.booking.findMany({ where: { clubId } })
  return <div>...</div>
}
```

### Client Components
```tsx
'use client'
import { useState } from 'react'
export function BookingModal({ onClose }: { onClose: () => void }) { ... }
```

### Props
- Destructured in function signature
- Types inline for simple props, separate interface for complex ones
- `club?: any` used frequently (typing gap)

## Server Action Patterns

### Standard pattern (every action follows this):
```tsx
'use server'
export async function createBooking(data: BookingInput) {
  const clubId = await getCurrentClubId()  // 1. Auth + tenant gate
  const validated = schema.parse(data)      // 2. Zod validation
  const result = await prisma.booking.create({ ... })  // 3. DB operation
  revalidatePath('/dashboard')              // 4. Revalidate cache
  return { success: true, data: result }    // 5. Return result
}
```

### Error handling pattern:
```tsx
try {
  // ... operation
  return { success: true, data }
} catch (error: unknown) {
  console.error('Context:', error)
  return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
}
```

### Super admin pattern:
```tsx
export async function deleteClub(formData: FormData) {
  if (!(await checkOnlyDellorsif())) return { success: false, error: 'Unauthorized' }
  // ... operation
}
```

## Validation — Zod
- Schemas in `src/schemas/` (shared client + server)
- Used in server actions for input validation
- Zod 4 with `.parse()` (throws on failure)

## Error Handling
- Server actions: try/catch → `{ success: boolean, error?: string }`
- API routes: try/catch → `NextResponse.json()`
- Client: `toast.error()` via sonner
- Global: Sentry captures unhandled exceptions

## Imports & Path Aliases
```tsx
import { Component } from '@/components/Component'  // src/*
import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'
```

## UI Patterns

### Tailwind Classes
- Dark theme default: `bg-card`, `text-foreground`, `border-border`
- Rounded corners: `rounded-2xl` to `rounded-3xl`
- Glassmorphism: `bg-background/95 backdrop-blur-2xl`
- Shadows: `shadow-lg shadow-primary/30`

### Animations (Framer Motion)
```tsx
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
```

### Responsive
- Mobile-first with `md:` breakpoint for desktop
- `MobileBottomNav` (mobile) + `Sidebar` (desktop) in `AppShell`
- `md:hidden` / `hidden md:block` patterns

## i18n / Language Mix
- `LanguageContext` in `src/contexts/LanguageContext.tsx`
- User-facing text: always Spanish
- Code identifiers: always English
- date-fns locale: `{ locale: es }` for formatted dates
- No translation files — strings are hardcoded in Spanish
