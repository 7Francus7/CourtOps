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

              // WIDENED RANGE DEBUGGING
              // Instead of strict 00:00-23:59, we look at previous day and next day
              // This ensures if timezone shifts pushed the booking to adjacent day, we still find it.
              const start = new Date(targetDate)
              start.setDate(start.getDate() - 1)
              start.setHours(0, 0, 0, 0)

              const end = new Date(targetDate)
              end.setDate(end.getDate() + 1)
              end.setHours(23, 59, 59, 999)

              console.log(`[Turnero] Fetching for dateStr: ${dateStr}`)
              console.log(`[Turnero] Query Range: ${start.toISOString()} -> ${end.toISOString()}`)

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

              console.log(`[Turnero] Found ${bookings.length} bookings for this wide range.`)
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
