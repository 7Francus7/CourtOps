'use server'

import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'
import { subDays, addDays, startOfDay, endOfDay } from 'date-fns'
import { TurneroResponse } from '@/types/booking'
import { nowInArg } from '@/lib/date-utils'
import { toZonedTime } from 'date-fns-tz'

function safeSerialize<T>(data: T): T {
       return JSON.parse(JSON.stringify(data))
}

export async function getTurneroData(dateStr: string): Promise<TurneroResponse> {
       try {
              const clubId = await getCurrentClubId()
              const targetDate = new Date(dateStr)
              const start = subDays(startOfDay(targetDate), 1)
              const end = addDays(endOfDay(targetDate), 1)

              // 1. Fetch Courts & Config (Prioridad alta para pintar el grid)
              const [courts, club] = await Promise.all([
                     prisma.court.findMany({
                            where: { clubId, isActive: true },
                            orderBy: { sortOrder: 'asc' }
                     }).catch(() => []),
                     prisma.club.findUnique({
                            where: { id: clubId },
                            select: { openTime: true, closeTime: true, slotDuration: true, timezone: true }
                     }).catch(() => null)
              ])

              // 2. Fetch Bookings (Opcional, si falla devolvemos lista vacía pero NO rompemos el grid)
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
                     console.error("Non-fatal: Error fetching bookings in turnero", e)
              }

              const config = club || { openTime: '08:00', closeTime: '23:00', slotDuration: 90 }

              return safeSerialize({
                     bookings,
                     courts,
                     config: {
                            openTime: config.openTime || '09:00',
                            closeTime: config.closeTime || '00:00',
                            slotDuration: config.slotDuration || 60
                     },
                     clubId,
                     success: true
              })

       } catch (error: any) {
              if (error.digest?.startsWith('NEXT_REDIRECT')) throw error;
              return {
                     bookings: [],
                     courts: [],
                     config: { openTime: '09:00', closeTime: '00:00', slotDuration: 60 },
                     clubId: 'ERR',
                     success: false,
                     error: error.message
              }
       }
}

// RESTO DE FUNCIONES (Alerts, Heatmap) CON EL MISMO BLINDAJE
export async function getDashboardAlerts() {
       try {
              const clubId = await getCurrentClubId()
              const [lowStock, pendingPayments] = await Promise.all([
                     prisma.product.findMany({ where: { clubId, stock: { lte: 5 }, isActive: true }, take: 5 }),
                     prisma.booking.findMany({
                            where: { clubId, status: 'CONFIRMED', paymentStatus: 'UNPAID' },
                            include: { client: true },
                            take: 10
                     })
              ]).catch(() => [[], []])
              return safeSerialize({ lowStock, pendingPayments })
       } catch { return { lowStock: [], pendingPayments: [] } }
}

export async function getCourts() {
       const clubId = await getCurrentClubId().catch(() => null)
       if (!clubId) return []
       const data = await prisma.court.findMany({ where: { clubId, isActive: true }, orderBy: { sortOrder: 'asc' } }).catch(() => [])
       return safeSerialize(data)
}

export async function getClubSettings() {
       const clubId = await getCurrentClubId().catch(() => null)
       if (!clubId) return null
       const data = await prisma.club.findUnique({ where: { id: clubId } }).catch(() => null)
       return safeSerialize(data)
}

export async function getBookingsForDate(dateStr: string) { return await getTurneroData(dateStr) }
