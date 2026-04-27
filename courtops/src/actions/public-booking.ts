'use server'

import prisma from '@/lib/db'
import { getEffectivePrice, enforceActiveSubscription } from '@/lib/tenant'
import { addDays } from 'date-fns'
import { revalidatePath } from 'next/cache'
import { createArgDate, fromUTC } from '@/lib/date-utils'

export async function getPublicClubBySlug(slug: string) {
       const club = await prisma.club.findUnique({
              where: { slug },
              select: {
                     id: true,
                     name: true,
                     slug: true,
                     logoUrl: true,
                     phone: true,
                     address: true,
                     openTime: true,
                     closeTime: true,
                     slotDuration: true,
                     bookingDeposit: true,
                     cancelHours: true,
                     themeColor: true,
                     hasOnlinePayments: true,
                     mpAccessToken: true,
                     mpPublicKey: true,
                     mpAlias: true,
                     mpCvu: true,
                     description: true,
                     coverUrl: true,
                     amenities: true,
                     socialInstagram: true,
                     socialFacebook: true,
                     socialTwitter: true,
                     socialTiktok: true,
                     courts: {
                            where: { isActive: true },
                            orderBy: { sortOrder: 'asc' },
                            select: { id: true, name: true, surface: true, isIndoor: true, sport: true, duration: true, sortOrder: true }
                     }
              }
       })

       if (!club) return null

       const { mpAccessToken, ...publicClub } = club
       return JSON.parse(JSON.stringify({
              ...publicClub,
              canUseOnlinePayments: Boolean(mpAccessToken)
       }))
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

function getPublicDateParts(dateInput: Date | string) {
       if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
              const [year, month, day] = dateInput.split('-').map(Number)
              return { year, month: month - 1, day }
       }

       const parsed = dateInput instanceof Date ? dateInput : new Date(dateInput)
       if (Number.isNaN(parsed.getTime())) {
              throw new Error('Fecha inválida')
       }

       const argDate = fromUTC(parsed)
       return {
              year: argDate.getUTCFullYear(),
              month: argDate.getUTCMonth(),
              day: argDate.getUTCDate()
       }
}

export async function getPublicAvailability(clubId: string, dateInput: Date | string, durationMinutes?: number) {
       const { year: targetYear, month: targetMonth, day: targetDay } = getPublicDateParts(dateInput)
       // Use a wider padded range to fetch bookings from DB, 
       // to avoid skipped bookings on cross-timezone boundaries (e.g., night shifts matching next UTC day). 
       // The exact overlap check down below handles the precise filtering.
       const start = addDays(createArgDate(targetYear, targetMonth, targetDay, 0, 0), -1)
       const end = addDays(createArgDate(targetYear, targetMonth, targetDay, 23, 59), 2)
       end.setSeconds(59, 999)

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
       const slotsMap = new Map<string, { time: string, minPrice: number, courts: { id: number; name: string; type: string | null; sport: string; duration: number; price: number }[] }>()

       const [openH, openM] = club.openTime.split(':').map(Number)
       const [closeH, closeM] = club.closeTime.split(':').map(Number)

       // For comparison - Add a 15-minute buffer so we don't show slots that are about to start or have just started
       const nowWithBuffer = new Date()
       nowWithBuffer.setMinutes(nowWithBuffer.getMinutes() + 15)

       // Shared Intl formatter for robust "HH:mm" extraction without side effects
       const timeFormatter = new Intl.DateTimeFormat('es-AR', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
              timeZone: 'America/Argentina/Buenos_Aires'
       })

       // Iterate EACH COURT individually
       for (const court of courts) {
              const courtDefaultDuration = (court as { duration?: number }).duration || club.slotDuration || 90
              const courtDuration = durationMinutes || courtDefaultDuration
              const sport = (court as { sport?: string }).sport || 'PADEL'

              // Start time for this court
              let currentTime = createArgDate(targetYear, targetMonth, targetDay, openH, openM)
              let limitTime = createArgDate(targetYear, targetMonth, targetDay, closeH, closeM)

              // Handle crossing midnight (e.g. close at 02:00)
              if (limitTime <= currentTime) {
                     limitTime = addDays(limitTime, 1)
              }

              while (currentTime < limitTime) {
                     // 1. Filter out past times intrinsically
                     if (currentTime < nowWithBuffer) {
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
                            const timeLabel = timeFormatter.format(currentTime)

                            // Calculate price for this specific court/time/duration
                            const price = await getEffectivePrice(clubId, currentTime, courtDuration, false, 0, court.id)

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

type PublicBookingInput = {
       clubId: string
       courtId: number
       dateStr?: string // YYYY-MM-DD
       timeStr?: string // HH:mm
       clientName?: string
       clientPhone?: string
       email?: string
       isGuest?: boolean
       isOpenMatch?: boolean
       matchLevel?: string
       matchGender?: string
       durationMinutes?: number
       date?: string
       time?: string
       guestName?: string
       guestPhone?: string
}

export async function createPublicBooking(data: PublicBookingInput) {
       try {
              await enforceActiveSubscription(data.clubId)

              const dateStr = data.dateStr ?? data.date
              const timeStr = data.timeStr ?? data.time
              const clientName = data.clientName ?? data.guestName
              const clientPhone = data.clientPhone ?? data.guestPhone

              if (!dateStr || !timeStr || !clientName || !clientPhone) {
                     return { success: false, error: 'Faltan datos obligatorios para crear la reserva.' }
              }

              let clientId: number | null = null
              let guestName: string | null = null
              let guestPhone: string | null = null

              if (data.isGuest) {
                     // GUEST MODE: Do not create client, store info in booking
                     guestName = clientName
                     guestPhone = clientPhone
              } else {
                     // PREMIUM MODE: Find or Create Client
                     let client = await prisma.client.findFirst({
                            where: { clubId: data.clubId, phone: clientPhone }
                     })

                     if (!client) {
                            client = await prisma.client.create({
                                   data: {
                                          clubId: data.clubId,
                                          name: clientName,
                                          phone: clientPhone,
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
                     select: { slotDuration: true, bookingDeposit: true, cancelHours: true, slug: true }
              })
              if (!club) return { success: false, error: 'Club not found' }

              // 2b. Fetch Court and Verify Ownership
              const court = await prisma.court.findFirst({
                     where: { id: data.courtId, clubId: data.clubId, isActive: true }
              })

              if (!court) {
                     return { success: false, error: 'La cancha seleccionada no es válida para este club.' }
              }

              const courtDuration = court.duration || club.slotDuration || 90


              // 3. Dates & Price - Robust Parsing
              // Split date: YYYY, MM, DD
              const [y, m, d] = dateStr.split('-').map(Number)
              // Split time: HH, mm
              const [hh, mm] = timeStr.split(':').map(Number)

              const duration = data.durationMinutes || courtDuration

              const dateTime = createArgDate(y, m - 1, d, hh, mm)
              const endTime = new Date(dateTime.getTime() + duration * 60000)

              // Validate that the booking is not in the past
              const now = new Date()
              if (dateTime < now) {
                     return { success: false, error: 'No se pueden reservar turnos con horarios que ya han pasado.' }
              }

              const price = await getEffectivePrice(data.clubId, dateTime, duration, false, 0, data.courtId)

              // 4. Check Availability (Prevent Double Booking)
              const existingBooking = await prisma.booking.findFirst({
                     where: {
                            clubId: data.clubId,
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
              // publicToken enables the client to cancel their own booking via the
              // public cancel-public route without requiring authentication.
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
                            publicToken: crypto.randomUUID(),

                            // Open Match Fields
                            isOpenMatch: data.isOpenMatch || false,
                            matchLevel: data.matchLevel,
                            matchGender: data.matchGender
                     }
              })

              try {
                     const { pusherServer } = await import('@/lib/pusher')
                     await pusherServer.trigger(`club-${data.clubId}`, 'booking-update', {
                            action: 'create',
                            bookingId: booking.id
                     })
              } catch (pusherErr) {
                     console.error('[PUSHER ERROR in public-booking]', pusherErr)
              }

              revalidatePath('/')
              revalidatePath(`/p/${club.slug}`)
              revalidatePath(`/${club.slug}`)
              return { success: true, bookingId: booking.id }
       } catch (error: unknown) {
              console.error("ERROR CREATING PUBLIC BOOKING:", error)
              return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
       }
}

export async function getPublicBooking(bookingId: number, clubId: string) {
       if (!clubId) return null
       const booking = await prisma.booking.findFirst({
              where: { id: bookingId, clubId },
              select: {
                     id: true,
                     startTime: true,
                     endTime: true,
                     price: true,
                     status: true,
                     paymentStatus: true,
                     guestName: true,
                     guestPhone: true,
                     court: { select: { id: true, name: true } },
                     client: { select: { id: true, name: true, phone: true } }
              }
       })
       return booking
}
