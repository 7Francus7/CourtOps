'use server'

import prisma from '@/lib/db'
import { logAction } from '@/lib/logger'
import { revalidatePath } from 'next/cache'
import { fromUTC } from '@/lib/date-utils'
import { sendPushToClubUsers } from '@/lib/push-notifications'

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
			court: { select: { name: true } },
			client: { select: { name: true } }
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

	let waitingListMatches = 0
	try {
		const startOfDay = new Date(booking.startTime)
		startOfDay.setHours(0, 0, 0, 0)
		const nextDay = new Date(startOfDay)
		nextDay.setDate(nextDay.getDate() + 1)

		waitingListMatches = await prisma.waitingList.count({
			where: {
				clubId: booking.clubId,
				status: 'PENDING',
				date: {
					gte: startOfDay,
					lt: nextDay
				},
				AND: [
					{
						OR: [
							{ startTime: null },
							{ startTime: booking.startTime }
						]
					},
					{
						OR: [
							{ courtId: null },
							{ courtId: booking.courtId }
						]
					}
				]
			}
		})
	} catch (error) {
		console.error('[PUBLIC CANCEL WAITING LIST]', error)
	}

	try {
		const { pusherServer } = await import('@/lib/pusher')
		await pusherServer.trigger(`club-${booking.clubId}`, 'booking-update', {
			action: 'cancel',
			bookingId: booking.id,
			waitingListMatches,
			startTime: booking.startTime.toISOString(),
			courtId: booking.courtId
		})
	} catch {}

	try {
		const clientName = booking.guestName || booking.client?.name || 'Cliente'
		const startLabel = fromUTC(booking.startTime).toLocaleString('es-AR', {
			day: '2-digit',
			month: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		})

		await sendPushToClubUsers(booking.clubId, {
			title: 'Se liberó una cancha',
			body: `${booking.court.name} · ${startLabel} · canceló ${clientName}`,
			kind: 'cancellations',
			url: '/dashboard?view=bookings',
			tag: `public-cancel-${booking.id}`,
			actions: [
				{ action: 'open-bookings', title: 'Ver agenda', url: '/dashboard?view=bookings' },
				{ action: 'open-public', title: 'Link publico', url: `/p/${booking.club.slug}` }
			],
			data: {
				bookingId: booking.id,
				type: 'public_booking_cancel'
			}
		})
	} catch (error) {
		console.error('[PUSH ERROR in cancel-public-booking]', error)
	}

	revalidatePath(`/p/${booking.club.slug}`)
	revalidatePath(`/${booking.club.slug}`)

	return { success: true, isLate, cancelHours }
}
