import prisma from '@/lib/db'
import { parsePushPreferences, type PushPreferenceKey } from '@/lib/push-preferences'
import webpush from 'web-push'

type PushPayload = {
	title: string
	body: string
	kind: PushPreferenceKey
	url?: string
	tag?: string
	icon?: string
	badge?: string
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

	const message = JSON.stringify({
		title: payload.title,
		body: payload.body,
		url: payload.url || '/dashboard',
		tag: payload.tag || 'courtops-event',
		icon: payload.icon || '/icon-192.png',
		badge: payload.badge || '/icon-192.png',
		data: payload.data || {}
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
