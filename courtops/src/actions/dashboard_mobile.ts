
import { startOfDay, endOfDay, format } from 'date-fns'
import { getCajaStats } from './caja'
import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'
import { nowInArg } from '@/lib/date-utils'

export async function getMobileDashboardData() {
       try {
              const clubId = await getCurrentClubId()
              const today = startOfDay(nowInArg())
              const endToday = endOfDay(nowInArg())

              // 1. Caja Stats
              const caja = await getCajaStats()

              // 2. Receivables (A Cobrar) - All confirmed bookings with outstanding balance
              // This might be heavy if we check ALL time. Let's limit to recent/future or just today?
              // Usually "A Cobrar" implies debt. If we want just today's debt:
              const bookingsToday = await prisma.booking.findMany({
                     where: {
                            clubId,
                            startTime: { gte: today, lte: endToday },
                            status: { not: 'CANCELED' }
                     },
                     include: {
                            transactions: true,
                            items: true
                     }
              })

              let receivables = 0
              for (const b of bookingsToday) {
                     const itemsTotal = b.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
                     const total = b.price + itemsTotal
                     const paid = b.transactions.reduce((sum, t) => sum + t.amount, 0)
                     const balance = total - paid
                     if (balance > 0) receivables += balance
              }

              // 3. Current Courts Status
              const courts = await prisma.court.findMany({
                     where: { clubId, isActive: true },
                     orderBy: { sortOrder: 'asc' }
              })

              const now = nowInArg()
              const currentCourts = courts.map(court => {
                     // Find booking happening NOW
                     const currentBooking = bookingsToday.find(b =>
                            b.courtId === court.id &&
                            b.startTime <= now &&
                            b.endTime > now
                     )

                     let status = 'Disponible'
                     let statusColor = 'text-brand-green'
                     let info = '1.5h' // Default duration or something?

                     // Find NEXT booking if available
                     const nextBooking = bookingsToday.find(b =>
                            b.courtId === court.id &&
                            b.startTime > now
                     )

                     let timeDisplay = nextBooking ? `${format(nextBooking.startTime, 'HH:mm')}` : 'Libre'

                     if (currentBooking) {
                            status = 'En Juego'
                            statusColor = 'text-brand-blue'
                            timeDisplay = `${format(currentBooking.startTime, 'HH:mm')} - ${format(currentBooking.endTime, 'HH:mm')}`

                            // Check payment
                            const paid = currentBooking.transactions.reduce((s, t) => s + t.amount, 0)
                            const total = currentBooking.price + currentBooking.items.reduce((s, i) => s + (i.unitPrice * i.quantity), 0)
                            if (total - paid <= 0) {
                                   status += ' • Pagado'
                            }
                     }

                     return {
                            id: court.id,
                            name: court.name,
                            surface: court.surface,
                            status,
                            statusColor,
                            timeDisplay,
                            isFree: !currentBooking,
                            currentBookingId: currentBooking?.id
                     }
              })

              // 4. Alerts (Recycle logic or simplified)
              const alerts = []
              // Pending payments from today
              const pendingBookings = bookingsToday.filter(b => {
                     const itemsTotal = b.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
                     const total = b.price + itemsTotal
                     const paid = b.transactions.reduce((sum, t) => sum + t.amount, 0)
                     return (total - paid) > 0 && b.status === 'CONFIRMED'
              })

              if (pendingBookings.length > 0) {
                     alerts.push({
                            type: 'warning',
                            title: 'Cobros Pendientes',
                            message: `${pendingBookings.length} reservas sin pagar hoy`
                     })
              }

              return {
                     caja,
                     receivables,
                     courts: currentCourts,
                     alerts,
                     userName: 'Usuario' // We can get this from session in component
              }

       } catch (error) {
              console.error(error)
              return null
       }
}
