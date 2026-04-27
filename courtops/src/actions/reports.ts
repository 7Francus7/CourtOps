'use server'

import prisma from '@/lib/db'
import {
       differenceInDays,
       format,
       eachDayOfInterval,
       eachMonthOfInterval,
       differenceInMinutes
} from 'date-fns'
import { getCurrentClubId } from '@/lib/tenant'
import { fromUTC } from '@/lib/date-utils'

export async function getFinancialStats(start: Date, end: Date) {
       const clubId = await getCurrentClubId()

       const stats = await prisma.transaction.groupBy({
              by: ['type'],
              where: {
                     cashRegister: { clubId },
                     createdAt: { gte: start, lte: end }
              },
              _sum: { amount: true }
       })

       const income = stats.find(s => s.type === 'INCOME')?._sum.amount || 0
       const expenses = stats.find(s => s.type === 'EXPENSE')?._sum.amount || 0
       const balance = income - expenses

       const catStats = await prisma.transaction.groupBy({
              by: ['category'],
              where: {
                     cashRegister: { clubId },
                     createdAt: { gte: start, lte: end }
              },
              _sum: { amount: true }
       })

       const byCategory = catStats.reduce((acc, s) => {
              acc[s.category] = s._sum.amount || 0
              return acc
       }, {} as Record<string, number>)

       // Income-only categories for pie chart (excludes expenses)
       const incomeCatStats = await prisma.transaction.groupBy({
              by: ['category'],
              where: {
                     cashRegister: { clubId },
                     type: 'INCOME',
                     createdAt: { gte: start, lte: end }
              },
              _sum: { amount: true }
       })

       const byCategoryIncome = incomeCatStats.reduce((acc, s) => {
              acc[s.category] = s._sum.amount || 0
              return acc
       }, {} as Record<string, number>)

       return { income, expenses, balance, byCategory, byCategoryIncome }
}

export async function getReportTransactions(start: Date, end: Date) {
       const clubId = await getCurrentClubId()

       return await prisma.transaction.findMany({
              where: {
                     cashRegister: {
                            clubId
                     },
                     createdAt: {
                            gte: start,
                            lte: end
                     }
              },
              orderBy: {
                     createdAt: 'desc'
              }
       })
}


export async function getOccupancyByCourt(start: Date, end: Date) {
       const clubId = await getCurrentClubId()

       const bookings = await prisma.booking.findMany({
              where: {
                     clubId,
                     startTime: { gte: start, lte: end },
                     status: { not: 'CANCELED' }
              },
              include: { court: true }
       })

       const club = await prisma.club.findUnique({ where: { id: clubId }, select: { openTime: true, closeTime: true } })
       const courts = await prisma.court.findMany({ where: { clubId } })

       let hoursPerDay = 10
       if (club) {
              const startH = parseInt(club.openTime.split(':')[0])
              const endH = parseInt(club.closeTime.split(':')[0])
              hoursPerDay = endH - startH
              if (hoursPerDay <= 0) hoursPerDay += 24
       }

       const days = Math.max(1, differenceInDays(end, start) + 1)
       const capacityPerCourt = hoursPerDay * days

       const courtMap = new Map<string, number>()
       courts.forEach(c => courtMap.set(c.name, 0))

       bookings.forEach(b => {
              const duration = differenceInMinutes(b.endTime, b.startTime) / 60
              const current = courtMap.get(b.court.name) || 0
              courtMap.set(b.court.name, current + duration)
       })

       return Array.from(courtMap.entries()).map(([name, hours]) => ({
              name,
              value: capacityPerCourt > 0 ? Math.round((hours / capacityPerCourt) * 100) : 0
       }))
}

export async function getDashboardKPIs(start: Date, end: Date, prevStart: Date, prevEnd: Date) {
       const clubId = await getCurrentClubId()

       const fetchData = async (s: Date, e: Date) => {
              const txs = await prisma.transaction.findMany({
                     where: { cashRegister: { clubId }, createdAt: { gte: s, lte: e } }
              })
              const income = txs.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0)
              const count = txs.filter(t => t.type === 'INCOME').length
              const avgTicket = count > 0 ? income / count : 0

              const newClients = await prisma.client.count({
                     where: { clubId, createdAt: { gte: s, lte: e } }
              })

              const bookings = await prisma.booking.findMany({
                     where: { clubId, startTime: { gte: s, lte: e }, status: { not: 'CANCELED' } },
                     select: { startTime: true, endTime: true }
              })

              const totalHoursBooked = bookings.reduce((sum, b) => {
                     const duration = differenceInMinutes(b.endTime, b.startTime) / 60
                     return sum + duration
              }, 0)

              const courtsCount = await prisma.court.count({ where: { clubId } })
              const club = await prisma.club.findUnique({ where: { id: clubId }, select: { openTime: true, closeTime: true } })

              let capacityHours = 0
              if (club && courtsCount > 0) {
                     const startH = parseInt(club.openTime.split(':')[0])
                     const endH = parseInt(club.closeTime.split(':')[0])
                     let hoursPerDay = endH - startH
                     if (hoursPerDay <= 0) hoursPerDay += 24

                     const days = Math.max(1, differenceInDays(e, s) + 1)
                     capacityHours = courtsCount * hoursPerDay * days
              }

              const occupancyRate = capacityHours > 0 ? (totalHoursBooked / capacityHours) * 100 : 0

              return { income, avgTicket, newClients, occupancyRate }
       }

       const current = await fetchData(start, end)
       const previous = await fetchData(prevStart, prevEnd)

       const hasPreviousData = previous.income > 0 || previous.newClients > 0 || previous.occupancyRate > 0 || previous.avgTicket > 0

       return {
              income: { value: current.income, change: calculateChange(current.income, previous.income), hasPreviousData },
              occupancy: { value: Math.round(current.occupancyRate), change: calculateChange(current.occupancyRate, previous.occupancyRate), hasPreviousData },
              ticket: { value: current.avgTicket, change: calculateChange(current.avgTicket, previous.avgTicket), hasPreviousData },
              newClients: { value: current.newClients, change: calculateChange(current.newClients, previous.newClients), hasPreviousData }
       }
}

function calculateChange(current: number, previous: number) {
       if (previous === 0) return current > 0 ? 100 : 0
       return ((current - previous) / previous) * 100
}

export async function getBestClient(start: Date, end: Date) {
       const clubId = await getCurrentClubId()

       const topClient = await prisma.booking.groupBy({
              by: ['clientId'],
              where: {
                     clubId,
                     startTime: { gte: start, lte: end },
                     status: { not: 'CANCELED' },
                     clientId: { not: null }
              },
              _count: {
                     id: true
              },
              orderBy: {
                     _count: {
                            id: 'desc'
                     }
              },
              take: 1
       })

       if (!topClient || topClient.length === 0 || !topClient[0].clientId) {
              return null
       }

       const clientId = topClient[0].clientId
       const bookingsCount = topClient[0]._count.id

       const client = await prisma.client.findUnique({
              where: { id: clientId }
       })

       return {
              name: client?.name || 'Desconocido',
              bookings: bookingsCount,
              initials: (client?.name || '??').substring(0, 2).toUpperCase()
       }
}

export async function getPaymentMethodStats(start: Date, end: Date) {
       const clubId = await getCurrentClubId()

       const stats = await prisma.transaction.groupBy({
              by: ['method'],
              where: {
                     cashRegister: { clubId },
                     type: 'INCOME',
                     createdAt: { gte: start, lte: end }
              },
              _sum: { amount: true }
       })

       const methodMap: Record<string, string> = {
              'CASH': 'Efectivo',
              'TRANSFER': 'Transferencia',
              'CREDIT': 'Crédito',
              'DEBIT': 'Débito',
              'MERCADOPAGO': 'Mercado Pago'
       }

       return stats.map(s => ({
              name: methodMap[s.method || 'CASH'] || s.method,
              value: s._sum.amount || 0
       }))
}

export async function getDailyRevenueStats(start: Date, end: Date) {
       const clubId = await getCurrentClubId()

       const txs = await prisma.transaction.findMany({
              where: {
                     cashRegister: { clubId },
                     type: 'INCOME',
                     createdAt: { gte: start, lte: end }
              },
              select: { createdAt: true, amount: true }
       })

       const dailyMap = new Map<string, number>()
       const diffInDays = differenceInDays(end, start)

       // If interval > 60 days, aggregate by month
       if (diffInDays > 60) {
              const months = eachMonthOfInterval({ start, end })
              months.forEach(m => {
                     const key = format(m, 'MMM')
                     dailyMap.set(key, 0)
              })

              txs.forEach(t => {
                     const key = format(fromUTC(t.createdAt), 'MMM')
                     if (dailyMap.has(key)) {
                            dailyMap.set(key, (dailyMap.get(key) || 0) + t.amount)
                     }
              })
       } else {
              // Aggregate by day
              const days = eachDayOfInterval({ start, end })
              days.forEach(d => {
                     const key = format(d, 'dd/MM')
                     dailyMap.set(key, 0)
              })

              txs.forEach(t => {
                     const key = format(fromUTC(t.createdAt), 'dd/MM')
                     if (dailyMap.has(key)) {
                            dailyMap.set(key, (dailyMap.get(key) || 0) + t.amount)
                     }
              })
       }

       return Array.from(dailyMap.entries()).map(([name, value]) => ({ name, value }))
}

export async function getMembershipRetentionStats() {
       const clubId = await getCurrentClubId()
       const now = new Date()
       const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

       const [total, active, expired, expiringCount, plans] = await Promise.all([
              prisma.membership.count({ where: { plan: { clubId } } }),
              prisma.membership.count({ where: { plan: { clubId }, status: 'ACTIVE', endDate: { gte: now } } }),
              prisma.membership.count({ where: { plan: { clubId }, status: 'ACTIVE', endDate: { lt: now } } }),
              prisma.membership.count({ where: { plan: { clubId }, status: 'ACTIVE', endDate: { gte: now, lte: thirtyDaysFromNow } } }),
              prisma.membershipPlan.findMany({
                     where: { clubId, isActive: true },
                     include: { _count: { select: { memberships: { where: { status: 'ACTIVE' } } } } },
                     orderBy: { price: 'asc' }
              })
       ])

       const cancelled = total - active - expired

       return {
              total,
              active,
              expired,
              cancelled,
              expiringCount,
              retentionRate: total > 0 ? Math.round((active / total) * 100) : 0,
              plans: plans.map(p => ({ name: p.name, price: p.price, activeCount: p._count.memberships }))
       }
}

export async function getClientActivityStats() {
       const clubId = await getCurrentClubId()

       const now = new Date()
       const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
       const d90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

       const [totalClients, newThisMonth, activeClients, riskClients, lostClients] = await Promise.all([
              prisma.client.count({ where: { clubId, deletedAt: null } }),
              prisma.client.count({ where: { clubId, deletedAt: null, createdAt: { gte: d30 } } }),
              prisma.client.count({
                     where: {
                            clubId, deletedAt: null,
                            bookings: { some: { startTime: { gte: d30 }, status: { not: 'CANCELED' } } }
                     }
              }),
              prisma.client.count({
                     where: {
                            clubId, deletedAt: null,
                            bookings: {
                                   some: { startTime: { gte: d90, lt: d30 }, status: { not: 'CANCELED' } },
                                   none: { startTime: { gte: d30 } }
                            }
                     }
              }),
              prisma.client.count({
                     where: {
                            clubId, deletedAt: null,
                            bookings: { none: { startTime: { gte: d90 } } }
                     }
              })
       ])

       return { totalClients, newThisMonth, activeClients, riskClients, lostClients }
}
