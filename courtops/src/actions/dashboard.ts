'use server'

import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'
import { subDays, addDays, startOfDay, endOfDay } from 'date-fns'
import { TurneroResponse } from '@/types/booking'
import { nowInArg } from '@/lib/date-utils'
import { getCache, setCache } from '@/lib/cache'
import { format } from 'date-fns'

export async function getDashboardAlerts() {
       try {
              const clubId = await getCurrentClubId()
              const lowStockProducts = await prisma.product.findMany({
                     where: { clubId, stock: { lte: 5 }, isActive: true },
                     take: 5,
                     select: { name: true, stock: true }
              })

              const todayStart = startOfDay(nowInArg())
              const futureEnd = addDays(todayStart, 7)

              // General Debts: All confirmed bookings that are unpaid or partial, regardless of date (or limiting to reasonable range like last year + future)
              // Actually, "General Debts" usually prioritizes past due. 
              const pendingPayments = await prisma.booking.findMany({
                     where: {
                            clubId,
                            status: 'CONFIRMED',
                            paymentStatus: { in: ['UNPAID', 'PARTIAL'] }
                     },
                     include: { client: { select: { name: true } } },
                     orderBy: { startTime: 'asc' }, // Oldest first? or Closest? Usually Oldest debt is more urgent.
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

              // --- CACHING STRATEGY ---
              // Key format: turnero:clubId:yyyy-MM-dd
              const dateKey = format(targetDate, 'yyyy-MM-dd')
              const cacheKey = `turnero:${clubId}:${dateKey}`

              // 1. Try Cache
              const cachedData = await getCache<TurneroResponse>(cacheKey)
              if (cachedData) {
                     // Ensure dates are converted back to strings/objects if needed, though they are usually strings in JSON
                     // We return directly
                     console.log(`[Cache] Hit for ${cacheKey}`)
                     return cachedData
              }

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
                            prisma.court.findMany({ where: { clubId, isActive: true }, orderBy: { sortOrder: 'asc' } }),
                            prisma.club.findUnique({ where: { id: clubId }, select: { openTime: true, closeTime: true, slotDuration: true } })
                     ])
                     bookings = b
                     courts = c
                     club = s
              } catch (e) {
                     console.error("Partial fetch error, trying cleanup...", e)
                     // Fallback: try minimal fetch
                     const [c, s] = await Promise.all([
                            prisma.court.findMany({ where: { clubId, isActive: true }, orderBy: { sortOrder: 'asc' } }),
                            prisma.club.findUnique({ where: { id: clubId }, select: { openTime: true, closeTime: true, slotDuration: true } })
                     ])
                     courts = c
                     club = s

                     try {
                            bookings = await prisma.booking.findMany({
                                   where: { clubId, startTime: { gte: start, lte: end }, status: { not: 'CANCELED' } },
                                   select: {
                                          id: true,
                                          courtId: true,
                                          startTime: true,
                                          endTime: true,
                                          price: true,
                                          status: true,
                                          guestName: true,
                                          client: { select: { name: true } }
                                   },
                                   orderBy: { startTime: 'asc' }
                            })
                     } catch (e2) {
                            console.error("Even simple bookings failed", e2)
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
              // 2. Set Cache
              // TTL: 60 seconds (short cache to allow near real-time updates but protect from bursts)
              // Ideally validation happens on booking update
              await setCache(cacheKey, response, 60)

              return response
       } catch (error: any) {
              // Si es un error de Next.js (como redirect), lo relanzamos
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
       return prisma.court.findMany({ where: { clubId, isActive: true }, orderBy: { sortOrder: 'asc' } })
}
export async function getClubSettings() {
       const clubId = await getCurrentClubId()
       return prisma.club.findUnique({ where: { id: clubId }, select: { openTime: true, closeTime: true, slotDuration: true } })
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

              // 3. Aggregate in Memory (Day of Week 0-6 x Hour 0-23)
              // Data structure: user needs array of { day: number, hour: number, value: number }
              const heatmap = new Map<string, { count: number, revenue: number }>()

              bookings.forEach(b => {
                     // Adjust to local time? Prisma returns UTC. 
                     // Ideally we use the club's timezone. 
                     // For MVP, we'll assume UTC-3 (Argentina) or rely on the date object's method if server is local.
                     // A robust fix: use 'date-fns-tz' but for now let's simple offset.
                     // Assuming startTime is stored as Date object (UTC in DB).

                     // We manually adjust -3 hours for AR
                     const localDate = new Date(b.startTime.getTime() - (3 * 60 * 60 * 1000))

                     const day = localDate.getDay() // 0 = Sunday
                     const hour = localDate.getHours()

                     const key = `${day}-${hour}`
                     const current = heatmap.get(key) || { count: 0, revenue: 0 }
                     heatmap.set(key, {
                            count: current.count + 1,
                            revenue: current.revenue + b.price
                     })
              })

              const result = []
              for (let d = 0; d < 7; d++) {
                     for (let h = 8; h < 24; h++) { // Filter reasonable hours 8am to midnight
                            const key = `${d}-${h}`
                            const data = heatmap.get(key) || { count: 0, revenue: 0 }
                            // Normalize "intensity" based on revenue or count. Let's use Count for occupancy heatmap.
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
