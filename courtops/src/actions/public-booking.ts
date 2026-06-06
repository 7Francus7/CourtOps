'use server'

import { Prisma } from '@prisma/client'
import prisma from '@/lib/db'
import { getEffectivePrice, enforceActiveSubscription, computePriceFromRules } from '@/lib/tenant'
import { addDays } from 'date-fns'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { createArgDate, fromUTC } from '@/lib/date-utils'
import { AVAILABILITY_BLOCKING_BOOKING_STATUSES } from '@/lib/booking-status'
import { getPublicBookingHoldExpiration } from '@/lib/booking-hold'
import { getPhoneLastDigits, phoneMatches } from '@/lib/phone'
import { checkRateLimit } from '@/lib/ratelimit'
import { getCache, setCache, invalidateCachePattern } from '@/lib/cache'

async function getClientIp(): Promise<string> {
  const h = await headers()
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
}

const PADEL_SLOT_MINUTES = 90

async function expirePublicSlotHolds(clubId: string, now: Date = new Date()) {
       await prisma.slotHold.updateMany({
              where: {
                     clubId,
                     status: 'ACTIVE',
                     expiresAt: { lte: now }
              },
              data: {
                     status: 'EXPIRED'
              }
       })
}

function getPublicBookingWindow(dateStr: string, timeStr: string, durationMinutes: number) {
       const [y, m, d] = dateStr.split('-').map(Number)
       const [hh, mm] = timeStr.split(':').map(Number)

       const startTime = createArgDate(y, m - 1, d, hh, mm)
       const endTime = new Date(startTime.getTime() + durationMinutes * 60000)

       return { startTime, endTime }
}

export async function getPublicClubBySlug(slug: string) {
       const cacheKey = `public-club:${slug}`
       const cached = await getCache<Awaited<ReturnType<typeof _fetchPublicClub>>>(cacheKey)
       if (cached) return cached

       const result = await _fetchPublicClub(slug)
       if (result) await setCache(cacheKey, result, 300) // 5 min — changes rarely
       return result
}

async function _fetchPublicClub(slug: string) {
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
       const trimmedIdentifier = identifier.trim()

       if (trimmedIdentifier.includes('@')) {
              return prisma.client.findFirst({
                     where: { clubId, email: trimmedIdentifier },
                     select: {
                            id: true,
                            name: true,
                            phone: true,
                            email: true
                     }
              })
       }

       const phoneLastDigits = getPhoneLastDigits(trimmedIdentifier)
       if (!phoneLastDigits) return null

       const candidates = await prisma.client.findMany({
              where: {
                     clubId,
                     phone: { contains: phoneLastDigits }
              },
              select: {
                     id: true,
                     name: true,
                     phone: true,
                     email: true
              },
              take: 20
       })

       return candidates.find((candidate) => phoneMatches(trimmedIdentifier, candidate.phone)) ?? null
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
       const t0 = Date.now()
       const { year: targetYear, month: targetMonth, day: targetDay } = getPublicDateParts(dateInput)
       const start = addDays(createArgDate(targetYear, targetMonth, targetDay, 0, 0), -1)
       const end = addDays(createArgDate(targetYear, targetMonth, targetDay, 23, 59), 2)
       end.setSeconds(59, 999)
       const now = new Date()

       // Parallel fetch: expire holds + club + courts + bookings + holds + priceRules in one round-trip
       // Previously: 4 sequential queries + N×priceRule queries (one per available slot)
       const [, club, courts, bookings, activeHolds, priceRules] = await Promise.all([
              expirePublicSlotHolds(clubId, now),
              prisma.club.findUnique({
                     where: { id: clubId },
                     select: { openTime: true, closeTime: true, slotDuration: true },
              }),
              prisma.court.findMany({
                     where: { clubId, isActive: true },
                     orderBy: { sortOrder: 'asc' },
              }),
              prisma.booking.findMany({
                     where: {
                            clubId,
                            startTime: { gte: start, lte: end },
                            status: { in: [...AVAILABILITY_BLOCKING_BOOKING_STATUSES] },
                     },
                     select: { courtId: true, startTime: true, endTime: true },
              }),
              prisma.slotHold.findMany({
                     where: {
                            clubId,
                            status: 'ACTIVE',
                            expiresAt: { gt: now },
                            startTime: { lt: end },
                            endTime: { gt: start },
                     },
                     select: { courtId: true, startTime: true, endTime: true },
              }),
              // Fetch ALL price rules once — reused inside the slot loop (eliminates N+1)
              prisma.priceRule.findMany({
                     where: { clubId },
                     orderBy: { priority: 'desc' },
              }),
       ])

       if (!club) throw new Error('Club not found')

       const blockedWindows = [...bookings, ...activeHolds]

       type SlotEntry = { time: string; minPrice: number; courts: { id: number; name: string; type: string | null; sport: string; duration: number; price: number }[] }
       const slotsMap = new Map<string, SlotEntry>()

       const [openH, openM] = club.openTime.split(':').map(Number)
       const [closeH, closeM] = club.closeTime.split(':').map(Number)

       const nowWithBuffer = new Date(now)
       nowWithBuffer.setMinutes(nowWithBuffer.getMinutes() + 15)

       const timeFormatter = new Intl.DateTimeFormat('es-AR', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
              timeZone: 'America/Argentina/Buenos_Aires',
       })

       for (const court of courts) {
              const courtDuration = durationMinutes || PADEL_SLOT_MINUTES

              let currentTime = createArgDate(targetYear, targetMonth, targetDay, openH, openM)
              let limitTime = createArgDate(targetYear, targetMonth, targetDay, closeH, closeM)

              if (limitTime <= currentTime) limitTime = addDays(limitTime, 1)

              while (currentTime < limitTime) {
                     if (currentTime < nowWithBuffer) {
                            currentTime = new Date(currentTime.getTime() + courtDuration * 60000)
                            continue
                     }

                     const proposedEnd = new Date(currentTime.getTime() + courtDuration * 60000)
                     if (proposedEnd > limitTime) break

                     const hasOverlap = blockedWindows.some(
                            b => b.courtId === court.id && b.startTime < proposedEnd && b.endTime > currentTime
                     )

                     if (!hasOverlap) {
                            const timeLabel = timeFormatter.format(currentTime)
                            // Pure in-memory computation — no DB call
                            const price = computePriceFromRules(priceRules, currentTime, false, 0, court.id)

                            if (!slotsMap.has(timeLabel)) {
                                   slotsMap.set(timeLabel, { time: timeLabel, minPrice: price, courts: [] })
                            }
                            const slotEntry = slotsMap.get(timeLabel)!
                            if (price < slotEntry.minPrice) slotEntry.minPrice = price

                            slotEntry.courts.push({
                                   id: court.id,
                                   name: court.name,
                                   type: court.surface,
                                   sport: 'PADEL',
                                   duration: courtDuration,
                                   price,
                            })
                     }

                     currentTime = new Date(currentTime.getTime() + courtDuration * 60000)
              }
       }

       const slots = Array.from(slotsMap.values())
              .sort((a, b) => a.time.localeCompare(b.time))
              .map(s => ({
                     time: s.time,
                     price: s.minPrice,
                     courts: s.courts.sort((a, b) => a.name.localeCompare(b.name)),
              }))

       console.log(`[perf] getPublicAvailability clubId=${clubId} courts=${courts.length} slots=${slots.length} ${Date.now() - t0}ms`)
       return slots
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
       holdToken?: string
       holdOwnerToken?: string
}

type PublicBookingHoldInput = {
       clubId: string
       courtId: number
       dateStr: string
       timeStr: string
       durationMinutes?: number
       ownerToken: string
}

type PublicWaitingListInput = {
       clubId: string
       dateStr: string
       clientName: string
       clientPhone: string
       notes?: string
       courtId?: number
}

export async function createPublicBookingHold(data: PublicBookingHoldInput) {
       try {
              await enforceActiveSubscription(data.clubId)

              const ip = await getClientIp()
              const rl = await checkRateLimit(`hold:${ip}`, 15, 15 * 60_000)
              if (!rl.success) {
                     return { success: false, error: 'Demasiados intentos. Esperá unos minutos e intentá de nuevo.' }
              }

              if (!data.ownerToken?.trim()) {
                     return { success: false, error: 'No pudimos asegurar el horario. Intentá de nuevo.' }
              }

              const court = await prisma.court.findFirst({
                     where: {
                            id: data.courtId,
                            clubId: data.clubId,
                            isActive: true
                     },
                     select: { id: true }
              })

              if (!court) {
                     return { success: false, error: 'La cancha seleccionada no está disponible.' }
              }

              const duration = data.durationMinutes || PADEL_SLOT_MINUTES
              const now = new Date()
              const { startTime, endTime } = getPublicBookingWindow(data.dateStr, data.timeStr, duration)

              if (startTime <= now) {
                     return { success: false, error: 'Ese horario ya no está disponible.' }
              }

              await expirePublicSlotHolds(data.clubId, now)

              const hold = await prisma.$transaction(async (tx) => {
                     const expiresAt = getPublicBookingHoldExpiration(now)

                     await tx.slotHold.updateMany({
                            where: {
                                   clubId: data.clubId,
                                   status: 'ACTIVE',
                                   expiresAt: { lte: now }
                            },
                            data: {
                                   status: 'EXPIRED'
                            }
                     })

                     const existingBooking = await tx.booking.findFirst({
                            where: {
                                   clubId: data.clubId,
                                   courtId: data.courtId,
                                   status: { in: [...AVAILABILITY_BLOCKING_BOOKING_STATUSES] },
                                   startTime: { lt: endTime },
                                   endTime: { gt: startTime }
                            },
                            select: { id: true }
                     })

                     if (existingBooking) {
                            throw new Error('El turno ya no está disponible.')
                     }

                     const ownHold = await tx.slotHold.findFirst({
                            where: {
                                   clubId: data.clubId,
                                   courtId: data.courtId,
                                   ownerToken: data.ownerToken,
                                   status: 'ACTIVE',
                                   expiresAt: { gt: now },
                                   startTime,
                                   endTime
                            },
                            select: { id: true, holdToken: true }
                     })

                     const conflictingHold = await tx.slotHold.findFirst({
                            where: {
                                   clubId: data.clubId,
                                   courtId: data.courtId,
                                   status: 'ACTIVE',
                                   expiresAt: { gt: now },
                                   ownerToken: { not: data.ownerToken },
                                   startTime: { lt: endTime },
                                   endTime: { gt: startTime }
                            },
                            select: { id: true }
                     })

                     if (conflictingHold) {
                            throw new Error('Otro jugador está terminando de reservar ese horario. Elegí otro turno.')
                     }

                     await tx.slotHold.updateMany({
                            where: {
                                   clubId: data.clubId,
                                   ownerToken: data.ownerToken,
                                   status: 'ACTIVE',
                                   ...(ownHold ? { id: { not: ownHold.id } } : {})
                            },
                            data: {
                                   status: 'RELEASED',
                                   releasedAt: now
                            }
                     })

                     if (ownHold) {
                            return tx.slotHold.update({
                                   where: { id: ownHold.id },
                                   data: { expiresAt }
                            })
                     }

                     return tx.slotHold.create({
                            data: {
                                   clubId: data.clubId,
                                   courtId: data.courtId,
                                   ownerToken: data.ownerToken,
                                   holdToken: crypto.randomUUID(),
                                   startTime,
                                   endTime,
                                   expiresAt
                            }
                     })
              }, {
                     isolationLevel: Prisma.TransactionIsolationLevel.Serializable
              })

              return {
                     success: true,
                     holdToken: hold.holdToken,
                     expiresAt: hold.expiresAt.toISOString()
              }
       } catch (error: unknown) {
              console.error('[createPublicBookingHold] Error:', error)
              return {
                     success: false,
                     error: error instanceof Error ? error.message : 'No se pudo guardar el horario.'
              }
       }
}

export async function releasePublicBookingHold(holdToken: string, ownerToken: string) {
       try {
              if (!holdToken || !ownerToken) {
                     return { success: true }
              }

              await prisma.slotHold.updateMany({
                     where: {
                            holdToken,
                            ownerToken,
                            status: 'ACTIVE'
                     },
                     data: {
                            status: 'RELEASED',
                            releasedAt: new Date()
                     }
              })

              return { success: true }
       } catch (error) {
              console.error('[releasePublicBookingHold] Error:', error)
              return { success: false, error: 'No se pudo liberar el horario.' }
       }
}

export async function createPublicBooking(data: PublicBookingInput) {
       try {
              await enforceActiveSubscription(data.clubId)

              const ip = await getClientIp()
              const rl = await checkRateLimit(`booking:${ip}`, 5, 15 * 60_000)
              if (!rl.success) {
                     return { success: false, error: 'Demasiados intentos. Esperá unos minutos e intentá de nuevo.' }
              }

              const dateStr = data.dateStr ?? data.date
              const timeStr = data.timeStr ?? data.time
              const clientName = data.clientName ?? data.guestName
              const clientPhone = (data.clientPhone ?? data.guestPhone)?.trim()

              if (!dateStr || !timeStr || !clientName || !clientPhone) {
                     return { success: false, error: 'Faltan datos obligatorios para crear la reserva.' }
              }

              if (clientName.trim().length < 2) {
                     return { success: false, error: 'El nombre debe tener al menos 2 caracteres.' }
              }

              const phoneDigits = clientPhone.replace(/\D/g, '')
              if (phoneDigits.length < 8 || phoneDigits.length > 15) {
                     return { success: false, error: 'El teléfono ingresado no es válido.' }
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
                     const clientCandidates = await prisma.client.findMany({
                            where: {
                                   clubId: data.clubId,
                                   phone: { contains: getPhoneLastDigits(clientPhone) }
                            },
                            take: 20
                     })

                     let client = clientCandidates.find((candidate) => phoneMatches(clientPhone, candidate.phone)) ?? null

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
                     select: { slotDuration: true, bookingDeposit: true, cancelHours: true, slug: true, name: true, phone: true }
              })
              if (!club) return { success: false, error: 'Club not found' }

              // 2b. Fetch Court and Verify Ownership
              const court = await prisma.court.findFirst({
                     where: { id: data.courtId, clubId: data.clubId, isActive: true }
              })

              if (!court) {
                     return { success: false, error: 'La cancha seleccionada no es válida para este club.' }
              }

              const courtDuration = PADEL_SLOT_MINUTES


              const duration = data.durationMinutes || courtDuration

              const { startTime: dateTime, endTime } = getPublicBookingWindow(dateStr, timeStr, duration)

              // Validate that the booking is not in the past
              const now = new Date()
              if (dateTime < now) {
                     return { success: false, error: 'No se pueden reservar turnos con horarios que ya han pasado.' }
              }

              const price = await getEffectivePrice(data.clubId, dateTime, duration, false, 0, data.courtId)
              await expirePublicSlotHolds(data.clubId, now)

              // 4. Check Availability (Prevent Double Booking)
               const existingBooking = await prisma.booking.findFirst({
                      where: {
                             clubId: data.clubId,
                             courtId: data.courtId,
                             status: { in: [...AVAILABILITY_BLOCKING_BOOKING_STATUSES] },
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

              if (data.isGuest) {
                     const guestHistory = await prisma.booking.findMany({
                            where: {
                                   clubId: data.clubId,
                                   guestPhone: { contains: getPhoneLastDigits(clientPhone) },
                                   status: 'NO_SHOW'
                            },
                            select: { guestPhone: true }
                     })
                     const noShowCount = guestHistory.filter((booking) => phoneMatches(clientPhone, booking.guestPhone)).length
                     if (noShowCount >= 2) {
                            return { success: false, error: 'Tu número no puede realizar nuevas reservas. Contactá al club.' }
                     }

                     const activeBookings = await prisma.booking.findMany({
                            where: {
                                   clubId: data.clubId,
                                   guestPhone: { contains: getPhoneLastDigits(clientPhone) },
                                   status: { in: ['PENDING', 'CONFIRMED'] },
                                   startTime: { gt: new Date() }
                            },
                            select: { guestPhone: true }
                     })
                     const activeCount = activeBookings.filter((booking) => phoneMatches(clientPhone, booking.guestPhone)).length
                     if (activeCount >= 1) {
                            return { success: false, error: 'Ya tenés una reserva activa. Cancelá la anterior para hacer una nueva.' }
                     }
              }

              // 5. Create Booking
              // publicToken enables the client to cancel their own booking via the
              // public cancel-public route without requiring authentication.
              const booking = await prisma.$transaction(async (tx) => {
                     const matchingHold =
                            data.holdToken && data.holdOwnerToken
                                   ? await tx.slotHold.findFirst({
                                            where: {
                                                   clubId: data.clubId,
                                                   courtId: data.courtId,
                                                   holdToken: data.holdToken,
                                                   ownerToken: data.holdOwnerToken,
                                                   status: 'ACTIVE',
                                                   expiresAt: { gt: now },
                                                   startTime: dateTime,
                                                   endTime
                                            },
                                            select: { id: true }
                                     })
                                   : null

                     if (data.holdToken && !matchingHold) {
                            throw new Error('El horario reservado venció. Elegí nuevamente el turno.')
                     }

                     const [existingBooking, conflictingHold] = await Promise.all([
                            tx.booking.findFirst({
                                   where: {
                                          clubId: data.clubId,
                                          courtId: data.courtId,
                                          status: { in: [...AVAILABILITY_BLOCKING_BOOKING_STATUSES] },
                                          startTime: { lt: endTime },
                                          endTime: { gt: dateTime }
                                   },
                                   select: { id: true }
                            }),
                            tx.slotHold.findFirst({
                                   where: {
                                          clubId: data.clubId,
                                          courtId: data.courtId,
                                          status: 'ACTIVE',
                                          expiresAt: { gt: now },
                                          startTime: { lt: endTime },
                                          endTime: { gt: dateTime },
                                          ...(data.holdToken ? { holdToken: { not: data.holdToken } } : {}),
                                          ...(data.holdOwnerToken ? { ownerToken: { not: data.holdOwnerToken } } : {})
                                   },
                                   select: { id: true }
                            })
                     ])

                     if (existingBooking || conflictingHold) {
                            throw new Error('El turno ya no está disponible.')
                     }

                     const createdBooking = await tx.booking.create({
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
                                   isOpenMatch: data.isOpenMatch || false,
                                   matchLevel: data.matchLevel,
                                   matchGender: data.matchGender
                            }
                     })

                     if (matchingHold) {
                            await tx.slotHold.update({
                                   where: { id: matchingHold.id },
                                   data: {
                                          status: 'CONSUMED',
                                          bookingId: createdBooking.id,
                                          consumedAt: now
                                   }
                            })
                     }

                     return createdBooking
              }, {
                     isolationLevel: Prisma.TransactionIsolationLevel.Serializable
              })

              try {
                     const { pusherServer } = await import('@/lib/pusher')
                     await pusherServer.trigger(`club-${data.clubId}`, 'booking-update', {
                            action: 'create',
                            bookingId: booking.id,
                            clientName: clientName,
                            courtName: court.name,
                            time: timeStr
                     })
              } catch (pusherErr) {
                     console.error('[PUSHER ERROR in public-booking]', pusherErr)
              }

              try {
                     const { sendPushToClubUsers } = await import('@/lib/push-notifications')
                     const startLabel = fromUTC(dateTime).toLocaleString('es-AR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                     })

                     await sendPushToClubUsers(data.clubId, {
                            title: 'Nueva reserva online',
                            body: `${court.name} · ${startLabel} · ${clientName}`,
                            kind: 'bookings',
                            url: '/dashboard?view=bookings',
                            tag: `public-booking-${booking.id}`,
                            actions: [
                                   { action: 'open-bookings', title: 'Ver agenda', url: '/dashboard?view=bookings' },
                                   { action: 'open-public', title: 'Link público', url: `/p/${club.slug}` }
                            ],
                            data: {
                                   bookingId: booking.id,
                                   type: 'public_booking_create'
                            }
                     })
              } catch (pushError) {
                     console.error('[PUSH ERROR in public-booking]', pushError)
              }

              // Client-facing notifications (fire-and-forget)
              try {
                     const [{ MessagingService }, { sendBookingConfirmationEmail }] = await Promise.all([
                            import('@/lib/messaging'),
                            import('@/lib/email')
                     ])
                     const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://courtops.net'
                     const paymentUrl = `${appUrl}/pay/${booking.id}?token=${booking.publicToken}`

                     const dateFormatter = new Intl.DateTimeFormat('es-AR', {
                            weekday: 'long', day: '2-digit', month: 'long',
                            timeZone: 'America/Argentina/Buenos_Aires'
                     })
                     const dateLabel = dateFormatter.format(dateTime)

                     if (data.isGuest) {
                            const waMsg = MessagingService.generateBookingMessage({
                                   schedule: { startTime: dateTime, courtName: court.name },
                                   client: { name: clientName },
                                   pricing: { totalPrice: Number(price) },
                                   meta: { paymentUrl, cancelHours: club.cancelHours ?? 24 }
                            }, 'pending_booking')
                            MessagingService.sendWhatsApp(clientPhone!, waMsg).catch(e =>
                                   console.error('[WA] pending booking notif failed:', e)
                            )
                     } else {
                            const waMsg = MessagingService.generateBookingMessage({
                                   schedule: { startTime: dateTime, courtName: court.name },
                                   client: { name: clientName },
                                   pricing: { totalPrice: Number(price) }
                            }, 'new_booking')
                            MessagingService.sendWhatsApp(clientPhone!, waMsg).catch(e =>
                                   console.error('[WA] confirmed booking notif failed:', e)
                            )
                     }

                     if (data.email) {
                            sendBookingConfirmationEmail(
                                   data.email,
                                   clientName!,
                                   dateLabel,
                                   timeStr,
                                   court.name,
                                   club.name,
                                   Number(price),
                                   {
                                          isPending: data.isGuest,
                                          paymentUrl: data.isGuest ? paymentUrl : undefined,
                                          cancelHours: club.cancelHours ?? 24,
                                          clubPhone: club.phone
                                   }
                            ).catch(e => console.error('[EMAIL] booking confirmation failed:', e))
                     }
              } catch (notifErr) {
                     console.error('[NOTIF] Error sending booking notifications:', notifErr)
              }

              revalidatePath('/')
              revalidatePath(`/p/${club.slug}`)
              revalidatePath(`/${club.slug}`)
              return {
                     success: true,
                     bookingId: booking.id,
                     publicToken: booking.publicToken as string,
                     bookingStatus: booking.status,
                     paymentStatus: booking.paymentStatus
              }
       } catch (error: unknown) {
              console.error("ERROR CREATING PUBLIC BOOKING:", error)
              return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
       }
}

export async function getPublicBooking(bookingId: number, clubId: string, publicToken?: string | null) {
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
                     publicToken: true,
                     guestName: true,
                     guestPhone: true,
                     court: { select: { id: true, name: true } },
                     client: { select: { id: true, name: true, phone: true } }
              }
       })
       if (booking?.publicToken && publicToken !== booking.publicToken) {
              return null
       }
       return booking
}

export async function createPublicWaitingList(data: PublicWaitingListInput) {
       try {
              await enforceActiveSubscription(data.clubId)

              const clientName = data.clientName.trim()
              const clientPhone = data.clientPhone.trim()
              const notes = data.notes?.trim()

              if (!data.dateStr || !clientName || !clientPhone) {
                     return { success: false, error: 'Faltan datos para unirte a la lista de espera.' }
              }

              if (clientName.length < 2) {
                     return { success: false, error: 'El nombre debe tener al menos 2 caracteres.' }
              }

              const phoneDigits = clientPhone.replace(/\D/g, '')
              if (phoneDigits.length < 8 || phoneDigits.length > 15) {
                     return { success: false, error: 'El teléfono ingresado no es válido.' }
              }

              const [y, m, d] = data.dateStr.split('-').map(Number)
              const waitingDate = createArgDate(y, m - 1, d, 0, 0)

              if (Number.isNaN(waitingDate.getTime())) {
                     return { success: false, error: 'La fecha seleccionada no es válida.' }
              }

              const club = await prisma.club.findUnique({
                     where: { id: data.clubId },
                     select: { slug: true }
              })

              if (!club) {
                     return { success: false, error: 'Club no encontrado.' }
              }

              let clientId: number | undefined
              const existingClientCandidates = await prisma.client.findMany({
                     where: {
                            clubId: data.clubId,
                            phone: { contains: getPhoneLastDigits(clientPhone) }
                     },
                     take: 20
              })
              const existingClient = existingClientCandidates.find((candidate) => phoneMatches(clientPhone, candidate.phone))

              if (existingClient) {
                     clientId = existingClient.id
              }

              const duplicateCandidates = await prisma.waitingList.findMany({
                     where: {
                            clubId: data.clubId,
                            phone: { contains: getPhoneLastDigits(clientPhone) },
                            date: waitingDate,
                            status: 'PENDING'
                     }
              })
              const duplicateEntry = duplicateCandidates.find((entry) => phoneMatches(clientPhone, entry.phone))

              if (duplicateEntry) {
                     return { success: false, error: 'Ya estás anotado en la lista de espera para esta fecha.' }
              }

              await prisma.waitingList.create({
                     data: {
                            clubId: data.clubId,
                            date: waitingDate,
                            courtId: data.courtId,
                            clientId,
                            name: clientName,
                            phone: clientPhone,
                            notes: notes || undefined
                     }
              })

              try {
                     const { pusherServer } = await import('@/lib/pusher')
                     await pusherServer.trigger(`club-${data.clubId}`, 'waiting-list-update', {
                            action: 'create',
                            dateStr: waitingDate.toISOString(),
                            name: clientName,
                            source: 'public'
                     })
              } catch (pusherErr) {
                     console.error('[PUSHER ERROR in public-waiting-list]', pusherErr)
              }

              try {
                     const { sendPushToClubUsers } = await import('@/lib/push-notifications')
                     await sendPushToClubUsers(data.clubId, {
                            title: 'Nuevo pedido en lista de espera',
                            body: `${clientName} quiere aviso para ${data.dateStr}.`,
                            kind: 'waitingList',
                            url: '/dashboard?view=bookings',
                            tag: `waiting-list-${data.dateStr}-${clientPhone}`,
                            actions: [
                                   { action: 'open-bookings', title: 'Ver agenda', url: '/dashboard?view=bookings' },
                                   { action: 'open-clients', title: 'Ver clientes', url: '/clientes' }
                            ],
                            data: {
                                   type: 'waiting_list_create'
                            }
                     })
              } catch (pushError) {
                     console.error('[PUSH ERROR in public-waiting-list]', pushError)
              }

              revalidatePath(`/p/${club.slug}`)
              revalidatePath(`/${club.slug}`)

              return { success: true }
       } catch (error: unknown) {
              console.error('ERROR CREATING PUBLIC WAITING LIST:', error)
              return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
       }
}

export async function submitPublicTransfer(bookingId: number, data: {
       receiptUrl?: string,
       reference: string,
       publicToken?: string | null
}) {
       try {
              const booking = await prisma.booking.findUnique({
                     where: { id: bookingId },
                     include: {
                            court: { select: { name: true } },
                            client: { select: { phone: true, name: true } }
                     }
              });

               if (!booking) {
                      return { success: false, error: 'Reserva no encontrada' };
               }

               if (booking.publicToken && data.publicToken !== booking.publicToken) {
                      return { success: false, error: 'Reserva no encontrada' };
               }

               await prisma.booking.update({
                      where: { id_clubId: { id: bookingId, clubId: booking.clubId } },
                      data: {
                             paymentStatus: 'PENDING_VALIDATION',
                             paymentMethod: 'TRANSFER',
                            paymentReference: data.reference,
                            receiptUrl: data.receiptUrl
                     }
              });

              // Notify client that receipt was received (fire-and-forget)
              try {
                     const { MessagingService } = await import('@/lib/messaging')
                     const phone = booking.guestPhone || booking.client?.phone
                     const name = booking.guestName || booking.client?.name || 'Jugador'
                     if (phone) {
                            MessagingService.sendWhatsApp(phone, [
                                   `🧾 *Comprobante recibido*`,
                                   ``,
                                   `Hola *${name}*!`,
                                   `Recibimos tu comprobante de transferencia para:`,
                                   ``,
                                   `📍 ${booking.court?.name || 'tu cancha'}`,
                                   ``,
                                   `Lo revisaremos pronto y confirmaremos tu turno.`,
                                   `Ante cualquier duda, contactá al club. 🙌`
                            ].join('\n')).catch(e => console.error('[WA] transfer receipt notif failed:', e))
                     }
              } catch (notifErr) {
                     console.error('[NOTIF] Transfer receipt notification failed:', notifErr)
              }

              revalidatePath('/');
              revalidatePath(`/pay/${bookingId}`);

              return { success: true };
       } catch (error) {
              console.error("[submitPublicTransfer] Error:", error);
              return { success: false, error: 'Error al procesar el pago' };
       }
}

export async function cancelActiveGuestBooking(phone: string, clubId: string) {
       try {
              const phoneLastDigits = getPhoneLastDigits(phone)
              const bookingCandidates = await prisma.booking.findMany({
                     where: {
                            clubId,
                            guestPhone: { contains: phoneLastDigits },
                            status: { in: ['PENDING', 'CONFIRMED'] },
                            startTime: { gt: new Date() }
                     },
                     select: { id: true, startTime: true, courtId: true, guestPhone: true }
               })

              const booking = bookingCandidates.find((candidate) => phoneMatches(phone, candidate.guestPhone))

              if (!booking) {
                     return { success: false, error: 'No se encontró una reserva activa para cancelar.' }
              }

              await prisma.booking.update({
                     where: { id_clubId: { id: booking.id, clubId } },
                     data: { status: 'CANCELED' }
              })

              return { success: true }
       } catch (error) {
              console.error('[cancelActiveGuestBooking] Error:', error)
              return { success: false, error: 'No se pudo cancelar la reserva anterior.' }
       }
}
