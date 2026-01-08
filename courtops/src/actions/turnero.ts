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

              const targetDate = new Date(dateStr)
              if (isNaN(targetDate.getTime())) {
                     console.error('[Turnero] Invalid date string:', dateStr)
                     return []
              }

              // Normalizamos a las 12:00 del día solicitado para evitar que el timezone
              // nos mueva al día anterior/siguiente por horas de diferencia (ej 03:00 UTC vs 00:00 Local)
              const base = new Date(targetDate)
              base.setHours(12, 0, 0, 0)

              // Buscamos 24 horas antes y después del mediodía de ese día
              const start = new Date(base)
              start.setHours(start.getHours() - 36) // Un poco más de margen por las dudas

              const end = new Date(base)
              end.setHours(end.getHours() + 36)

              console.log(`[Turnero] Club: ${clubId} - Request: ${dateStr}`)
              console.log(`[Turnero] Range: ${start.toISOString()} to ${end.toISOString()}`)

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
                            client: { select: { name: true } },
                            items: true,
                            transactions: true
                     },
                     orderBy: { startTime: 'asc' }
              }) as unknown as BookingWithClient[]

              console.log(`[Turnero] Found ${bookings.length} potential bookings.`)

              // Debug: Si hay 0 pero el usuario ve alertas, algo raro pasa con el clubId o los datos
              if (bookings.length === 0) {
                     const anyBooking = await prisma.booking.findFirst({ where: { clubId } })
                     console.log(`[Turnero] Check: Does any booking exist for club ${clubId}? ${anyBooking ? 'Yes: ' + anyBooking.id : 'No'}`)
              }

              return JSON.parse(JSON.stringify(bookings))
       } catch (error) {
              console.error('[Turnero] Action Error:', error)
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
