'use server'

import prisma from '@/lib/db'
import { logAction } from '@/lib/logger'
import { revalidatePath } from 'next/cache'

export async function getBookingByToken(publicToken: string) {
	if (!publicToken) return null
	return prisma.booking.findFirst({
		where: { publicToken, status: { notIn: ['CANCELED', 'NO_SHOW'] } },
		select: {
			id: true,
			startTime: true,
			endTime: true,
			price: true,
			status: true,
			guestName: true,
			guestPhone: true,
			canceledAt: true,
			club: { select: { id: true, name: true, slug: true, cancelHours: true } },
			court: { select: { name: true } },
			client: { select: { name: true, phone: true } }
		}
	})
}

export async function cancelPublicBooking(publicToken: string) {
	if (!publicToken) return { success: false, error: 'Token inválido.' }

	const booking = await prisma.booking.findFirst({
		where: { publicToken },
		include: {
			club: { select: { id: true, name: true, slug: true, cancelHours: true } },
			court: { select: { name: true } }
		}
	})

	if (!booking) return { success: false, error: 'Reserva no encontrada.' }
	if (booking.status === 'CANCELED') return { success: false, error: 'La reserva ya fue cancelada.' }
	if (booking.status === 'NO_SHOW') return { success: false, error: 'La reserva ya fue marcada como ausente.' }

	const cancelHours = booking.club.cancelHours ?? 6
	const deadline = new Date(booking.startTime.getTime() - cancelHours * 60 * 60 * 1000)
	const isLate = new Date() > deadline

	await prisma.booking.update({
		where: { id: booking.id },
		data: {
			status: 'CANCELED',
			canceledAt: new Date(),
			cancelReason: isLate ? 'CANCELLED_LATE' : 'CANCELLED_BY_CLIENT'
		}
	})

	await logAction({
		clubId: booking.clubId,
		action: 'UPDATE',
		entity: 'BOOKING',
		entityId: booking.id.toString(),
		details: {
			type: isLate ? 'CANCELLED_LATE_BY_CLIENT' : 'CANCELLED_BY_CLIENT',
			guestName: booking.guestName,
			courtName: booking.court.name,
			cancelHours
		}
	}).catch(console.error)

	try {
		const { pusherServer } = await import('@/lib/pusher')
		await pusherServer.trigger(`club-${booking.clubId}`, 'booking-update', {
			action: 'cancel',
			bookingId: booking.id
		})
	} catch {}

	revalidatePath(`/p/${booking.club.slug}`)
	revalidatePath(`/${booking.club.slug}`)

	return { success: true, isLate, cancelHours }
}
