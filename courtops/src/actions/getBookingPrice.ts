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

              // 1. Robustly parse the YYYY-MM-DD part from the string
              // This avoids any 'midnight UTC' vs 'midnight Local' shifts
              const dateString = dateStr instanceof Date
                     ? dateStr.toISOString()
                     : dateStr.toString()

              const [yStr, mStr, dStr] = dateString.substring(0, 10).split('-')

              const year = parseInt(yStr)
              const month = parseInt(mStr) - 1 // Months are 0-indexed in JS/Date
              const day = parseInt(dStr)

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
