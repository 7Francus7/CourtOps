import {
  isCanceledBookingStatus,
  isExpiredBookingStatus,
  isNoShowBookingStatus,
  normalizeBookingStatus,
  normalizePaymentStatus,
} from '@/lib/booking-status'

export type PublicBookingStateMeta = {
  headline: string
  helper: string
  reservationLabel: string
  reservationTone: string
  paymentLabel: string
  paymentTone: string
}

export function getPublicBookingStateMeta(
  status: string | null | undefined,
  paymentStatus: string | null | undefined,
  isGuest: boolean,
): PublicBookingStateMeta {
  const normalizedStatus = normalizeBookingStatus(status)
  const normalizedPayment = normalizePaymentStatus(paymentStatus)

  const reservationLabel = normalizedStatus === 'CONFIRMED'
    ? 'Confirmada'
    : normalizedStatus === 'PENDING'
      ? 'Pendiente'
      : isExpiredBookingStatus(normalizedStatus)
        ? 'Vencida'
        : isNoShowBookingStatus(normalizedStatus)
          ? 'No asistio'
          : isCanceledBookingStatus(normalizedStatus)
            ? 'Cancelada'
            : 'Creada'

  const reservationTone = normalizedStatus === 'CONFIRMED'
    ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/20'
    : normalizedStatus === 'PENDING'
      ? 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-500/10 dark:border-amber-500/20'
      : isExpiredBookingStatus(normalizedStatus)
        ? 'text-slate-600 bg-slate-100 border-slate-200 dark:text-zinc-300 dark:bg-zinc-800/60 dark:border-zinc-700/40'
        : isNoShowBookingStatus(normalizedStatus)
          ? 'text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-300 dark:bg-orange-500/10 dark:border-orange-500/20'
          : isCanceledBookingStatus(normalizedStatus)
        ? 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-500/10 dark:border-rose-500/20'
          : 'text-slate-700 bg-slate-50 border-slate-200 dark:text-zinc-300 dark:bg-zinc-800/60 dark:border-zinc-700/40'

  const paymentLabel = normalizedPayment === 'PAID'
    ? 'Pagada'
    : normalizedPayment === 'PARTIAL'
      ? 'Pago parcial'
      : normalizedPayment === 'PENDING_VALIDATION'
        ? 'Pago en validacion'
        : normalizedPayment === 'REFUNDED'
          ? 'Reintegrada'
          : 'Pendiente de pago'

  const paymentTone = normalizedPayment === 'PAID'
    ? 'text-emerald-600 dark:text-emerald-300'
    : normalizedPayment === 'PARTIAL'
      ? 'text-amber-600 dark:text-amber-300'
      : normalizedPayment === 'PENDING_VALIDATION'
        ? 'text-sky-600 dark:text-sky-300'
        : normalizedPayment === 'REFUNDED'
          ? 'text-violet-600 dark:text-violet-300'
          : 'text-slate-500 dark:text-zinc-400'

  const headline = normalizedPayment === 'PAID'
    ? 'Pago acreditado'
    : isExpiredBookingStatus(normalizedStatus)
      ? 'Reserva vencida'
      : isNoShowBookingStatus(normalizedStatus)
        ? 'Reserva no asistida'
    : isGuest && normalizedStatus === 'PENDING'
      ? 'Reserva pendiente'
      : 'Turno reservado'

  const helper = normalizedPayment === 'PAID'
    ? 'Tu pago se registro y el turno ya quedo asociado a tu reserva.'
    : isExpiredBookingStatus(normalizedStatus)
      ? 'La reserva se libero por falta de pago dentro del tiempo configurado por el club.'
      : isNoShowBookingStatus(normalizedStatus)
        ? 'El turno ya paso y quedo marcado como ausente.'
    : isGuest && normalizedStatus === 'PENDING'
      ? 'El club debe validar la sena para confirmar definitivamente tu turno.'
      : 'Ya puedes compartirlo, agregarlo al calendario o volver a reservar.'

  return {
    headline,
    helper,
    reservationLabel,
    reservationTone,
    paymentLabel,
    paymentTone,
  }
}
