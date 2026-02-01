'use server'

import { fromUTC, DEFAULT_TIMEZONE } from '@/lib/date-utils'
import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export interface NotificationItem {
       id: string
       type: 'payment' | 'booking' | 'stock' | 'message'
       title: string
       description: string
       time: string
       isRead: boolean
       date: Date
}

export async function getNotifications(): Promise<NotificationItem[]> {
       try {
              const clubId = await getCurrentClubId()
              if (!clubId) return []

              const notifications: NotificationItem[] = []

              // 1. Recent Bookings (Last 48h)
              const recentBookings = await prisma.booking.findMany({
                     where: {
                            clubId,
                            createdAt: {
                                   gte: new Date(Date.now() - 48 * 60 * 60 * 1000)
                            }
                     },
                     include: {
                            client: true,
                            court: true
                     },
                     orderBy: { createdAt: 'desc' },
                     take: 10
              })

              recentBookings.forEach(booking => {
                     // Convert stored UTC time to Club's local time for display
                     const localStartTime = fromUTC(booking.startTime)
                     const formattedTime = format(localStartTime, 'dd/MM HH:mm', { locale: es })

                     let title = 'Nueva Reserva'
                     // Use 'court.name' directly
                     let desc = `${booking.client?.name || 'Cliente'} reservó ${booking.court.name} para el ${formattedTime}`

                     if (booking.status === 'CANCELED') {
                            title = 'Reserva Cancelada'
                            desc = `La reserva de ${booking.client?.name || 'Cliente'} para el ${formattedTime} ha sido cancelada.`
                     }

                     notifications.push({
                            id: `booking-${booking.id}`,
                            type: 'booking',
                            title,
                            description: desc,
                            time: formatDistanceToNow(booking.createdAt, { addSuffix: true, locale: es }),
                            isRead: false,
                            date: booking.createdAt
                     })
              })

              // 2. Recent Payments (Transactions) (Last 48h)
              const recentTransactions = await prisma.transaction.findMany({
                     where: {
                            cashRegister: {
                                   clubId
                            },
                            type: 'INCOME',
                            createdAt: {
                                   gte: new Date(Date.now() - 48 * 60 * 60 * 1000)
                            }
                     },
                     include: {
                            client: true,
                            cashRegister: true
                     },
                     orderBy: { createdAt: 'desc' },
                     take: 10
              })

              recentTransactions.forEach(tx => {
                     notifications.push({
                            id: `tx-${tx.id}`,
                            type: 'payment',
                            title: 'Pago Recibido',
                            description: `Se recibió un pago de $${tx.amount} (${tx.method}) de ${tx.client?.name || 'Anónimo'}.`,
                            time: formatDistanceToNow(tx.createdAt, { addSuffix: true, locale: es }),
                            isRead: false,
                            date: tx.createdAt
                     })
              })

              // 3. Low Stock Alerts
              const allProducts = await prisma.product.findMany({
                     where: {
                            clubId,
                            isActive: true
                     }
              })

              const lowStockProducts = allProducts.filter(p => p.stock <= p.minStock)

              lowStockProducts.forEach(prod => {
                     notifications.push({
                            id: `stock-${prod.id}`,
                            type: 'stock',
                            title: 'Stock Bajo',
                            description: `Quedan ${prod.stock} unidades de "${prod.name}" (Mínimo: ${prod.minStock}).`,
                            time: 'Ahora',
                            isRead: false,
                            date: new Date()
                     })
              })

              // Sort all by date desc
              const sorted = notifications.sort((a, b) => b.date.getTime() - a.date.getTime())
              return JSON.parse(JSON.stringify(sorted))

       } catch (error: any) {
              if (error.digest?.startsWith('NEXT_REDIRECT')) throw error;
              console.error('Error fetching notifications:', error)
              return []
       }
}
