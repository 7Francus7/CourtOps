'use server'

import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'
import { subDays, addDays, startOfDay, endOfDay } from 'date-fns'
import { TurneroResponse } from '@/types/booking'
import { nowInArg } from '@/lib/date-utils'
import { getCache, setCache } from '@/lib/cache'
import { format } from 'date-fns'
import { unstable_cache } from 'next/cache'
import { toZonedTime } from 'date-fns-tz'
import { logError } from '@/lib/debug-logger'

async function getCachedCourts(clubId: string) {
       return prisma.court.findMany({
              where: { clubId, isActive: true },
              orderBy: { sortOrder: 'asc' }
       })
}

// Direct fetch for settings to ensure immediate updates on schedule changes
async function getCachedClubSettings(clubId: string) {
       return prisma.club.findUnique({
              where: { id: clubId },
              select: { openTime: true, closeTime: true, slotDuration: true, timezone: true, allowCredit: true }
       })
}


export async function getDashboardAlerts() {
       try {
              const clubId = await getCurrentClubId()

              const lowStockProducts = await prisma.product.findMany({
                     where: { clubId, stock: { lte: 5 }, isActive: true },
                     take: 5,
                     select: { name: true, stock: true }
              })

              const todayStart = startOfDay(nowInArg())

              // OPTIMIZATION: Limit pending payments check to last 6 months to avoid full table scan on old data
              // Old debts should be handled in a dedicated "Debts" report
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

              return JSON.parse(JSON.stringify({ lowStock: lowStockProducts, pendingPayments }))
       } catch (error: any) {
              if (error.digest?.startsWith('NEXT_REDIRECT')) throw error;
              console.error("[CRITICAL] getDashboardAlerts failed:", error)
              logError('getDashboardAlerts', error)
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

              let bookings: any[] = []
              let courts: any[] = []
              let club: any = null

              try {
                     const [b, c, s] = await Promise.all([
                            prisma.booking.findMany({
                                   where: { clubId, startTime: { gte: start, lte: end }, status: { not: 'CANCELED' } },
                                   select: {
                                          id: true,
                                          clubId: true,
                                          courtId: true,
                                          startTime: true,
                                          endTime: true,
                                          price: true,
                                          status: true,
                                          paymentStatus: true,
                                          guestName: true,
                                          guestPhone: true,
                                          clientId: true,
                                          client: {
                                                 select: {
                                                        id: true,
                                                        name: true,
                                                        phone: true
                                                 }
                                          },
                                          items: {
                                                 select: {
                                                        id: true,
                                                        quantity: true,
                                                        unitPrice: true,
                                                        product: {
                                                               select: {
                                                                      name: true
                                                               }
                                                        }
                                                 }
                                          },
                                          transactions: {
                                                 select: {
                                                        id: true,
                                                        amount: true
                                                 }
                                          }
                                   },
                                   orderBy: { startTime: 'asc' }
                            }),
                            getCachedCourts(clubId),
                            getCachedClubSettings(clubId)
                     ])
                     bookings = b
                     courts = c
                     club = s
              } catch (e: any) {
                     if (e.digest?.startsWith('NEXT_REDIRECT')) throw e;
                     console.error("[CRITICAL] getTurneroData Prisma Error:", e)
                     logError('getTurneroData.prisma', e)
                     return {
                            bookings: [],
                            courts: [],
                            config: { openTime: '14:00', closeTime: '00:30', slotDuration: 90 },
                            clubId,
                            success: false,
                            error: "Database Fetch Error: " + (e.message || "Unknown")
                     }
              }


              // Ensuring defaults if club config is missing, but NOT overwriting valid data
              const config = club || { openTime: '08:00', closeTime: '23:00', slotDuration: 90 }

              return JSON.parse(JSON.stringify({
                     bookings,
                     courts,
                     config,
                     clubId,
                     success: true
              }))
       } catch (error: any) {
              if (error.digest?.startsWith('NEXT_REDIRECT')) throw error;
              console.error("[CRITICAL] getTurneroData Fatal Error:", error)
              logError('getTurneroData.fatal', error)

              return {
                     bookings: [],
                     courts: [],
                     config: { openTime: '14:00', closeTime: '00:30', slotDuration: 90 },
                     clubId: 'ERR',
                     success: false,
                     error: error.message || "Fatal Error"
              }
       }
}

// Added back original names for compatibility
export async function getBookingsForDate(dateStr: string) {
       return await getTurneroData(dateStr)
}
export async function getCourts() {
       try {
              const clubId = await getCurrentClubId()
              const data = await getCachedCourts(clubId)
              return JSON.parse(JSON.stringify(data))
       } catch (error: any) {
              if (error.digest?.startsWith('NEXT_REDIRECT')) throw error;
              console.error("[CRITICAL] getCourts failed:", error)
              return []
       }
}
export async function getClubSettings() {
       try {
              const clubId = await getCurrentClubId()
              const data = await getCachedClubSettings(clubId)
              return JSON.parse(JSON.stringify(data))
       } catch (error: any) {
              if (error.digest?.startsWith('NEXT_REDIRECT')) throw error;
              console.error("[CRITICAL] getClubSettings failed:", error)
              return null
       }
}

export async function getRevenueHeatmapData() {
       try {
              const clubId = await getCurrentClubId()

              // 1. Define range: Last 90 days to catch recent trends
              const end = new Date()
              const start = subDays(end, 90)

              // 2. Fetch all non-cancelled bookings with price
              const bookings = await prisma.booking.findMany({
                     where: {
                            clubId,
                            startTime: { gte: start, lte: end },
                            status: { not: 'CANCELED' }
                     },
                     select: {
                            startTime: true,
                            price: true
                     }
              })

              // 3. Aggregate in Memory
              const heatmap = new Map<string, { count: number, revenue: number }>()

              const clubSettings = await getCachedClubSettings(clubId)
              const timeZone = clubSettings?.timezone || 'America/Argentina/Buenos_Aires'

              bookings.forEach(b => {
                     // Robust Timezone conversion using date-fns-tz
                     const localDate = toZonedTime(b.startTime, timeZone)

                     const day = localDate.getUTCDay() // 0 = Sunday
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
                     for (let h = 8; h < 24; h++) { // Filter reasonable hours
                            const key = `${d}-${h}`
                            const data = heatmap.get(key) || { count: 0, revenue: 0 }
                            result.push({
                                   day: d,
                                   hour: h,
                                   value: data.count,
                                   revenue: data.revenue
                            })
                     }
              }

              return { success: true, data: result }

       } catch (error: any) {
              if (error.digest?.startsWith('NEXT_REDIRECT')) throw error;
              console.error("[CRITICAL] getRevenueHeatmapData failed:", error)
              logError('getRevenueHeatmapData', error)
              return { success: false, data: [] }
       }
}
