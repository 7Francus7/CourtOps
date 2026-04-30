import prisma from '@/lib/db'
import { parsePushPreferences, type PushPreferenceKey } from '@/lib/push-preferences'
import webpush from 'web-push'

type PushAction = {
	action: string
	title: string
	url?: string
}

type PushPayload = {
	title: string
	body: string
	kind: PushPreferenceKey
	url?: string
	tag?: string
	icon?: string
	badge?: string
	actions?: PushAction[]
	vibrate?: number[]
	requireInteraction?: boolean
	renotify?: boolean
	timestamp?: number
	data?: Record<string, unknown>
}

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:soporte@courtops.net'

let configured = false

type PushSubscriptionRecord = {
	id: string
	endpoint: string
	p256dh: string
	auth: string
	user: {
		pushPreferences: string | null
	}
}

const pushSubscriptionDelegate = prisma.pushSubscription as unknown as {
	findMany: (_args: unknown) => Promise<PushSubscriptionRecord[]>
	update: (_args: unknown) => Promise<unknown>
	delete: (_args: unknown) => Promise<unknown>
}

const clubDelegate = prisma.club as unknown as {
	findUnique: (_args: unknown) => Promise<{ name: string } | null>
}

function getNotificationPresentation(kind: PushPreferenceKey) {
	switch (kind) {
		case 'bookings':
			return { vibrate: [70, 35, 70], requireInteraction: false, renotify: false }
		case 'cancellations':
			return { vibrate: [120, 45, 120, 45, 120], requireInteraction: true, renotify: true }
		case 'waitingList':
			return { vibrate: [100, 30, 100], requireInteraction: true, renotify: true }
		case 'payments':
			return { vibrate: [80, 30, 80], requireInteraction: false, renotify: false }
		case 'stock':
			return { vibrate: [90, 30, 90], requireInteraction: false, renotify: true }
		default:
			return { vibrate: [70, 35, 70], requireInteraction: false, renotify: false }
	}
}

function ensureWebPushConfigured() {
	if (configured) return true
	if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return false

	webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
	configured = true
	return true
}

export function isPushNotificationsEnabled() {
	return Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY)
}

export async function sendPushToClubUsers(clubId: string, payload: PushPayload) {
	if (!ensureWebPushConfigured()) return

	const club = await clubDelegate.findUnique({
		where: { id: clubId },
		select: { name: true }
	})

	const subscriptions = await pushSubscriptionDelegate.findMany({
		where: { clubId },
		select: {
			id: true,
			endpoint: true,
			p256dh: true,
			auth: true,
			user: {
				select: {
					pushPreferences: true
				}
			}
		}
	})

	if (subscriptions.length === 0) return

	const presentation = getNotificationPresentation(payload.kind)
	const actions = payload.actions || []
	const actionUrls = actions.reduce<Record<string, string>>((acc, action) => {
		if (action.url) {
			acc[action.action] = action.url
		}
		return acc
	}, {})

	const message = JSON.stringify({
		title: payload.title,
		clubName: club?.name || 'CourtOps',
		body: payload.body,
		url: payload.url || '/dashboard',
		tag: payload.tag || 'courtops-event',
		icon: payload.icon || '/icon-192.png',
		badge: payload.badge || '/icon-192.png',
		actions,
		vibrate: payload.vibrate || presentation.vibrate,
		requireInteraction: payload.requireInteraction ?? presentation.requireInteraction,
		renotify: payload.renotify ?? presentation.renotify,
		timestamp: payload.timestamp || Date.now(),
		data: {
			...(payload.data || {}),
			actionUrls
		}
	})

	await Promise.allSettled(
		subscriptions.map(async subscription => {
			try {
				const preferences = parsePushPreferences(subscription.user.pushPreferences)
				if (!preferences[payload.kind]) return

				await webpush.sendNotification(
					{
						endpoint: subscription.endpoint,
						keys: {
							p256dh: subscription.p256dh,
							auth: subscription.auth
						}
					},
					message
				)

				await pushSubscriptionDelegate.update({
					where: { id: subscription.id },
					data: { lastUsedAt: new Date() }
				})
			} catch (error) {
				const statusCode =
					typeof error === 'object' && error !== null && 'statusCode' in error
						? Number((error as { statusCode?: number }).statusCode)
						: null

				if (statusCode === 404 || statusCode === 410) {
					await pushSubscriptionDelegate.delete({
						where: { id: subscription.id }
					}).catch(() => null)
				} else {
					console.error('[PUSH SEND ERROR]', error)
				}
			}
		})
	)
}
