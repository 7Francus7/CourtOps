'use server'

import { startOfDay, endOfDay } from 'date-fns'
import { getCurrentClubId } from '@/lib/tenant'
import prisma from '@/lib/db'

import { Prisma } from '@prisma/client'

// Manual type to avoid environment Prisma generation issues
// Better type definition using Prisma util
export type BookingWithClient = Prisma.BookingGetPayload<{
       include: {
              client: { select: { name: true } }
              items: true
              transactions: true
       }
}>

export async function getBookingsForDate(dateStr: string): Promise<any> {
       try {
              const clubId = await getCurrentClubId()

              // Use a query very similar to alerts to ensure consistency
              const bookings = await prisma.booking.findMany({
                     where: {
                            clubId,
                            status: { not: 'CANCELED' }
                     },
                     include: {
                            client: { select: { name: true } }
                     },
                     orderBy: { startTime: 'asc' },
                     take: 100
              })

              console.log(`[TurneroAction] Club: ${clubId}, Found: ${bookings.length}`)

              return {
                     bookings: JSON.parse(JSON.stringify(bookings)),
                     debug: {
                            clubId,
                            count: bookings.length,
                            timestamp: new Date().toISOString()
                     }
              }
       } catch (error) {
              console.error('[TurneroAction] CRITICAL ERROR:', error)
              return {
                     bookings: [],
                     error: String(error),
                     debug: { clubId: 'ERROR' }
              }
       }
}

export async function getCourts() {
       const clubId = await getCurrentClubId()
       return await prisma.court.findMany({
              where: {
                     clubId,
                     isActive: true
              },
              orderBy: {
                     sortOrder: 'asc'
              }
       })
}

export async function getClubSettings() {
       const clubId = await getCurrentClubId()
       const club = await prisma.club.findUnique({
              where: { id: clubId },
              select: {
                     openTime: true,
                     closeTime: true,
                     slotDuration: true
              }
       })

       if (!club) {
              // Fallback default
              return {
                     openTime: '14:00',
                     closeTime: '23:30',
                     slotDuration: 90
              }
       }

       // Temporary Override Removed: User explicitly requested 14:00 start
       // if (club.openTime === '14:00') {
       //        return { ...club, openTime: '08:00' }
       // }

       return club
}
