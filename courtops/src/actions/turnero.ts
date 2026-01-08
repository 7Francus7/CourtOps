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
              console.log(`[Turnero] Fetching for club: ${clubId}, requested date: ${dateStr}`)

              // DEBUG: Let's fetch ALL bookings for this club to see if anything at all comes back
              // In production we should filter, but we are troubleshooting why it's empty
              const allBookings = await prisma.booking.findMany({
                     where: {
                            clubId,
                            status: {
                                   not: 'CANCELED'
                            }
                     },
                     include: {
                            client: { select: { name: true } },
                            items: true,
                            transactions: true
                     },
                     orderBy: { startTime: 'desc' },
                     take: 200 // Safety limit
              }) as unknown as BookingWithClient[]

              console.log(`[Turnero] Found ${allBookings.length} total bookings for club ${clubId}`)

              // Return an object that includes the data and some debug info
              // We'll have to adjust the frontend to handle this or just return the array
              // For now, let's keep it as an array to not break types, but filtered to the specific day?
              // No, let's return ALL of them and filter in the frontend to BE SURE.

              return JSON.parse(JSON.stringify(allBookings))
       } catch (error) {
              console.error('[Turnero] Global Fetch Error:', error)
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
