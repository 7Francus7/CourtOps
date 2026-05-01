'use server'

import prisma from '@/lib/db'
import { getCache, setCache } from '@/lib/cache'
import { sendTextMessage, normalizePhone } from '@/lib/whatsapp'
import { cookies } from 'next/headers'
import { createHmac } from 'crypto'
import { fromUTC } from '@/lib/date-utils'

const SECRET = process.env.NEXTAUTH_SECRET ?? 'fallback-secret'

function signToken(payload: object): string {
  const data = JSON.stringify(payload)
  const sig = createHmac('sha256', SECRET).update(data).digest('hex')
  return Buffer.from(data).toString('base64url') + '.' + sig
}

function verifyToken(token: string): { phone: string; clubId: string; exp: number } | null {
  try {
    const [dataB64, sig] = token.split('.')
    const data = Buffer.from(dataB64, 'base64url').toString()
    const expected = createHmac('sha256', SECRET).update(data).digest('hex')
    if (sig !== expected) return null
    const payload = JSON.parse(data)
    if (payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

function sessionKey(clubId: string) {
  return `player_session_${clubId}`
}

export async function sendPlayerOTP(phone: string, clubSlug: string) {
  const club = await prisma.club.findUnique({
    where: { slug: clubSlug },
    select: { id: true, name: true },
  })
  if (!club) return { error: 'Club no encontrado' }

  const normalized = normalizePhone(phone.trim())
  if (normalized.length < 8) return { error: 'Teléfono inválido' }

  const code = Math.floor(100000 + Math.random() * 900000).toString()
  await setCache(`player_otp:${club.id}:${normalized}`, code, 300)

  const result = await sendTextMessage(
    normalized,
    `Tu código de acceso para *${club.name}* es: *${code}*\n\nVence en 5 minutos. No lo compartas.`
  )

  if (!result.success && !result.simulated) {
    return { error: 'No se pudo enviar el código. Intentá de nuevo.' }
  }

  return { ok: true, simulated: result.simulated }
}

export async function verifyPlayerOTP(phone: string, clubSlug: string, code: string) {
  const club = await prisma.club.findUnique({
    where: { slug: clubSlug },
    select: { id: true },
  })
  if (!club) return { error: 'Club no encontrado' }

  const normalized = normalizePhone(phone.trim())
  const stored = await getCache<string>(`player_otp:${club.id}:${normalized}`)

  if (!stored || stored.trim() !== code.trim()) {
    return { error: 'Código incorrecto o expirado' }
  }

  // Invalidate OTP immediately
  await setCache(`player_otp:${club.id}:${normalized}`, '__used__', 1)

  const token = signToken({
    phone: normalized,
    clubId: club.id,
    exp: Date.now() + 24 * 60 * 60 * 1000,
  })

  const cookieStore = await cookies()
  cookieStore.set(sessionKey(club.id), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 86400,
    path: '/',
    sameSite: 'lax',
  })

  return { ok: true }
}

export async function getPlayerSession(clubId: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get(sessionKey(clubId))?.value
  if (!token) return null
  return verifyToken(token)
}

export async function getPlayerDashboard(clubSlug: string) {
  const club = await prisma.club.findUnique({
    where: { slug: clubSlug },
    select: {
      id: true,
      name: true,
      themeColor: true,
      logoUrl: true,
      slug: true,
      cancelHours: true,
    },
  })
  if (!club) return null

  const session = await getPlayerSession(club.id)
  if (!session) return { club, authenticated: false as const }

  const phoneLastDigits = session.phone.replace(/\D/g, '').slice(-8)

  const client = await prisma.client.findFirst({
    where: {
      clubId: club.id,
      deletedAt: null,
      phone: { contains: phoneLastDigits },
    },
    select: {
      id: true,
      name: true,
      membershipStatus: true,
      membershipExpiresAt: true,
    },
  })

  const now = new Date()

  const bookings = await prisma.booking.findMany({
    where: {
      clubId: club.id,
      deletedAt: null,
      status: { not: 'CANCELED' },
      OR: [
        client ? { clientId: client.id } : { id: -1 },
        { guestPhone: { contains: phoneLastDigits } },
      ],
    },
    select: {
      id: true,
      startTime: true,
      endTime: true,
      price: true,
      status: true,
      paymentStatus: true,
      court: { select: { name: true } },
    },
    orderBy: { startTime: 'desc' },
    take: 40,
  })

  const upcoming = bookings
    .filter((b) => b.startTime > now)
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    .map((b) => ({
      ...b,
      startTime: fromUTC(b.startTime).toISOString(),
      endTime: fromUTC(b.endTime).toISOString(),
    }))

  const past = bookings
    .filter((b) => b.startTime <= now)
    .slice(0, 15)
    .map((b) => ({
      ...b,
      startTime: fromUTC(b.startTime).toISOString(),
      endTime: fromUTC(b.endTime).toISOString(),
    }))

  return {
    club,
    authenticated: true as const,
    client: client
      ? {
          ...client,
          membershipExpiresAt: client.membershipExpiresAt?.toISOString() ?? null,
        }
      : null,
    phone: session.phone,
    upcoming,
    past,
  }
}

export async function cancelPlayerBooking(bookingId: number, clubSlug: string) {
  const club = await prisma.club.findUnique({
    where: { slug: clubSlug },
    select: { id: true, cancelHours: true },
  })
  if (!club) return { error: 'Club no encontrado' }

  const session = await getPlayerSession(club.id)
  if (!session) return { error: 'Sesión expirada. Ingresá de nuevo.' }

  const phoneLastDigits = session.phone.replace(/\D/g, '').slice(-8)

  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      clubId: club.id,
      deletedAt: null,
      OR: [
        { guestPhone: { contains: phoneLastDigits } },
        { client: { phone: { contains: phoneLastDigits } } },
      ],
    },
  })

  if (!booking) return { error: 'Reserva no encontrada' }
  if (booking.status === 'CANCELED') return { error: 'La reserva ya fue cancelada' }

  const hoursUntil = (booking.startTime.getTime() - Date.now()) / 3_600_000
  if (hoursUntil < 0) return { error: 'La reserva ya pasó' }

  const cancelHours = club.cancelHours ?? 6
  if (hoursUntil < cancelHours) {
    return { error: `Solo podés cancelar con al menos ${cancelHours}h de anticipación` }
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'CANCELED',
      canceledAt: new Date(),
      cancelReason: 'Cancelado por el jugador desde portal',
    },
  })

  return { ok: true }
}

export async function logoutPlayer(clubSlug: string) {
  const club = await prisma.club.findUnique({
    where: { slug: clubSlug },
    select: { id: true },
  })
  if (!club) return
  const cookieStore = await cookies()
  cookieStore.delete(sessionKey(club.id))
}
