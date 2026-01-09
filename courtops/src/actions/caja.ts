'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentClubId, getOrCreateTodayCashRegister } from '@/lib/tenant'
import prisma from '@/lib/db'

// Helper to get or create today's register (Multi-tenant)
export async function getTodaysRegister() {
       const clubId = await getCurrentClubId()
       const register = await getOrCreateTodayCashRegister(clubId)

       // We need to fetch transactions which aren't included by getOrCreateTodayCashRegister
       const registerWithTransactions = await prisma.cashRegister.findUnique({
              where: { id: register.id },
              include: { transactions: true }
       })

       // Should always exist as we just retrieved/created it
       return registerWithTransactions!
}

export async function getCajaStats() {
       const register = await getTodaysRegister()

       const incomeCash = register.transactions
              .filter(t => t.type === 'INCOME' && t.method === 'CASH')
              .reduce((sum, t) => sum + t.amount, 0)

       const incomeTransfer = register.transactions
              .filter(t => t.type === 'INCOME' && (t.method === 'TRANSFER' || t.method === 'MERCADOPAGO' || t.method === 'DEBIT' || t.method === 'CREDIT'))
              .reduce((sum, t) => sum + t.amount, 0)

       // Detailed breakdown for closing
       const incomeMP = register.transactions
              .filter(t => t.type === 'INCOME' && t.method === 'MERCADOPAGO')
              .reduce((sum, t) => sum + t.amount, 0)

       const expenses = register.transactions
              .filter(t => t.type === 'EXPENSE')
              .reduce((sum, t) => sum + t.amount, 0)

       const balance = (incomeCash + incomeTransfer) - expenses

       return {
              id: register.id,
              status: register.status,
              incomeCash,
              incomeTransfer,
              incomeMP,
              expenses,
              total: balance,
              transactionCount: register.transactions.length,
              // For closing comparison
              expectedCash: incomeCash - expenses // Simplified: expenses usually paid in cash, but could be digital. For now assume expenses reduce cash on hand if not specified. Actually schema doesn't specify expense method. Let's assume cash expenses.
       }
}

export async function registerTransaction(data: {
       type: 'INCOME' | 'EXPENSE',
       category: string,
       amount: number,
       method: 'CASH' | 'TRANSFER' | 'MERCADOPAGO' | 'DEBIT' | 'CREDIT',
       description?: string,
       bookingId?: number // Optional link
}) {
       const register = await getTodaysRegister()

       const transaction = await prisma.transaction.create({
              data: {
                     cashRegisterId: register.id,
                     type: data.type,
                     category: data.category,
                     amount: data.amount,
                     method: data.method,
                     description: data.description || '',
                     bookingId: data.bookingId
              }
       })

       revalidatePath('/')
       return transaction
}


export async function closeCashRegister(registerId: number, realCash: number, realTransfer: number) {
       try {
              const register = await prisma.cashRegister.findUnique({
                     where: { id: registerId },
                     include: { transactions: true }
              })

              if (!register) throw new Error("Caja no encontrada")

              await prisma.cashRegister.update({
                     where: { id: registerId },
                     data: {
                            status: 'CLOSED',
                            endAmountCash: realCash,
                            endAmountTransf: realTransfer,
                            endTime: new Date()
                     }
              })

              revalidatePath('/')
              return { success: true }
       } catch (e) {
              console.error(e)
              return { success: false, error: 'Error al cerrar caja' }
       }
}
