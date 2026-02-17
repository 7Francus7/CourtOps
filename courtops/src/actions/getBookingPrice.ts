'use server'

import { getCurrentClubId, getEffectivePrice } from '@/lib/tenant'
import { fromUTC, createArgDate } from '@/lib/date-utils'
import prisma from '@/lib/db'

export async function getBookingPriceEstimate(
       courtId: number,
       dateStr: Date | string,
       timeStr: string,
       isMember: boolean = false
) {
       try {
              const clubId = await getCurrentClubId()

              // Construct the generic date object with timezone awareness
              // 1. Get the base date components in Argentina Time
              const argDateBase = fromUTC(new Date(dateStr))
              const year = argDateBase.getUTCFullYear()
              const month = argDateBase.getUTCMonth()
              const day = argDateBase.getUTCDate()

              // 2. Parse the time string
              const [hours, minutes] = timeStr.split(':').map(Number)

              // 3. Create the final date explicitly in ARG timezone
              const dateObj = createArgDate(year, month, day, hours, minutes)

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
