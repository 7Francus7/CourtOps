/**
 * Multi-tenant isolation regression tests.
 *
 * These tests guard against re-introducing the class of bugs found in the
 * 2026-04-26 security audit: mutations that used only `id` in their Prisma
 * `where` clause, allowing cross-tenant data modification.
 *
 * Pattern verified by each test:
 *   "A user authenticated as Club A CANNOT mutate a record that belongs to Club B."
 *
 * Each suite mocks Prisma so no real DB is needed.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Constants ────────────────────────────────────────────────────────────────
const CLUB_A = 'club-a-id'
const CLUB_B = 'club-b-id'

// ─── Shared Prisma mock ───────────────────────────────────────────────────────
vi.mock('@/lib/db', () => {
  const make = () => ({
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
    updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    delete: vi.fn().mockResolvedValue({}),
    deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
  })
  return {
    default: {
      employee: make(),
      tournament: make(),
      membershipPlan: make(),
      cashRegister: make(),
      waiver: make(),
      booking: make(),
      club: make(),
      transaction: make(),
      bookingPlayer: make(),
      $transaction: vi.fn(async (ops: unknown[]) => ops),
    },
  }
})

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/logger', () => ({ logAction: vi.fn() }))

// ─── Helper to load fresh module per test (avoids module caching issues) ─────
async function freshDb() {
  return (await import('@/lib/db')).default
}

// ─── 1. employees.ts ──────────────────────────────────────────────────────────
describe('employees — upsertEmployee cross-tenant block', () => {
  beforeEach(() => vi.clearAllMocks())

  it('update uses id_clubId compound key, not id alone', async () => {
    vi.mock('@/lib/tenant', () => ({ getCurrentClubId: vi.fn().mockResolvedValue(CLUB_A) }))
    const db = await freshDb()
    ;(db.employee.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'emp-1',
      clubId: CLUB_A,
    })

    const { upsertEmployee } = await import('@/actions/employees')
    await upsertEmployee({ id: 'emp-1', name: 'Test', pin: '1234', permissions: {} as never })

    const updateCall = (db.employee.update as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]
    expect(updateCall?.where).toEqual({ id_clubId: { id: 'emp-1', clubId: CLUB_A } })
  })

  it('delete uses id_clubId compound key, not id alone', async () => {
    vi.mock('@/lib/tenant', () => ({ getCurrentClubId: vi.fn().mockResolvedValue(CLUB_A) }))
    const db = await freshDb()
    ;(db.employee.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'emp-1',
      clubId: CLUB_A,
    })

    const { deleteEmployee } = await import('@/actions/employees')
    await deleteEmployee('emp-1')

    const deleteCall = (db.employee.delete as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]
    expect(deleteCall?.where).toEqual({ id_clubId: { id: 'emp-1', clubId: CLUB_A } })
  })
})

// ─── 2. tournaments.ts ────────────────────────────────────────────────────────
describe('tournaments — cross-tenant block', () => {
  beforeEach(() => vi.clearAllMocks())

  it('deleteTournament uses deleteMany with clubId scope', async () => {
    vi.mock('next-auth', async () => ({
      getServerSession: vi.fn().mockResolvedValue({ user: { clubId: CLUB_A, id: 'u1' } }),
    }))
    const db = await freshDb()
    ;(db.tournament.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 't-1', clubId: CLUB_A })

    const { deleteTournament } = await import('@/actions/tournaments')
    await deleteTournament('t-1')

    const call = (db.tournament.deleteMany as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]
    expect(call?.where).toMatchObject({ id: 't-1', clubId: CLUB_A })
  })

  it('updateTournament uses updateMany with clubId scope', async () => {
    vi.mock('next-auth', async () => ({
      getServerSession: vi.fn().mockResolvedValue({ user: { clubId: CLUB_A, id: 'u1' } }),
    }))
    const db = await freshDb()
    ;(db.tournament.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 't-1', clubId: CLUB_A })

    const { updateTournament } = await import('@/actions/tournaments')
    await updateTournament('t-1', { name: 'Copa Test' })

    const call = (db.tournament.updateMany as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]
    expect(call?.where).toMatchObject({ id: 't-1', clubId: CLUB_A })
  })

  it('rejects update attempt when ownership check fails (Club B record)', async () => {
    vi.mock('next-auth', async () => ({
      getServerSession: vi.fn().mockResolvedValue({ user: { clubId: CLUB_A, id: 'u1' } }),
    }))
    const db = await freshDb()
    // Simulate that findFirst returns null (record belongs to Club B)
    ;(db.tournament.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null)

    const { updateTournament } = await import('@/actions/tournaments')
    const result = await updateTournament('t-club-b', { name: 'Hack' })

    expect(result.success).toBe(false)
    expect(db.tournament.updateMany).not.toHaveBeenCalled()
  })
})

// ─── 3. waivers.ts ────────────────────────────────────────────────────────────
describe('waivers — cross-tenant block', () => {
  beforeEach(() => vi.clearAllMocks())

  it('updateWaiver uses updateMany with clubId in where', async () => {
    vi.mock('@/lib/tenant', () => ({
      getCurrentClubId: vi.fn().mockResolvedValue(CLUB_A),
    }))
    const db = await freshDb()
    ;(db.club.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: CLUB_A, hasWaivers: true })
    ;(db.waiver.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'w-1', clubId: CLUB_A })

    const { updateWaiver } = await import('@/actions/waivers')
    await updateWaiver('w-1', { title: 'New Title' })

    const call = (db.waiver.updateMany as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]
    expect(call?.where).toMatchObject({ id: 'w-1', clubId: CLUB_A })
  })

  it('deleteWaiver (soft-delete) uses updateMany with clubId in where', async () => {
    vi.mock('@/lib/tenant', () => ({
      getCurrentClubId: vi.fn().mockResolvedValue(CLUB_A),
    }))
    const db = await freshDb()
    ;(db.club.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: CLUB_A, hasWaivers: true })
    ;(db.waiver.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'w-1', clubId: CLUB_A })

    const { deleteWaiver } = await import('@/actions/waivers')
    await deleteWaiver('w-1')

    const call = (db.waiver.updateMany as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]
    expect(call?.where).toMatchObject({ id: 'w-1', clubId: CLUB_A })
    expect(call?.data).toMatchObject({ isActive: false })
  })

  it('does not mutate waiver when ownership check fails', async () => {
    vi.mock('@/lib/tenant', () => ({
      getCurrentClubId: vi.fn().mockResolvedValue(CLUB_A),
    }))
    const db = await freshDb()
    ;(db.club.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: CLUB_A, hasWaivers: true })
    ;(db.waiver.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null) // Club B record

    const { updateWaiver } = await import('@/actions/waivers')
    const result = await updateWaiver('w-club-b', { title: 'Hack' })

    expect(result.success).toBe(false)
    expect(db.waiver.updateMany).not.toHaveBeenCalled()
  })
})

// ─── 4. cash-register.ts ─────────────────────────────────────────────────────
describe('cash-register — closeCashRegister cross-tenant block', () => {
  beforeEach(() => vi.clearAllMocks())

  it('close uses id_clubId compound key', async () => {
    vi.mock('@/lib/tenant', () => ({
      getCurrentClubId: vi.fn().mockResolvedValue(CLUB_A),
    }))
    const db = await freshDb()
    ;(db.cashRegister.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 10,
      clubId: CLUB_A,
      status: 'OPEN',
      startAmount: 0,
    })
    ;(db.transaction.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([])

    const { closeCashRegister } = await import('@/actions/cash-register')
    await closeCashRegister(10, 5000)

    const call = (db.cashRegister.update as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]
    expect(call?.where).toEqual({ id_clubId: { id: 10, clubId: CLUB_A } })
  })

  it('rejects close when register belongs to a different club', async () => {
    vi.mock('@/lib/tenant', () => ({
      getCurrentClubId: vi.fn().mockResolvedValue(CLUB_A),
    }))
    const db = await freshDb()
    // Simulate register from Club B being returned
    ;(db.cashRegister.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 99,
      clubId: CLUB_B,
      status: 'OPEN',
      startAmount: 0,
    })

    const { closeCashRegister } = await import('@/actions/cash-register')
    const result = await closeCashRegister(99, 5000)

    expect(result.success).toBe(false)
    expect(db.cashRegister.update).not.toHaveBeenCalled()
  })
})

// ─── 5. public-booking.ts — availability check ───────────────────────────────
describe('public-booking — availability check scoped to club', () => {
  beforeEach(() => vi.clearAllMocks())

  it('findFirst for conflict check includes clubId', async () => {
    vi.mock('@/lib/tenant', () => ({
      enforceActiveSubscription: vi.fn(),
      getEffectivePrice: vi.fn().mockResolvedValue(1000),
    }))
    const db = await freshDb()

    // Return a conflicting booking from the same club
    ;(db.booking.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 5,
      clubId: CLUB_A,
    })

    // The action should detect the conflict (booking exists) and reject
    const { createPublicBooking } = await import('@/actions/public-booking')
    const result = await createPublicBooking({
      clubId: CLUB_A,
      courtId: 1,
      date: new Date(Date.now() + 86_400_000).toISOString().split('T')[0],
      time: '10:00',
      durationMinutes: 90,
      isGuest: true,
      guestName: 'Test',
      guestPhone: '+5491100000000',
      isOpenMatch: false,
    })

    // The conflicting booking query must include clubId
    const findCalls = (db.booking.findFirst as ReturnType<typeof vi.fn>).mock.calls
    const conflictCheck = findCalls.find(
      (c) => c[0]?.where?.courtId === 1 && c[0]?.where?.status !== undefined
    )
    expect(conflictCheck?.[0]?.where).toMatchObject({ clubId: CLUB_A, courtId: 1 })

    // And the booking creation should be rejected due to conflict
    expect(result.success).toBe(false)
  })
})

// ─── 6. cancel-public route — publicToken enforcement ────────────────────────
describe('cancel-public route — publicToken required', () => {
  beforeEach(() => vi.clearAllMocks())

  it('rejects cancellation when booking has no publicToken and no token supplied', async () => {
    const db = await freshDb()
    ;(db.booking.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 1,
      clubId: CLUB_A,
      status: 'CONFIRMED',
      publicToken: null, // no token set
      price: 1000,
      transactions: [],
    })

    const { POST } = await import('@/app/api/bookings/[id]/cancel-public/route')
    const req = new Request('http://localhost/api/bookings/1/cancel-public', {
      method: 'POST',
      body: JSON.stringify({ token: undefined }),
    })

    const res = await POST(req as never, { params: Promise.resolve({ id: '1' }) })
    expect(res.status).toBe(404)
    expect(db.booking.update).not.toHaveBeenCalled()
  })

  it('rejects cancellation when supplied token does not match', async () => {
    const db = await freshDb()
    ;(db.booking.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 1,
      clubId: CLUB_A,
      status: 'CONFIRMED',
      publicToken: 'correct-token',
      price: 1000,
      transactions: [],
    })

    const { POST } = await import('@/app/api/bookings/[id]/cancel-public/route')
    const req = new Request('http://localhost/api/bookings/1/cancel-public', {
      method: 'POST',
      body: JSON.stringify({ token: 'wrong-token' }),
    })

    const res = await POST(req as never, { params: Promise.resolve({ id: '1' }) })
    expect(res.status).toBe(404)
    expect(db.booking.update).not.toHaveBeenCalled()
  })

  it('cancel update uses id_clubId compound key', async () => {
    const db = await freshDb()
    ;(db.booking.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 1,
      clubId: CLUB_A,
      status: 'CONFIRMED',
      publicToken: 'valid-token',
      price: 1000,
      transactions: [{ amount: 0 }],
    })

    const { POST } = await import('@/app/api/bookings/[id]/cancel-public/route')
    const req = new Request('http://localhost/api/bookings/1/cancel-public', {
      method: 'POST',
      body: JSON.stringify({ token: 'valid-token' }),
    })

    await POST(req as never, { params: Promise.resolve({ id: '1' }) })

    const updateCall = (db.booking.update as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]
    expect(updateCall?.where).toEqual({ id_clubId: { id: 1, clubId: CLUB_A } })
  })
})
