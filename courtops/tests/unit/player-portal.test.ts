import { describe, expect, it } from 'vitest'

import {
  buildPlayerBookingPath,
  buildRepeatReservationDate,
  getPlayerBookingStateMeta,
} from '@/lib/player-portal'

describe('player portal helpers', () => {
  it('maps reservation and payment states to player-friendly labels', () => {
    expect(getPlayerBookingStateMeta('CONFIRMED', 'PAID')).toMatchObject({
      reservationLabel: 'Confirmada',
      paymentLabel: 'Pagada',
    })

    expect(getPlayerBookingStateMeta('PENDING', 'PARTIAL')).toMatchObject({
      reservationLabel: 'Pendiente',
      paymentLabel: 'Pago parcial',
    })

    expect(getPlayerBookingStateMeta('CANCELED', 'UNPAID')).toMatchObject({
      reservationLabel: 'Cancelada',
      paymentLabel: 'Pendiente de pago',
    })
  })

  it('builds a player booking path with tracking and date', () => {
    expect(buildPlayerBookingPath('club-demo', new Date('2026-05-10T12:00:00.000Z'))).toBe(
      '/p/club-demo?date=2026-05-10&utm_source=player_portal&utm_medium=cta&utm_campaign=repeat_booking',
    )
  })

  it('creates a repeat reservation date seven days later', () => {
    expect(buildRepeatReservationDate('2026-05-10T12:00:00.000Z').toISOString().slice(0, 10)).toBe('2026-05-17')
  })
})
