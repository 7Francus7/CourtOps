'use server'

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

              // 2. Receivables (A Cobrar)
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

              const nowArg = nowInArg()
              const nowHours = nowArg.getHours() + nowArg.getMinutes() / 60
              const FIXED_SLOTS = [14, 15.5, 17, 18.5, 20, 21.5, 23]

              const currentCourts = courts.map(court => {
                     // Find booking happening NOW
                     const currentBooking = bookingsToday.find(b =>
                            b.courtId === court.id &&
                            b.startTime <= nowArg &&
                            b.endTime > nowArg
                     )

                     let status = currentBooking ? 'En Juego' : 'Disponible'
                     let statusColor = currentBooking ? 'text-brand-blue' : 'text-brand-green'

                     // Calculate Next Available Slot logic
                     let nextAvailableSlot = null

                     // Check today's slots
                     for (const slot of FIXED_SLOTS) {
                            // Calculate slot end time (slot start + 1.5)
                            const slotEnd = slot + 1.5

                            // A slot is potentially available if it hasn't finished yet
                            if (slotEnd > nowHours) {
                                   // Check if there's a booking for this slot
                                   const slotTimeDate = new Date(today)
                                   const h = Math.floor(slot)
                                   const m = (slot % 1) * 60
                                   slotTimeDate.setHours(h, m, 0, 0)

                                   // Check flexible overlap (start time match)
                                   const isBooked = bookingsToday.some(b =>
                                          Math.abs(b.startTime.getTime() - slotTimeDate.getTime()) < 60000 &&
                                          b.courtId === court.id
                                   )

                                   if (!isBooked) {
                                          nextAvailableSlot = {
                                                 time: `${h.toString().padStart(2, '0')}:${m === 30 ? '30' : '00'}`,
                                                 val: slot
                                          }
                                          break
                                   }
                            }
                     }

                     let proposalDate = today
                     let proposalTime = "14:00"
                     let timeDisplay = ""

                     if (nextAvailableSlot) {
                            timeDisplay = `${nextAvailableSlot.time}`
                            proposalTime = nextAvailableSlot.time
                     } else {
                            // Tomorrow
                            timeDisplay = "Mañana 14:00"
                            // Add 1 day
                            const tmr = new Date(today)
                            tmr.setDate(tmr.getDate() + 1)
                            proposalDate = tmr
                            proposalTime = "14:00"
                     }

                     if (currentBooking) {
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
                            currentBookingId: currentBooking?.id,
                            proposal: {
                                   date: format(proposalDate, 'yyyy-MM-dd'),
                                   time: proposalTime
                            }
                     }
              })

              // 4. Alerts
              const alerts = []
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

              // 5. Club Slug
              const club = await prisma.club.findUnique({
                     where: { id: clubId }
              })

              return {
                     caja,
                     receivables,
                     courts: currentCourts,
                     alerts,
                     userName: 'Usuario',
                     clubSlug: club?.slug,
                     debugClubId: clubId
              }

       } catch (error: any) {
              if (error?.message === 'NEXT_REDIRECT' || error?.digest?.startsWith('NEXT_REDIRECT')) {
                     throw error
              }
              console.error("[getMobileDashboardData] Error:", error)
              return null
       }
}
