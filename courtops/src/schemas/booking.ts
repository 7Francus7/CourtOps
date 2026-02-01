
import { z } from 'zod'

export const createBookingSchema = z.object({
       clientName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
       clientPhone: z.string().min(6, "El teléfono debe tener al menos 6 caracteres"),
       clientEmail: z.string().email("Email inválido").optional().or(z.literal('')),
       courtId: z.number().int().positive(),
       startTime: z.coerce.date(), // Handles string -> date conversion
       endTime: z.coerce.date().optional(),

       // Payment & Status
       paymentStatus: z.enum(['UNPAID', 'PAID', 'PARTIAL', 'SPLIT']).default('UNPAID'),
       status: z.enum(['PENDING', 'CONFIRMED']).default('CONFIRMED'),

       // Financials
       priceOverride: z.number().nonnegative().optional(),
       advancePaymentAmount: z.number().nonnegative().optional(),
       totalPrice: z.number().nonnegative().optional(),

       // Arrays
       payments: z.array(z.object({
              method: z.string(),
              amount: z.number().nonnegative()
       })).optional(),

       // Meta
       notes: z.string().optional(),
       isMember: z.boolean().optional(),
       recurringEndDate: z.string().optional().nullable().transform(val => val ? new Date(val) : undefined)
})

export type CreateBookingSchema = z.infer<typeof createBookingSchema>
