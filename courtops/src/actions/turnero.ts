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

export async function getBookingsForDate(dateStr: string): Promise<{ bookings: BookingWithClient[], clubId: string }> {
       try {
              const clubId = await getCurrentClubId()

              // Traemos todas las del club (limite 300) y filtramos en el cliente.
              // Es la única forma de garantizar que aparezcan siempre sin importar el Timezone del servidor.
              const bookings = await prisma.booking.findMany({
                     where: {
                            clubId,
                            status: { not: 'CANCELED' }
                     },
                     include: {
                            client: { select: { id: true, name: true } },
                            items: {
                                   include: { product: true }
                            },
                            transactions: true
                     },
                     orderBy: { startTime: 'desc' },
                     take: 300
              })

              return {
                     bookings: JSON.parse(JSON.stringify(bookings)),
                     clubId
              }
       } catch (error) {
              console.error('[Turnero] Global Fetch Error:', error)
              return { bookings: [], clubId: 'ERROR' }
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
