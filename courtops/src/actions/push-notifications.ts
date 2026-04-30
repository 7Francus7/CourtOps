'use server'

import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import {
	DEFAULT_PUSH_PREFERENCES,
	parsePushPreferences,
	serializePushPreferences,
	type PushPreferences
} from '@/lib/push-preferences'
import { getCurrentClubId } from '@/lib/tenant'
import { getServerSession } from 'next-auth'

export type PushSubscriptionInput = {
	endpoint: string
	keys?: {
		p256dh?: string
		auth?: string
	}
}

const userDelegate = prisma.user as unknown as {
	findUnique: (_args: unknown) => Promise<{ pushPreferences: string | null } | null>
	update: (_args: unknown) => Promise<unknown>
}

async function getCurrentUser() {
	const session = await getServerSession(authOptions)
	if (!session?.user?.email) {
		throw new Error('Sesion invalida')
	}

	const user = await prisma.user.findUnique({
		where: { email: session.user.email },
		select: { id: true, clubId: true }
	})

	if (!user?.id || !user.clubId) {
		throw new Error('Usuario no encontrado')
	}

	return user
}

export async function subscribeToPushNotifications(
	subscription: PushSubscriptionInput,
	userAgent?: string
) {
	const clubId = await getCurrentClubId()
	const user = await getCurrentUser()

	if (user.clubId !== clubId) {
		throw new Error('Club invalido')
	}

	if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
		throw new Error('Suscripcion invalida')
	}

	await prisma.pushSubscription.upsert({
		where: { endpoint: subscription.endpoint },
		update: {
			clubId,
			userId: user.id,
			p256dh: subscription.keys.p256dh,
			auth: subscription.keys.auth,
			userAgent: userAgent || undefined,
			lastUsedAt: new Date()
		},
		create: {
			clubId,
			userId: user.id,
			endpoint: subscription.endpoint,
			p256dh: subscription.keys.p256dh,
			auth: subscription.keys.auth,
			userAgent: userAgent || undefined
		}
	})

	return { success: true }
}

export async function unsubscribeFromPushNotifications(endpoint: string) {
	const clubId = await getCurrentClubId()
	const user = await getCurrentUser()

	if (!endpoint) return { success: true }

	await prisma.pushSubscription.deleteMany({
		where: {
			clubId,
			userId: user.id,
			endpoint
		}
	})

	return { success: true }
}

export async function getMyPushPreferences() {
	const user = await getCurrentUser()

	return {
		success: true,
		data: parsePushPreferences(
			(
				await userDelegate.findUnique({
					where: { id: user.id },
					select: { pushPreferences: true }
				})
			)?.pushPreferences
		)
	}
}

export async function updateMyPushPreferences(preferences: PushPreferences) {
	const clubId = await getCurrentClubId()
	const user = await getCurrentUser()

	if (user.clubId !== clubId) {
		throw new Error('Club invalido')
	}

	const mergedPreferences: PushPreferences = {
		...DEFAULT_PUSH_PREFERENCES,
		...preferences
	}

	await userDelegate.update({
		where: { id: user.id },
		data: {
			pushPreferences: serializePushPreferences(mergedPreferences)
		}
	})

	return { success: true }
}
