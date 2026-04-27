'use server'

import { getCurrentClubId, getEffectivePrice } from '@/lib/tenant'
import { DEFAULT_TIMEZONE, createArgDate } from '@/lib/date-utils'
import { formatInTimeZone } from 'date-fns-tz'

const PADEL_SLOT_MINUTES = 90

export async function getBookingPriceEstimate(
       courtId: number,
       dateStr: Date | string,
       timeStr: string,
       isMember: boolean = false
) {
       try {
              const clubId = await getCurrentClubId()

              // 1. Get YYYY-MM-DD in Argentina timezone regardless of where the server or client is
              const datePart = typeof dateStr === 'string'
                     ? dateStr.substring(0, 10)
                     : formatInTimeZone(dateStr, DEFAULT_TIMEZONE, 'yyyy-MM-dd')

              const [yStr, mStr, dStr] = datePart.split('-')

              const year = parseInt(yStr)
              const month = parseInt(mStr) - 1 // Months are 0-indexed in JS/Date
              const day = parseInt(dStr)

              // 2. Parse the time string
              const [hours, minutes] = timeStr.split(':').map(Number)

              // 3. Create the final date explicitly in ARG timezone
              const dateObj = createArgDate(year, month, day, hours, minutes)

              const duration = PADEL_SLOT_MINUTES

              // Calculate Base Price
              const price = await getEffectivePrice(clubId, dateObj, duration, isMember, 0, courtId)

              return { success: true, price }
       } catch (error: unknown) {
              console.error("Error fetching price estimate:", error)
              return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
       }
}
