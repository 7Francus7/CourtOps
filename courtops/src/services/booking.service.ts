import prisma from '@/lib/db'
import { getEffectivePrice, getOrCreateTodayCashRegister } from '@/lib/tenant'
import { v4 as uuidv4 } from 'uuid'
import { fromUTC } from '@/lib/date-utils'
import { MessagingService } from '@/lib/messaging'
import { logAction } from '@/lib/logger'
import { pusherServer } from '@/lib/pusher'
import { processPaymentAtomic } from '@/actions/payment.atomic'
import { getMatchingWaitingUsers } from '@/actions/waitingList'

export type CreateBookingDTO = {
       clubId: string
       clientName: string
       clientPhone: string
       clientEmail?: string
       courtId: number
       startTime: Date
       endTime?: Date // Optional override
       paymentStatus?: 'UNPAID' | 'PAID' | 'PARTIAL' | 'SPLIT' // Expanded status
       status?: 'PENDING' | 'CONFIRMED'
       notes?: string
       isMember?: boolean
       recurringEndDate?: Date | null
       advancePaymentAmount?: number
       payments?: { method: string; amount: number }[]
       totalPrice?: number
}

export class BookingService {
       /**
        * Creates a new booking (or set of recurring bookings)
        * Encapsulates validation, pricing, transaction creation, and notifications.
        */
       static async create(data: CreateBookingDTO) {
              const { clubId } = data

              // 1. Fetch Club Configuration
              const clubConfig = await prisma.club.findUnique({
                     where: { id: clubId },
                     select: {
                            slotDuration: true,
                            openTime: true,
                            closeTime: true,
                     },
              })

              if (!clubConfig) throw new Error('Club no encontrado')

              const openTimeStr = clubConfig.openTime || '08:00'
              const closeTimeStr = clubConfig.closeTime || '23:00'

              const court = await prisma.court.findUnique({
                     where: { id: data.courtId }
              })

              const slotDuration = (court as any)?.duration || clubConfig.slotDuration || 90

              // 2. Prepare Booking Dates (Single or Recurring)
              const datesToBook: Date[] = []
              const startDate = new Date(data.startTime)
              datesToBook.push(startDate)

              if (data.recurringEndDate) {
                     const endDate = new Date(data.recurringEndDate)
                     let nextDate = new Date(startDate)
                     nextDate.setDate(nextDate.getDate() + 7)

                     // Safety Cap: 52 weeks
                     let safety = 0
                     while (nextDate <= endDate && safety < 52) {
                            datesToBook.push(new Date(nextDate))
                            nextDate.setDate(nextDate.getDate() + 7)
                            safety++
                     }
              }

              // 3. Validate Opening Hours (Check only the first date for efficiency)
              this.validateOpeningHours(datesToBook[0], openTimeStr, closeTimeStr)

              // 4. Find or Create Client
              let client = await this.resolveClient(clubId, data)

              // Check Membership for automatic discounts
              const isMember = client.membershipStatus === 'ACTIVE'
              let discountPercent = 0
              if (isMember) {
                     const activeMembership = await prisma.membership.findFirst({
                            where: {
                                   clientId: client.id,
                                   status: 'ACTIVE',
                                   endDate: { gte: new Date() },
                            },
                            include: { plan: true },
                            orderBy: { endDate: 'desc' },
                     })
                     if (activeMembership) {
                            discountPercent = activeMembership.plan.discountPercent
                     }
              }

              // 5. Process Bookings (Overlaps & Pricing)
              const recurringId = datesToBook.length > 1 ? uuidv4() : null
              const bookingsPayload: any[] = []

              for (let i = 0; i < datesToBook.length; i++) {
                     const date = datesToBook[i]
                     const requestEnd = new Date(date)
                     requestEnd.setMinutes(requestEnd.getMinutes() + slotDuration)

                     // Check Overlap
                     await this.checkOverlap(clubId, data.courtId, date, requestEnd)

                     // Calculate Price
                     const calculatedPrice = await getEffectivePrice(clubId, date, slotDuration, isMember, discountPercent)
                     // Use override if provided, otherwise calculated
                     const price = data.totalPrice !== undefined ? data.totalPrice : calculatedPrice

                     // Payment Logic
                     // Apply payments only to the FIRST booking in the chain
                     let paymentStatus = 'UNPAID'
                     let paymentMethod = null
                     let transactionAmount = 0
                     let paymentsToRecord: { method: string; amount: number }[] = []

                     if (i === 0) {
                            // New Split Payment Logic
                            if (data.payments && data.payments.length > 0) {
                                   paymentsToRecord = data.payments
                                   const totalPaid = paymentsToRecord.reduce((sum, p) => sum + p.amount, 0)
                                   paymentStatus = totalPaid >= price ? 'PAID' : (totalPaid > 0 ? 'PARTIAL' : 'UNPAID')
                                   paymentMethod = 'MIXED'
                            } else {
                                   // Legacy Logic
                                   paymentStatus = data.paymentStatus || 'UNPAID'
                                   if (paymentStatus === 'PAID') {
                                          paymentMethod = 'CASH'
                                          transactionAmount = price
                                          paymentsToRecord.push({ method: 'CASH', amount: price })
                                   } else if (paymentStatus === 'PARTIAL') {
                                          paymentMethod = 'CASH'
                                          transactionAmount = data.advancePaymentAmount || 0
                                          paymentsToRecord.push({ method: 'CASH', amount: transactionAmount })

                                          if (transactionAmount >= price) {
                                                 paymentStatus = 'PAID'
                                          }
                                   }
                            }
                     }

                     bookingsPayload.push({
                            clubId,
                            courtId: data.courtId,
                            clientId: client.id,
                            startTime: date,
                            endTime: requestEnd,
                            price,
                            status: data.status || 'CONFIRMED',
                            paymentStatus,
                            paymentMethod,
                            recurringId,
                            paymentsToRecord, // internal helper
                     })
              }

              // 6. Persist to Database (Transaction)
              const createdBookings = []

              // We execute sequentially to handle payments correctly per booking ID
              for (const payload of bookingsPayload) {
                     const { paymentsToRecord, ...bookingData } = payload

                     const booking = await prisma.booking.create({
                            data: {
                                   ...bookingData,
                                   paymentStatus: bookingData.paymentStatus as any
                            }
                     })
                     createdBookings.push(booking)

                     // Payment Transactions
                     if (paymentsToRecord && paymentsToRecord.length > 0) {
                            const register = await getOrCreateTodayCashRegister(clubId)

                            for (const payment of paymentsToRecord) {
                                   if (payment.amount > 0) {
                                          await prisma.transaction.create({
                                                 data: {
                                                        cashRegisterId: register.id,
                                                        type: 'INCOME',
                                                        category: 'BOOKING',
                                                        amount: payment.amount,
                                                        method: payment.method,
                                                        description: `Pago Reserva #${booking.id} - ${client.name}`,
                                                        bookingId: booking.id,
                                                        clientId: client.id
                                                 }
                                          })
                                   }
                            }
                     }
              }

              // 7. Side Effects (Async)
              const primaryBooking = createdBookings[0]

              // Audit Log
              await logAction({
                     clubId,
                     action: 'CREATE',
                     entity: 'BOOKING',
                     entityId: recurringId ? `RECURRING-${recurringId}` : primaryBooking.id.toString(),
                     details: {
                            courtId: data.courtId,
                            count: createdBookings.length,
                            client: client.name,
                            isRecurring: !!recurringId
                     }
              })

              // Real-time Update (Fire & Forget)
              try {
                     // pusherServer may be a stub during build, ensure safe call
                     const triggerResult = pusherServer.trigger(`club-${clubId}`, 'booking-update', {
                            action: 'create',
                            booking: primaryBooking
                     })
                     if (triggerResult && typeof triggerResult.catch === 'function') {
                            triggerResult.catch((err: any) => console.error('Pusher Error:', err))
                     }
              } catch (e) { console.error(e) }

              // WhatsApp Notification (Fire & Forget)
              try {
                     const initialData = bookingsPayload[0]
                     const paid = initialData.paymentsToRecord?.reduce((s: any, p: any) => s + p.amount, 0) || 0
                     const bal = Math.max(0, initialData.price - paid)

                     const wrapper = {
                            schedule: {
                                   startTime: primaryBooking.startTime,
                                   courtName: `Cancha ${data.courtId}` // Ideally fetch court name
                            },
                            client: { name: client.name },
                            pricing: { balance: bal }
                     }
                     const msg = MessagingService.generateBookingMessage(wrapper, 'new_booking')
                     MessagingService.sendWhatsApp(data.clientPhone, msg).catch(console.error)
              } catch (e) {
                     console.error("WhatsApp Error:", e)
              }

              return {
                     success: true,
                     count: createdBookings.length,
                     booking: primaryBooking,
                     client
              }
       }

       // --- Private Helpers ---

       private static async resolveClient(clubId: string, data: CreateBookingDTO) {
              let client = await prisma.client.findFirst({
                     where: { clubId, phone: data.clientPhone }
              })

              if (!client) {
                     client = await prisma.client.create({
                            data: {
                                   clubId,
                                   name: data.clientName,
                                   phone: data.clientPhone,
                                   email: data.clientEmail,
                                   membershipStatus: data.isMember ? 'ACTIVE' : 'NONE'
                            }
                     })
              } else {
                     // Update if needed
                     const shouldUpdate =
                            (data.clientEmail && data.clientEmail !== client.email) ||
                            (data.clientName && data.clientName !== client.name) ||
                            (data.isMember && client.membershipStatus !== 'ACTIVE')

                     if (shouldUpdate) {
                            client = await prisma.client.update({
                                   where: { id: client.id },
                                   data: {
                                          email: data.clientEmail || client.email,
                                          name: data.clientName,
                                          membershipStatus: data.isMember ? 'ACTIVE' : client.membershipStatus
                                   }
                            })
                     }
              }
              return client
       }

       private static async validateOpeningHours(date: Date, openStr: string, closeStr: string) {
              const [openH, openM] = openStr.split(':').map(Number)
              const [closeH, closeM] = closeStr.split(':').map(Number)

              // Use helper to get Argentina hour/min
              const argDate = fromUTC(date)
              const argH = argDate.getUTCHours()
              const argM = argDate.getUTCMinutes()

              const startMinutes = openH * 60 + openM
              const endMinutes = closeH * 60 + closeM
              const currentMinutes = argH * 60 + argM

              let isOpen = false
              if (endMinutes < startMinutes) {
                     // Cross-midnight (e.g. 18:00 to 02:00)
                     isOpen = (currentMinutes >= startMinutes || currentMinutes < endMinutes)
              } else {
                     isOpen = (currentMinutes >= startMinutes && currentMinutes < endMinutes)
              }

              if (!isOpen) {
                     throw new Error(`El horario está fuera de operación (${openStr} - ${closeStr})`)
              }
       }

       private static async checkOverlap(clubId: string, courtId: number, start: Date, end: Date) {
              const overlap = await prisma.booking.findFirst({
                     where: {
                            clubId,
                            courtId,
                            status: { not: 'CANCELED' },
                            OR: [
                                   { startTime: { gte: start, lt: end } },
                                   { endTime: { gt: start, lte: end } },
                                   { startTime: { lte: start }, endTime: { gte: end } }
                            ]
                     }
              })
              if (overlap) {
                     throw new Error(`Conflicto de horario: ${start.toLocaleString('es-AR')}`)
              }
       }

       /**
        * Retrieves full booking details with related data
        */
       static async getDetails(bookingId: number, clubId: string) {
              const booking = await prisma.booking.findFirst({
                     where: { id: bookingId, clubId },
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
                            reminderSent: true,
                            client: { select: { id: true, name: true, phone: true, email: true } },
                            court: { select: { id: true, name: true } },
                            items: { include: { product: true } },
                            transactions: true,
                            players: true,
                     }
              })
              return booking
       }

       /**
        * Cancels a booking, handling refunds (if applicable), stock return, 
        * waiting list notifications, and audit logging.
        */
       static async cancel(bookingId: number, clubId: string, _performedByUser: { id?: string, role: string }) {
              const booking = await prisma.booking.findFirst({
                     where: { id: bookingId, clubId },
                     include: {
                            transactions: true,
                            items: true
                     }
              })

              if (!booking) throw new Error('Reserva no encontrada')

              const totalPaid = booking.transactions.reduce((sum: number, t: any) => sum + t.amount, 0)
              const needsRefund = totalPaid > 0

              // Permission Check (Logic-level)
              // We assume caller checked relevant "can cancel" permission.

              if (booking.status === 'CANCELED') return { success: true }

              // 1. Refund Transaction (if needed)
              if (totalPaid > 0) {
                     const register = await getOrCreateTodayCashRegister(booking.clubId)
                     // Check if register is open? 

                     await prisma.transaction.create({
                            data: {
                                   cashRegisterId: register.id,
                                   bookingId,
                                   type: 'EXPENSE',
                                   category: 'REFUND',
                                   amount: totalPaid,
                                   method: 'CASH',
                                   description: `Devolución total por cancelación Reserva #${booking.id}`
                            }
                     })
              }

              // 2. Return Stock
              for (const item of booking.items) {
                     if (item.productId) {
                            await prisma.product.update({
                                   where: { id: item.productId },
                                   data: { stock: { increment: item.quantity } }
                            })
                     }
              }

              // 3. Update Status
              await prisma.booking.update({
                     where: { id: bookingId },
                     data: { status: 'CANCELED', paymentStatus: 'REFUNDED' }
              })

              // 4. Audit
              await logAction({
                     clubId: booking.clubId,
                     action: 'DELETE',
                     entity: 'BOOKING',
                     entityId: booking.id.toString(),
                     details: { refundAmount: totalPaid > 0 ? totalPaid : 0 }
              })

              // 5. Notify Waiting List & Realtime
              this.handleCancellationSideEffects(bookingId, clubId, booking.startTime, booking.courtId, booking)

              return { success: true }
       }

       /**
        * Handles payments for a booking, trying Atomic first then Legacy fallback
        */
       static async pay(bookingId: number, clubId: string, amount: number, method: string) {
              // Security Check
              const exists = await prisma.booking.count({ where: { id: bookingId, clubId } })
              if (!exists) throw new Error('Reserva no encontrada')

              // 1. Attempt Atomic Payment
              try {
                     const atomicResult = await processPaymentAtomic(bookingId, amount, method)
                     if (atomicResult.success) return atomicResult

                     // If it failed but didn't throw generic error, it might be a logic error
                     if (atomicResult.error && atomicResult.error !== 'DB_SCHEMA_ERROR') {
                            return { success: false, error: atomicResult.error }
                     }
              } catch (error: any) {
                     // Fallback only on specific schema errors
                     if (error.message !== 'DB_SCHEMA_ERROR') {
                            throw error
                     }
              }

              // 2. Fallback Legacy Mode
              const booking = await prisma.booking.findUnique({
                     where: { id: bookingId },
                     include: { items: true, transactions: true }
              })
              if (!booking) throw new Error('Reserva no encontrada')

              const register = await getOrCreateTodayCashRegister(booking.clubId)

              await prisma.transaction.create({
                     data: {
                            cashRegisterId: register.id,
                            bookingId,
                            type: 'INCOME',
                            category: 'BOOKING_PAYMENT',
                            amount,
                            method,
                            description: `Pago parcial/total Reserva #${bookingId}`
                     }
              })

              const itemsTotal = booking.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
              const totalCost = booking.price + itemsTotal
              const previousPaid = booking.transactions.reduce((sum, t) => sum + t.amount, 0)
              const totalPaid = previousPaid + amount
              const newStatus = totalPaid >= totalCost ? 'PAID' : 'PARTIAL'

              await prisma.booking.update({
                     where: { id: bookingId },
                     data: { paymentStatus: newStatus, status: 'CONFIRMED' }
              })

              await logAction({
                     clubId: booking.clubId,
                     action: 'UPDATE',
                     entity: 'BOOKING',
                     entityId: booking.id.toString(),
                     details: { type: 'PAYMENT', amount, method, status: newStatus }
              })

              return { success: true }
       }

       private static async handleCancellationSideEffects(bookingId: number, clubId: string, startTime: Date, courtId: number, bookingData: any) {
              // Notify Waiting List
              try {
                     const waitingResult = await getMatchingWaitingUsers(startTime, startTime, courtId)
                     if (waitingResult.success && waitingResult.list.length > 0) {
                            await MessagingService.notifyWaitingList(bookingData, waitingResult.list)
                     }
              } catch (e) { console.error("Error notifying waiting list:", e) }

              // Pusher
              try {
                     await pusherServer.trigger(`club-${clubId}`, 'booking-update', {
                            type: 'DELETE',
                            bookingId
                     })
              } catch (e) { console.error("Pusher Error:", e) }
       }

       /**
        * Charges a specific player within a booking
        */
       static async chargePlayer(bookingId: number, clubId: string, playerName: string, amount: number, method: string) {
              const booking = await prisma.booking.findFirst({ where: { id: bookingId, clubId } })
              if (!booking) throw new Error('Reserva no encontrada')

              // 1. Find or Create Player
              let player = await prisma.bookingPlayer.findFirst({
                     where: { bookingId, name: playerName }
              })

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
              const transactions = await prisma.transaction.findMany({ where: { bookingId, type: 'INCOME' } })
              const totalPaid = transactions.reduce((sum, t) => sum + t.amount, 0)

              const freshBooking = await prisma.booking.findUnique({
                     where: { id: bookingId },
                     include: { items: true }
              })

              if (freshBooking) {
                     const itemsTotal = freshBooking.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
                     const totalCost = freshBooking.price + itemsTotal

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

              return { success: true }
       }
}
