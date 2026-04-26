/**
 * Tenant isolation tests for Day 1 security fixes.
 *
 * Verifies that cross-tenant access is blocked for:
 *   - toggleOpenMatch (matchmaking.ts)
 *   - joinOpenMatch   (open-matches.ts)
 *   - createPreference (mercadopago.ts)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Shared mocks ────────────────────────────────────────────────────────────

const CLUB_A = 'club-a-id'
const CLUB_B = 'club-b-id'

const mocks = vi.hoisted(() => ({
       getServerSession: vi.fn(),
       decrypt: vi.fn(),
       createBookingCheckout: vi.fn(),
}))

const mockBookingClubA = {
       id: 1,
       clubId: CLUB_A,
       isOpenMatch: true,
       status: 'CONFIRMED',
       startTime: new Date(Date.now() + 3_600_000), // 1 hour from now
       maxPlayers: 4,
       price: 2000,
       players: [],
       club: { id: CLUB_A, slug: 'club-a', mpAccessToken: 'enc-token' },
       court: { name: 'Cancha 1' },
}

const mockBookingClubB = {
       id: 2,
       clubId: CLUB_B,
       isOpenMatch: true,
       status: 'CONFIRMED',
       startTime: new Date(Date.now() + 3_600_000),
       maxPlayers: 4,
       price: 2000,
       players: [],
       club: { id: CLUB_B, slug: 'club-b', mpAccessToken: 'enc-token-b' },
       court: { name: 'Cancha 2' },
}

vi.mock('@/lib/db', () => {
       const booking = {
              findUnique: vi.fn(),
              update: vi.fn(),
       }
       const bookingPlayer = {
              create: vi.fn(),
       }
       return { default: { booking, bookingPlayer } }
})

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next-auth', () => ({ getServerSession: mocks.getServerSession }))
vi.mock('@/lib/encryption', () => ({ decrypt: mocks.decrypt }))
vi.mock('@/lib/payment', () => ({
       getClubPaymentAdapter: vi.fn(() => ({
              createBookingCheckout: mocks.createBookingCheckout,
       })),
}))

// ─── toggleOpenMatch ──────────────────────────────────────────────────────────

describe('toggleOpenMatch — tenant isolation', () => {
       beforeEach(() => {
              vi.clearAllMocks()
              mocks.getServerSession.mockResolvedValue({ user: { clubId: CLUB_A, id: 'user-1' } })
       })

       it('allows owner club to toggle their own booking', async () => {
              vi.mocked((await import('@/lib/db')).default.booking.findUnique).mockResolvedValue({
                     clubId: CLUB_A,
                     club: { slug: 'club-a' },
              } as never)
              vi.mocked((await import('@/lib/db')).default.booking.update).mockResolvedValue(
                     mockBookingClubA as never
              )

              const { toggleOpenMatch } = await import('@/actions/matchmaking')
              const result = await toggleOpenMatch(1, true)

              expect(result.success).toBe(true)
       })

       it('blocks Club A user from toggling Club B booking', async () => {
              vi.mocked((await import('@/lib/db')).default.booking.findUnique).mockResolvedValue({
                     clubId: CLUB_B,
                     club: { slug: 'club-b' },
              } as never)

              const { toggleOpenMatch } = await import('@/actions/matchmaking')
              const result = await toggleOpenMatch(2, true)

              expect(result.success).toBe(false)
              expect(result.error).toMatch(/no autorizado/i)
       })

       it('blocks unauthenticated users', async () => {
              mocks.getServerSession.mockResolvedValue(null)

              const { toggleOpenMatch } = await import('@/actions/matchmaking')
              const result = await toggleOpenMatch(1, true)

              expect(result.success).toBe(false)
              expect(result.error).toMatch(/no autorizado/i)
       })
})

// ─── joinOpenMatch ────────────────────────────────────────────────────────────

describe('joinOpenMatch — booking state validation', () => {
       beforeEach(() => {
              vi.clearAllMocks()
              mocks.getServerSession.mockResolvedValue(null)
       })

       it('allows joining a valid open match', async () => {
              vi.mocked((await import('@/lib/db')).default.booking.findUnique).mockResolvedValue(
                     mockBookingClubA as never
              )
              vi.mocked((await import('@/lib/db')).default.bookingPlayer.create).mockResolvedValue({} as never)

              const { joinOpenMatch } = await import('@/actions/open-matches')
              const result = await joinOpenMatch(1, 'Franco', '+5491112345678')

              expect(result.success).toBe(true)
       })

       it('blocks joining a booking that is NOT an open match', async () => {
              vi.mocked((await import('@/lib/db')).default.booking.findUnique).mockResolvedValue({
                     ...mockBookingClubA,
                     isOpenMatch: false,
              } as never)

              const { joinOpenMatch } = await import('@/actions/open-matches')
              await expect(joinOpenMatch(1, 'Hacker', '+5491100000000')).rejects.toThrow(
                     /no está abierto/i
              )
       })

       it('blocks joining a cancelled booking', async () => {
              vi.mocked((await import('@/lib/db')).default.booking.findUnique).mockResolvedValue({
                     ...mockBookingClubA,
                     status: 'CANCELLED',
              } as never)

              const { joinOpenMatch } = await import('@/actions/open-matches')
              await expect(joinOpenMatch(1, 'Hacker', '+5491100000000')).rejects.toThrow(
                     /cancelado/i
              )
       })

       it('blocks joining a past booking', async () => {
              vi.mocked((await import('@/lib/db')).default.booking.findUnique).mockResolvedValue({
                     ...mockBookingClubA,
                     startTime: new Date(Date.now() - 3_600_000), // 1 hour ago
              } as never)

              const { joinOpenMatch } = await import('@/actions/open-matches')
              await expect(joinOpenMatch(1, 'Hacker', '+5491100000000')).rejects.toThrow(
                     /ya comenzó/i
              )
       })

       it('blocks joining a full match', async () => {
              vi.mocked((await import('@/lib/db')).default.booking.findUnique).mockResolvedValue({
                     ...mockBookingClubA,
                     players: [{ name: 'P1' }, { name: 'P2' }, { name: 'P3' }], // 1 creator + 3 = 4
              } as never)

              const { joinOpenMatch } = await import('@/actions/open-matches')
              await expect(joinOpenMatch(1, 'Overflow', '+5491100000001')).rejects.toThrow(
                     /completo/i
              )
       })
})

// ─── createPreference ─────────────────────────────────────────────────────────

describe('createPreference — ownership and state checks', () => {
       beforeEach(() => {
              vi.clearAllMocks()
              mocks.getServerSession.mockResolvedValue(null)
              mocks.decrypt.mockReturnValue('decrypted-token')
              mocks.createBookingCheckout.mockResolvedValue({
                     checkoutUrl: 'https://checkout.test/preference',
                     id: 'pref-1',
              })
       })

       it('blocks authenticated Club A user from paying for Club B booking', async () => {
              mocks.getServerSession.mockResolvedValue({
                     user: { clubId: CLUB_A, id: 'user-1' },
              })

              vi.mocked((await import('@/lib/db')).default.booking.findUnique).mockResolvedValue(
                     mockBookingClubB as never
              )

              const { createPreference } = await import('@/actions/mercadopago')
              const result = await createPreference(2)

              expect(result.success).toBe(false)
              expect(result.error).toMatch(/no autorizado/i)
       })

       it('blocks public payment for a cancelled booking', async () => {
              vi.mocked((await import('@/lib/db')).default.booking.findUnique).mockResolvedValue({
                     ...mockBookingClubA,
                     status: 'CANCELLED',
              } as never)

              const { createPreference } = await import('@/actions/mercadopago')
              const result = await createPreference(1)

              expect(result.success).toBe(false)
              expect(result.error).toMatch(/cancelada/i)
       })

       it('returns error for non-existent booking', async () => {
              vi.mocked((await import('@/lib/db')).default.booking.findUnique).mockResolvedValue(null)

              const { createPreference } = await import('@/actions/mercadopago')
              const result = await createPreference(999)

              expect(result.success).toBe(false)
              expect(result.error).toMatch(/no encontrada/i)
       })
})
