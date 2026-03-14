'use server'

import { fromUTC } from '@/lib/date-utils'
import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

function safeSerialize<T>(data: T): T {
       return JSON.parse(JSON.stringify(data))
}

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
              const session = await getServerSession(authOptions)

              if (!session?.user?.email) return []

              const user = await prisma.user.findUnique({
                     where: { email: session.user.email },
                     select: { lastNotificationsReadAt: true }
              })

              const lastRead = user?.lastNotificationsReadAt || new Date(0)
              const notifications: NotificationItem[] = []

              // 1. Recent Bookings
              const recentBookings = await prisma.booking.findMany({
                     where: {
                            clubId,
                            createdAt: { gte: new Date(Date.now() - 48 * 60 * 60 * 1000) }
                     },
                     include: { client: true, court: true },
                     orderBy: { createdAt: 'desc' },
                     take: 10
              })

              recentBookings.forEach(booking => {
                     const localStartTime = fromUTC(booking.startTime)
                     const formattedTime = format(localStartTime, 'dd/MM HH:mm', { locale: es })
                     const title = booking.status === 'CANCELED' ? 'Reserva Cancelada' : 'Nueva Reserva'
                     const desc = booking.status === 'CANCELED'
                            ? `La reserva de ${booking.client?.name || 'Cliente'} para el ${formattedTime} ha sido cancelada.`
                            : `${booking.client?.name || 'Cliente'} reservo ${booking.court.name} para el ${formattedTime}`

                     notifications.push({
                            id: `booking-${booking.id}`,
                            type: 'booking',
                            title,
                            description: desc,
                            time: formatDistanceToNow(booking.createdAt, { addSuffix: true, locale: es }),
                            isRead: booking.createdAt <= lastRead,
                            date: booking.createdAt
                     })
              })

              // 2. Recent Payments
              const recentTransactions = await prisma.transaction.findMany({
                     where: {
                            cashRegister: { clubId },
                            type: 'INCOME',
                            createdAt: { gte: new Date(Date.now() - 48 * 60 * 60 * 1000) }
                     },
                     include: { client: true },
                     orderBy: { createdAt: 'desc' },
                     take: 10
              })

              recentTransactions.forEach(tx => {
                     notifications.push({
                            id: `tx-${tx.id}`,
                            type: 'payment',
                            title: 'Pago Recibido',
                            description: `Se recibio un pago de $${tx.amount} (${tx.method}) de ${tx.client?.name || tx.description?.split(' Pago de: ')[1] || tx.description || 'Anonimo'}.`,
                            time: formatDistanceToNow(tx.createdAt, { addSuffix: true, locale: es }),
                            isRead: tx.createdAt <= lastRead,
                            date: tx.createdAt
                     })
              })

              // 3. Low Stock Alerts
              const allProducts = await prisma.product.findMany({
                     where: { clubId, isActive: true }
              }).catch(() => [])

              const lowStockProducts = allProducts.filter(p => p.stock <= p.minStock)

              lowStockProducts.forEach(prod => {
                     const isRead = lastRead > new Date(Date.now() - 2 * 60 * 60 * 1000)

                     notifications.push({
                            id: `stock-${prod.id}`,
                            type: 'stock',
                            title: 'Stock Bajo',
                            description: `Quedan ${prod.stock} unidades de "${prod.name}" (Minimo: ${prod.minStock}).`,
                            time: 'Critico',
                            isRead: isRead,
                            date: new Date()
                     })
              })

              const sorted = notifications.sort((a, b) => b.date.getTime() - a.date.getTime())
              return safeSerialize(sorted)

       } catch (error: unknown) {
              const err = error as { digest?: string }
              if (err.digest?.startsWith('NEXT_REDIRECT')) throw error;
              console.error("[CRITICAL] getNotifications failed:", error)
              return []
       }
}

export async function markAllAsRead() {
       try {
              const session = await getServerSession(authOptions)
              if (!session?.user?.email) return { success: false }

              // Update lastNotificationsReadAt field on User model
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await (prisma.user as any).update({
                     where: { email: session.user.email },
                     data: { lastNotificationsReadAt: new Date() }
              })

              return { success: true }
       } catch (error) {
              console.error("Error marking as read:", error)
              return { success: false }
       }
}

