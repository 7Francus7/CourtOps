import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  buildComparison,
  calculateOccupancyRate,
  getPreviousPeriodRange,
  summarizeClientSegments,
} from '@/lib/reporting'

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
}))

vi.mock('next-auth', () => ({
  getServerSession: mocks.getServerSession,
}))

vi.mock('@/lib/db', () => {
  const transaction = {
    findMany: vi.fn(),
    aggregate: vi.fn(),
  }

  const booking = {
    findMany: vi.fn(),
  }

  const client = {
    count: vi.fn(),
    findMany: vi.fn(),
  }

  const club = {
    findUnique: vi.fn(),
  }

  return {
    default: {
      transaction,
      booking,
      client,
      club,
    },
  }
})

describe('reporting helpers', () => {
  it('builds previous period using the same number of days', () => {
    const range = getPreviousPeriodRange(
      new Date('2026-05-10T00:00:00.000Z'),
      new Date('2026-05-16T23:59:59.999Z'),
    )

    expect(range.totalDays).toBe(7)
    expect(range.start.toISOString().slice(0, 10)).toBe('2026-05-03')
    expect(range.end.toISOString().slice(0, 10)).toBe('2026-05-09')
  })

  it('calculates occupancy using operating hours, courts and days', () => {
    const occupancy = calculateOccupancyRate({
      bookedMinutes: 540,
      courtCount: 2,
      openTime: '09:00',
      closeTime: '18:00',
      totalDays: 1,
    })

    expect(occupancy).toBe(50)
  })

  it('summarizes new, recurrent and inactive clients', () => {
    const result = summarizeClientSegments({
      periodStart: new Date('2026-05-01T00:00:00.000Z'),
      periodEnd: new Date('2026-05-31T23:59:59.999Z'),
      clients: [
        { id: 1, createdAt: new Date('2026-05-05T10:00:00.000Z'), lastBookingAt: new Date('2026-05-20T10:00:00.000Z') },
        { id: 2, createdAt: new Date('2026-03-01T10:00:00.000Z'), lastBookingAt: new Date('2026-05-15T10:00:00.000Z') },
        { id: 3, createdAt: new Date('2025-12-01T10:00:00.000Z'), lastBookingAt: new Date('2026-01-01T10:00:00.000Z') },
      ],
      periodBookings: [
        { clientId: 1 },
        { clientId: 2 },
        { clientId: 2 },
      ],
    })

    expect(result).toEqual({
      newClients: 1,
      recurrentClients: 1,
      inactiveClients: 1,
    })
  })

  it('builds percentage comparison data', () => {
    expect(buildComparison(120, 100)).toEqual({
      current: 120,
      previous: 100,
      change: 20,
    })
  })
})

describe('getReportsSnapshot', () => {
  beforeEach(async () => {
    vi.clearAllMocks()

    mocks.getServerSession.mockResolvedValue({
      user: {
        id: 'user-1',
        clubId: 'club-a',
        role: 'ADMIN',
      },
    })

    const db = (await import('@/lib/db')).default

    vi.mocked(db.club.findUnique).mockResolvedValue({
      id: 'club-a',
      name: 'Club A',
      currency: 'ARS',
      openTime: '09:00',
      closeTime: '18:00',
      courts: [{ id: 1, name: 'Cancha 1' }],
    } as never)

    vi.mocked(db.transaction.findMany).mockResolvedValue([] as never)
    vi.mocked(db.transaction.aggregate).mockResolvedValue({ _sum: { amount: 0 } } as never)
    vi.mocked(db.booking.findMany).mockResolvedValue([] as never)
    vi.mocked(db.client.count).mockResolvedValue(0 as never)
    vi.mocked(db.client.findMany).mockResolvedValue([] as never)
  })

  it('scopes report queries to the authenticated club', async () => {
    const { getReportsSnapshot } = await import('@/actions/reports')
    const db = (await import('@/lib/db')).default

    await getReportsSnapshot({
      startDate: '2026-05-01',
      endDate: '2026-05-31',
    })

    expect(db.transaction.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        clubId: 'club-a',
      }),
    }))

    expect(db.booking.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        clubId: 'club-a',
      }),
    }))

    expect(db.client.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        clubId: 'club-a',
      }),
    }))
  })

  it('blocks users without finance read permission', async () => {
    mocks.getServerSession.mockResolvedValue({
      user: {
        id: 'user-2',
        clubId: 'club-a',
        role: 'STAFF',
      },
    })

    const { getReportsSnapshot } = await import('@/actions/reports')

    await expect(getReportsSnapshot({
      startDate: '2026-05-01',
      endDate: '2026-05-31',
    })).rejects.toThrow(/permisos/i)
  })

  it('rejects invalid ranges where start is after end', async () => {
    const { getReportsSnapshot } = await import('@/actions/reports')

    await expect(getReportsSnapshot({
      startDate: '2026-05-31',
      endDate: '2026-05-01',
    })).rejects.toThrow(/fecha inicial/i)
  })
})
