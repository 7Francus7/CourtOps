import { z } from 'zod'
import { Prisma } from '@prisma/client'

// ============================================================================
// ENUMS Y CONSTANTES
// ============================================================================

export const BookingStatus = {
       PENDING: 'PENDING',
       CONFIRMED: 'CONFIRMED',
       PARTIAL_PAID: 'PARTIAL_PAID',
       PAID: 'PAID',
       IN_PROGRESS: 'IN_PROGRESS',
       COMPLETED: 'COMPLETED',
       CANCELED: 'CANCELED'
} as const

export const PaymentMethod = {
       CASH: 'CASH',
       TRANSFER: 'TRANSFER',
       DEBIT: 'DEBIT',
       CREDIT: 'CREDIT',
       MERCADOPAGO: 'MERCADOPAGO'
} as const

export const PaymentMethodLabels: Record<keyof typeof PaymentMethod, string> = {
       CASH: 'Efectivo',
       TRANSFER: 'Transferencia',
       DEBIT: 'Débito',
       CREDIT: 'Crédito',
       MERCADOPAGO: 'Mercado Pago'
}

// ============================================================================
// SCHEMAS DE VALIDACIÓN (ZOD)
// ============================================================================

export const paymentSchema = z.object({
       amount: z.number()
              .min(1, 'El monto debe ser mayor a 0')
              .positive('El monto debe ser positivo'),
       method: z.enum(['CASH', 'TRANSFER', 'DEBIT', 'CREDIT', 'MERCADOPAGO']),
       notes: z.string().optional(),
       reference: z.string().optional()
})

export const productSchema = z.object({
       productId: z.number(),
       quantity: z.number().min(1, 'La cantidad debe ser al menos 1'),
       playerName: z.string().optional()
})

export const playerSchema = z.object({
       name: z.string().min(1, 'El nombre es requerido'),
       amount: z.number().min(0),
       isPaid: z.boolean().default(false),
       paymentMethod: z.enum(['CASH', 'TRANSFER', 'DEBIT', 'CREDIT', 'MERCADOPAGO']).optional()
})

// ============================================================================
// TIPOS TYPESCRIPT
// ============================================================================

export type BookingStatusType = typeof BookingStatus[keyof typeof BookingStatus]
export type PaymentMethodType = typeof PaymentMethod[keyof typeof PaymentMethod]

export interface BookingClient {
       id: number
       name: string
       phone: string
       email?: string | null
}

export interface BookingSchedule {
       date: Date
       startTime: Date
       endTime: Date
       duration: number
       courtId: number
       courtName: string
}

export interface BookingPricing {
       basePrice: number
       kioskExtras: number
       total: number
       paid: number
       balance: number
}

export interface BookingTransaction {
       id: number
       amount: number
       method: PaymentMethodType
       createdAt: Date
       notes?: string | null
       reference?: string | null
}

export interface BookingProduct {
       id: number
       productId: number
       productName: string
       quantity: number
       unitPrice: number
       playerName?: string | null
       subtotal: number
}

export interface BookingPlayer {
       id: number
       name: string
       amount: number
       isPaid: boolean
       paymentMethod?: PaymentMethodType | null
}

export interface BookingMetadata {
       createdAt: Date
       updatedAt: Date
       createdBy?: string
       reminderSent?: boolean
}

export interface Booking {
       id: number
       client: BookingClient
       schedule: BookingSchedule
       pricing: BookingPricing
       status: BookingStatusType
       paymentStatus: string
       transactions: BookingTransaction[]
       products: BookingProduct[]
       players: BookingPlayer[]
       notes?: string | null
       metadata: BookingMetadata
}

// ============================================================================
// TIPOS DE FORMULARIOS
// ============================================================================

export type PaymentFormData = z.infer<typeof paymentSchema>
export type ProductFormData = z.infer<typeof productSchema>
export type PlayerFormData = z.infer<typeof playerSchema>

// ============================================================================
// HELPERS DE CÁLCULO
// ============================================================================

export function calculateBookingPricing(
       basePrice: number,
       products: BookingProduct[],
       transactions: BookingTransaction[]
): BookingPricing {
       const kioskExtras = products.reduce((sum, p) => sum + p.subtotal, 0)
       const total = basePrice + kioskExtras
       const paid = transactions.reduce((sum, t) => sum + t.amount, 0)
       const balance = total - paid

       return {
              basePrice,
              kioskExtras,
              total,
              paid,
              balance: Math.max(0, balance)
       }
}

export function getStatusColor(status: BookingStatusType): string {
       const colors: Record<BookingStatusType, string> = {
              PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
              CONFIRMED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
              PARTIAL_PAID: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
              PAID: 'bg-green-500/20 text-green-400 border-green-500/30',
              IN_PROGRESS: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
              COMPLETED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
              CANCELED: 'bg-red-500/20 text-red-400 border-red-500/30'
       }
       return colors[status] || colors.PENDING
}

export function getStatusLabel(status: BookingStatusType): string {
       const labels: Record<BookingStatusType, string> = {
              PENDING: 'Pendiente',
              CONFIRMED: 'Confirmado',
              PARTIAL_PAID: 'Pago Parcial',
              PAID: 'Pagado',
              IN_PROGRESS: 'En Progreso',
              COMPLETED: 'Completado',
              CANCELED: 'Cancelado'
       }
       return labels[status] || status
}

export function getPaymentMethodIcon(method: PaymentMethodType): string {
       const icons: Record<PaymentMethodType, string> = {
              CASH: '💵',
              TRANSFER: '🏦',
              DEBIT: '💳',
              CREDIT: '💳',
              MERCADOPAGO: '💰'
       }
       return icons[method] || '💰'
}

// ============================================================================
// TURNERO / DASHBOARD TYPES
// ============================================================================

export type TurneroBooking = Prisma.BookingGetPayload<{
       include: {
              client: { select: { id: true, name: true, phone: true } }
              items: { include: { product: true } }
              transactions: true
              court: { select: { id: true, name: true } }
       }
}>

export type TurneroCourt = Prisma.CourtGetPayload<{}>

export interface TurneroResponse {
       bookings: TurneroBooking[]
       courts: TurneroCourt[]
       config: {
              openTime: string
              closeTime: string
              slotDuration: number
       }
       clubId: string
       success: boolean
       error?: string
}

// ============================================================================
// PRISMA-BASED TYPES (Type-safe with database schema)
// ============================================================================

// Booking with client relation
export type BookingWithClient = Prisma.BookingGetPayload<{
       include: { client: true }
}>

// Booking with all details
export type BookingWithDetails = Prisma.BookingGetPayload<{
       include: {
              client: true
              court: true
              items: { include: { product: true } }
              transactions: true
              players: true
       }
}>

// Booking with full relations for management
export type BookingFull = Prisma.BookingGetPayload<{
       include: {
              client: true
              court: true
              club: true
              items: { include: { product: true } }
              transactions: true
              players: true
       }
}>
