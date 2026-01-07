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

export async function getBookingsForDate(date: Date): Promise<BookingWithClient[]> {
       try {
              const clubId = await getCurrentClubId()

              // Widen the search to account for timezone differences (UTC vs Local)
              // The grid logic handles the visual filtering by time key.
              const d = new Date(date)
              d.setHours(12, 0, 0, 0) // Midday of requested date

              const start = new Date(d)
              start.setDate(start.getDate() - 1) // Look back 1 day

              const end = new Date(d)
              end.setDate(end.getDate() + 1) // Look ahead 1 day

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
