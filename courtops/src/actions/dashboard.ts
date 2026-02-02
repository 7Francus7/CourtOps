'use server'

import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'
import { TurneroResponse } from '@/types/booking'

function safeSerialize<T>(data: T): T {
       return JSON.parse(JSON.stringify(data))
}

export async function getTurneroData(dateStr: string): Promise<TurneroResponse> {
       try {
              const clubId = await getCurrentClubId()
              const targetDate = new Date(dateStr)

              // Simple date range: -1 day to +1 day
              const start = new Date(targetDate)
              start.setDate(start.getDate() - 1)
              start.setHours(0, 0, 0, 0)

              const end = new Date(targetDate)
              end.setDate(end.getDate() + 1)
              end.setHours(23, 59, 59, 999)

              // Fetch courts & config first (critical)
              const courts = await prisma.court.findMany({
                     where: { clubId, isActive: true },
                     orderBy: { sortOrder: 'asc' }
              }).catch(() => [])

              const club = await prisma.club.findUnique({
                     where: { id: clubId },
                     select: { openTime: true, closeTime: true, slotDuration: true, timezone: true }
              }).catch(() => null)

              // Fetch bookings (non-critical, can fail)
              let bookings: any[] = []
              try {
                     bookings = await prisma.booking.findMany({
                            where: {
                                   clubId,
                                   startTime: { gte: start, lte: end },
                                   status: { not: 'CANCELED' }
                            },
                            include: {
                                   client: { select: { id: true, name: true, phone: true } },
                                   items: { include: { product: true } },
                                   transactions: true
                            },
                            orderBy: { startTime: 'asc' }
                     })
              } catch (e) {
                     console.error("Non-fatal: Error fetching bookings", e)
              }

              const config = {
                     openTime: club?.openTime || '09:00',
                     closeTime: club?.closeTime || '00:00',
                     slotDuration: club?.slotDuration || 90
              }

              return safeSerialize({
                     bookings,
                     courts,
                     config,
                     clubId,
                     success: true
              })

       } catch (error: any) {
              console.error('[TURNERO SERVER ERROR]', error)
              return {
                     bookings: [],
                     courts: [],
                     config: { openTime: '09:00', closeTime: '00:00', slotDuration: 60 },
                     clubId: '',
                     success: false,
                     error: 'Server error'
              }
       }
}

export async function getDashboardAlerts() {
       try {
              const clubId = await getCurrentClubId()
              const lowStock = await prisma.product.findMany({
                     where: { clubId, stock: { lte: 5 }, isActive: true },
                     take: 5
              }).catch(() => [])

              const pendingPayments = await prisma.booking.findMany({
                     where: { clubId, status: 'CONFIRMED', paymentStatus: { in: ['UNPAID', 'PARTIAL'] } },
                     include: { client: true },
                     take: 10
              }).catch(() => [])

              return safeSerialize({ lowStock, pendingPayments })
       } catch {
              return { lowStock: [], pendingPayments: [] }
       }
}

export async function getCourts() {
       try {
              const clubId = await getCurrentClubId()
              const data = await prisma.court.findMany({
                     where: { clubId, isActive: true },
                     orderBy: { sortOrder: 'asc' }
              })
              return safeSerialize(data)
       } catch {
              return []
       }
}

export async function getClubSettings() {
       try {
              const clubId = await getCurrentClubId()
              const data = await prisma.club.findUnique({ where: { id: clubId } })
              return safeSerialize(data)
       } catch {
              return null
       }
}

export async function getRevenueHeatmapData() {
       try {
              const clubId = await getCurrentClubId()
              const end = new Date()
              const start = new Date(end)
              start.setDate(start.getDate() - 90)

              const bookings = await prisma.booking.findMany({
                     where: {
                            clubId,
                            startTime: { gte: start, lte: end },
                            status: { not: 'CANCELED' }
                     },
                     select: { startTime: true, price: true }
              })

              const heatmap = new Map<string, { count: number, revenue: number }>()

              bookings.forEach(b => {
                     const date = new Date(b.startTime)
                     const day = date.getDay()
                     const hour = date.getHours()

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
              console.error('[HEATMAP ERROR]', error)
              return { success: false, data: [] }
       }
}

export async function getBookingsForDate(dateStr: string) {
       return await getTurneroData(dateStr)
}
