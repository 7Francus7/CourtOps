'use server'

import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'

function safeSerialize<T>(data: T): T {
       return JSON.parse(JSON.stringify(data))
}

export async function getDailyFinancials(dateStr: string) {
       try {
              const clubId = await getCurrentClubId()
              const date = new Date(dateStr)
              const start = new Date(date); start.setHours(0, 0, 0, 0)
              const end = new Date(date); end.setHours(23, 59, 59, 999)

              // 1. Transactions - Linked via CashRegister
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

              // 2. Bookings - Fallback simple
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

              return safeSerialize({
                     success: true,
                     stats: { income, expenses, pending, expectedTotal }
              })

       } catch (error: any) {
              if (error.digest?.startsWith('NEXT_REDIRECT')) throw error;
              return { success: false, error: 'Error', stats: null }
       }
}

export async function getWeeklyRevenue() {
       try {
              const clubId = await getCurrentClubId()
              const end = new Date()
              const start = subDays(end, 6)

              const transactions = await prisma.transaction.findMany({
                     where: { cashRegister: { clubId }, type: 'INCOME', createdAt: { gte: start, lte: end } },
                     select: { amount: true, createdAt: true }
              }).catch(() => [])

              // Simple aggregation logic for UI components
              const result: any[] = []
              for (let i = 0; i < 7; i++) {
                     const date = addDays(start, i)
                     const sum = transactions
                            .filter(t => isSameDay(t.createdAt, date))
                            .reduce((acc, t) => acc + t.amount, 0)

                     result.push({
                            date: date.toLocaleDateString('es-AR', { weekday: 'short' }).toUpperCase(),
                            fullDate: date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }),
                            amount: sum
                     })
              }

              return safeSerialize({ success: true, data: result })
       } catch { return { success: false, data: [] } }
}

function subDays(date: Date, days: number) {
       const result = new Date(date);
       result.setDate(result.getDate() - days);
       return result;
}

function addDays(date: Date, days: number) {
       const result = new Date(date);
       result.setDate(result.getDate() + days);
       return result;
}

function isSameDay(d1: Date, d2: Date) {
       return d1.getFullYear() === d2.getFullYear() &&
              d1.getMonth() === d2.getMonth() &&
              d1.getDate() === d2.getDate();
}
