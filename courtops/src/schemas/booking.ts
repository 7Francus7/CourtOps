
import { z } from 'zod'

export const createBookingSchema = z.object({
       clientName: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
       clientPhone: z.string().min(6, "El teléfono debe tener al menos 6 caracteres").max(20).regex(/^[+\d\s()-]+$/, "Formato de teléfono inválido"),
       clientEmail: z.string().email("Email inválido").optional().or(z.literal('')),
       courtId: z.number().int().positive(),
       startTime: z.coerce.date(),
       endTime: z.coerce.date().optional(),

       // Payment & Status
       paymentStatus: z.enum(['UNPAID', 'PAID', 'PARTIAL', 'SPLIT']).default('UNPAID'),
       status: z.enum(['PENDING', 'CONFIRMED']).default('CONFIRMED'),

       // Financials
       priceOverride: z.number().nonnegative().max(10000000, "Precio fuera de rango").optional(),
       advancePaymentAmount: z.number().nonnegative().max(10000000).optional(),
       totalPrice: z.number().nonnegative().max(10000000).optional(),

       // Arrays
       payments: z.array(z.object({
              method: z.string(),
              amount: z.number().nonnegative().max(10000000)
       })).optional(),

       // Meta
       notes: z.string().max(500).optional(),
       isMember: z.boolean().optional(),
       recurringEndDate: z.string().optional().nullable().transform(val => val ? new Date(val) : undefined)
})

export type CreateBookingSchema = z.infer<typeof createBookingSchema>
