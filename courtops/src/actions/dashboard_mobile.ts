'use server'

import { startOfDay, endOfDay, format } from 'date-fns'
import { getCajaStats } from './cash-register'
import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'
import { nowInArg, fromUTC } from '@/lib/date-utils' // Added fromUTC!

export async function getMobileDashboardData() {
       try {
              const clubId = await getCurrentClubId()
              const today = startOfDay(nowInArg())
              const endToday: Date = endOfDay(nowInArg())

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
                            items: true,
                            client: true
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
              const nowReal = new Date() // actual UTC epoch for comparing with DB dates
              const nowHours = nowArg.getHours() + nowArg.getMinutes() / 60
              const FIXED_SLOTS = [14, 15.5, 17, 18.5, 20, 21.5, 23]

              // OPTIMIZATION: Group bookings by courtId to avoid O(N*M) lookups
              const bookingsByCourt = new Map<number, typeof bookingsToday>()
              for (const b of bookingsToday) {
                     const existing = bookingsByCourt.get(b.courtId) || []
                     existing.push(b)
                     bookingsByCourt.set(b.courtId, existing)
              }

              const currentCourts = courts.map(court => {
                     const courtBookings = bookingsByCourt.get(court.id) || []

                     // Find booking happening NOW (compare with real UTC time, not zoned time)
                     const currentBooking = courtBookings.find(b =>
                            b.startTime <= nowReal &&
                            b.endTime > nowReal
                     )

                     let status = currentBooking ? 'En Juego' : 'Disponible'
                     const statusColor = currentBooking ? 'text-brand-blue' : 'text-brand-green'

                     // Calculate Next Available Slot logic
                     let nextAvailableSlot = null

                     // Check today's slots
                     for (const slot of FIXED_SLOTS) {
                            // Calculate slot end time (slot start + 1.5)
                            // const slotEnd = slot + 1.5 // Not used in original logic

                            // A slot is potentially available if it hasn't started yet (or strictly future)
                            if (slot > nowHours) {
                                   // Check flexible overlap using strict Club Time comparison
                                   const isBooked = courtBookings.some(b => {
                                          const bLocal = fromUTC(b.startTime)
                                          const bTime = bLocal.getHours() + bLocal.getMinutes() / 60
                                          return Math.abs(bTime - slot) < 0.1
                                   })

                                   if (!isBooked) {
                                          const h = Math.floor(slot)
                                          const m = (slot % 1) * 60

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
                            // Show end time for current game
                            const endLocal = fromUTC(currentBooking.endTime)
                            timeDisplay = `Hasta ${format(endLocal, 'HH:mm')}`
                            // Check payment
                            const paid = currentBooking.transactions.reduce((s, t) => s + t.amount, 0)
                            const total = currentBooking.price + currentBooking.items.reduce((s, i) => s + (i.unitPrice * i.quantity), 0)
                            if (total - paid <= 0) {
                                   status += ' · Pagado'
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

              const timeline = bookingsToday
                     .filter(b => b.startTime >= nowArg)
                     .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
                     .map(b => {
                            const itemsTotal = b.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
                            const total = b.price + itemsTotal
                            const paid = b.transactions.reduce((sum, t) => sum + t.amount, 0)
                            const balance = total - paid

                            // Formatting time with consistent localized format
                            const localDate = fromUTC(b.startTime)
                            const timeStr = format(localDate, 'HH:mm')

                            return {
                                   id: b.id,
                                   time: timeStr,
                                   courtName: courts.find(c => c.id === b.courtId)?.name || 'Cancha',
                                   title: b.client?.name || b.guestName || 'Reserva',
                                   status: b.status,
                                   paymentStatus: balance <= 0 ? 'paid' : (paid > 0 ? 'partial' : 'unpaid'),
                                   price: total,
                                   balance
                            }
                     })

              // 6. Hourly occupancy for today
              const openHour = club?.openTime ? parseInt(club.openTime.split(':')[0]) : 8
              const closeHour = club?.closeTime ? parseInt(club.closeTime.split(':')[0]) : 24
              const totalCourtsCount = courts.length || 1
              const hourlyOccupancy: { hour: number; pct: number }[] = []
              for (let h = openHour; h < closeHour; h++) {
                     let occupied = 0
                     for (const b of bookingsToday) {
                            const bStart = fromUTC(b.startTime)
                            const bEnd = fromUTC(b.endTime)
                            const slotStart = new Date(today)
                            slotStart.setHours(h, 0, 0, 0)
                            const slotEnd = new Date(today)
                            slotEnd.setHours(h + 1, 0, 0, 0)
                            if (bStart < slotEnd && bEnd > slotStart) occupied++
                     }
                     hourlyOccupancy.push({ hour: h, pct: Math.round((occupied / totalCourtsCount) * 100) })
              }

              // 7. Debts - computed from unpaid bookings (no balance field on Client model)
              // Find clients who owe money based on their unpaid bookings
              const unpaidBookings = await prisma.booking.findMany({
                     where: {
                            clubId,
                            status: { not: 'CANCELED' },
                            paymentStatus: { in: ['UNPAID', 'PARTIAL'] },
                     },
                     include: {
                            client: { select: { id: true, name: true, phone: true } },
                            transactions: true,
                            items: true,
                     }
              })

              const clientDebts = new Map<number, { name: string; phone: string; total: number }>()
              for (const ub of unpaidBookings) {
                     if (!ub.client) continue
                     const itemsTotal = ub.items.reduce((sum: number, item: { unitPrice: number; quantity: number }) => sum + (item.unitPrice * item.quantity), 0)
                     const totalCost = ub.price + itemsTotal
                     const totalPaid = ub.transactions.reduce((sum: number, t: { amount: number }) => sum + t.amount, 0)
                     const debt = totalCost - totalPaid
                     if (debt > 0) {
                            const existing = clientDebts.get(ub.client.id)
                            if (existing) {
                                   existing.total += debt
                            } else {
                                   clientDebts.set(ub.client.id, { name: ub.client.name, phone: ub.client.phone, total: debt })
                            }
                     }
              }

              const debtClients = Array.from(clientDebts.values()).sort((a, b) => b.total - a.total).slice(0, 5)
              const totalDebtAmount = debtClients.reduce((sum: number, c) => sum + c.total, 0)
              const debts = debtClients.length > 0 ? {
                     totalCount: debtClients.length,
                     totalAmount: totalDebtAmount,
                     topDebtors: debtClients.map(c => ({ name: c.name, total: c.total, phone: c.phone }))
              } : null

              // 8. End-of-day summary
              const totalBookingsCount: number = bookingsToday.length
              const totalRevenue: number = bookingsToday.reduce((sum: number, b) => sum + b.transactions.reduce((s: number, t: { amount: number }) => s + t.amount, 0), 0)
              const possibleSlots = totalCourtsCount * (closeHour - openHour)
              const occupancyPct = possibleSlots > 0 ? Math.round((totalBookingsCount / possibleSlots) * 100) : 0
              const endOfDaySummary = {
                     totalBookings: totalBookingsCount,
                     totalRevenue,
                     occupancy: occupancyPct
              }

              return {
                     caja,
                     receivables,
                     courts: currentCourts,
                     timeline,
                     alerts,
                     hourlyOccupancy,
                     debts,
                     endOfDay: endOfDaySummary,
                     userName: 'Usuario',
                     clubSlug: club?.slug,
                     debugClubId: clubId,
                     features: {
                            hasKiosco: club?.hasKiosco,
                            hasTournaments: club?.hasTournaments,
                            hasAdvancedReports: club?.hasAdvancedReports
                     }
              }

       } catch (error: unknown) {
              const err = error as { message?: string; digest?: string }
              if (err?.message === 'NEXT_REDIRECT' || err?.digest?.startsWith('NEXT_REDIRECT')) {
                     throw error
              }
              console.error("[getMobileDashboardData] Error:", error)
              return null
       }
}

