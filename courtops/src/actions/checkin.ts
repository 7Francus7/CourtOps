'use server'

import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'

export async function checkInByToken(token: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { checkinToken: token },
      include: {
        court: { select: { name: true } },
        client: { select: { name: true } },
        club: { select: { name: true } },
      },
    })

    if (!booking) return { success: false, error: 'Código de check-in inválido' }
    if (booking.status === 'CANCELED') return { success: false, error: 'Esta reserva fue cancelada' }
    if (booking.checkedInAt) {
      return {
        success: true,
        alreadyCheckedIn: true,
        checkedInAt: booking.checkedInAt,
        booking: {
          id: booking.id,
          courtName: booking.court.name,
          clientName: booking.client?.name || booking.guestName || 'Invitado',
          clubName: booking.club.name,
          startTime: booking.startTime,
          endTime: booking.endTime,
        },
      }
    }

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { checkedInAt: new Date() },
    })

    return {
      success: true,
      alreadyCheckedIn: false,
      checkedInAt: updated.checkedInAt,
      booking: {
        id: booking.id,
        courtName: booking.court.name,
        clientName: booking.client?.name || booking.guestName || 'Invitado',
        clubName: booking.club.name,
        startTime: booking.startTime,
        endTime: booking.endTime,
      },
    }
  } catch (error) {
    console.error('Check-in error:', error)
    return { success: false, error: 'Error al procesar el check-in' }
  }
}

export async function checkInByBookingId(bookingId: number) {
  try {
    const clubId = await getCurrentClubId()

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, clubId },
    })

    if (!booking) return { success: false, error: 'Reserva no encontrada' }
    if (booking.checkedInAt) return { success: false, error: 'Ya tiene check-in registrado' }

    await prisma.booking.update({
      where: { id: bookingId },
      data: { checkedInAt: new Date() },
    })

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Check-in error:', error)
    return { success: false, error: 'Error al procesar el check-in' }
  }
}

export async function getTodayBookingsForCheckin() {
  try {
    const clubId = await getCurrentClubId()

    const now = new Date()
    const startOfDay = new Date(now)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(now)
    endOfDay.setHours(23, 59, 59, 999)

    const bookings = await prisma.booking.findMany({
      where: {
        clubId,
        startTime: { gte: startOfDay, lte: endOfDay },
        status: { not: 'CANCELED' },
        deletedAt: null,
      },
      include: {
        court: { select: { name: true } },
        client: { select: { name: true, phone: true } },
      },
      orderBy: { startTime: 'asc' },
    })

    return bookings.map((b) => ({
      id: b.id,
      courtName: b.court.name,
      clientName: b.client?.name || b.guestName || 'Sin nombre',
      clientPhone: b.client?.phone || b.guestPhone || '',
      startTime: b.startTime,
      endTime: b.endTime,
      checkedInAt: b.checkedInAt,
      checkinToken: b.checkinToken,
      status: b.status,
    }))
  } catch (error) {
    console.error('Error fetching bookings for checkin:', error)
    return []
  }
}
