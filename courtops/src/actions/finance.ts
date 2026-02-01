'use server'

import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'
import { logError } from '@/lib/debug-logger'

export async function getDailyFinancials(dateStr: string) {
       try {
              const clubId = await getCurrentClubId()
              const date = new Date(dateStr)

              // Day Range
              const startOfDay = new Date(date)
              startOfDay.setHours(0, 0, 0, 0)

              const endOfDay = new Date(date)
              endOfDay.setHours(23, 59, 59, 999)

              // 1. Fetch Transactions (Real Money)
              const rawTransactions = await prisma.transaction.findMany({
                     where: {
                            cashRegister: { clubId }, // Ensure club
                            createdAt: {
                                   gte: startOfDay,
                                   lte: endOfDay
                            }
                     }
              })

              let income = {
                     total: 0,
                     cash: 0,
                     digital: 0 // MP, Transfer, Card
              }

              let expenses = 0

              for (const tx of rawTransactions) {
                     if (tx.type === 'INCOME') {
                            income.total += tx.amount
                            if (tx.method === 'CASH') {
                                   income.cash += tx.amount
                            } else {
                                   income.digital += tx.amount
                            }
                     } else if (tx.type === 'EXPENSE') {
                            expenses += tx.amount
                     }
              }

              // 2. Fetch Bookings (Pending Money)
              const bookings = await prisma.booking.findMany({
                     where: {
                            clubId,
                            status: { not: 'CANCELED' },
                            startTime: {
                                   gte: startOfDay,
                                   lte: endOfDay
                            }
                     },
                     include: {
                            items: true,
                            transactions: true
                     }
              })

              let pending = 0
              let expectedTotal = 0

              for (const b of bookings) {
                     const itemsTotal = b.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
                     const total = b.price + itemsTotal
                     const paid = b.transactions.reduce((sum, t) => sum + t.amount, 0)

                     expectedTotal += total
                     const p = total - paid
                     if (p > 0) pending += p
              }

              return JSON.parse(JSON.stringify({
                     success: true,
                     stats: {
                            income, // { total, cash, digital }
                            expenses,
                            pending,
                            expectedTotal
                     }
              }))

       } catch (error: any) {
              if (error.digest?.startsWith('NEXT_REDIRECT')) throw error;
              logError('getDailyFinancials', error)
              console.error("Error fetching financial stats:", error)
              return { success: false, error: 'Error al cargar finanzas', stats: null }
       }
}

export async function getWeeklyRevenue() {
       try {
              const clubId = await getCurrentClubId()

              const end = new Date()
              const start = new Date()
              start.setDate(end.getDate() - 6) // Last 7 days including today
              start.setHours(0, 0, 0, 0)

              const transactions = await prisma.transaction.findMany({
                     where: {
                            cashRegister: { clubId },
                            type: 'INCOME',
                            createdAt: {
                                   gte: start,
                                   lte: end
                            }
                     },
                     select: {
                            amount: true,
                            createdAt: true
                     }
              })

              const result = []
              for (let d = 0; d < 7; d++) {
                     const date = new Date(start)
                     date.setDate(date.getDate() + d)

                     // Filter txs for this day
                     const dayStart = new Date(date)
                     dayStart.setHours(0, 0, 0, 0)
                     const dayEnd = new Date(date)
                     dayEnd.setHours(23, 59, 59, 999)

                     const dayTotal = transactions
                            .filter(t => t.createdAt >= dayStart && t.createdAt <= dayEnd)
                            .reduce((sum, t) => sum + t.amount, 0)

                     result.push({
                            date: date.toLocaleDateString('es-AR', { weekday: 'short' }).toUpperCase(), // "LUN"
                            fullDate: date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }), // "25 Ene"
                            amount: dayTotal
                     })
              }

              return { success: true, data: result }

       } catch (error: any) {
              if (error.digest?.startsWith('NEXT_REDIRECT')) throw error;
              logError('getWeeklyRevenue', error)
              console.error("Weekly Revenue Error:", error)
              return { success: false, data: [] }
       }
}
