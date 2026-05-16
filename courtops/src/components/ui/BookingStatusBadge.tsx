'use client'

import { cn } from '@/lib/utils'
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  UserX,
  GraduationCap,
  Swords,
  Sparkles,
  Hourglass,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────

export type PaymentStatus = 'PAID' | 'UNPAID' | 'PARTIAL' | 'PENDING_VALIDATION'
export type BookingStatus = 'CONFIRMED' | 'CANCELED' | 'NO_SHOW' | 'PENDING'
export type BookingType = 'NORMAL' | 'CLASS' | 'MATCH'

type Size = 'xs' | 'sm' | 'md'

// ── Config maps ────────────────────────────────────────────────────────────────

const PAYMENT_CONFIG: Record<
  PaymentStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  PAID: {
    label: 'Pagado',
    icon: CheckCircle2,
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  PARTIAL: {
    label: 'Seña',
    icon: Clock,
    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  PENDING_VALIDATION: {
    label: 'Validando',
    icon: Hourglass,
    className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  UNPAID: {
    label: 'Impago',
    icon: AlertCircle,
    className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  },
}

const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  CONFIRMED: {
    label: 'Confirmada',
    icon: CheckCircle2,
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  PENDING: {
    label: 'Pendiente',
    icon: Clock,
    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  CANCELED: {
    label: 'Cancelada',
    icon: XCircle,
    className: 'bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border-zinc-500/20',
  },
  NO_SHOW: {
    label: 'No Show',
    icon: UserX,
    className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  },
}

const TYPE_CONFIG: Record<
  BookingType,
  { label: string; icon: React.ElementType; className: string }
> = {
  NORMAL: {
    label: 'Reserva',
    icon: Sparkles,
    className: 'bg-primary/10 text-primary border-primary/20',
  },
  CLASS: {
    label: 'Clase',
    icon: GraduationCap,
    className: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  },
  MATCH: {
    label: 'Partido',
    icon: Swords,
    className: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  },
}

const SIZE_CONFIG: Record<Size, { badge: string; icon: number; text: string }> = {
  xs: { badge: 'px-1.5 py-0.5 gap-1 rounded-md', icon: 10, text: 'text-[9px]' },
  sm: { badge: 'px-2 py-1 gap-1 rounded-lg', icon: 11, text: 'text-[10px]' },
  md: { badge: 'px-2.5 py-1 gap-1.5 rounded-xl', icon: 12, text: 'text-xs' },
}

// ── Components ─────────────────────────────────────────────────────────────────

interface PaymentStatusBadgeProps {
  status: PaymentStatus | string
  size?: Size
  className?: string
  hideIcon?: boolean
}

export function PaymentStatusBadge({
  status,
  size = 'sm',
  className,
  hideIcon = false,
}: PaymentStatusBadgeProps) {
  const config = PAYMENT_CONFIG[status as PaymentStatus] ?? PAYMENT_CONFIG.UNPAID
  const sizes = SIZE_CONFIG[size]
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center border font-bold uppercase tracking-wider',
        sizes.badge,
        sizes.text,
        config.className,
        className
      )}
    >
      {!hideIcon && <Icon size={sizes.icon} className="shrink-0" />}
      {config.label}
    </span>
  )
}

interface BookingStatusBadgeProps {
  status: BookingStatus | string
  size?: Size
  className?: string
  hideIcon?: boolean
}

export function BookingStatusBadge({
  status,
  size = 'sm',
  className,
  hideIcon = false,
}: BookingStatusBadgeProps) {
  const config = STATUS_CONFIG[status as BookingStatus] ?? STATUS_CONFIG.CONFIRMED
  const sizes = SIZE_CONFIG[size]
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center border font-bold uppercase tracking-wider',
        sizes.badge,
        sizes.text,
        config.className,
        className
      )}
    >
      {!hideIcon && <Icon size={sizes.icon} className="shrink-0" />}
      {config.label}
    </span>
  )
}

interface BookingTypeBadgeProps {
  type: BookingType | string
  size?: Size
  className?: string
  hideIcon?: boolean
}

export function BookingTypeBadge({
  type,
  size = 'sm',
  className,
  hideIcon = false,
}: BookingTypeBadgeProps) {
  const config = TYPE_CONFIG[type as BookingType] ?? TYPE_CONFIG.NORMAL
  const sizes = SIZE_CONFIG[size]
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center border font-bold uppercase tracking-wider',
        sizes.badge,
        sizes.text,
        config.className,
        className
      )}
    >
      {!hideIcon && <Icon size={sizes.icon} className="shrink-0" />}
      {config.label}
    </span>
  )
}

// ── Combined badge (payment + lifecycle) for timeline/calendar ────────────────

interface CombinedBookingBadgeProps {
  paymentStatus?: PaymentStatus | string
  bookingStatus?: BookingStatus | string
  bookingType?: BookingType | string
  size?: Size
  className?: string
}

export function CombinedBookingBadge({
  paymentStatus,
  bookingStatus,
  bookingType,
  size = 'sm',
  className,
}: CombinedBookingBadgeProps) {
  const isTerminal =
    bookingStatus === 'CANCELED' || bookingStatus === 'NO_SHOW'

  return (
    <span className={cn('inline-flex items-center gap-1 flex-wrap', className)}>
      {bookingType && bookingType !== 'NORMAL' && (
        <BookingTypeBadge type={bookingType} size={size} />
      )}
      {isTerminal ? (
        <BookingStatusBadge status={bookingStatus!} size={size} />
      ) : (
        paymentStatus && <PaymentStatusBadge status={paymentStatus} size={size} />
      )}
    </span>
  )
}
