export type PlayerBookingStateMeta = {
  reservationLabel: string
  reservationTone: string
  paymentLabel: string
  paymentTone: string
}

function toDateOnlyString(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getPlayerBookingStateMeta(status: string, paymentStatus: string): PlayerBookingStateMeta {
  const normalizedStatus = status.toUpperCase()
  const normalizedPayment = paymentStatus.toUpperCase()

  const reservationLabel = normalizedStatus === 'CONFIRMED'
    ? 'Confirmada'
    : normalizedStatus === 'PENDING'
      ? 'Pendiente'
      : normalizedStatus === 'CANCELED' || normalizedStatus === 'CANCELLED'
        ? 'Cancelada'
        : normalizedStatus

  const reservationTone = normalizedStatus === 'CONFIRMED'
    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    : normalizedStatus === 'PENDING'
      ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      : normalizedStatus === 'CANCELED' || normalizedStatus === 'CANCELLED'
        ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
        : 'text-white/60 bg-white/5 border-white/10'

  const paymentLabel = normalizedPayment === 'PAID'
    ? 'Pagada'
    : normalizedPayment === 'PARTIAL'
      ? 'Pago parcial'
      : normalizedPayment === 'REFUNDED'
        ? 'Reintegrada'
        : 'Pendiente de pago'

  const paymentTone = normalizedPayment === 'PAID'
    ? 'text-emerald-300'
    : normalizedPayment === 'PARTIAL'
      ? 'text-amber-300'
      : normalizedPayment === 'REFUNDED'
        ? 'text-sky-300'
        : 'text-white/45'

  return {
    reservationLabel,
    reservationTone,
    paymentLabel,
    paymentTone,
  }
}

export function buildPlayerBookingPath(clubSlug: string, date?: Date | null) {
  const urlDate = date ? new Date(date) : new Date()
  const path = new URL(`https://courtops.local/p/${clubSlug}`)
  path.searchParams.set('date', toDateOnlyString(urlDate))
  path.searchParams.set('utm_source', 'player_portal')
  path.searchParams.set('utm_medium', 'cta')
  path.searchParams.set('utm_campaign', 'repeat_booking')
  return `${path.pathname}${path.search}`
}

export function buildRepeatReservationDate(sourceIso?: string | null) {
  if (!sourceIso) return new Date()
  const source = new Date(sourceIso)
  if (Number.isNaN(source.getTime())) return new Date()
  source.setDate(source.getDate() + 7)
  return source
}
