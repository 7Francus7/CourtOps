'use server'

import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'
import { subDays, addDays, startOfDay, endOfDay } from 'date-fns'
import { Prisma } from '@prisma/client'

export type BookingWithClient = Prisma.BookingGetPayload<{
       include: {
              client: { select: { id: true, name: true } }
              items: { include: { product: true } }
              transactions: true
       }
}>

// WE INTEGRATE EVERYTHING HERE TO GUARANTEE SESSION CONSISTENCY
export async function getDashboardAlerts() {
       const clubId = await getCurrentClubId()
       const lowStockProducts = await prisma.product.findMany({
              where: { clubId, stock: { lte: 5 }, isActive: true },
              take: 5,
              select: { name: true, stock: true }
       })

       const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
       const futureEnd = new Date(); futureEnd.setDate(futureEnd.getDate() + 7); futureEnd.setHours(23, 59, 59, 999)

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
}

export async function getTurneroData(dateStr: string) {
       try {
              const clubId = await getCurrentClubId()
              const targetDate = new Date(dateStr)

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
              return {
                     bookings: [],
                     courts: [],
                     config: { openTime: '14:00', closeTime: '23:30', slotDuration: 90 },
                     clubId: 'SESSION_ERROR',
                     success: false
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
