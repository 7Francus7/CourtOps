'use server'

import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'
import { subDays, addDays, startOfDay, endOfDay } from 'date-fns'
import { TurneroResponse } from '@/types/booking'
import { nowInArg } from '@/lib/date-utils'
import { toZonedTime } from 'date-fns-tz'
import { logError } from '@/lib/debug-logger'

// Helper para limpiar objetos antes de enviarlos al cliente
function safeSerialize<T>(data: T): T {
       return JSON.parse(JSON.stringify(data))
}

async function getCachedCourts(clubId: string) {
       try {
              return await prisma.court.findMany({
                     where: { clubId, isActive: true },
                     orderBy: { sortOrder: 'asc' }
              })
       } catch (e) {
              console.error("Error fetching courts:", e)
              return []
       }
}

async function getCachedClubSettings(clubId: string) {
       try {
              return await prisma.club.findUnique({
                     where: { id: clubId },
                     select: { openTime: true, closeTime: true, slotDuration: true, timezone: true, allowCredit: true }
              })
       } catch (e) {
              console.error("Error fetching settings:", e)
              return null
       }
}


export async function getDashboardAlerts() {
       try {
              const clubId = await getCurrentClubId()
              if (!clubId) return { lowStock: [], pendingPayments: [] }

              const lowStockProducts = await prisma.product.findMany({
                     where: { clubId, stock: { lte: 5 }, isActive: true },
                     take: 5,
                     select: { name: true, stock: true }
              })

              const todayStart = startOfDay(nowInArg())
              const sixMonthsAgo = subDays(todayStart, 180)

              const pendingPayments = await prisma.booking.findMany({
                     where: {
                            clubId,
                            status: 'CONFIRMED',
                            paymentStatus: { in: ['UNPAID', 'PARTIAL'] },
                            startTime: { gte: sixMonthsAgo }
                     },
                     include: { client: { select: { name: true } } },
                     orderBy: { startTime: 'asc' },
                     take: 10
              })

              return safeSerialize({ lowStock: lowStockProducts, pendingPayments })
       } catch (error: any) {
              if (error.digest?.startsWith('NEXT_REDIRECT')) throw error;
              console.error("[CRITICAL] getDashboardAlerts failed:", error)
              return { lowStock: [], pendingPayments: [] }
       }
}

export async function getTurneroData(dateStr: string): Promise<TurneroResponse> {
       try {
              const clubId = await getCurrentClubId()
              if (!clubId) throw new Error("No club session")

              if (!dateStr) throw new Error("Missing dateStr")
              const targetDate = new Date(dateStr)
              if (isNaN(targetDate.getTime())) throw new Error("Invalid dateStr: " + dateStr)

              const start = subDays(startOfDay(targetDate), 1)
              const end = addDays(endOfDay(targetDate), 1)

              const [bookings, courts, club] = await Promise.all([
                     prisma.booking.findMany({
                            where: { clubId, startTime: { gte: start, lte: end }, status: { not: 'CANCELED' } },
                            include: {
                                   client: { select: { id: true, name: true, phone: true } },
                                   items: { include: { product: true } },
                                   transactions: true
                            },
                            orderBy: { startTime: 'asc' }
                     }),
                     getCachedCourts(clubId),
                     getCachedClubSettings(clubId)
              ])

              const config = club || { openTime: '08:00', closeTime: '23:00', slotDuration: 90 }

              return safeSerialize({
                     bookings,
                     courts,
                     config,
                     clubId,
                     success: true
              })
       } catch (error: any) {
              if (error.digest?.startsWith('NEXT_REDIRECT')) throw error;
              console.error("[CRITICAL] getTurneroData Fatal Error:", error)
              return {
                     bookings: [],
                     courts: [],
                     config: { openTime: '08:00', closeTime: '23:00', slotDuration: 90 },
                     clubId: 'ERR',
                     success: false,
                     error: error.message || "Fatal Error"
              }
       }
}

export async function getCourts() {
       try {
              const clubId = await getCurrentClubId()
              const data = await getCachedCourts(clubId)
              return safeSerialize(data)
       } catch (error: any) {
              if (error.digest?.startsWith('NEXT_REDIRECT')) throw error;
              return []
       }
}

export async function getClubSettings() {
       try {
              const clubId = await getCurrentClubId()
              const data = await getCachedClubSettings(clubId)
              return safeSerialize(data)
       } catch (error: any) {
              if (error.digest?.startsWith('NEXT_REDIRECT')) throw error;
              return null
       }
}

export async function getRevenueHeatmapData() {
       try {
              const clubId = await getCurrentClubId()
              const end = new Date()
              const start = subDays(end, 90)

              const bookings = await prisma.booking.findMany({
                     where: {
                            clubId,
                            startTime: { gte: start, lte: end },
                            status: { not: 'CANCELED' }
                     },
                     select: { startTime: true, price: true }
              })

              const heatmap = new Map<string, { count: number, revenue: number }>()
              const clubSettings = await getCachedClubSettings(clubId)
              const timeZone = clubSettings?.timezone || 'America/Argentina/Buenos_Aires'

              bookings.forEach(b => {
                     const localDate = toZonedTime(b.startTime, timeZone)
                     const day = localDate.getUTCDay()
                     const hour = localDate.getUTCHours()

                     const key = `${day}-${hour}`
                     const current = heatmap.get(key) || { count: 0, revenue: 0 }
                     heatmap.set(key, {
                            count: current.count + 1,
                            revenue: current.revenue + b.price
                     })
              })

              const result = []
              for (let d = 0; d < 7; d++) {
                     for (let h = 8; h < 24; h++) {
                            const key = `${d}-${h}`
                            const data = heatmap.get(key) || { count: 0, revenue: 0 }
                            result.push({ day: d, hour: h, value: data.count, revenue: data.revenue })
                     }
              }

              return safeSerialize({ success: true, data: result })
       } catch (error: any) {
              if (error.digest?.startsWith('NEXT_REDIRECT')) throw error;
              return safeSerialize({ success: false, data: [] })
       }
}

// Added back original names for compatibility
export async function getBookingsForDate(dateStr: string) {
       return await getTurneroData(dateStr)
}
