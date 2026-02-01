'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentClubId } from '@/lib/tenant'
import { BookingService, CreateBookingDTO } from '@/services/booking.service'

import { createBookingSchema } from '@/schemas/booking'

// Re-exporting the type for frontend compatibility if needed, 
// though ideally frontend should import from the service definition or shared types
export type CreateBookingInput = Omit<CreateBookingDTO, 'clubId'>

export async function createBooking(data: CreateBookingInput) {
       try {
              const clubId = await getCurrentClubId()

              // Validate input
              const validation = createBookingSchema.safeParse(data)
              if (!validation.success) {
                     return { success: false, error: validation.error.issues[0]?.message || "Error de validación" }
              }

              const result = await BookingService.create({
                     ...validation.data,
                     clubId
              })

              revalidatePath('/')
              return result

       } catch (error: any) {
              console.error("Booking Creation Error:", error)
              return { success: false, error: error.message }
       }
}
