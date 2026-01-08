'use server'

import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'
import { subDays, addDays, startOfDay, endOfDay } from 'date-fns'
import { TurneroResponse } from '@/types/booking'

export async function getDashboardAlerts() {
       try {
              const clubId = await getCurrentClubId()
              const lowStockProducts = await prisma.product.findMany({
                     where: { clubId, stock: { lte: 5 }, isActive: true },
                     take: 5,
                     select: { name: true, stock: true }
              })

              const todayStart = startOfDay(new Date())
              const futureEnd = addDays(todayStart, 7)

              const pendingPayments = await prisma.booking.findMany({
                     where: {
                            clubId,
                            startTime: { gte: todayStart, lte: futureEnd },
                            OR: [
                                   { paymentStatus: 'UNPAID', status: 'CONFIRMED' },
                                   { status: 'PENDING' }
                            ]
                     },
                     include: { client: { select: { name: true } } },
                     orderBy: { startTime: 'asc' },
                     take: 5
              })

              return { lowStock: lowStockProducts, pendingPayments }
       } catch (error: any) {
              console.error("[DashboardAlerts] Error:", error.message)
              return { lowStock: [], pendingPayments: [] }
       }
}

export async function getTurneroData(dateStr: string): Promise<TurneroResponse> {
       try {
              const clubId = await getCurrentClubId()

              if (!dateStr) throw new Error("Missing dateStr")
              const targetDate = new Date(dateStr)
              if (isNaN(targetDate.getTime())) throw new Error("Invalid dateStr: " + dateStr)

              const start = subDays(startOfDay(targetDate), 1)
              const end = addDays(endOfDay(targetDate), 1)

              const [bookings, courts, club] = await Promise.all([
                     prisma.booking.findMany({
                            where: { clubId, startTime: { gte: start, lte: end }, status: { not: 'CANCELED' } },
                            include: {
                                   client: { select: { id: true, name: true } },
                                   items: { include: { product: true } },
                                   transactions: true
                            },
                            orderBy: { startTime: 'asc' }
                     }),
                     prisma.court.findMany({ where: { clubId, isActive: true }, orderBy: { sortOrder: 'asc' } }),
                     prisma.club.findUnique({ where: { id: clubId }, select: { openTime: true, closeTime: true, slotDuration: true } })
              ])

              return {
                     bookings: JSON.parse(JSON.stringify(bookings)),
                     courts,
                     config: club || { openTime: '14:00', closeTime: '23:30', slotDuration: 90 },
                     clubId,
                     success: true
              }
       } catch (error: any) {
              // Si es un error de Next.js (como redirect), lo relanzamos
              if (error.digest?.startsWith('NEXT_REDIRECT')) throw error;

              console.error("[TurneroAction] Fatal Error:", error)
              return {
                     bookings: [],
                     courts: [],
                     config: { openTime: '14:00', closeTime: '23:30', slotDuration: 90 },
                     clubId: 'ERR',
                     success: false,
                     error: error.message
              }
       }
}

// Added back original names for compatibility
export async function getBookingsForDate(dateStr: string) {
       return await getTurneroData(dateStr)
}
export async function getCourts() {
       const clubId = await getCurrentClubId()
       return prisma.court.findMany({ where: { clubId, isActive: true }, orderBy: { sortOrder: 'asc' } })
}
export async function getClubSettings() {
       const clubId = await getCurrentClubId()
       return prisma.club.findUnique({ where: { id: clubId }, select: { openTime: true, closeTime: true, slotDuration: true } })
}
