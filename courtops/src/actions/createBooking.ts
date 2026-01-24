'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentClubId, getEffectivePrice, getOrCreateTodayCashRegister } from '@/lib/tenant'
import prisma from '@/lib/db'
import { logAction } from '@/lib/logger'
import { v4 as uuidv4 } from 'uuid'
import { fromUTC } from '@/lib/date-utils'
import { MessagingService } from '@/lib/messaging'

export type CreateBookingInput = {
       clientName: string
       clientPhone: string
       clientEmail?: string
       courtId: number
       startTime: Date // Javascript Date object
       paymentStatus?: 'UNPAID' | 'PAID' | 'PARTIAL'
       status?: 'PENDING' | 'CONFIRMED'
       notes?: string
       isMember?: boolean
       recurringEndDate?: Date | null
       advancePaymentAmount?: number
       payments?: { method: string, amount: number }[]
}

export async function createBooking(data: CreateBookingInput) {
       try {
              const clubId = await getCurrentClubId()

              // 0. Fetch Club Settings
              const clubConfig = await prisma.club.findUnique({
                     where: { id: clubId },
                     select: {
                            slotDuration: true,
                            openTime: true,
                            closeTime: true
                     }
              })

              const slotDuration = clubConfig?.slotDuration || 90
              const openTimeStr = clubConfig?.openTime || "08:00"
              const closeTimeStr = clubConfig?.closeTime || "23:00"

              // 1. Prepare Dates List
              const datesToBook: Date[] = []
              const startDate = new Date(data.startTime)
              datesToBook.push(startDate)

              if (data.recurringEndDate) {
                     const endDate = new Date(data.recurringEndDate)
                     let nextDate = new Date(startDate)
                     nextDate.setDate(nextDate.getDate() + 7) // Add 7 days

                     // Basic safety cap: Max 52 weeks (1 year)
                     let safety = 0
                     while (nextDate <= endDate && safety < 52) {
                            datesToBook.push(new Date(nextDate))
                            nextDate.setDate(nextDate.getDate() + 7)
                            safety++
                     }
              }

              // 2. Validate Opening Hours (Simple check on first date)
              const [openH, openM] = openTimeStr.split(':').map(Number)
              const [closeH, closeM] = closeTimeStr.split(':').map(Number)

              const startCheck = new Date(datesToBook[0])
              // Adjust to Argentina Time using date-fns-tz
              const argDate = fromUTC(startCheck)
              const argH = argDate.getUTCHours()
              const argM = argDate.getUTCMinutes()

              const startMinutes = openH * 60 + openM
              const endMinutes = closeH * 60 + closeM
              const currentMinutes = argH * 60 + argM

              // Handle crossing midnight
              let isOpen = false
              if (endMinutes < startMinutes) {
                     isOpen = (currentMinutes >= startMinutes || currentMinutes < endMinutes)
              } else {
                     isOpen = (currentMinutes >= startMinutes && currentMinutes < endMinutes)
              }

              if (!isOpen) {
                     throw new Error(`El horario está fuera de la operación (${openTimeStr} - ${closeTimeStr})`)
              }


              // 3. Find or Create Client (Once)
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
                     const shouldUpdate = data.clientEmail || (data.clientName && data.clientName !== client.name) || (data.isMember && client.membershipStatus !== 'ACTIVE')
                     if (shouldUpdate) {
                            await prisma.client.update({
                                   where: { id: client.id },
                                   data: {
                                          email: data.clientEmail || client.email,
                                          name: data.clientName,
                                          membershipStatus: data.isMember ? 'ACTIVE' : client.membershipStatus
                                   }
                            })
                            if (data.isMember) client.membershipStatus = 'ACTIVE'
                     }
              }
              const isMember = client.membershipStatus === 'ACTIVE'

              // 3.5 Check for Active Membership Plan (Advanced Discoutns)
              let discountPercent = 0
              if (isMember) {
                     const activeMembership = await prisma.membership.findFirst({
                            where: {
                                   clientId: client.id,
                                   status: 'ACTIVE',
                                   endDate: { gte: new Date() }
                            },
                            include: { plan: true },
                            orderBy: { endDate: 'desc' }
                     })

                     if (activeMembership) {
                            discountPercent = activeMembership.plan.discountPercent
                     }
              }

              // 4. Check Overlaps & Calculate Price for EACH Date
              const recurringId = datesToBook.length > 1 ? uuidv4() : null
              const bookingsToCreate: any[] = []

              for (let i = 0; i < datesToBook.length; i++) {
                     const date = datesToBook[i]
                     const requestEnd = new Date(date)
                     requestEnd.setMinutes(requestEnd.getMinutes() + slotDuration)

                     // Check Overlap
                     const overlap = await prisma.booking.findFirst({
                            where: {
                                   clubId,
                                   courtId: data.courtId,
                                   status: { not: 'CANCELED' },
                                   OR: [
                                          { startTime: { gte: date, lt: requestEnd } },
                                          { endTime: { gt: date, lte: requestEnd } },
                                          { startTime: { lte: date }, endTime: { gte: requestEnd } }
                                   ]
                            }
                     })

                     if (overlap) {
                            throw new Error(`Conflicto de horario el día ${date.toLocaleDateString('es-AR')}`)
                     }

                     // Price
                     const price = await getEffectivePrice(clubId, date, slotDuration, isMember, discountPercent)

                     // Payment Logic: Support Single (Legacy) or Split Payments
                     // Only first booking in a recurrence chain typically gets the payments assigned, or we split?
                     // Rule: Apply payments to the first booking only.

                     let paymentStatus = 'UNPAID'
                     let paymentMethod = null
                     let transactionAmount = 0
                     let paymentsToRecord: { method: string, amount: number }[] = []

                     if (i === 0) {
                            // Check for Split Payments first
                            if (data.payments && data.payments.length > 0) {
                                   paymentsToRecord = data.payments
                                   const totalPaid = paymentsToRecord.reduce((sum, p) => sum + p.amount, 0)
                                   paymentStatus = totalPaid >= price ? 'PAID' : (totalPaid > 0 ? 'PARTIAL' : 'UNPAID')
                                   paymentMethod = 'MIXED' // Use mixed helper
                            } else {
                                   // Legacy handling
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
                                                 // Don't change amount, just status
                                          }
                                   }
                            }
                     }

                     bookingsToCreate.push({
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
                            paymentsToRecord // Helper field
                     })
              }

              // 5. Create All Bookings
              const createdBookings = []
              for (const bookingData of bookingsToCreate) {
                     const { paymentsToRecord, transactionAmount, ...dbData } = bookingData

                     const booking = await prisma.booking.create({
                            data: {
                                   ...dbData,
                                   paymentStatus: dbData.paymentStatus as any
                            }
                     })
                     createdBookings.push(booking)

                     // Payment Transactions (Loop)
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
                                                        description: `Pago Reserva #${booking.id} - ${data.clientName}`,
                                                        bookingId: booking.id,
                                                        clientId: client.id
                                                 }
                                          })
                                   }
                            }
                     }
              }

              // 6. Log Audit
              await logAction({
                     clubId,
                     action: 'CREATE',
                     entity: 'BOOKING',
                     entityId: recurringId ? `RECURRING-${recurringId}` : createdBookings[0].id.toString(),
                     details: {
                            courtId: data.courtId,
                            count: createdBookings.length,
                            client: client.name,
                            isRecurring: !!recurringId
                     }
              })

              // REAL-TIME UPDATE
              try {
                     const { pusherServer } = await import('@/lib/pusher')
                     await pusherServer.trigger(`club-${clubId}`, 'booking-update', {
                            type: 'CREATE',
                            booking: createdBookings[0]
                     })
              } catch (pusherError) {
                     console.error("Pusher Trigger Error:", pusherError)
              }

              // 8. Auto-Send WhatsApp
              try {
                     // Prepare a comprehensive object for the message generator
                     const wrapper = {
                            schedule: {
                                   startTime: createdBookings[0].startTime,
                                   courtName: `Cancha ${data.courtId}` // Rough approx if court name wasn't fetched, but client side usually handles "Message" after success.
                                   // Ideally we fetch court name properly or use what we have.
                            },
                            client: { name: client.name },
                            pricing: { balance: 0 } // Calculate balance?
                     }
                     const msg = MessagingService.generateBookingMessage(wrapper, 'new_booking')

                     // Fire and forget - don't await result to block UI, unless critical
                     MessagingService.sendWhatsApp(client.phone, msg).catch(console.error)
              } catch (e) {
                     console.error("Error sending automatic whatsapp:", e)
              }

              revalidatePath('/')
              return {
                     success: true,
                     count: createdBookings.length,
                     booking: createdBookings[0],
                     client: client
              }

       } catch (error: any) {
              console.error("Booking Creation Error:", error)
              return { success: false, error: error.message }
       }
}
