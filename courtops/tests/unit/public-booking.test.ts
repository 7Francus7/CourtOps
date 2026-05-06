import { describe, expect, it } from 'vitest'

import { getPublicBookingStateMeta } from '@/lib/public-booking'

describe('public booking helpers', () => {
  it('prioritizes paid state in the success messaging', () => {
    expect(getPublicBookingStateMeta('CONFIRMED', 'PAID', false)).toMatchObject({
      headline: 'Pago acreditado',
      reservationLabel: 'Confirmada',
      paymentLabel: 'Pagada',
    })
  })

  it('keeps guest pending reservations explicit', () => {
    expect(getPublicBookingStateMeta('PENDING', 'UNPAID', true)).toMatchObject({
      headline: 'Reserva pendiente',
      reservationLabel: 'Pendiente',
      paymentLabel: 'Pendiente de pago',
    })
  })

  it('marks cancelled bookings as cancelled even without payment', () => {
    expect(getPublicBookingStateMeta('CANCELED', null, false)).toMatchObject({
      reservationLabel: 'Cancelada',
      paymentLabel: 'Pendiente de pago',
    })
  })
})
