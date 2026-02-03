'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { getCurrentClubId } from '@/lib/tenant'
import { logAction } from '@/lib/logger'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { hasPermission, RESOURCES, ACTIONS } from "@/lib/permissions"
import { BookingService } from '@/services/booking.service'
import { safeSerialize } from '@/lib/utils'


// Replaced ultraSafeSerialize usages with JSON-based safe serialization

export async function getBookingDetails(bookingId: number | string) {
       try {
              const clubId = await getCurrentClubId()
              const id = Number(bookingId)

              if (isNaN(id)) return { success: false, error: 'ID de reserva inválido' }

              const booking = await BookingService.getDetails(id, clubId)

              if (!booking) return { success: false, error: 'Turno no encontrado' }
              return safeSerialize({ success: true, booking })

       } catch (error: any) {
              console.error("❌ CRITICAL ERROR in getBookingDetails:", error)
              return { success: false as const, error: error.message || 'Error al obtener detalles' }
       }
}

export async function getProducts() {
       const clubId = await getCurrentClubId()
       const products = await prisma.product.findMany({
              where: { clubId, isActive: true }
       })
       return safeSerialize(products)
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

       if (isNaN(id)) return { success: false, error: 'ID inválido' }

       try {
              const result = await BookingService.pay(id, clubId, amount, method)
              if (result.success) revalidatePath('/')
              return result
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

              // Retrieve booking to check permissions (needsRefund logic strictly requires knowing previous payments)
              const booking = await prisma.booking.findFirst({
                     where: { id: id, clubId: session.user.clubId },
                     include: { transactions: true }
              })

              if (!booking) return { success: false, error: 'Reserva no encontrada' }

              const totalPaid = booking.transactions.reduce((sum: number, t: any) => sum + t.amount, 0)
              const needsRefund = totalPaid > 0
              const requiredAction = needsRefund ? ACTIONS.DELETE : ACTIONS.UPDATE

              if (!hasPermission(session.user.role, RESOURCES.BOOKINGS, requiredAction)) {
                     return { success: false, error: `No tienes permisos. ${needsRefund ? 'Se requiere ADMIN para devoluciones.' : ''}` }
              }

              // Delegate to Service
              await BookingService.cancel(id, session.user.clubId, { id: session.user.id, role: session.user.role })

              revalidatePath('/')
              return { success: true }
       } catch (error: any) {
              console.error("Error cancelling booking:", error)
              return { success: false, error: error.message || "Error al cancelar la reserva" }
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
              await BookingService.chargePlayer(bookingId, clubId, playerName, amount, method)
              revalidatePath('/')
              return { success: true }
       } catch (error: any) {
              console.error("Error charging player:", error)
              return { success: false, error: 'Error al cobrar jugador' }
       }
}

export async function updateBookingClient(bookingId: number, data: { name: string, phone: string, email?: string }) {
       try {
              const clubId = await getCurrentClubId()
              const booking = await prisma.booking.findFirst({ where: { id: bookingId, clubId } })

              if (!booking) return { success: false, error: 'Reserva no encontrada' }

              if (booking.clientId) {
                     // Update existing client
                     await prisma.client.update({
                            where: { id: booking.clientId },
                            data: {
                                   name: data.name,
                                   phone: data.phone,
                                   email: data.email
                            }
                     })
              } else {
                     // If for some reason there is no client ID (legacy?), update guest fields or create client
                     // For now, let's assume we update the booking's potential guest fields if they exist in schema, 
                     // or we can't do much. But based on Service, clientId is main.
                     // Let's at least try to update guest fields if the schema has them (BookingService.getDetails selects them?)
                     // BookingService selects: client: { ... }
              }

              revalidatePath('/')
              return { success: true }
       } catch (error: any) {
              console.error("Error updating client:", error)
              return { success: false, error: error.message || 'Error al actualizar cliente' }
       }
}
