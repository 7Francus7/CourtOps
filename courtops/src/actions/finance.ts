'use server'

import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'
// Using JSON.parse(JSON.stringify(...)) for safe serialization

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function getDailyFinancials(dateStr: string) {
       try {
              const session = await getServerSession(authOptions)
              if (!session?.user?.clubId) return null
              const clubId = session.user.clubId
              const date = new Date(dateStr)
              const start = new Date(date)
              start.setHours(0, 0, 0, 0)
              const end = new Date(date)
              end.setHours(23, 59, 59, 999)

              // Transactions via CashRegister
              const rawTransactions = await prisma.transaction.findMany({
                     where: {
                            cashRegister: { clubId },
                            createdAt: { gte: start, lte: end }
                     }
              }).catch(() => [])

              let income = { total: 0, cash: 0, digital: 0 }
              let expenses = 0

              rawTransactions.forEach(tx => {
                     if (tx.type === 'INCOME') {
                            income.total += tx.amount
                            if (tx.method === 'CASH') income.cash += tx.amount
                            else income.digital += tx.amount
                     } else {
                            expenses += tx.amount
                     }
              })

              // Bookings
              const bookings = await prisma.booking.findMany({
                     where: { clubId, status: { not: 'CANCELED' }, startTime: { gte: start, lte: end } },
                     include: { items: true, transactions: true }
              }).catch(() => [])

              let pending = 0
              let expectedTotal = 0

              bookings.forEach(b => {
                     const total = b.price + (b.items?.reduce((s, i) => s + (i.unitPrice * i.quantity), 0) || 0)
                     const paid = b.transactions?.reduce((s, t) => s + t.amount, 0) || 0
                     expectedTotal += total
                     if (total > paid) pending += (total - paid)
              })

              return JSON.parse(JSON.stringify({
                     success: true,
                     stats: { income, expenses, pending, expectedTotal }
              }))

       } catch (error: any) {
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
                     where: { cashRegister: { clubId }, type: 'INCOME', createdAt: { gte: start, lte: end } },
                     select: { amount: true, createdAt: true }
              }).catch(() => [])

              const result: any[] = []
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
