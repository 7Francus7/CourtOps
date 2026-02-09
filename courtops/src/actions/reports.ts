'use server'

import prisma from '@/lib/db'
import { subDays, differenceInDays, differenceInHours, format } from 'date-fns'
import { getCurrentClubId } from '@/lib/tenant'
import { fromUTC } from '@/lib/date-utils'

export async function getFinancialStats(start: Date, end: Date) {
       const clubId = await getCurrentClubId()

       const transactions = await prisma.transaction.findMany({
              where: {
                     cashRegister: {
                            clubId
                     },
                     createdAt: {
                            gte: start,
                            lte: end
                     }
              }
       })

       const income = transactions
              .filter(t => t.type === 'INCOME')
              .reduce((sum, t) => sum + t.amount, 0)

       const expenses = transactions
              .filter(t => t.type === 'EXPENSE')
              .reduce((sum, t) => sum + t.amount, 0)

       const balance = income - expenses

       const byCategory = transactions.reduce((acc, t) => {
              acc[t.category] = (acc[t.category] || 0) + t.amount
              return acc
       }, {} as Record<string, number>)

       return { income, expenses, balance, byCategory }
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
              },
              take: 100
       })
}

export async function getOccupancyStats() {
       const clubId = await getCurrentClubId()
       const club = await prisma.club.findUnique({ where: { id: clubId }, select: { openTime: true, closeTime: true } })
       if (!club) return []

       const openHour = parseInt(club.openTime.split(':')[0])
       const closeHour = parseInt(club.closeTime.split(':')[0])
       const endDate = new Date()
       const startDate = subDays(endDate, 30)

       const bookings = await prisma.booking.findMany({
              where: {
                     clubId,
                     startTime: { gte: startDate, lte: endDate },
                     status: { not: 'CANCELED' }
              }
       })

       const hoursCount = new Array(24).fill(0)
       const totalBookings = bookings.length
       bookings.forEach(booking => {
              // Convert UTC to Argentina local time before extracting hour
              const localTime = fromUTC(booking.startTime)
              const hour = localTime.getUTCHours()
              hoursCount[hour]++
       })

       return hoursCount.map((count, hour) => ({
              hour: `${hour}:00`,
              count,
              percentage: totalBookings > 0 ? Math.round((count / totalBookings) * 100) : 0
       })).filter((_, hour) => {
              if (closeHour < openHour) return hour >= openHour || hour <= closeHour
              return hour >= openHour && hour <= closeHour
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

       const courtMap = new Map<string, number>()
       const courts = await prisma.court.findMany({ where: { clubId } })
       courts.forEach(c => courtMap.set(c.name, 0))

       bookings.forEach(b => {
              const current = courtMap.get(b.court.name) || 0
              courtMap.set(b.court.name, current + 1)
       })

       return Array.from(courtMap.entries()).map(([name, value]) => ({ name, value }))
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

              const bookings = await prisma.booking.count({
                     where: { clubId, startTime: { gte: s, lte: e }, status: { not: 'CANCELED' } }
              })

              const courtsCount = await prisma.court.count({ where: { clubId } })
              const club = await prisma.club.findUnique({ where: { id: clubId }, select: { openTime: true, closeTime: true } })
              let capacity = 1
              if (club && courtsCount > 0) {
                     const startH = parseInt(club.openTime.split(':')[0])
                     const endH = parseInt(club.closeTime.split(':')[0])
                     let hoursPerDay = endH - startH
                     if (hoursPerDay < 0) hoursPerDay += 24

                     const days = differenceInDays(e, s) + 1
                     capacity = courtsCount * (hoursPerDay || 1) * (days || 1)
              }
              const occupancyRate = capacity > 0 ? (bookings / capacity) * 100 : 0

              return { income, avgTicket, newClients, occupancyRate }
       }

       const current = await fetchData(start, end)
       const previous = await fetchData(prevStart, prevEnd)

       return {
              income: { value: current.income, change: calculateChange(current.income, previous.income) },
              occupancy: { value: Math.round(current.occupancyRate), change: calculateChange(current.occupancyRate, previous.occupancyRate) },
              ticket: { value: current.avgTicket, change: calculateChange(current.avgTicket, previous.avgTicket) },
              newClients: { value: current.newClients, change: calculateChange(current.newClients, previous.newClients) }
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

       txs.forEach(t => {
              const day = format(t.createdAt, 'dd/MM')
              dailyMap.set(day, (dailyMap.get(day) || 0) + t.amount)
       })

       return Array.from(dailyMap.entries()).map(([name, value]) => ({ name, value }))
}
