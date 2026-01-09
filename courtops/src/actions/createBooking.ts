'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentClubId, getEffectivePrice, getOrCreateTodayCashRegister } from '@/lib/tenant'
import prisma from '@/lib/db'
import { logAction } from '@/lib/logger'
import { v4 as uuidv4 } from 'uuid'

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
              // Adjust to Argentina Time (approx) if needed, but here we assume Local Server Time matches or we check pure hours
              const argDate = new Date(startCheck.getTime() - (3 * 3600000))
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
                     const price = await getEffectivePrice(clubId, date, slotDuration, isMember)

                     // Payment Status: Only first booking uses the passed status. Others UNPAID.
                     const paymentStatus = (i === 0) ? (data.paymentStatus || 'UNPAID') : 'UNPAID'
                     const paymentMethod = (paymentStatus === 'PAID') ? 'CASH' : null

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
                            recurringId
                     })
              }

              // 5. Create All Bookings
              const createdBookings = []
              for (const bookingData of bookingsToCreate) {
                     const booking = await prisma.booking.create({ data: bookingData })
                     createdBookings.push(booking)

                     // Payment Transaction (Only for the first one if PAID)
                     if (bookingData.paymentStatus === 'PAID') {
                            const register = await getOrCreateTodayCashRegister(clubId)
                            await prisma.transaction.create({
                                   data: {
                                          cashRegisterId: register.id,
                                          type: 'INCOME',
                                          category: 'BOOKING',
                                          amount: bookingData.price,
                                          method: 'CASH',
                                          description: `Reserva Cancha ${data.courtId} - ${data.clientName} (Fijo)`,
                                          bookingId: booking.id,
                                          clientId: client.id
                                   }
                            })
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

              revalidatePath('/')
              return { success: true, count: createdBookings.length }

       } catch (error: any) {
              console.error("Booking Creation Error:", error)
              return { success: false, error: error.message }
       }
}
