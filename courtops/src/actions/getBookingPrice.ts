'use server'

import { getCurrentClubId, getEffectivePrice } from '@/lib/tenant'
import prisma from '@/lib/db'

export async function getBookingPriceEstimate(
       courtId: number,
       dateStr: Date | string,
       timeStr: string,
       isMember: boolean = false
) {
       try {
              const clubId = await getCurrentClubId()

              // Construct the generic date object
              // dateStr usually comes as the base date (e.g. 2024-01-27T00:00:00)
              // timeStr is "14:00"
              const [hours, minutes] = timeStr.split(':').map(Number)

              const dateObj = new Date(dateStr)
              dateObj.setHours(hours, minutes, 0, 0)

              // Get club duration setting
              const club = await prisma.club.findUnique({
                     where: { id: clubId },
                     select: { slotDuration: true }
              })
              const duration = club?.slotDuration || 90

              // Calculate Base Price
              const price = await getEffectivePrice(clubId, dateObj, duration, isMember)

              return { success: true, price }
       } catch (error: any) {
              console.error("Error fetching price estimate:", error)
              return { success: false, error: error.message }
       }
}
