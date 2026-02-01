'use server'

import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'

export async function getDailyFinancials(date: Date | string) {
       try {
              const clubId = await getCurrentClubId()
              const validDate = typeof date === 'string' ? new Date(date) : date

              // Day Range
              const startOfDay = new Date(validDate)
              startOfDay.setHours(0, 0, 0, 0)

              const endOfDay = new Date(validDate)
              endOfDay.setHours(23, 59, 59, 999)

              // 1. Fetch Transactions (Real Money)
              // We assume we want *all* transactions recorded on this day, 
              // regardless of whether the booking is for today or another day.
              // Cash flow view.
              const transactions = await prisma.transaction.findMany({
                     where: {
                            cashRegister: {
                                   clubId: clubId,
                                   date: {
                                          gte: startOfDay,
                                          lte: endOfDay
                                   }
                            }
                            // If cashRegister is not used strictly per day, we might check createdAt
                            // But usually transactions are linked to a cashRegister session.
                            // Let's fallback to createdAt if cashRegister link is complex or if we just want raw flow
                     }
              })

              // If transactions are empty via CashRegister, try raw createdAt (safer for now until CR is fully implemented)
              // Actually, looking at schema, Transaction has createdAt. Let's use that for simpler "Dashboard View".
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
              // We want bookings *occurring* today to see what we are missing.
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

              return {
                     success: true,
                     stats: {
                            income, // { total, cash, digital }
                            expenses,
                            pending,
                            expectedTotal
                     }
              }

       } catch (error: any) {
              console.error("Error fetching financial stats [FORCE_REBUILD]:", error)
              return { success: false, error: 'Error al cargar finanzas: ' + (error.message || 'Error desconocido'), stats: null }
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

              // Initialize map for last 7 days
              const dailyMap = new Map<string, number>()
              for (let d = 0; d < 7; d++) {
                     const date = new Date(start)
                     date.setDate(date.getDate() + d)
                     const key = date.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' }) // "Lun 25"
                     dailyMap.set(key, 0)
              }

              // Fill with data
              transactions.forEach(tx => {
                     // Adjust to ARG time conceptually if needed, or just take local date string from server time
                     // Assuming server time is reasonably aligned or we rely on consistent offset.
                     // For simple charts, local date string of the specific ISO timestamp works ok usually.
                     const dateKey = tx.createdAt.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' })

                     // We might need to normalize the date key if standard locale vary. 
                     // Better strategy: Use formatted YYYY-MM-DD keys then format for display.
                     // Re-doing loop safely:
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

       } catch (error) {
              console.error("Weekly Revenue Error:", error)
              return { success: false, data: [] }
       }
}
