'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { getOrCreateTodayCashRegister, getCurrentClubId } from '@/lib/tenant'

/**
 * Enterprise-grade Atomic Payment Processor
 * 
 * garantiza atomicidad: O todo se guarda (pago + transacción), o nada.
 * Evita inconsistencias de datos.
 * 
 * REQUIERE: Base de datos actualizada con tabla Transaction completa.
 */
export async function processPaymentAtomic(
       bookingId: number | string,
       amount: number,
       method: string,
       userId: string = 'system' // Should come from session
) {
       console.log(`💳 [AtomicPayment] Starting payment for Booking #${bookingId}`)
       const id = Number(bookingId)
       if (isNaN(id)) return { success: false, error: 'ID de reserva inválido' }

       try {
              const clubId = await getCurrentClubId()

              // INICIO TRANSACCIÓN ATÓMICA
              const result = await prisma.$transaction(async (tx) => {
                     // 1. Fetch Booking + Bloqueo
                     const booking = await tx.booking.findFirst({
                            where: { id, clubId },
                            include: { transactions: true }
                     })

                     if (!booking) throw new Error('BookingNotFoundError')

                     // 2. Obtener ITEMS para calcular total con precisión
                     const bookingItems = await tx.bookingItem.findMany({
                            where: { bookingId: id }
                     })

                     // 3. Obtener CAJA (Necesitamos el ID de la caja del día)
                     const register = await getOrCreateTodayCashRegister(booking.clubId)

                     // 4. Cálculos de Saldo
                     const previousPaid = booking.transactions.reduce((sum, t) => sum + t.amount, 0)
                     const newTotalPaid = previousPaid + amount

                     const itemsTotal = bookingItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
                     const totalCost = booking.price + itemsTotal

                     // 5. Crear Registro Financiero (Transaction)
                     const transaction = await tx.transaction.create({
                            data: {
                                   cashRegisterId: register.id,
                                   bookingId: id,
                                   amount,
                                   method,
                                   type: 'INCOME',
                                   category: 'BOOKING_PAYMENT',
                                   description: `Pago atómico Reserva #${id}`
                            }
                     })

                     // 6. Actualizar Booking
                     const newStatus = newTotalPaid >= totalCost ? 'PAID' : 'PARTIAL'
                     const updatedBooking = await tx.booking.update({
                            where: { id },
                            data: {
                                   paymentStatus: newStatus as any,
                                   status: 'CONFIRMED'
                            }
                     })

                     return { booking: updatedBooking, transaction }
              })

              console.log(`✅ [AtomicPayment] Success! Transaction ID: ${result.transaction.id}`)
              revalidatePath('/')
              return { success: true, booking: result.booking, warning: undefined }

       } catch (error: any) {
              console.error(`❌ [AtomicPayment] Transaction Rolled Back:`, error.message)

              // Re-lanzar errores conocidos para que el manejador superior decida si hacer fallback
              if (error.message.includes('bookingId') || error.message.includes('does not exist') || error.code === 'P2025') {
                     throw new Error('DB_SCHEMA_ERROR') // Señal para activar Fallback
              }

              if (error.message === 'BookingNotFoundError') return { success: false, error: 'Reserva no encontrada' }

              return { success: false, error: error.message || 'Error procesando el pago' }
       }
}
