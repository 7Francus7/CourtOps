'use server'

import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'
import { TurneroResponse } from '@/types/booking'
import { fromUTC, nowInArg } from '@/lib/date-utils'
import { fromZonedTime } from 'date-fns-tz'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function pingServer() {
       return { message: 'pong', timestamp: new Date().toISOString() }
}

export async function getTurneroData(dateStr: string): Promise<TurneroResponse> {
       try {
              const session = await getServerSession(authOptions)

              if (!session || !session.user || !session.user.clubId) {
                     console.error('[TURNERO] No session or clubId found')
                     const noSessionResponse: TurneroResponse = {
                            bookings: [],
                            courts: [],
                            config: { openTime: '09:00', closeTime: '00:00', slotDuration: 60 },
                            clubId: '',
                            success: false,
                            error: 'No session'
                     }
                     return JSON.parse(JSON.stringify(noSessionResponse)) as TurneroResponse
              }

              const clubId = session.user.clubId

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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                                   transactions: true,
                                   court: { select: { id: true, name: true } }
                            },
                            orderBy: { startTime: 'asc' }
                     })
              } catch (e) {
                     console.error("[TURNERO] Non-fatal: Error fetching bookings", e)
              }

              const config = {
                     openTime: club?.openTime || '09:00',
                     closeTime: club?.closeTime || '00:00',
                     slotDuration: club?.slotDuration || 90
              }

              const response: TurneroResponse = {
                     bookings,
                     courts,
                     config,
                     clubId,
                     success: true
              }

              // Use JSON parse/stringify instead of ultraSafeSerialize for compatibility
              const serialized = JSON.parse(JSON.stringify(response))

              return serialized as TurneroResponse

       } catch (error: unknown) {
              const errorMessage = error instanceof Error ? error.message : 'Server error'
              const errorStack = error instanceof Error ? error.stack : undefined
              console.error('[TURNERO SERVER ERROR]', errorMessage)
              console.error('[TURNERO STACK]', errorStack)
              const errorResponse: TurneroResponse = {
                     bookings: [],
                     courts: [],
                     config: { openTime: '09:00', closeTime: '00:00', slotDuration: 60 },
                     clubId: '',
                     success: false,
                     error: errorMessage
              }
              return JSON.parse(JSON.stringify(errorResponse)) as TurneroResponse
       }
}

export async function getDashboardAlerts() {
       try {
              const clubId = await getCurrentClubId()
              const lowStock = await prisma.product.findMany({
                     where: { clubId, stock: { lte: 5 }, isActive: true },
                     take: 5
              }).catch(() => [])

              // Use Argentina timezone for "today" boundaries
              const now = nowInArg()
              const yyyy = now.getUTCFullYear()
              const mm = String(now.getUTCMonth() + 1).padStart(2, '0')
              const dd = String(now.getUTCDate()).padStart(2, '0')
              const todayStart = fromZonedTime(`${yyyy}-${mm}-${dd} 00:00:00`, 'America/Argentina/Buenos_Aires')
              const todayEnd = fromZonedTime(`${yyyy}-${mm}-${dd} 23:59:59`, 'America/Argentina/Buenos_Aires')

              const pendingPayments = await prisma.booking.findMany({
                     where: {
                            clubId,
                            status: 'CONFIRMED',
                            paymentStatus: { in: ['UNPAID', 'PARTIAL'] },
                            startTime: { gte: todayStart, lte: todayEnd }
                     },
                     include: { client: true },
                     take: 10
              }).catch(() => [])

              return JSON.parse(JSON.stringify({ lowStock, pendingPayments }))
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
              return JSON.parse(JSON.stringify(data))
       } catch {
              return []
       }
}

export async function getClubSettings() {
       try {
              const clubId = await getCurrentClubId()
              const data = await prisma.club.findUnique({
                     where: { id: clubId },
                     select: {
                            id: true, name: true, slug: true, logoUrl: true,
                            openTime: true, closeTime: true, slotDuration: true,
                            themeColor: true, hasKiosco: true, hasTournaments: true,
                            hasAdvancedReports: true, timezone: true, currency: true,
                            hasOnlinePayments: true, allowCredit: true,
                            phone: true, address: true, cancelHours: true,
                            plan: true, subscriptionStatus: true, bookingDeposit: true,
                     }
              })
              return JSON.parse(JSON.stringify(data))
       } catch {
              return null
       }
}

export async function getRevenueHeatmapData() {
       try {
              const clubId = await getCurrentClubId()
              const end = nowInArg()
              const start = new Date(end)
              start.setDate(start.getUTCDate() - 90)

              const bookings = await prisma.booking.findMany({
                     where: {
                            clubId,
                            startTime: { gte: start, lte: end },
                            status: { not: 'CANCELED' }
                     },
                     select: { startTime: true, price: true }
              })

              // Get club hours for dynamic range
              const club = await prisma.club.findUnique({
                     where: { id: clubId },
                     select: { openTime: true, closeTime: true }
              })
              const openHour = club ? parseInt(club.openTime.split(':')[0]) : 8
              const closeHour = club ? parseInt(club.closeTime.split(':')[0]) : 24

              const heatmap = new Map<string, { count: number, revenue: number }>()

              bookings.forEach(b => {
                     // Convert UTC to Argentina local time before extracting day/hour
                     const localDate = fromUTC(new Date(b.startTime))
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
                     // Handle wrap-around (e.g. open=8, close=1 means 8..24 + 0..1)
                     const hours: number[] = []
                     if (closeHour <= openHour) {
                            for (let h = openHour; h < 24; h++) hours.push(h)
                            for (let h = 0; h <= closeHour; h++) hours.push(h)
                     } else {
                            for (let h = openHour; h < closeHour; h++) hours.push(h)
                     }
                     for (const h of hours) {
                            const key = `${d}-${h}`
                            const data = heatmap.get(key) || { count: 0, revenue: 0 }
                            result.push({ day: d, hour: h, value: data.count, revenue: data.revenue })
                     }
              }

              return JSON.parse(JSON.stringify({ success: true, data: result }))
       } catch (error: unknown) {
              console.error('[HEATMAP ERROR]', error)
              return { success: false, data: [] }
       }
}

export async function getBookingsForDate(dateStr: string) {
       return await getTurneroData(dateStr)
}
