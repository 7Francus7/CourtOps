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
       timeZoneOffset?: number // Client's timezone offset in minutes (UTC - Local)
       paymentStatus?: 'UNPAID' | 'PAID' | 'PARTIAL'
       status?: 'PENDING' | 'CONFIRMED'
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

              // Calculate Local Time for Validation
              let checkDate = new Date(bookingStart)
              if (typeof data.timeZoneOffset === 'number') {
                     checkDate = new Date(bookingStart.getTime() - (data.timeZoneOffset * 60000))
              }

              // Extract minutes from midnight (Local Time)
              const startMinutes = checkDate.getUTCHours() * 60 + checkDate.getUTCMinutes()
              const endMinutes = startMinutes + slotDuration

              const [openH, openM] = openTimeStr.split(':').map(Number)
              const [closeH, closeM] = closeTimeStr.split(':').map(Number)

              const openTotal = openH * 60 + openM
              let closeTotal = closeH * 60 + closeM

              let isValid = false

              if (closeTotal < openTotal) {
                     // Overnight (e.g. 14:00 to 00:30)
                     // Valid ranges: [Open, 1440) U [0, Close]
                     // We map [0, Close] to [1440, 1440+Close] for linear comparison
                     closeTotal += 1440

                     let checkStart = startMinutes
                     let checkEnd = endMinutes

                     // If start is early morning (e.g. 00:30), treat as next day extension
                     if (checkStart < openTotal) {
                            checkStart += 1440
                            checkEnd += 1440
                     }

                     if (checkStart >= openTotal && checkEnd <= closeTotal) {
                            isValid = true
                     }
              } else {
                     // Standard day (e.g. 08:00 to 23:00)
                     if (startMinutes >= openTotal && endMinutes <= closeTotal) {
                            isValid = true
                     }
              }

              if (!isValid) {
                     throw new Error(`La reserva debe estar entre ${openTimeStr} y ${closeTimeStr}`)
              }

              // 1. Find or Create Client (Scoped to Club)
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
                                   email: data.clientEmail
                            }
                     })
              } else {
                     // Optional: Update name/email if provided
                     if (data.clientEmail || (data.clientName && data.clientName !== client.name)) {
                            await prisma.client.update({
                                   where: { id: client.id },
                                   data: {
                                          email: data.clientEmail || client.email,
                                          name: data.clientName
                                   }
                            })
                     }
              }

              // 2. Calculate Price based on PriceRules (New Logic)
              // Pass dynamic duration context
              const finalPrice = await getEffectivePrice(clubId, data.startTime, slotDuration)

              // 3. Prevent Overlaps
              // Rule: No existing booking can OVERLAP with NewBooking (Start to End)
              // New Booking End = Start + slotDuration
              const requestEnd = new Date(data.startTime)
              requestEnd.setMinutes(requestEnd.getMinutes() + slotDuration)

              const overlap = await prisma.booking.findFirst({
                     where: {
                            clubId, // Scope to club
                            courtId: data.courtId,
                            status: { not: 'CANCELED' },
                            OR: [
                                   // Existing starts inside new
                                   { startTime: { gte: data.startTime, lt: requestEnd } },
                                   // Existing ends inside new
                                   { endTime: { gt: data.startTime, lte: requestEnd } },
                                   // Existing engulfs new
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
                     }
              })

              // 4.5. Log Audit Action
              // We don't await this to keep UI fast, or we await if strict consistency needed.
              // For "Best for system", let's await safely inside a try-catch block inside logAction function, 
              // but here we just call it. Since logAction is async, we should await it if we want to ensure it's written before return.
              // Given the wrapper in logger.ts, we can await it.
              await logAction({
                     clubId,
                     action: 'CREATE',
                     entity: 'BOOKING',
                     entityId: booking.id.toString(),
                     details: {
                            courtId: data.courtId,
                            startTime: data.startTime,
                            price: finalPrice,
                            client: client.name
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
                                   method: 'CASH', // Defaulting to CASH for manual quick pay
                                   description: `Reserva Cancha ${data.courtId} - ${data.clientName}`
                            }
                     })
              }

              revalidatePath('/') // Revalidate the dashboard
              return { success: true, booking }

       } catch (error: any) {
              console.error("Booking Creation Error:", error)
              return { success: false, error: error.message }
       }
}
