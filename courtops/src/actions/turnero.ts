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

export async function getBookingsForDate(dateStr: string): Promise<BookingWithClient[]> {
       try {
              const clubId = await getCurrentClubId()

              // Safe Date Handling from String
              const targetDate = new Date(dateStr)

              if (isNaN(targetDate.getTime())) {
                     console.error('Invalid date string provided:', dateStr)
                     return []
              }

              // Set to start of day (00:00:00)
              const start = new Date(targetDate)
              start.setHours(0, 0, 0, 0)

              // Set to end of day (23:59:59)
              const end = new Date(targetDate)
              end.setHours(23, 59, 59, 999)

              // Just in case of timezone shifts, let's grab a bit more context
              // (e.g. -3h to +3h overlap isn't huge, but +/- 12h is safer)
              // actually, reverting to strictly start/end of the REQUESTED date is safer for now.
              // If we need "widen", we do it carefully.
              // Let's stick to the exact day requested but ensure the Date object is valid.

              console.log(`Fetching bookings for ${start.toISOString()} to ${end.toISOString()}`)

              // We cast to unknown first to avoid the specific environment TS issues mentioning in comments previously
              const bookings = await prisma.booking.findMany({
                     where: {
                            clubId,
                            startTime: {
                                   gte: start,
                                   lte: end
                            },
                            status: {
                                   not: 'CANCELED'
                            }
                     },
                     include: {
                            client: {
                                   select: {
                                          name: true
                                   }
                            },
                            // @ts-ignore
                            items: true,
                            // @ts-ignore
                            transactions: true
                     }
              }) as unknown as BookingWithClient[]

              return bookings
       } catch (error) {
              console.error('Error fetching bookings:', error)
              return []
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
