'use server'

import { Prisma } from '@prisma/client'
import { startOfDay, endOfDay, addDays, subDays } from 'date-fns'
import { getCurrentClubId } from '@/lib/tenant'
import prisma from '@/lib/db'

export type BookingWithClient = Prisma.BookingGetPayload<{
       include: {
              client: { select: { id: true, name: true } }
              items: { include: { product: true } }
              transactions: true
       }
}>

export async function getBookingsForDate(dateStr: string) {
       try {
              // Obtenemos el ID del club. Si falla, es problema de sesión.
              const clubId = await getCurrentClubId()

              const targetDate = new Date(dateStr)

              // Rango extendido para evitar problemas de zona horaria (48hs de margen)
              const start = subDays(startOfDay(targetDate), 1)
              const end = addDays(endOfDay(targetDate), 1)

              const bookings = await prisma.booking.findMany({
                     where: {
                            clubId,
                            startTime: { gte: start, lte: end },
                            status: { not: 'CANCELED' }
                     },
                     include: {
                            client: { select: { id: true, name: true } },
                            items: {
                                   include: { product: true }
                            },
                            transactions: true
                     },
                     orderBy: { startTime: 'asc' }
              })

              return {
                     bookings: JSON.parse(JSON.stringify(bookings)),
                     clubId,
                     success: true
              }
       } catch (error: any) {
              console.error('[TurneroAction] Error:', error.message)
              return {
                     bookings: [],
                     clubId: 'SESSION_ERROR',
                     success: false,
                     error: error.message
              }
       }
}

export async function getCourts() {
       try {
              const clubId = await getCurrentClubId()
              return await prisma.court.findMany({
                     where: { clubId, isActive: true },
                     orderBy: { sortOrder: 'asc' }
              })
       } catch { return [] }
}

export async function getClubSettings() {
       try {
              const clubId = await getCurrentClubId()
              const club = await prisma.club.findUnique({
                     where: { id: clubId },
                     select: { openTime: true, closeTime: true, slotDuration: true }
              })
              return club || { openTime: '14:00', closeTime: '23:30', slotDuration: 90 }
       } catch {
              return { openTime: '14:00', closeTime: '23:30', slotDuration: 90 }
       }
}
