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

       } catch (error) {
              console.error("Error fetching financial stats:", error)
              return { success: false, error: 'Error al cargar finanzas' }
       }
}
