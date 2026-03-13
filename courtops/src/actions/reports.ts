'use server'

import prisma from '@/lib/db'
import {
       subDays,
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
              const duration = differenceInMinutes(b.endTime, b.startTime) / 60
              const current = courtMap.get(b.court.name) || 0
              courtMap.set(b.court.name, current + duration)
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
                     const key = format(t.createdAt, 'MMM')
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
                     const key = format(t.createdAt, 'dd/MM')
                     if (dailyMap.has(key)) {
                            dailyMap.set(key, (dailyMap.get(key) || 0) + t.amount)
                     }
              })
       }

       return Array.from(dailyMap.entries()).map(([name, value]) => ({ name, value }))
}
