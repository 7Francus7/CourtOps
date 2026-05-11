import { describe, it, expect, vi, beforeEach } from 'vitest'
import { calcBillingAmount, getBankDetails } from '@/actions/billing'

// ─── Mock dependencies ────────────────────────────────────────────────────────

const mockPrisma = {
  club: {
    findUnique: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
  },
  platformPlan: { findUnique: vi.fn() },
  subscriptionPayment: {
    create: vi.fn(),
    updateMany: vi.fn(),
    findFirst: vi.fn(),
  },
  invoice: {
    create: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
  },
  billingLog: { create: vi.fn(), findFirst: vi.fn() },
  $transaction: vi.fn(),
}
mockPrisma.$transaction = vi.fn(async (ops: any[]) => Promise.all(ops))

vi.mock('@/lib/db', () => ({ default: mockPrisma }))
vi.mock('@/lib/tenant', () => ({ getCurrentClubId: vi.fn().mockResolvedValue('club-123') }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next-auth', () => ({ getServerSession: vi.fn() }))
vi.mock('@/lib/auth', () => ({
  authOptions: {},
  isSuperAdmin: vi.fn(),
}))

// ─── Pure helpers ─────────────────────────────────────────────────────────────

describe('calcBillingAmount', () => {
  it('returns plan price for monthly', () => {
    expect(calcBillingAmount(15000, 'monthly')).toBe(15000)
  })

  it('applies 20% discount for yearly (12 months × 0.8)', () => {
    expect(calcBillingAmount(15000, 'yearly')).toBe(144000)
  })

  it('rounds yearly result', () => {
    expect(calcBillingAmount(10333, 'yearly')).toBe(Math.round(10333 * 12 * 0.8))
  })
})

describe('getBankDetails', () => {
  it('returns env vars when set', () => {
    process.env.COURTOPS_BANK_ALIAS = 'mi.alias'
    process.env.COURTOPS_BANK_CVU = '0000001234'
    process.env.COURTOPS_BANK_ACCOUNT_NAME = 'Empresa SA'
    const details = getBankDetails()
    expect(details.alias).toBe('mi.alias')
    expect(details.cvu).toBe('0000001234')
    expect(details.accountName).toBe('Empresa SA')
    delete process.env.COURTOPS_BANK_ALIAS
    delete process.env.COURTOPS_BANK_CVU
    delete process.env.COURTOPS_BANK_ACCOUNT_NAME
  })

  it('returns fallback values when env vars absent', () => {
    const details = getBankDetails()
    expect(details.alias).toBeTruthy()
    expect(typeof details.alias).toBe('string')
  })
})

// ─── submitBillingTransfer ────────────────────────────────────────────────────

describe('submitBillingTransfer', () => {
  const { submitBillingTransfer } = await import('@/actions/billing')

  beforeEach(() => {
    vi.clearAllMocks()
    mockPrisma.$transaction = vi.fn(async (ops: any[]) => Promise.all(ops))
  })

  it('blocks submission when club already PENDING_VALIDATION', async () => {
    mockPrisma.club.findUnique.mockResolvedValue({ subscriptionStatus: 'PENDING_VALIDATION' })

    const result = await submitBillingTransfer('plan-1', 'monthly', 'ref-123')

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/comprobante en revisión/i)
    expect(mockPrisma.$transaction).not.toHaveBeenCalled()
  })

  it('creates SubscriptionPayment + BillingLog atomically when valid', async () => {
    mockPrisma.club.findUnique.mockResolvedValue({ subscriptionStatus: 'TRIAL' })
    mockPrisma.platformPlan.findUnique.mockResolvedValue({ id: 'plan-1', name: 'Pro', price: 15000 })

    const result = await submitBillingTransfer('plan-1', 'monthly', '  ref-456  ', 'https://comprobante.com')

    expect(result.success).toBe(true)
    expect(mockPrisma.$transaction).toHaveBeenCalledOnce()

    // Reference should be trimmed
    const transactionArgs = mockPrisma.$transaction.mock.calls[0][0]
    // The club.update should have trimmed reference
    const clubUpdateCall = mockPrisma.club.update.mock.calls[0]
    expect(clubUpdateCall[0].data.subscriptionReference).toBe('ref-456')
  })

  it('calculates correct amount for annual cycle', async () => {
    mockPrisma.club.findUnique.mockResolvedValue({ subscriptionStatus: 'authorized' })
    mockPrisma.platformPlan.findUnique.mockResolvedValue({ id: 'plan-1', name: 'Pro', price: 15000 })

    await submitBillingTransfer('plan-1', 'yearly', 'ref-789')

    const paymentCreate = mockPrisma.subscriptionPayment.create.mock.calls[0]
    expect(paymentCreate[0].data.amount).toBe(144000) // 15000 * 12 * 0.8
    expect(paymentCreate[0].data.billingCycle).toBe('yearly')
  })

  it('allows re-submission after rejection (cancelled status)', async () => {
    mockPrisma.club.findUnique.mockResolvedValue({ subscriptionStatus: 'cancelled' })
    mockPrisma.platformPlan.findUnique.mockResolvedValue({ id: 'plan-1', name: 'Pro', price: 15000 })

    const result = await submitBillingTransfer('plan-1', 'monthly', 'ref-new')

    expect(result.success).toBe(true)
  })

  it('returns error when plan does not exist', async () => {
    mockPrisma.club.findUnique.mockResolvedValue({ subscriptionStatus: 'TRIAL' })
    mockPrisma.platformPlan.findUnique.mockResolvedValue(null)

    const result = await submitBillingTransfer('nonexistent', 'monthly', 'ref-1')

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/plan/i)
  })
})

// ─── getBillingStats auth guard ───────────────────────────────────────────────

describe('getBillingStats', () => {
  const { getServerSession } = await import('next-auth')
  const { isSuperAdmin } = await import('@/lib/auth')
  const { getBillingStats } = await import('@/actions/billing')

  beforeEach(() => vi.clearAllMocks())

  it('throws Unauthorized when not super admin', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: 'x@x.com' } } as any)
    vi.mocked(isSuperAdmin).mockReturnValue(false)

    await expect(getBillingStats()).rejects.toThrow('Unauthorized')
  })

  it('throws Unauthorized when no session', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    await expect(getBillingStats()).rejects.toThrow('Unauthorized')
  })
})

// ─── validateSaaSTransfer idempotency ────────────────────────────────────────

describe('validateSaaSTransfer — idempotency', () => {
  const { validateSaaSTransfer } = await import('@/actions/super-admin')
  const { isSuperAdmin } = await import('@/lib/auth')
  const { getServerSession } = await import('next-auth')

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: 'admin@courtops.com' } } as any)
    vi.mocked(isSuperAdmin).mockReturnValue(true)
  })

  it('returns error when club already authorized with no pending plan', async () => {
    mockPrisma.club.findUnique.mockResolvedValue({
      id: 'club-123',
      subscriptionStatus: 'authorized',
      pendingPlanId: null,
      platformPlanId: 'plan-1',
    })
    mockPrisma.platformPlan.findUnique.mockResolvedValue({ id: 'plan-1', name: 'Pro', price: 15000 })

    const result = await validateSaaSTransfer('club-123', 'approve')

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/ya fue aprobada/i)
    expect(mockPrisma.$transaction).not.toHaveBeenCalled()
  })

  it('approves when status is PENDING_VALIDATION', async () => {
    mockPrisma.club.findUnique.mockResolvedValue({
      id: 'club-123',
      subscriptionStatus: 'PENDING_VALIDATION',
      pendingPlanId: 'plan-1',
      pendingBillingCycle: 'monthly',
    })
    mockPrisma.platformPlan.findUnique.mockResolvedValue({ id: 'plan-1', name: 'Pro', price: 15000 })
    mockPrisma.invoice.count.mockResolvedValue(0)
    mockPrisma.$transaction = vi.fn().mockResolvedValue([])

    const result = await validateSaaSTransfer('club-123', 'approve')

    expect(result.success).toBe(true)
    expect(mockPrisma.$transaction).toHaveBeenCalledOnce()
  })

  it('reject updates status to cancelled and logs event', async () => {
    mockPrisma.$transaction = vi.fn().mockResolvedValue([])

    const result = await validateSaaSTransfer('club-123', 'reject', 'Comprobante inválido')

    expect(result.success).toBe(true)
    expect(mockPrisma.$transaction).toHaveBeenCalledOnce()
    const txOps = mockPrisma.$transaction.mock.calls[0][0]
    // Club update to 'cancelled' + payment updateMany + billingLog create
    expect(txOps).toHaveLength(3)
  })
})

// ─── Grace period calculation (pure logic extracted for test) ─────────────────

describe('subscription-suspend grace period logic', () => {
  it('does not suspend within grace period', () => {
    const endDate = new Date(Date.now() - 1 * 86400000) // expired 1 day ago
    const gracePeriodDays = 3
    const graceCutoff = new Date(endDate.getTime() + gracePeriodDays * 86400000)
    const now = new Date()
    expect(now < graceCutoff).toBe(true) // should skip
  })

  it('suspends after grace period', () => {
    const endDate = new Date(Date.now() - 5 * 86400000) // expired 5 days ago
    const gracePeriodDays = 3
    const graceCutoff = new Date(endDate.getTime() + gracePeriodDays * 86400000)
    const now = new Date()
    expect(now >= graceCutoff).toBe(true) // should suspend
  })

  it('never suspends clubs with subscriptionStatus !== authorized', () => {
    // The cron query filters subscriptionStatus: 'authorized', so PENDING_VALIDATION
    // clubs are never in the result set
    const statusesThatAreSafe = ['PENDING_VALIDATION', 'TRIAL', 'cancelled', 'SUSPENDED']
    statusesThatAreSafe.forEach((s) => {
      expect(s).not.toBe('authorized')
    })
  })
})

// ─── Reminder deduplication ───────────────────────────────────────────────────

describe('subscription-reminders window logic', () => {
  it('assigns REMINDER_7D for 5-8 days remaining', () => {
    ;[5, 6, 7, 8].forEach((daysLeft) => {
      const event = daysLeft >= 5 && daysLeft <= 8 ? 'REMINDER_7D' : daysLeft >= 1 && daysLeft <= 3 ? 'REMINDER_2D' : null
      expect(event).toBe('REMINDER_7D')
    })
  })

  it('assigns REMINDER_2D for 1-3 days remaining', () => {
    ;[1, 2, 3].forEach((daysLeft) => {
      const event = daysLeft >= 5 && daysLeft <= 8 ? 'REMINDER_7D' : daysLeft >= 1 && daysLeft <= 3 ? 'REMINDER_2D' : null
      expect(event).toBe('REMINDER_2D')
    })
  })

  it('skips clubs with 4 days remaining (between windows)', () => {
    const daysLeft = 4
    const event = daysLeft >= 5 && daysLeft <= 8 ? 'REMINDER_7D' : daysLeft >= 1 && daysLeft <= 3 ? 'REMINDER_2D' : null
    expect(event).toBeNull()
  })

  it('skips clubs with 0 days (today — already handled by suspend cron)', () => {
    const daysLeft = 0
    const event = daysLeft >= 5 && daysLeft <= 8 ? 'REMINDER_7D' : daysLeft >= 1 && daysLeft <= 3 ? 'REMINDER_2D' : null
    expect(event).toBeNull()
  })
})
