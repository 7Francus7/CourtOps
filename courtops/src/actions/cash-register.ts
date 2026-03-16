'use server'

import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'
import { startOfDay, endOfDay } from 'date-fns'
import { nowInArg } from '@/lib/date-utils'

export async function getCashRegisterStatus() {
       try {
              const clubId = await getCurrentClubId()
              const today = nowInArg()

              // Find open register first
              const register = await prisma.cashRegister.findFirst({
                     where: {
                            clubId,
                            status: 'OPEN'
                     },
                     include: {
                            transactions: {
                                   orderBy: { createdAt: 'desc' },
                                   take: 20
                            }
                     }
              })

              // If no open register, find last closed one for context or just null
              if (!register) {
                     // Check if there was one today
                     const todayRegister = await prisma.cashRegister.findFirst({
                            where: {
                                   clubId,
                                   date: {
                                          gte: startOfDay(today),
                                          lte: endOfDay(today)
                                   }
                            },
                            orderBy: { openedAt: 'desc' }
                     })

                     if (todayRegister) {
                            // Return closed register details
                            return { success: true, status: 'CLOSED', register: todayRegister }
                     }

                     return { success: true, status: 'NO_REGISTER' }
              }

              // Calculate totals for the open register
              const movements = await prisma.transaction.findMany({
                     where: { cashRegisterId: register.id }
              })

              const incomeCash = movements
                     .filter(t => t.type === 'INCOME' && t.method === 'CASH')
                     .reduce((sum, t) => sum + t.amount, 0)

              const expenseCash = movements
                     .filter(t => t.type === 'EXPENSE' && t.method === 'CASH')
                     .reduce((sum, t) => sum + t.amount, 0)

              const incomeDigital = movements
                     .filter(t => t.type === 'INCOME' && t.method !== 'CASH')
                     .reduce((sum, t) => sum + t.amount, 0)

              const currentCash = register.startAmount + incomeCash - expenseCash

              return {
                     success: true,
                     status: 'OPEN',
                     register,
                     movements, // Pass movements down to avoid double fetch
                     summary: {
                            startAmount: register.startAmount,
                            incomeCash,
                            expenseCash,
                            incomeDigital,
                            currentCash,
                            totalMovements: movements.length
                     }
              }

       } catch (error) {
              console.error("Error getting cash register:", error)
              return { success: false, error: "Error al obtener estado de caja" }
       }
}

export async function openCashRegister(startAmount: number) {
       try {
              const clubId = await getCurrentClubId()
              if (startAmount < 0) return { success: false, error: 'El monto inicial no puede ser negativo' }

              const active = await prisma.cashRegister.findFirst({ where: { clubId, status: 'OPEN' } })
              if (active) return { success: false, error: 'Ya hay una caja abierta' }

              const now = nowInArg()
              await prisma.cashRegister.create({
                     data: {
                            clubId,
                            startAmount,
                            status: 'OPEN',
                            openedAt: now,
                            date: startOfDay(now)
                     }
              })

              revalidatePath('/')
              return { success: true }
       } catch (_error) {
              return { success: false, error: 'Error al abrir caja' }
       }
}

export async function closeCashRegister(registerId: number, declaredCash: number, _notes?: string) {
       try {
              const clubId = await getCurrentClubId()
              const register = await prisma.cashRegister.findUnique({ where: { id: registerId } })

              if (!register || register.clubId !== clubId) return { success: false, error: 'Caja no encontrada' }
              if (register.status === 'CLOSED') return { success: false, error: 'La caja ya esta cerrada' }
              if (declaredCash < 0) return { success: false, error: 'El monto declarado no puede ser negativo' }

              // Calculate expected
              const movements = await prisma.transaction.findMany({ where: { cashRegisterId: registerId } })
              const incomeCash = movements.filter(t => t.type === 'INCOME' && t.method === 'CASH').reduce((s, t) => s + t.amount, 0)
              const expenseCash = movements.filter(t => t.type === 'EXPENSE' && t.method === 'CASH').reduce((s, t) => s + t.amount, 0)
              const expectedCash = register.startAmount + incomeCash - expenseCash

              const difference = declaredCash - expectedCash

              // Calculate digital totals (Transfer, MP, Cards)
              const incomeDigital = movements.filter(t => t.type === 'INCOME' && t.method !== 'CASH').reduce((s, t) => s + t.amount, 0)
              const expenseDigital = movements.filter(t => t.type === 'EXPENSE' && t.method !== 'CASH').reduce((s, t) => s + t.amount, 0)
              const endAmountTransf = incomeDigital - expenseDigital

              await prisma.cashRegister.update({
                     where: { id: registerId },
                     data: {
                            status: 'CLOSED',
                            closedAt: nowInArg(),
                            endAmountCash: declaredCash,
                            endAmountTransf
                     }
              })

              // Log the closing difference as a system note or distinct log if needed
              // For now, we trust the update.

              revalidatePath('/')
              return { success: true, difference }
       } catch (_error) {
              return { success: false, error: 'Error al cerrar caja' }
       }
}

export async function addMovement(amount: number, type: 'INCOME' | 'EXPENSE', description: string, category: string = 'OTHER') {
       try {
              if (!amount || amount <= 0) return { success: false, error: 'El monto debe ser mayor a 0' }
              if (!description?.trim()) return { success: false, error: 'La descripción es obligatoria' }

              const clubId = await getCurrentClubId()
              const register = await prisma.cashRegister.findFirst({ where: { clubId, status: 'OPEN' } })

              if (!register) return { success: false, error: 'No hay caja abierta' }

              await prisma.transaction.create({
                     data: {
                            clubId,
                            cashRegisterId: register.id,
                            amount,
                            type,
                            category,
                            method: 'CASH',
                            description
                     }
              })

              revalidatePath('/')
              return { success: true }
       } catch (_error) {
              return { success: false, error: 'Error al registrar movimiento' }
       }
}

// Compat wrapper for Dashboard widgets
export async function getCajaStats() {
       try {
              const res = await getCashRegisterStatus()

              if (!res.success || !res.register || !res.summary) {
                     return null
              }

              const transactions = ('movements' in res ? res.movements : []) as { type: string; method: string; amount: number }[]

              const incomeMP = transactions
                     .filter((t) => t.type === 'INCOME' && (t.method === 'MERCADOPAGO' || t.method === 'MP'))
                     .reduce((sum: number, t) => sum + t.amount, 0)

              const incomeTransfer = transactions
                     .filter((t) => t.type === 'INCOME' && (t.method === 'TRANSFER' || t.method === 'TRANSFERENCIA'))
                     .reduce((sum: number, t) => sum + t.amount, 0)

              return {
                     id: res.register.id,
                     status: res.register.status,
                     incomeCash: res.summary.incomeCash,
                     incomeTransfer: incomeTransfer,
                     incomeMP: incomeMP,
                     incomeDigital: res.summary.incomeDigital, // Total digital (Transfer + MP + etc)
                     expenses: res.summary.expenseCash,
                     total: res.summary.currentCash, // Keeping this as physical cash balance for consistency with "Saldo en caja"
                     totalGeneral: res.summary.incomeCash + res.summary.incomeDigital, // Real daily revenue (excludes startAmount)
                     transactionCount: res.summary.totalMovements,
                     expectedCash: res.summary.currentCash
              }
       } catch (error) {
              console.error("Error in getCajaStats:", error)
              return null
       }
}


