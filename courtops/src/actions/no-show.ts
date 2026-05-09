'use server'

import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'
import { logAction } from '@/lib/logger'
import { revalidatePath } from 'next/cache'
import { BookingService } from '@/services/booking.service'
import { canTransitionBookingStatus } from '@/lib/booking-status'

/**
 * Manually mark a booking as NO_SHOW.
 * Only bookings in an active playable state can be marked.
 */
export async function markNoShow(bookingId: number) {
       try {
              const clubId = await getCurrentClubId()
              const booking = await prisma.booking.findFirst({
                     where: { id: bookingId, clubId },
                     select: { id: true, status: true }
              })

              if (!booking) return { success: false, error: 'Reserva no encontrada' }
              if (!canTransitionBookingStatus(booking.status, 'NO_SHOW')) {
                     return { success: false, error: 'La reserva no puede marcarse como no-show desde su estado actual' }
              }

              await BookingService.markNoShow(bookingId, clubId, 'MANUAL_NO_SHOW')

              revalidatePath('/')
              return { success: true }
       } catch (error: unknown) {
              console.error('[markNoShow] Error:', error)
              return { success: false, error: error instanceof Error ? error.message : 'Error al marcar como no-show' }
       }
}

/**
 * Revert a NO_SHOW booking back to CONFIRMED.
 */
export async function revertNoShow(bookingId: number) {
       try {
              const clubId = await getCurrentClubId()
              const booking = await prisma.booking.findFirst({
                     where: { id: bookingId, clubId },
                     include: { items: true }
              })

              if (!booking) return { success: false, error: 'Reserva no encontrada' }
              if (booking.status !== 'NO_SHOW') return { success: false, error: 'La reserva no estÃ¡ marcada como no-show' }

              for (const item of booking.items) {
                     if (item.productId) {
                            await prisma.product.update({
                                   where: { id_clubId: { id: item.productId, clubId } },
                                   data: { stock: { decrement: item.quantity } }
                            })
                     }
              }

              await prisma.booking.update({
                     where: { id_clubId: { id: bookingId, clubId } },
                     data: { status: 'CONFIRMED' }
              })

              await logAction({
                     clubId,
                     action: 'UPDATE',
                     entity: 'BOOKING',
                     entityId: bookingId.toString(),
                     details: { type: 'REVERT_NO_SHOW' }
              })

              revalidatePath('/')
              return { success: true }
       } catch (error: unknown) {
              return { success: false, error: error instanceof Error ? error.message : 'Error al revertir no-show' }
       }
}

/**
 * Get no-show stats for a club.
 */
export async function getNoShowStats() {
       try {
              const clubId = await getCurrentClubId()

              const thirtyDaysAgo = new Date()
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

              const [totalNoShows, noShowsByClient] = await Promise.all([
                     prisma.booking.count({
                            where: {
                                   clubId,
                                   status: 'NO_SHOW',
                                   startTime: { gte: thirtyDaysAgo }
                            }
                     }),
                     prisma.booking.groupBy({
                            by: ['clientId'],
                            where: {
                                   clubId,
                                   status: 'NO_SHOW',
                                   startTime: { gte: thirtyDaysAgo },
                                   clientId: { not: null }
                            },
                            _count: true,
                            orderBy: { _count: { clientId: 'desc' } },
                            take: 10
                     })
              ])

              const clientIds = noShowsByClient.map(n => n.clientId).filter(Boolean) as number[]
              const clients = await prisma.client.findMany({
                     where: { id: { in: clientIds } },
                     select: { id: true, name: true, phone: true }
              })

              const topOffenders = noShowsByClient.map(n => {
                     const client = clients.find(c => c.id === n.clientId)
                     return {
                            clientId: n.clientId,
                            clientName: client?.name || 'Desconocido',
                            clientPhone: client?.phone || '',
                            count: n._count
                     }
              })

              return {
                     success: true,
                     totalNoShows,
                     topOffenders
              }
       } catch (error: unknown) {
              return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
       }
}
