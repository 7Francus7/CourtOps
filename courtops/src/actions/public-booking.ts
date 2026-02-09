'use server'

import prisma from '@/lib/db'
import { getEffectivePrice } from '@/lib/tenant'
import { startOfDay, endOfDay, addDays, format, parse, set } from 'date-fns'
import { revalidatePath } from 'next/cache'
import { createArgDate, nowInArg, fromUTC } from '@/lib/date-utils'
// Note: We keep nowInArg available but use new Date() for comparison

export async function getPublicClubBySlug(slug: string) {
       const club = await prisma.club.findUnique({
              where: { slug },
              include: {
                     courts: {
                            orderBy: { sortOrder: 'asc' }
                     }
              }
       })
       return JSON.parse(JSON.stringify(club))
}

export async function getPublicClient(clubId: string, identifier: string) {
       const client = await prisma.client.findFirst({
              where: {
                     clubId,
                     OR: [
                            { phone: identifier },
                            { email: identifier }
                     ]
              },
              select: {
                     id: true,
                     name: true,
                     phone: true,
                     email: true
              }
       })
       return client
}

export async function getPublicAvailability(clubId: string, dateInput: Date | string) {
       const date = new Date(dateInput)
       const start = startOfDay(date)
       const end = endOfDay(date)

       // 1. Get Club Settings
       const club = await prisma.club.findUnique({
              where: { id: clubId },
              select: { openTime: true, closeTime: true, slotDuration: true }
       })
       if (!club) throw new Error('Club not found')

       // 2. Get Courts
       const courts = await prisma.court.findMany({
              where: { clubId, isActive: true },
              orderBy: { sortOrder: 'asc' }
       })

       // 3. Get Existing Bookings
       const bookings = await prisma.booking.findMany({
              where: {
                     clubId,
                     startTime: { gte: start, lte: end },
                     status: { not: 'CANCELED' }
              },
              select: { courtId: true, startTime: true, endTime: true }
       })

       // 4. Generate & Merge Slots
       // We use a Map to group availability by start time: "HH:mm" -> { time, minPrice, courts: [...] }
       const slotsMap = new Map<string, { time: string, minPrice: number, courts: any[] }>()

       const [openH, openM] = club.openTime.split(':').map(Number)
       const [closeH, closeM] = club.closeTime.split(':').map(Number)

       // For comparison
       const now = new Date()

       // Iterate EACH COURT individually
       for (const court of courts) {
              const courtDuration = (court as any).duration || club.slotDuration || 90
              const sport = (court as any).sport || 'PADEL'

              // Start time for this court
              let currentTime = createArgDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), openH, openM)
              let limitTime = createArgDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), closeH, closeM)

              // Handle crossing midnight (e.g. close at 02:00)
              if (limitTime <= currentTime) {
                     limitTime = addDays(limitTime, 1)
              }

              while (currentTime < limitTime) {
                     // 1. Filter out past times if today
                     if (currentTime < now && date.getDate() === now.getDate() && date.getMonth() === now.getMonth()) {
                            currentTime = new Date(currentTime.getTime() + courtDuration * 60000)
                            continue
                     }

                     // 2. Check Overlap
                     const proposedEnd = new Date(currentTime.getTime() + courtDuration * 60000)

                     // Optimization: If end time exceeds closing time, break (unless we allow last turn to go over?)
                     // Usually we stop if the turn doesn't fit? Let's check strict fit.
                     if (proposedEnd > limitTime) {
                            // If it doesn't fit before close, stop generating for this court
                            break;
                     }

                     const hasOverlap = bookings.some(b => {
                            if (b.courtId !== court.id) return false
                            // Classic overlap
                            return b.startTime < proposedEnd && b.endTime > currentTime
                     })

                     if (!hasOverlap) {
                            // It's free! Add to map.
                            const timeLabel = format(fromUTC(currentTime), 'HH:mm')

                            // Calculate price for this specific court/time/duration
                            const price = await getEffectivePrice(clubId, currentTime, courtDuration)

                            if (!slotsMap.has(timeLabel)) {
                                   slotsMap.set(timeLabel, { time: timeLabel, minPrice: price, courts: [] })
                            }

                            const slotEntry = slotsMap.get(timeLabel)!
                            // Update minPrice if this court is cheaper
                            if (price < slotEntry.minPrice) {
                                   slotEntry.minPrice = price
                            }

                            slotEntry.courts.push({
                                   id: court.id,
                                   name: court.name,
                                   type: court.surface,
                                   sport: sport,
                                   duration: courtDuration,
                                   price: price // Include specific price
                            })
                     }

                     // Advance by THIS COURT's duration
                     currentTime = new Date(currentTime.getTime() + courtDuration * 60000)
              }
       }

       // Convert Map to Array and Sort by Time
       const sortedSlots = Array.from(slotsMap.values()).sort((a, b) => {
              return a.time.localeCompare(b.time)
       })

       // Return reformatted structure compatible with frontend
       return sortedSlots.map(s => ({
              time: s.time,
              price: s.minPrice, // "From" price
              courts: s.courts.sort((a, b) => a.name.localeCompare(b.name))
       }))
}

export async function createPublicBooking(data: {
       clubId: string
       courtId: number
       dateStr: string // YYYY-MM-DD
       timeStr: string // HH:mm
       clientName: string
       clientPhone: string
       email?: string
       isGuest?: boolean
       isOpenMatch?: boolean
       matchLevel?: string
       matchGender?: string
}) {
       try {
              let clientId: number | null = null
              let guestName: string | null = null
              let guestPhone: string | null = null

              if (data.isGuest) {
                     // GUEST MODE: Do not create client, store info in booking
                     guestName = data.clientName
                     guestPhone = data.clientPhone
              } else {
                     // PREMIUM MODE: Find or Create Client
                     let client = await prisma.client.findFirst({
                            where: { clubId: data.clubId, phone: data.clientPhone }
                     })

                     if (!client) {
                            client = await prisma.client.create({
                                   data: {
                                          clubId: data.clubId,
                                          name: data.clientName,
                                          phone: data.clientPhone,
                                          email: data.email
                                   }
                            })
                     } else if (data.email && !client.email) {
                            // Update email if missing
                            await prisma.client.update({
                                   where: { id: client.id },
                                   data: { email: data.email }
                            })
                     }
                     clientId = client.id
              }

              // 2. Fetch Settings
              const club = await prisma.club.findUnique({
                     where: { id: data.clubId },
                     select: { slotDuration: true, bookingDeposit: true } // Add bookingDeposit selection
              })
              if (!club) return { success: false, error: 'Club not found' }

              // 2b. Fetch Court Duration
              const court = await prisma.court.findUnique({
                     where: { id: data.courtId }
              })
              const courtDuration = (court as any)?.duration || club.slotDuration || 90


              // 3. Dates & Price - Robust Parsing
              // Split date: YYYY, MM, DD
              const [y, m, d] = data.dateStr.split('-').map(Number)
              // Split time: HH, mm
              const [hh, mm] = data.timeStr.split(':').map(Number)

              // Ensure slotDuration is set (fallback or override)
              const duration = courtDuration

              const dateTime = createArgDate(y, m - 1, d, hh, mm)
              const endTime = new Date(dateTime.getTime() + duration * 60000)
              const price = await getEffectivePrice(data.clubId, dateTime, duration)

              // 4. Check Availability (Prevent Double Booking)
              const existingBooking = await prisma.booking.findFirst({
                     where: {
                            courtId: data.courtId,
                            status: { not: 'CANCELED' },
                            OR: [
                                   {
                                          startTime: { lt: endTime },
                                          endTime: { gt: dateTime }
                                   }
                            ]
                     }
              })

              if (existingBooking) {
                     return { success: false, error: 'El turno ya no está disponible.' }
              }

              // 5. Create Booking
              const booking = await prisma.booking.create({
                     data: {
                            clubId: data.clubId,
                            courtId: data.courtId,
                            clientId: clientId,
                            guestName: guestName,
                            guestPhone: guestPhone,
                            startTime: dateTime,
                            endTime: endTime,
                            price: Number(price),
                            status: data.isGuest ? 'PENDING' : 'CONFIRMED',
                            paymentStatus: 'UNPAID',
                            paymentMethod: data.isGuest ? 'PENDING_DEPOSIT' : 'ON_ACCOUNT',

                            // Open Match Fields
                            isOpenMatch: data.isOpenMatch || false,
                            matchLevel: data.matchLevel,
                            matchGender: data.matchGender
                     }
              })

              revalidatePath('/')
              revalidatePath(`/p/${data.clubId}`) // Revalidate specific public page too
              return { success: true, bookingId: booking.id }
       } catch (error: any) {
              console.error("ERROR CREATING PUBLIC BOOKING:", error)
              return { success: false, error: error.message || 'Error desconocido' }
       }
}

export async function getPublicBooking(bookingId: number) {
       const booking = await prisma.booking.findUnique({
              where: { id: bookingId },
              include: {
                     court: true,
                     client: true
              }
       })
       return booking
}
