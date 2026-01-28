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

const getCachedCourts = unstable_cache(
       async (clubId: string) => prisma.court.findMany({
              where: { clubId, isActive: true },
              orderBy: { sortOrder: 'asc' }
       }),
       ['courts-by-club'],
       { revalidate: 3600, tags: ['courts'] }
)

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

              // --- CACHING STRATEGY: REMOVED FOR REAL-TIME ACCURACY ---
              // Since we implemented Pusher for instant updates, utilizing a 60s cache
              // would serve stale data immediately after a "Refetch" trigger.
              // Database queries for a single day range are indexed and fast enough.

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
              } catch (e) {
                     console.error("Partial fetch error, trying cleanup...", e)
                     // Fallback mechanism (simplified for brevity, kept from original)
                     return {
                            bookings: [],
                            courts: [],
                            config: { openTime: '14:00', closeTime: '00:30', slotDuration: 90 },
                            clubId: 'ERR',
                            success: false,
                            error: "Database Fetch Error"
                     }
              }


              // Ensuring defaults if club config is missing, but NOT overwriting valid data
              const config = club || { openTime: '08:00', closeTime: '23:00', slotDuration: 90 }

              const response = {
                     bookings: JSON.parse(JSON.stringify(bookings)),
                     courts,
                     config,
                     clubId,
                     success: true
              }

              return response
       } catch (error: any) {
              if (error.digest?.startsWith('NEXT_REDIRECT')) throw error;

              console.error("[TurneroAction] Fatal Error:", error)
              return {
                     bookings: [],
                     courts: [],
                     config: { openTime: '14:00', closeTime: '00:30', slotDuration: 90 },
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
       return getCachedCourts(clubId)
}
export async function getClubSettings() {
       const clubId = await getCurrentClubId()
       return getCachedClubSettings(clubId)
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

       } catch (error) {
              console.error("Heatmap Error:", error)
              return { success: false, data: [] }
       }
}
