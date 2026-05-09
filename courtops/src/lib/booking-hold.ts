export const PUBLIC_BOOKING_HOLD_MINUTES = 6

export function getPublicBookingHoldExpiration(now: Date = new Date()): Date {
  return new Date(now.getTime() + PUBLIC_BOOKING_HOLD_MINUTES * 60 * 1000)
}

export function isActiveHoldStatus(status: string | null | undefined): boolean {
  return (status || '').trim().toUpperCase() === 'ACTIVE'
}
