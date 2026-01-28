'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { getOrCreateTodayCashRegister, getCurrentClubId } from '@/lib/tenant'
import { processPaymentAtomic } from './payment.atomic'
import { logAction } from '@/lib/logger'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { hasPermission, RESOURCES, ACTIONS } from "@/lib/permissions"
import { getMatchingWaitingUsers } from "@/actions/waitingList"
import { MessagingService } from "@/lib/messaging"


export async function getBookingDetails(bookingId: number | string) {
       try {
              const clubId = await getCurrentClubId()
              const id = Number(bookingId)
              console.log(`🔍 Fetching booking details for ID: ${bookingId} (Type: ${typeof bookingId}, Casted: ${id})`)

              if (isNaN(id)) {
                     return { success: false, error: 'ID de reserva inválido' }
              }

              const booking = await prisma.booking.findFirst({
                     where: { id: id, clubId },
                     select: {
                            id: true,
                            startTime: true,
                            endTime: true,
                            price: true,
                            status: true,
                            paymentStatus: true,
                            paymentMethod: true,
                            courtId: true,
                            clubId: true,
                            createdAt: true,
                            updatedAt: true,
                            client: { select: { id: true, name: true, phone: true, email: true } },
                            court: { select: { id: true, name: true } },
                            items: { include: { product: true } },
                            transactions: true,
                            players: true,
                     }
              })

              if (!booking) return { success: false, error: 'Turno no encontrado' }
              return { success: true, booking }

       } catch (error: any) {
              console.error("❌ CRITICAL ERROR in getBookingDetails:", error)
              return { success: false, error: error.message || 'Error al obtener detalles' }
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
                                   playerName
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
       const clubId = await getCurrentClubId()
       const id = Number(bookingId)

       // Security Check
       const exists = await prisma.booking.findFirst({ where: { id, clubId } })
       if (!exists) return { success: false, error: 'Reserva no encontrada o acceso denegado' }

       // 1. Attempt Enterprise Atomic Payment First
       try {
              const atomicResult = await processPaymentAtomic(bookingId, amount, method)
              if (atomicResult.success) return atomicResult
              return atomicResult
       } catch (error: any) {
              if (error.message !== 'DB_SCHEMA_ERROR') {
                     console.error("Atomic payment failed unexpectedly:", error)
                     return { success: false, error: 'Error procesando pago atómico' }
              }
              console.warn("⚠️ Database Schema Mismatch detected. Falling back to Legacy Payment Mode.")
       }

       // 2. FALLBACK LEGACY MODE
       try {
              if (isNaN(id)) return { success: false, error: 'ID inválido' }

              const booking = await prisma.booking.findUnique({
                     where: { id: id },
                     include: {
                            items: true,
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

              const itemsTotal = booking.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
              const totalCost = booking.price + itemsTotal

              const previousPaid = booking.transactions.reduce((sum: number, t: any) => sum + (t.amount || 0), 0)
              const totalPaid = previousPaid + amount

              const newStatus = totalPaid >= totalCost ? 'PAID' : 'PARTIAL'

              await prisma.booking.update({
                     where: { id: id },
                     data: {
                            paymentStatus: newStatus,
                            status: 'CONFIRMED'
                     }
              })

              await logAction({
                     clubId: booking.clubId,
                     action: 'UPDATE',
                     entity: 'BOOKING',
                     entityId: booking.id.toString(),
                     details: { type: 'PAYMENT', amount, method, status: newStatus }
              })

              revalidatePath('/')
              return { success: true }
       } catch (error: any) {
              console.error(`[payBooking] Error paying booking ${bookingId}:`, error)
              return { success: false, error: error.message || 'Error processing payment' }
       }
}

export async function cancelBooking(bookingId: number | string) {
       try {
              const session = await getServerSession(authOptions)
              if (!session) return { success: false, error: 'No autenticado' }

              const id = Number(bookingId)
              if (isNaN(id)) return { success: false, error: 'ID inválido' }

              if (!session.user.clubId) return { success: false, error: 'No club ID found' }

              const booking = await prisma.booking.findFirst({
                     where: { id: id, clubId: session.user.clubId },
                     include: {
                            transactions: true,
                            items: true
                     }
              })

              if (!booking) return { success: false, error: 'Reserva no encontrada' }

              const totalPaid = booking.transactions.reduce((sum: number, t: any) => sum + t.amount, 0)
              const needsRefund = totalPaid > 0
              const requiredAction = needsRefund ? ACTIONS.DELETE : ACTIONS.UPDATE

              if (!hasPermission(session.user.role, RESOURCES.BOOKINGS, requiredAction)) {
                     return { success: false, error: `No tienes permisos. ${needsRefund ? 'Se requiere ADMIN para devoluciones.' : ''}` }
              }

              if (booking.status === 'CANCELED') return { success: true }

              if (totalPaid > 0) {
                     const register = await getOrCreateTodayCashRegister(booking.clubId)

                     await prisma.transaction.create({
                            data: {
                                   cashRegisterId: register.id,
                                   bookingId: id,
                                   type: 'EXPENSE',
                                   category: 'REFUND',
                                   amount: totalPaid,
                                   method: 'CASH',
                                   description: `Devolución total por cancelación Reserva #${booking.id}`
                            }
                     })
              }

              for (const item of booking.items) {
                     if (item.productId) {
                            await prisma.product.update({
                                   where: { id: item.productId },
                                   data: { stock: { increment: item.quantity } }
                            })
                     }
              }

              await prisma.booking.update({
                     where: { id: id },
                     data: { status: 'CANCELED', paymentStatus: 'REFUNDED' }
              })

              await logAction({
                     clubId: booking.clubId,
                     action: 'DELETE',
                     entity: 'BOOKING',
                     entityId: booking.id.toString(),
                     details: { refundAmount: totalPaid > 0 ? totalPaid : 0 }
              })

              // CHECK WAITING LIST & NOTIFY
              try {
                     const waitingResult = await getMatchingWaitingUsers(booking.startTime, booking.startTime, booking.courtId)
                     if (waitingResult.success && waitingResult.list.length > 0) {
                            await MessagingService.notifyWaitingList(booking, waitingResult.list)
                     }
              } catch (e) {
                     console.error("Error notifying waiting list:", e)
              }

              // REAL-TIME UPDATE
              try {
                     const { pusherServer } = await import('@/lib/pusher')
                     await pusherServer.trigger(`club-${booking.clubId}`, 'booking-update', {
                            type: 'DELETE',
                            bookingId: id
                     })
              } catch (pusherError) {
                     console.error("Pusher Trigger Error:", pusherError)
              }

              revalidatePath('/')
              return { success: true }
       } catch (error) {
              console.error("Error cancelling booking:", error)
              return { success: false, error: "Error al cancelar la reserva" }
       }
}

export async function updateBookingStatus(bookingId: number, options: {
       status?: 'CONFIRMED' | 'PENDING',
       paymentStatus?: 'PAID' | 'UNPAID'
}) {
       const clubId = await getCurrentClubId()

       if (options.paymentStatus === 'PAID') {
              const booking = await prisma.booking.findFirst({ where: { id: bookingId, clubId } })
              if (booking) {
                     await payBooking(bookingId, booking.price, 'CASH')
                     return { success: true }
              }
       }

       await prisma.booking.update({
              where: { id: bookingId }, // ID is unique, but we checked existence above potentially? No, update needs check or updateMany
              data: options
       })
       // Better safety:
       const authorized = await prisma.booking.count({ where: { id: bookingId, clubId } })
       if (!authorized) return { success: false, error: 'No autorizado' }

       // Re-do update safely if we skipped the PAID block
       if (options.paymentStatus !== 'PAID') {
              await prisma.booking.update({
                     where: { id: bookingId },
                     data: options
              })
       }
       revalidatePath('/')
       return { success: true }
}

export async function updateBookingDetails(
       bookingId: number,
       newStartTime: Date,
       courtId: number
) {
       try {
              const clubId = await getCurrentClubId()
              const booking = await prisma.booking.findFirst({ where: { id: bookingId, clubId } })
              if (!booking) return { success: false, error: 'Reserva no encontrada' }

              const durationMs = booking.endTime.getTime() - booking.startTime.getTime()
              const newEndTime = new Date(newStartTime.getTime() + durationMs)

              const existing = await prisma.booking.findFirst({
                     where: {
                            clubId: booking.clubId,
                            courtId: courtId,
                            status: { not: 'CANCELED' },
                            id: { not: bookingId },
                            startTime: { lt: newEndTime },
                            endTime: { gt: newStartTime }
                     }
              })

              if (existing) {
                     return { success: false, error: 'El horario seleccionado ya está ocupado por otra reserva.' }
              }

              await prisma.booking.update({
                     where: { id: bookingId },
                     data: {
                            startTime: newStartTime,
                            endTime: newEndTime,
                            courtId: courtId
                     }
              })

              await logAction({
                     clubId: booking.clubId,
                     action: 'UPDATE',
                     entity: 'BOOKING',
                     entityId: booking.id.toString(),
                     details: { type: 'RESCHEDULE', oldStart: booking.startTime, newStart: newStartTime, oldCourt: booking.courtId, newCourt: courtId }
              })

              // REAL-TIME UPDATE
              try {
                     const { pusherServer } = await import('@/lib/pusher')
                     await pusherServer.trigger(`club-${clubId}`, 'booking-update', {
                            type: 'UPDATE',
                            bookingId,
                            data: { startTime: newStartTime, endTime: newEndTime, courtId }
                     })
              } catch (pusherError) {
                     console.error("Pusher Trigger Error:", pusherError)
              }

              revalidatePath('/')
              return { success: true }
       } catch (error) {
              console.error(error)
              return { success: false, error: 'Error al modificar la reserva' }
       }
}

export async function updateBookingNotes(bookingId: number, notes: string) {
       try {
              revalidatePath('/')
              return { success: true }
       } catch (error) {
              return { success: false, error: 'Error al actualizar notas' }
       }
}

export async function manageSplitPlayers(bookingId: number, players: any[]) {
       try {
              const clubId = await getCurrentClubId()
              // Fetch booking to get clubId and verify
              const booking = await prisma.booking.findFirst({ where: { id: bookingId, clubId } })

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

              if (booking) {
                     await logAction({
                            clubId: booking.clubId,
                            action: 'UPDATE',
                            entity: 'BOOKING',
                            entityId: bookingId.toString(),
                            details: { type: 'PLAYERS_UPDATE', count: players.length }
                     })
              }

              revalidatePath('/')
              return { success: true }
       } catch (error) {
              console.error(error)
              return { success: false, error: 'Error al gestionar jugadores' }
       }
}

export async function generatePaymentLink(bookingId: number | string, amount: number) {
       try {
              const id = Number(bookingId)
              if (isNaN(id)) return { success: false, error: "ID inválido" }

              const { createPreference } = await import('@/actions/mercadopago')
              // Note: createPreference args are (bookingId, redirectPath, customAmount)
              const res = await createPreference(id, '/dashboard', amount)

              if (res.success && res.init_point) {
                     return { success: true, url: res.init_point }
              } else {
                     return { success: false, error: res.error || "Error al generar link de MercadoPago" }
              }
       } catch (error: any) {
              console.error("Error generating link:", error)
              return { success: false, error: error.message }
       }
}

export async function chargePlayer(bookingId: number, playerName: string, amount: number, method: string) {
       try {
              const clubId = await getCurrentClubId()
              const booking = await prisma.booking.findFirst({ where: { id: bookingId, clubId } })
              if (!booking) return { success: false, error: 'Reserva no encontrada' }

              // 1. Find the player
              let player = await prisma.bookingPlayer.findFirst({
                     where: { bookingId, name: playerName }
              })

              // If player doesn't exist (maybe split hasn't been saved yet), force create
              if (!player) {
                     player = await prisma.bookingPlayer.create({
                            data: {
                                   bookingId,
                                   name: playerName,
                                   amount,
                                   isPaid: true,
                                   paymentMethod: method
                            }
                     })
              } else {
                     // Update existing
                     await prisma.bookingPlayer.update({
                            where: { id: player.id },
                            data: { isPaid: true, paymentMethod: method }
                     })
              }

              // 2. Record Transaction
              const register = await getOrCreateTodayCashRegister(clubId)

              await prisma.transaction.create({
                     data: {
                            cashRegisterId: register.id,
                            bookingId,
                            type: 'INCOME',
                            category: 'BOOKING_PAYMENT',
                            amount,
                            method,
                            description: `Pago individual: ${playerName} - Reserva #${bookingId}`
                     }
              })

              // 3. Update Global Booking Status
              // Recalculate totals
              const transactions = await prisma.transaction.findMany({ where: { bookingId, type: 'INCOME' } })
              const totalPaid = transactions.reduce((sum, t) => sum + t.amount, 0)

              // We need total price. Fetch fresh booking with items
              const freshBooking = await prisma.booking.findUnique({
                     where: { id: bookingId },
                     include: { items: true }
              })

              if (freshBooking) {
                     const itemsTotal = freshBooking.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
                     const totalCost = freshBooking.price + itemsTotal

                     // Allow a small margin for float errors, or strict >=
                     const newStatus = totalPaid >= (totalCost - 1) ? 'PAID' : 'PARTIAL'

                     if (freshBooking.paymentStatus !== newStatus) {
                            await prisma.booking.update({
                                   where: { id: bookingId },
                                   data: { paymentStatus: newStatus as any }
                            })
                     }
              }

              await logAction({
                     clubId,
                     action: 'UPDATE',
                     entity: 'BOOKING',
                     entityId: bookingId.toString(),
                     details: { type: 'PLAYER_PAYMENT', player: playerName, amount, method }
              })

              revalidatePath('/')
              return { success: true }

       } catch (error: any) {
              console.error("Error charging player:", error)
              return { success: false, error: 'Error al cobrar jugador' }
       }
}
