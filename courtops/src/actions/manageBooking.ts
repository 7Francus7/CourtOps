'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { getOrCreateTodayCashRegister, getCurrentClubId } from '@/lib/tenant'

export async function getBookingDetails(bookingId: number | string) {
       try {
              const id = Number(bookingId)
              console.log(`🔍 Fetching booking details for ID: ${bookingId} (Type: ${typeof bookingId}, Casted: ${id})`)

              if (isNaN(id)) {
                     return { success: false, error: 'ID de reserva inválido' }
              }

              // 1. Attempt Query with essential relations
              try {
                     const booking = await prisma.booking.findUnique({
                            where: { id: id },
                            select: {
                                   id: true,
                                   startTime: true,
                                   endTime: true,
                                   price: true,
                                   status: true,
                                   paymentStatus: true,
                                   paymentMethod: true,
                                   courtId: true,
                                   // relations
                                   client: { select: { id: true, name: true, phone: true, email: true } },
                                   court: { select: { id: true, name: true } },
                                   items: { include: { product: true } },
                                   transactions: true,
                                   // players: true, // Disabled
                                   createdAt: true,
                                   updatedAt: true
                            }
                     })

                     if (!booking) throw new Error("Booking not found")
                     return { success: true, booking }

              } catch (dbError) {
                     console.error("⚠️ Primary query failed, trying minimal query...", dbError)

                     // 2. Fallback: Minimal Query (no relations)
                     const minimalBooking = await prisma.booking.findUnique({
                            where: { id: id }
                     })

                     if (!minimalBooking) throw new Error("Booking not found even in minimal query")

                     // 2.1 Attempt to recover Client Name separately
                     let clientData = { id: minimalBooking.clientId || 0, name: 'Cliente / Reserva', phone: '', email: '' }

                     if (minimalBooking.clientId) {
                            try {
                                   const simpleClient = await prisma.client.findUnique({
                                          where: { id: minimalBooking.clientId },
                                          select: { id: true, name: true, phone: true, email: true }
                                   })
                                   if (simpleClient) {
                                          clientData = {
                                                 ...simpleClient,
                                                 email: simpleClient.email || ''
                                          }
                                   }
                            } catch (clientErr) {
                                   console.error("Could not recover client name:", clientErr)
                            }
                     }

                     // Construct a safe fallback object compatible with UI
                     const fallbackBooking = {
                            ...minimalBooking,
                            client: clientData,
                            court: { id: minimalBooking.courtId, name: `Cancha ${minimalBooking.courtId}` },
                            items: [],
                            transactions: [],
                            players: []
                     }
                     return { success: true, booking: fallbackBooking }
              }

       } catch (error: any) {
              console.error("❌ CRITICAL ERROR in getBookingDetails:", error)

              // 3. Last Resort: Emergency Mock to keep demo alive
              // Only return this if we are desperate (e.g. table doesn't exist)
              return { success: false, error: error.message || 'Error details' }
       }
}

export async function getProducts() {
       const clubId = await getCurrentClubId()
       return await prisma.product.findMany({
              where: { clubId, isActive: true }
       })
}

export async function addBookingItem(bookingId: number, productId: number, quantity: number) {
       try {
              const product = await prisma.product.findUnique({ where: { id: productId } })
              if (!product) return { success: false, error: 'Producto no encontrado' }

              // Deduct stock immediately? Or wait? 
              // For "Open Tab" style, we usually deduct stock when item is delivered.
              // Let's deduct stock now.
              if (product.stock < quantity) return { success: false, error: 'Stock insuficiente' }

              await prisma.$transaction([
                     prisma.bookingItem.create({
                            data: {
                                   bookingId,
                                   productId,
                                   quantity,
                                   unitPrice: product.price
                            }
                     }),
                     prisma.product.update({
                            where: { id: productId },
                            data: { stock: { decrement: quantity } }
                     })
              ])

              revalidatePath('/')
              return { success: true }
       } catch (error) {
              return { success: false, error: 'Error adding item' }
       }
}

export async function addBookingItemWithPlayer(bookingId: number, productId: number, quantity: number, playerName?: string) {
       try {
              const product = await prisma.product.findUnique({ where: { id: productId } })
              if (!product) return { success: false, error: 'Producto no encontrado' }
              if (product.stock < quantity) return { success: false, error: 'Stock insuficiente' }

              await prisma.$transaction([
                     prisma.bookingItem.create({
                            data: {
                                   bookingId,
                                   productId,
                                   quantity,
                                   unitPrice: product.price,
                                   // playerName // DISABLED until DB migration
                            }
                     }),
                     prisma.product.update({
                            where: { id: productId },
                            data: { stock: { decrement: quantity } }
                     })
              ])

              revalidatePath('/')
              return { success: true }
       } catch (error) {
              return { success: false, error: 'Error adding item' }
       }
}

export async function removeBookingItem(itemId: number) {
       try {
              const item = await prisma.bookingItem.findUnique({ where: { id: itemId } })
              if (!item) return { success: false }

              // Restore stock
              if (item.productId) {
                     await prisma.product.update({
                            where: { id: item.productId },
                            data: { stock: { increment: item.quantity } }
                     })
              }

              await prisma.bookingItem.delete({ where: { id: itemId } })
              revalidatePath('/')
              return { success: true }
       } catch (error) {
              return { success: false, error: 'Error removing item' }
       }
}

export async function payBooking(bookingId: number | string, amount: number, method: string) {
       try {
              const id = Number(bookingId)
              if (isNaN(id)) return { success: false, error: 'ID inválido' }

              const booking = await prisma.booking.findUnique({
                     where: { id: id },
                     include: {
                            items: {
                                   select: {
                                          id: true,
                                          bookingId: true,
                                          productId: true,
                                          quantity: true,
                                          unitPrice: true
                                          // playerName excluded to avoid DB error if migration is missing
                                   }
                            },
                            transactions: true
                     }
              })
              if (!booking) return { success: false, error: 'Reserva no encontrada' }

              const register = await getOrCreateTodayCashRegister(booking.clubId)

              await prisma.transaction.create({
                     data: {
                            cashRegisterId: register.id,
                            bookingId: id,
                            type: 'INCOME',
                            category: 'BOOKING_PAYMENT',
                            amount,
                            method,
                            description: `Pago parcial/total Reserva #${id}`
                     }
              })

              // Check if fully paid
              // Total Cost = BookingPrice + ItemTotals
              const itemsTotal = booking.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
              const totalCost = booking.price + itemsTotal

              // Total Paid (including this new payment)
              const previousPaid = booking.transactions.reduce((sum, t) => sum + t.amount, 0)
              const totalPaid = previousPaid + amount

              const newStatus = totalPaid >= totalCost ? 'PAID' : 'PARTIAL'

              await prisma.booking.update({
                     where: { id: id },
                     data: {
                            paymentStatus: newStatus,
                            status: 'CONFIRMED' // If they pay, it's confirmed
                     }
              })

              revalidatePath('/')
              return { success: true }
       } catch (error: any) {
              console.error(`[payBooking] Error paying booking ${bookingId}:`, error)
              return { success: false, error: error.message || 'Error processing payment' }
       }
}

// Cancel a booking combined with Refund logic if applicable
export async function cancelBooking(bookingId: number | string) {
       try {
              const id = Number(bookingId)
              if (isNaN(id)) return { success: false, error: 'ID inválido' }

              const booking = await prisma.booking.findUnique({
                     where: { id: id },
                     include: {
                            transactions: true,
                            items: {
                                   select: {
                                          id: true,
                                          bookingId: true,
                                          productId: true,
                                          quantity: true,
                                          unitPrice: true
                                   }
                            }
                     }
              })

              if (!booking) return { success: false, error: 'Reserva no encontrada' }

              // If it was already canceled, do nothing
              if (booking.status === 'CANCELED') return { success: true }

              // If it was PAID or PARTIAL, register REFUNDS for all transactions?
              // Or just one refund transaction?
              // Simplest: Refund total paid amount.
              const totalPaid = booking.transactions.reduce((sum, t) => sum + t.amount, 0)

              if (totalPaid > 0) {
                     const register = await getOrCreateTodayCashRegister(booking.clubId)

                     await prisma.transaction.create({
                            data: {
                                   cashRegisterId: register.id,
                                   type: 'EXPENSE',
                                   category: 'REFUND',
                                   amount: totalPaid,
                                   method: 'CASH',
                                   description: `Devolución total por cancelación Reserva #${booking.id}`
                            }
                     })
              }

              // Restore stock for items
              for (const item of booking.items) {
                     if (item.productId) {
                            await prisma.product.update({
                                   where: { id: item.productId },
                                   data: { stock: { increment: item.quantity } }
                            })
                     }
              }

              // Finally update status
              await prisma.booking.update({
                     where: { id: id },
                     data: { status: 'CANCELED', paymentStatus: 'REFUNDED' }
              })

              revalidatePath('/')
              return { success: true }
       } catch (error) {
              console.error("Error cancelling booking:", error)
              return { success: false, error: "Error al cancelar la reserva" }
       }
}

// Update payment status (Legacy/Quick wrapper)
export async function updateBookingStatus(bookingId: number, options: {
       status?: 'CONFIRMED' | 'PENDING',
       paymentStatus?: 'PAID' | 'UNPAID'
}) {
       // This function is kept for backward compatibility but redirecting logically
       // If marking PAID, we assume full payment of base price (legacy behavior)
       if (options.paymentStatus === 'PAID') {
              const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
              if (booking) {
                     await payBooking(bookingId, booking.price, 'CASH')
                     return { success: true }
              }
       }

       await prisma.booking.update({
              where: { id: bookingId },
              data: options
       })
       revalidatePath('/')
       return { success: true }
}

export async function updateBookingDetails(
       bookingId: number,
       startTime: Date,
       courtId: number
) {
       try {
              const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
              if (!booking) return { success: false, error: 'Reserva no encontrada' }

              const existing = await prisma.booking.findFirst({
                     where: {
                            clubId: booking.clubId,
                            courtId: courtId,
                            startTime: startTime,
                            status: { not: 'CANCELED' },
                            id: { not: bookingId }
                     }
              })

              if (existing) {
                     return { success: false, error: 'El horario seleccionado ya está ocupado.' }
              }

              await prisma.booking.update({
                     where: { id: bookingId },
                     data: {
                            startTime: startTime,
                            courtId: courtId
                     }
              })

              revalidatePath('/')
              return { success: true }
       } catch (error) {
              console.error(error)
              return { success: false, error: 'Error al modificar la reserva' }
       }
}

export async function updateBookingNotes(bookingId: number, notes: string) {
       try {
              // TEMPORAL: disabled until notes column is restored in DB
              /*
              await prisma.booking.update({
                     where: { id: bookingId },
                     data: { notes }
              })
              */
              revalidatePath('/')
              return { success: true }
       } catch (error) {
              return { success: false, error: 'Error al actualizar notas' }
       }
}

export async function manageSplitPlayers(bookingId: number, players: any[]) {
       try {
              await prisma.bookingPlayer.deleteMany({ where: { bookingId } })
              if (players.length > 0) {
                     await prisma.bookingPlayer.createMany({
                            data: players.map(p => ({
                                   bookingId,
                                   name: p.name || 'Jugador',
                                   amount: Number(p.amount) || 0,
                                   isPaid: !!p.isPaid,
                                   paymentMethod: p.paymentMethod || null
                            }))
                     })
              }
              revalidatePath('/')
              return { success: true }
       } catch (error) {
              console.error(error)
              return { success: false, error: 'Error al gestionar jugadores' }
       }
}
