export const CANCELED_BOOKING_STATUSES = ['CANCELED', 'CANCELLED'] as const
export const EXPIRED_BOOKING_STATUSES = ['EXPIRED'] as const
export const NO_SHOW_BOOKING_STATUSES = ['NO_SHOW'] as const
export const COMPLETED_BOOKING_STATUSES = ['COMPLETED', 'FINALIZED'] as const

export const TERMINAL_BOOKING_STATUSES = [
  ...CANCELED_BOOKING_STATUSES,
  ...EXPIRED_BOOKING_STATUSES,
  ...NO_SHOW_BOOKING_STATUSES,
  ...COMPLETED_BOOKING_STATUSES,
] as const

export const AVAILABILITY_BLOCKING_BOOKING_STATUSES = [
  'PENDING',
  'PENDING_CONFIRMATION',
  'PENDING_PAYMENT',
  'CONFIRMED',
  'IN_PROGRESS',
] as const

export const ACTIVE_BOOKING_STATUSES = [
  ...AVAILABILITY_BLOCKING_BOOKING_STATUSES,
] as const

export const BOOKING_PAYMENT_STATUSES = [
  'UNPAID',
  'PARTIAL',
  'PAID',
  'PENDING_VALIDATION',
  'REFUNDED',
] as const

export type BookingStatusValue =
  | (typeof TERMINAL_BOOKING_STATUSES)[number]
  | (typeof ACTIVE_BOOKING_STATUSES)[number]
  | 'CREATED'
  | 'UNKNOWN'

export function normalizeBookingStatus(status: string | null | undefined): string {
  return (status || '').trim().toUpperCase()
}

export function normalizePaymentStatus(status: string | null | undefined): string {
  return (status || '').trim().toUpperCase()
}

export function isCanceledBookingStatus(status: string | null | undefined): boolean {
  const normalized = normalizeBookingStatus(status)
  return CANCELED_BOOKING_STATUSES.includes(normalized as (typeof CANCELED_BOOKING_STATUSES)[number])
}

export function isExpiredBookingStatus(status: string | null | undefined): boolean {
  const normalized = normalizeBookingStatus(status)
  return EXPIRED_BOOKING_STATUSES.includes(normalized as (typeof EXPIRED_BOOKING_STATUSES)[number])
}

export function isNoShowBookingStatus(status: string | null | undefined): boolean {
  const normalized = normalizeBookingStatus(status)
  return NO_SHOW_BOOKING_STATUSES.includes(normalized as (typeof NO_SHOW_BOOKING_STATUSES)[number])
}

export function isTerminalBookingStatus(status: string | null | undefined): boolean {
  const normalized = normalizeBookingStatus(status)
  return TERMINAL_BOOKING_STATUSES.includes(normalized as (typeof TERMINAL_BOOKING_STATUSES)[number])
}

export function isAvailabilityBlockingStatus(status: string | null | undefined): boolean {
  const normalized = normalizeBookingStatus(status)
  return AVAILABILITY_BLOCKING_BOOKING_STATUSES.includes(normalized as (typeof AVAILABILITY_BLOCKING_BOOKING_STATUSES)[number])
}

export function canTransitionBookingStatus(
  fromStatus: string | null | undefined,
  toStatus: string | null | undefined,
): boolean {
  const from = normalizeBookingStatus(fromStatus)
  const to = normalizeBookingStatus(toStatus)

  if (!to) return false
  if (!from) return ['PENDING', 'CONFIRMED'].includes(to)
  if (from === to) return true

  const validTransitions: Record<string, string[]> = {
    PENDING: ['CONFIRMED', 'EXPIRED', 'CANCELED', 'CANCELLED'],
    PENDING_CONFIRMATION: ['CONFIRMED', 'EXPIRED', 'CANCELED', 'CANCELLED'],
    PENDING_PAYMENT: ['CONFIRMED', 'EXPIRED', 'CANCELED', 'CANCELLED'],
    CONFIRMED: ['IN_PROGRESS', 'NO_SHOW', 'CANCELED', 'CANCELLED', 'FINALIZED', 'COMPLETED'],
    IN_PROGRESS: ['FINALIZED', 'COMPLETED', 'NO_SHOW'],
    EXPIRED: [],
    NO_SHOW: ['CONFIRMED'],
    FINALIZED: [],
    COMPLETED: [],
    CANCELED: [],
    CANCELLED: [],
  }

  return (validTransitions[from] || []).includes(to)
}

export function getPendingExpirationDate(createdAt: Date, depositTimeLimitHours: number | null | undefined): Date {
  const limitHours = depositTimeLimitHours && depositTimeLimitHours > 0 ? depositTimeLimitHours : 2
  return new Date(createdAt.getTime() + limitHours * 60 * 60 * 1000)
}

export function shouldExpirePendingBooking(params: {
  status: string | null | undefined
  paymentStatus: string | null | undefined
  createdAt: Date
  depositTimeLimitHours?: number | null
  now?: Date
}): boolean {
  const normalizedStatus = normalizeBookingStatus(params.status)
  const normalizedPayment = normalizePaymentStatus(params.paymentStatus)
  if (normalizedStatus !== 'PENDING') return false
  if (normalizedPayment !== 'UNPAID') return false

  const now = params.now ?? new Date()
  const expirationDate = getPendingExpirationDate(params.createdAt, params.depositTimeLimitHours)
  return now > expirationDate
}

export function canAutoMarkNoShow(params: {
  status: string | null | undefined
  paymentStatus: string | null | undefined
  endTime: Date
  now?: Date
  graceMinutes?: number
}): boolean {
  const normalizedStatus = normalizeBookingStatus(params.status)
  const normalizedPayment = normalizePaymentStatus(params.paymentStatus)
  if (normalizedStatus !== 'CONFIRMED') return false
  if (normalizedPayment !== 'UNPAID') return false

  const graceMinutes = params.graceMinutes ?? 30
  const now = params.now ?? new Date()
  const cutoff = new Date(now.getTime() - graceMinutes * 60 * 1000)
  return params.endTime < cutoff
}
