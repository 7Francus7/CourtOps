'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentClubId, getEffectivePrice, getOrCreateTodayCashRegister } from '@/lib/tenant'
import prisma from '@/lib/db'
import { logAction } from '@/lib/logger'

export type CreateBookingInput = {
       clientName: string
       clientPhone: string
       clientEmail?: string
       courtId: number
       startTime: Date // Javascript Date object
       paymentStatus?: 'UNPAID' | 'PAID' | 'PARTIAL'
       status?: 'PENDING' | 'CONFIRMED'
       notes?: string
       isMember?: boolean // New field
}

export async function createBooking(data: CreateBookingInput) {
       try {
              const clubId = await getCurrentClubId()

              // 0. Fetch Club Settings (Duration & Hours)
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

              // Validate Opening Hours
              const bookingStart = new Date(data.startTime)
              const [openH, openM] = openTimeStr.split(':').map(Number)
              const [closeH, closeM] = closeTimeStr.split(':').map(Number)

              const argDate = new Date(bookingStart.getTime() - (3 * 3600000))
              const argH = argDate.getUTCHours()
              const argM = argDate.getUTCMinutes()

              const startMinutes = openH * 60 + openM
              const endMinutes = closeH * 60 + closeM
              const currentMinutes = argH * 60 + argM

              let isWithinRange = false
              if (endMinutes < startMinutes) {
                     isWithinRange = (currentMinutes >= startMinutes || currentMinutes < endMinutes)
              } else {
                     isWithinRange = (currentMinutes >= startMinutes && currentMinutes < endMinutes)
              }

              if (!isWithinRange) {
                     throw new Error(`La reserva debe estar entre ${openTimeStr} y ${closeTimeStr}`)
              }

              // 1. Find or Create Client
              let client = await prisma.client.findFirst({
                     where: {
                            clubId,
                            phone: data.clientPhone
                     }
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
                     // Check if we should update membership
                     // If data.isMember is explicitly true, upgrade. If false, maybe don't downgrade?
                     // Let's assume if checkbox is unchecked, we don't change status unless explicitly requested.
                     // But for MVP, let's just update if provided?
                     // Safer: Only update if data.isMember is true.
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
                            // Refresh local client object
                            if (data.isMember) client.membershipStatus = 'ACTIVE'
                     }
              }

              const isMember = client.membershipStatus === 'ACTIVE'

              // 2. Calculate Price
              const finalPrice = await getEffectivePrice(clubId, data.startTime, slotDuration, isMember)

              // 3. Prevent Overlaps
              const requestEnd = new Date(data.startTime)
              requestEnd.setMinutes(requestEnd.getMinutes() + slotDuration)

              const overlap = await prisma.booking.findFirst({
                     where: {
                            clubId,
                            courtId: data.courtId,
                            status: { not: 'CANCELED' },
                            OR: [
                                   { startTime: { gte: data.startTime, lt: requestEnd } },
                                   { endTime: { gt: data.startTime, lte: requestEnd } },
                                   { startTime: { lte: data.startTime }, endTime: { gte: requestEnd } }
                            ]
                     }
              })

              if (overlap) {
                     throw new Error("Ya existe una reserva en este horario.")
              }

              // 4. Create Booking
              const booking = await prisma.booking.create({
                     data: {
                            clubId,
                            courtId: data.courtId,
                            clientId: client.id,
                            startTime: data.startTime,
                            endTime: requestEnd,
                            price: finalPrice,
                            status: data.status || 'CONFIRMED',
                            paymentStatus: data.paymentStatus || 'UNPAID',
                            paymentMethod: data.paymentStatus === 'PAID' ? 'CASH' : null
                            // notes: data.notes  // TEMPORAL: disabled until production DB migration
                     }
              })

              // 4.5. Log Audit Action
              await logAction({
                     clubId,
                     action: 'CREATE',
                     entity: 'BOOKING',
                     entityId: booking.id.toString(),
                     details: {
                            courtId: data.courtId,
                            startTime: data.startTime,
                            price: finalPrice,
                            client: client.name,
                            isMember
                     }
              })

              // 5. REGISTER TRANSACTION IF PAID
              if (data.paymentStatus === 'PAID') {
                     const register = await getOrCreateTodayCashRegister(clubId)

                     await prisma.transaction.create({
                            data: {
                                   cashRegisterId: register.id,
                                   type: 'INCOME',
                                   category: 'BOOKING',
                                   amount: finalPrice,
                                   method: 'CASH',
                                   description: `Reserva Cancha ${data.courtId} - ${data.clientName}`
                            }
                     })
              }

              revalidatePath('/')
              return { success: true, booking }

       } catch (error: any) {
              console.error("Booking Creation Error:", error)
              return { success: false, error: error.message }
       }
}
