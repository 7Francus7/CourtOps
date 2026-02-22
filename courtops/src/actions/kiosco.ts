'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { getCurrentClubId } from '@/lib/tenant'

export async function getProducts() {
       const clubId = await getCurrentClubId()
       return await prisma.product.findMany({
              where: {
                     clubId,
                     isActive: true
              },
       })
}

export async function restockProduct(id: number, quantity: number) {
       const clubId = await getCurrentClubId()
       await prisma.product.update({
              where: { id_clubId: { id, clubId } },
              data: { stock: { increment: quantity } }
       })
       revalidatePath('/dashboard')
       return { success: true }
}

export type SaleItem = {
       productId: number
       quantity: number
       price: number
}

export type Payment = {
       method: string
       amount: number
}

export async function processSale(items: SaleItem[], payments: Payment[], clientId?: number) {
       try {
              const clubId = await getCurrentClubId()

              // 1. Calculate Total and Validate Stock
              let totalCalculated = 0
              for (const item of items) {
                     totalCalculated += item.price * item.quantity
              }

              const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0)

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

                     const today = new Date()
                     today.setHours(0, 0, 0, 0)

                     let register = await tx.cashRegister.findFirst({
                            where: { clubId, date: today }
                     })

                     if (!register) {
                            register = await tx.cashRegister.create({
                                   data: { clubId, date: today, status: 'OPEN' }
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
       } catch (error) {
              console.error("Error processing sale:", error)
              throw new Error(error instanceof Error ? error.message : 'Error desconocido')
       }
}

export async function getActiveBookings() {
       try {
              const clubId = await getCurrentClubId()
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
       } catch (error) {
              console.error("Error fetching active bookings:", error)
              return []
       }
}
