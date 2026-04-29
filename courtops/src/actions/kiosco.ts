'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { createSafeAction } from '@/lib/safe-action'
import { getOrCreateTodayCashRegister } from '@/lib/tenant'

export const getProducts = createSafeAction(async ({ clubId }) => {
       return await prisma.product.findMany({
              where: { clubId, isActive: true },
              orderBy: [{ category: 'asc' }, { name: 'asc' }],
       })
})

export const restockProduct = createSafeAction(async ({ clubId }, id: number, quantity: number) => {
       if (!Number.isInteger(quantity) || quantity <= 0) throw new Error('Cantidad inválida')
       const updated = await prisma.product.update({
              where: { id_clubId: { id, clubId } },
              data: { stock: { increment: quantity } }
       })
       revalidatePath('/dashboard')
       return updated
})

export type SaleItem = {
       productId: number
       quantity: number
       price: number
}

export type Payment = {
       method: string
       amount: number
}

export const processSale = createSafeAction(async ({ clubId }, items: SaleItem[], payments: Payment[], clientId?: number) => {
       if (!items.length) throw new Error('No hay productos en la venta')
       if (!payments.length) throw new Error('No se registró ningún pago')

       const saleTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
       const paymentTotal = payments.reduce((sum, p) => sum + p.amount, 0)
       if (paymentTotal < saleTotal) throw new Error(`El pago ($${paymentTotal}) es menor al total ($${saleTotal})`)

       // Get cash register before transaction to avoid nested transaction issues
       const register = await getOrCreateTodayCashRegister(clubId)

       return await prisma.$transaction(async (tx) => {
              // 1. Verify Stock and Deduct
              const descriptionParts: string[] = []
              const transactionItemsData: { productId: number, quantity: number, unitPrice: number, subtotal: number }[] = []

              for (const item of items) {
                     const product = await tx.product.findUnique({ where: { id_clubId: { id: item.productId, clubId } } })
                     if (!product) throw new Error(`Producto no válido: ${item.productId}`)

                     if (product.stock < item.quantity) {
                            throw new Error(`Stock insuficiente para ${product.name}. Disponibles: ${product.stock}`)
                     }

                     await tx.product.update({
                            where: { id_clubId: { id: item.productId, clubId } },
                            data: { stock: { decrement: item.quantity } }
                     })

                     descriptionParts.push(`${item.quantity}x ${product.name}`)
                     transactionItemsData.push({
                            productId: item.productId,
                            quantity: item.quantity,
                            unitPrice: item.price,
                            subtotal: item.quantity * item.price
                     })
              }

              // 2. Create Transactions (one per payment method)
              const createdTransactions = []
              for (const p of payments) {
                     const transaction = await tx.transaction.create({
                            data: {
                                   clubId,
                                   cashRegisterId: register.id,
                                   clientId: clientId || null,
                                   type: 'INCOME',
                                   category: 'KIOSCO',
                                   amount: p.amount,
                                   method: p.method,
                                   description: descriptionParts.join(', '),
                            }
                     })
                     createdTransactions.push(transaction)
              }

              // Link items to the first transaction of the sale
              if (createdTransactions.length > 0) {
                     for (const tItem of transactionItemsData) {
                            await tx.transactionItem.create({
                                   data: {
                                          transactionId: createdTransactions[0].id,
                                          ...tItem
                                   }
                            })
                     }
              }

              return { success: true }
       })
})

export const getActiveBookings = createSafeAction(async ({ clubId }) => {
       const now = new Date()

       const activeBookings = await prisma.booking.findMany({
              where: {
                     clubId,
                     startTime: { lte: now },
                     endTime: { gt: now },
                     status: 'CONFIRMED'
              },
              include: {
                     court: true,
                     client: true,
                     transactions: true,
                     items: true
              }
       })

       return activeBookings.map(b => {
              const itemsTotal = b.items.reduce((s, i) => s + (i.unitPrice * i.quantity), 0)
              const total = b.price + itemsTotal
              const paid = b.transactions.reduce((s, t) => s + t.amount, 0)
              const debt = total - paid

              return {
                     id: b.id,
                     courtName: b.court.name,
                     clientName: b.client?.name || 'Cliente Casual',
                     debt,
                     startTime: b.startTime,
                     endTime: b.endTime
              }
       })
})
