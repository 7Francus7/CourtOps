'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { getCurrentClubId } from '@/lib/tenant'
import { logAction } from '@/lib/logger'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { hasPermission, RESOURCES, ACTIONS } from "@/lib/permissions"
import { BookingService } from '@/services/booking.service'
import { createSafeAction } from '@/lib/safe-action'


// Replaced ultraSafeSerialize usages with JSON-based safe serialization

export const getBookingDetails = createSafeAction(async ({ clubId }, bookingId: number | string) => {
       const id = Number(bookingId)
       if (isNaN(id)) throw new Error('ID de reserva inválido')

       const booking = await BookingService.getDetails(id, clubId)
       if (!booking) throw new Error('Turno no encontrado')

       return booking
})

export const getProducts = createSafeAction(async ({ clubId }) => {
       return await prisma.product.findMany({
              where: { clubId, isActive: true }
       })
})

export const addBookingItem = createSafeAction(async ({ clubId }, bookingId: number, productId: number, quantity: number) => {
       // Verify booking ownership
       const booking = await prisma.booking.findFirst({
              where: { id: bookingId, clubId }
       })
       if (!booking) throw new Error('Reserva no encontrada o no autorizada')

       // Verify product ownership and stock
       const product = await prisma.product.findFirst({
              where: { id: productId, clubId }
       })
       if (!product) throw new Error('Producto no encontrado')
       if (product.stock < quantity) throw new Error('Stock insuficiente')

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
                     where: { id_clubId: { id: productId, clubId } },
                     data: { stock: { decrement: quantity } }
              })
       ])

       revalidatePath('/')
       return true
})

export async function addBookingItemWithPlayer(bookingId: number, productId: number, quantity: number, playerName?: string) {
       try {
              const clubId = await getCurrentClubId()

              // Verify booking ownership
              const booking = await prisma.booking.findFirst({
                     where: { id: bookingId, clubId }
              })
              if (!booking) return { success: false, error: 'Reserva no encontrada o no autorizada' }

              const product = await prisma.product.findFirst({
                     where: { id: productId, clubId }
              })
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
                            where: { id_clubId: { id: productId, clubId } },
                            data: { stock: { decrement: quantity } }
                     })
              ])

              revalidatePath('/')
              return { success: true }
       } catch (_error) {
              return { success: false, error: 'Error al agregar producto' }
       }
}

export async function removeBookingItem(itemId: number) {
       try {
              const clubId = await getCurrentClubId()

              // Verify item ownership via booking
              const item = await prisma.bookingItem.findFirst({
                     where: {
                            id: itemId,
                            booking: { clubId }
                     },
                     include: { booking: true }
              })

              if (!item) return { success: false, error: 'No autorizado' }

              // Restore stock and delete item atomically
              if (item.productId) {
                     await prisma.$transaction([
                            prisma.product.update({
                                   where: { id_clubId: { id: item.productId, clubId } },
                                   data: { stock: { increment: item.quantity } }
                            }),
                            prisma.bookingItem.delete({ where: { id: itemId } })
                     ])
              } else {
                     await prisma.bookingItem.delete({ where: { id: itemId } })
              }
              revalidatePath('/')
              return { success: true }
       } catch (_error) {
              return { success: false, error: 'Error al eliminar producto' }
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
       } catch (error: unknown) {
              console.error(`[payBooking] Error paying booking ${bookingId}:`, error)
              return { success: false, error: error instanceof Error ? error.message : 'Error processing payment' }
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

              const totalPaid = booking.transactions.reduce((sum: number, t: { amount: number }) => sum + t.amount, 0)
              const needsRefund = totalPaid > 0
              const requiredAction = needsRefund ? ACTIONS.DELETE : ACTIONS.UPDATE

              if (!hasPermission(session.user.role, RESOURCES.BOOKINGS, requiredAction)) {
                     return { success: false, error: `No tienes permisos. ${needsRefund ? 'Se requiere ADMIN para devoluciones.' : ''}` }
              }

              // Delegate to Service
              await BookingService.cancel(id, session.user.clubId, { id: session.user.id, role: session.user.role })

              revalidatePath('/')
              return { success: true }
       } catch (error: unknown) {
              console.error("Error cancelling booking:", error)
              return { success: false, error: error instanceof Error ? error.message : "Error al cancelar la reserva" }
       }
}

export async function uncancelBooking(bookingId: number | string) {
       try {
              const session = await getServerSession(authOptions)
              if (!session) return { success: false, error: 'No autenticado' }

              const id = Number(bookingId)
              if (isNaN(id)) return { success: false, error: 'ID inválido' }

              if (!session.user.clubId) return { success: false, error: 'No club ID found' }

              if (!hasPermission(session.user.role, RESOURCES.BOOKINGS, ACTIONS.UPDATE)) {
                     return { success: false, error: 'No tienes permisos' }
              }

              // Only restore if currently CANCELED and the time slot is still free
              const booking = await prisma.booking.findFirst({
                     where: { id, clubId: session.user.clubId }
              })
              if (!booking) return { success: false, error: 'Reserva no encontrada' }
              if (booking.status !== 'CANCELED') return { success: false, error: 'La reserva no está cancelada' }

              // Check no other booking took the slot
              const conflict = await prisma.booking.findFirst({
                     where: {
                            courtId: booking.courtId,
                            clubId: session.user.clubId,
                            status: { notIn: ['CANCELED'] },
                            id: { not: id },
                            startTime: { lt: booking.endTime },
                            endTime: { gt: booking.startTime }
                     }
              })
              if (conflict) return { success: false, error: 'El horario ya fue tomado por otra reserva' }

              await prisma.booking.update({
                     where: { id_clubId: { id, clubId: session.user.clubId } },
                     data: { status: 'CONFIRMED' }
              })

              revalidatePath('/')
              return { success: true }
       } catch (error: unknown) {
              console.error("Error restoring booking:", error)
              return { success: false, error: error instanceof Error ? error.message : 'Error al restaurar la reserva' }
       }
}

export async function cancelRecurringBooking(bookingId: number | string) {
       try {
              const session = await getServerSession(authOptions)
              if (!session) return { success: false, error: 'No autenticado' }

              const id = Number(bookingId)
              if (isNaN(id)) return { success: false, error: 'ID inválido' }

              if (!session.user.clubId) return { success: false, error: 'No club ID found' }

              // Safety permission check (requiring admin-level for series cancellation is often preferred, but we follow standard check)
              if (!hasPermission(session.user.role, RESOURCES.BOOKINGS, ACTIONS.UPDATE)) {
                     return { success: false, error: "No tienes permisos para esta acción" }
              }

              const result = await BookingService.cancelRecurringSeries(id, session.user.clubId, { id: session.user.id, role: session.user.role })

              revalidatePath('/')
              return { success: true, count: result.count }
       } catch (error: unknown) {
              console.error("Error cancelling recurring booking series:", error)
              return { success: false, error: error instanceof Error ? error.message : "Error al cancelar la serie de reservas" }
       }
}

export async function updateBookingStatus(bookingId: number, options: {
       status?: 'CONFIRMED' | 'PENDING',
       paymentStatus?: 'PAID' | 'UNPAID'
}) {
       try {
              const clubId = await getCurrentClubId()

              // 1. Verify ownership and existence
              const booking = await prisma.booking.findFirst({
                     where: { id: bookingId, clubId }
              })

              if (!booking) {
                     return { success: false, error: 'Reserva no encontrada o no autorizada' }
              }

              // 2. Handle payment separately if requested
              if (options.paymentStatus === 'PAID') {
                     // If status is also provided, update it first
                     if (options.status) {
                            await prisma.booking.update({
                                   where: { id_clubId: { id: bookingId, clubId } },
                                   data: { status: options.status }
                            })
                     }
                     // Use specialized payment logic
                     return await payBooking(bookingId, booking.price, 'CASH')
              }

              // 3. Perform a single update for other cases
              await prisma.booking.update({
                     where: { id_clubId: { id: bookingId, clubId } },
                     data: options
              })

              revalidatePath('/')
              return { success: true }

       } catch (error: unknown) {
              console.error("Error in updateBookingStatus:", error)
              return { success: false, error: error instanceof Error ? error.message : 'Error al actualizar el estado de la reserva' }
       }
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

              // Validate court belongs to this club
              const court = await prisma.court.findFirst({ where: { id: courtId, clubId } })
              if (!court) return { success: false, error: 'Cancha no válida para este club' }

              const durationMs = booking.endTime.getTime() - booking.startTime.getTime()
              const newEndTime = new Date(newStartTime.getTime() + durationMs)

              const existing = await prisma.booking.findFirst({
                     where: {
                            clubId: clubId,
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
                     where: { id_clubId: { id: bookingId, clubId } },
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
              const clubId = await getCurrentClubId()
              // Notes are stored on the Client model, not on Booking.
              // Find the booking's client and update their notes.
              const booking = await prisma.booking.findFirst({
                     where: { id: bookingId, clubId },
                     select: { clientId: true }
              })
              if (!booking) return { success: false, error: 'Reserva no encontrada' }
              if (!booking.clientId) return { success: false, error: 'No hay cliente asociado a esta reserva' }

              await prisma.client.update({
                     where: { id_clubId: { id: booking.clientId, clubId } },
                     data: { notes }
              })

              revalidatePath('/')
              return { success: true }
       } catch (_error) {
              return { success: false, error: 'Error al actualizar notas' }
       }
}

export async function manageSplitPlayers(bookingId: number, players: { name?: string; amount?: number; isPaid?: boolean; paymentMethod?: string }[]) {
       try {
              const clubId = await getCurrentClubId()
              // Verify booking belongs to this club before modifying players
              const booking = await prisma.booking.findFirst({ where: { id: bookingId, clubId } })
              if (!booking) return { success: false, error: 'Reserva no encontrada' }

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
       } catch (error: unknown) {
              console.error("Error generating link:", error)
              return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
       }
}

export async function chargePlayer(bookingId: number, playerName: string, amount: number, method: string) {
       try {
              const clubId = await getCurrentClubId()
              await BookingService.chargePlayer(bookingId, clubId, playerName, amount, method)
              revalidatePath('/')
              return { success: true }
       } catch (error: unknown) {
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
                            where: { id_clubId: { id: booking.clientId, clubId } },
                            data: {
                                   name: data.name,
                                   phone: data.phone,
                                   email: data.email
                            }
                     })
              } else {
                     // No linked client — update guest fields on the booking
                     await prisma.booking.update({
                            where: { id_clubId: { id: bookingId, clubId } },
                            data: {
                                   guestName: data.name,
                                   guestPhone: data.phone
                            }
                     })
              }

              revalidatePath('/')
              return { success: true }
       } catch (error) {
              console.error("Error updating client:", error)
              return { success: false, error: error instanceof Error ? error.message : 'Error al actualizar cliente' }
       }
}
export async function sendManualReminder(bookingId: number) {
       try {
              const clubId = await getCurrentClubId()
              const booking = await prisma.booking.findUnique({
                     where: { id: bookingId, clubId },
                     include: { client: true, court: true, items: true, transactions: true, club: { select: { hasWhatsApp: true } } }
              })
              if (!booking) return { success: false, error: 'Reserva no encontrada' }
              if (!booking.client) return { success: false, error: 'El titular no tiene datos de contacto' }

              const { MessagingService } = await import('@/lib/messaging')
              const clientName = booking.client.name
              const phone = booking.client.phone

              if (!booking.club?.hasWhatsApp) return { success: false, error: 'Tu plan no incluye WhatsApp automático. Actualizá a Plan Pro.' }

              if (phone) {
                     // Calculate real balance
                     const itemsTotal = booking.items.reduce((s, i) => s + (i.unitPrice * i.quantity), 0)
                     const paidTotal = booking.transactions.reduce((s, t) => s + t.amount, 0)
                     const total = booking.price + itemsTotal
                     const balance = Math.max(0, total - paidTotal)

                     const message = MessagingService.generateBookingMessage(
                            {
                                   schedule: { startTime: booking.startTime, courtName: booking.court.name },
                                   pricing: { balance },
                                   client: { name: clientName }
                            },
                            'reminder'
                     )
                     await MessagingService.sendWhatsApp(phone, message)

                     // Mark as sent
                     await prisma.booking.update({
                            where: { id_clubId: { id: bookingId, clubId } },
                            data: { reminderSent: true }
                     })

                     return { success: true }
              } else {
                     return { success: false, error: 'El cliente no tiene un teléfono registrado' }
              }
       } catch (error) {
              return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
       }
}
