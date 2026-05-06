import { addDays, isWithinInterval } from 'date-fns'

export const CANCELED_BOOKING_STATUSES = ['CANCELED', 'CANCELLED'] as const
export const NO_SHOW_BOOKING_STATUSES = ['NO_SHOW'] as const

type ClientSnapshot = {
  id: number
  createdAt: Date
  lastBookingAt: Date | null
}

type PeriodBookingSnapshot = {
  clientId: number | null
}

export function calculateChange(current: number, previous: number) {
  if (previous === 0) {
    return current > 0 ? 100 : 0
  }

  return Number((((current - previous) / previous) * 100).toFixed(1))
}

export function buildComparison(current: number, previous: number) {
  return {
    current,
    previous,
    change: calculateChange(current, previous),
  }
}

export function getPreviousPeriodRange(start: Date, end: Date) {
  const dayMs = 24 * 60 * 60 * 1000
  const totalDays = Math.max(1, Math.ceil(((end.getTime() - start.getTime()) + 1) / dayMs))
  const previousEnd = addDays(start, -1)
  const previousStart = addDays(previousEnd, -(totalDays - 1))

  return { start: previousStart, end: previousEnd, totalDays }
}

export function getOperatingMinutesPerDay(openTime: string, closeTime: string) {
  const [openHour, openMinute] = openTime.split(':').map(Number)
  const [closeHour, closeMinute] = closeTime.split(':').map(Number)

  const openMinutes = (openHour * 60) + openMinute
  const closeMinutes = (closeHour * 60) + closeMinute

  if (closeMinutes <= openMinutes) {
    return ((24 * 60) - openMinutes) + closeMinutes
  }

  return closeMinutes - openMinutes
}

export function calculateOccupancyRate(params: {
  bookedMinutes: number
  courtCount: number
  openTime: string
  closeTime: string
  totalDays: number
}) {
  const operatingMinutes = getOperatingMinutesPerDay(params.openTime, params.closeTime)
  const totalCapacity = operatingMinutes * params.courtCount * Math.max(1, params.totalDays)

  if (totalCapacity <= 0) {
    return 0
  }

  return Number(((params.bookedMinutes / totalCapacity) * 100).toFixed(1))
}

export function isCanceledStatus(status: string | null | undefined) {
  return !!status && CANCELED_BOOKING_STATUSES.includes(status as (typeof CANCELED_BOOKING_STATUSES)[number])
}

export function isNoShowStatus(status: string | null | undefined) {
  return !!status && NO_SHOW_BOOKING_STATUSES.includes(status as (typeof NO_SHOW_BOOKING_STATUSES)[number])
}

export function summarizeClientSegments(params: {
  clients: ClientSnapshot[]
  periodBookings: PeriodBookingSnapshot[]
  periodStart: Date
  periodEnd: Date
  inactiveThresholdDays?: number
}) {
  const bookingCounts = new Map<number, number>()

  for (const booking of params.periodBookings) {
    if (!booking.clientId) continue
    bookingCounts.set(booking.clientId, (bookingCounts.get(booking.clientId) || 0) + 1)
  }

  const inactiveThresholdDays = params.inactiveThresholdDays ?? 90
  const inactiveBoundary = addDays(params.periodEnd, -inactiveThresholdDays)

  const newClients = params.clients.filter((client) =>
    isWithinInterval(client.createdAt, { start: params.periodStart, end: params.periodEnd })
  ).length

  const recurrentClients = Array.from(bookingCounts.values()).filter((count) => count >= 2).length

  const inactiveClients = params.clients.filter((client) => {
    if (!client.lastBookingAt) {
      return true
    }

    return client.lastBookingAt < inactiveBoundary
  }).length

  return {
    newClients,
    recurrentClients,
    inactiveClients,
  }
}
