'use server'

import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'
// Using JSON.parse(JSON.stringify(...)) for safe serialization

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

import { fromZonedTime } from 'date-fns-tz'

export async function getDailyFinancials(dateStr: string) {
       try {
              const session = await getServerSession(authOptions)
              if (!session?.user?.clubId) return null
              const clubId = session.user.clubId


              // Ensure we extract simply the YYYY-MM-DD string
              const baseDateStr = dateStr.includes('T') ? dateStr.substring(0, 10) : dateStr;
              const [year, month, day] = baseDateStr.split('-').map(Number)

              // Build precise ARG time boundaries and let date-fns-tz convert them to UTC for Prisma
              const start = fromZonedTime(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} 00:00:00`, 'America/Argentina/Buenos_Aires')
              const end = fromZonedTime(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} 23:59:59`, 'America/Argentina/Buenos_Aires')

              // Optimized Financials using Direct clubId filter on Transaction
              const incomeAgg = await prisma.transaction.aggregate({
                     where: {
                            clubId,
                            type: 'INCOME',
                            createdAt: { gte: start, lte: end }
                     },
                     _sum: { amount: true }
              })

              const cashIncomeAgg = await prisma.transaction.aggregate({
                     where: {
                            clubId,
                            type: 'INCOME',
                            method: 'CASH',
                            createdAt: { gte: start, lte: end }
                     },
                     _sum: { amount: true }
              })

              const expensesAgg = await prisma.transaction.aggregate({
                     where: {
                            clubId,
                            type: 'EXPENSE',
                            createdAt: { gte: start, lte: end }
                     },
                     _sum: { amount: true }
              })

              const income = {
                     total: incomeAgg._sum.amount || 0,
                     cash: cashIncomeAgg._sum.amount || 0,
                     digital: (incomeAgg._sum.amount || 0) - (cashIncomeAgg._sum.amount || 0)
              }
              const expenses = expensesAgg._sum.amount || 0

              // Bookings
              const bookings = await prisma.booking.findMany({
                     where: { clubId, status: { not: 'CANCELED' }, startTime: { gte: start, lte: end } },
                     include: { items: true, transactions: true }
              }).catch(() => [])

              let pending = 0
              let expectedTotal = 0
              // Calculate active bookings (not canceled)
              const activeBookings = bookings.length

              bookings.forEach(b => {
                     const total = b.price + (b.items?.reduce((s, i) => s + (i.unitPrice * i.quantity), 0) || 0)
                     const paid = b.transactions?.reduce((s, t) => s + t.amount, 0) || 0
                     expectedTotal += total
                     if (total > paid) pending += (total - paid)
              })

              // New Clients Today
              const newClients = await prisma.client.count({
                     where: {
                            clubId,
                            createdAt: { gte: start, lte: end }
                     }
              })

              // Occupancy Calculation
              const totalCourts = await prisma.court.count({ where: { clubId } })
              // Hardcoded schedule from Turnero logic: 14:00 to 00:30 is 10.5 hours = 630 mins. 90 min slots.
              // 630 / 90 = 7 slots per court.
              const slotsPerCourt = 7
              const totalCapacity = totalCourts * slotsPerCourt
              const occupancy = totalCapacity > 0 ? Math.round((activeBookings / totalCapacity) * 100) : 0

              return JSON.parse(JSON.stringify({
                     success: true,
                     stats: {
                            income,
                            expenses,
                            pending,
                            expectedTotal,
                            activeBookings,
                            newClients,
                            occupancy
                     }
              }))

       } catch (error) {
              console.error('[FINANCE ERROR]', error)
              return { success: false, error: 'Server error', stats: null }
       }
}

export async function getWeeklyRevenue() {
       try {
              const clubId = await getCurrentClubId()
              const end = new Date()
              const start = new Date(end)
              start.setDate(start.getDate() - 6)

              const transactions = await prisma.transaction.findMany({
                     where: { clubId, type: 'INCOME', createdAt: { gte: start, lte: end } },
                     select: { amount: true, createdAt: true }
              }).catch(() => [])

              const result: { date: string, fullDate: string, amount: number }[] = []
              for (let i = 0; i < 7; i++) {
                     const date = new Date(start)
                     date.setDate(date.getDate() + i)

                     const sum = transactions
                            .filter(t => {
                                   const tDate = new Date(t.createdAt)
                                   return tDate.getFullYear() === date.getFullYear() &&
                                          tDate.getMonth() === date.getMonth() &&
                                          tDate.getDate() === date.getDate()
                            })
                            .reduce((acc, t) => acc + t.amount, 0)

                     result.push({
                            date: date.toLocaleDateString('es-AR', { weekday: 'short' }).toUpperCase(),
                            fullDate: date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }),
                            amount: sum
                     })
              }

              return JSON.parse(JSON.stringify({ success: true, data: result }))
       } catch (error) {
              console.error('[WEEKLY ERROR]', error)
              return { success: false, data: [] }
       }
}


