'use client'

import { Bell, Smartphone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import {
	type PushSubscriptionInput,
	subscribeToPushNotifications,
	unsubscribeFromPushNotifications
} from '@/actions/push-notifications'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const DISMISS_KEY = 'courtops_push_prompt_dismissed'

function urlBase64ToUint8Array(base64String: string) {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
	const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
	const rawData = window.atob(base64)
	return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)))
}

function toSubscriptionInput(subscription: PushSubscriptionJSON): PushSubscriptionInput | null {
	if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
		return null
	}

	return {
		endpoint: subscription.endpoint,
		keys: {
			p256dh: subscription.keys.p256dh,
			auth: subscription.keys.auth
		}
	}
}

export function PushNotificationManager() {
	const [canPrompt, setCanPrompt] = useState(false)
	const [enabled, setEnabled] = useState(false)
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		if (!VAPID_PUBLIC_KEY) return
		if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
			return
		}

		const isStandalone =
			window.matchMedia('(display-mode: standalone)').matches ||
			document.referrer.includes('android-app://')

		if (!isStandalone) return

		const dismissed = localStorage.getItem(DISMISS_KEY) === 'true'
		const permission = window.Notification?.permission

		if (permission === 'granted') {
			setEnabled(true)
			void syncExistingSubscription()
			return
		}

		if (!dismissed && permission !== 'denied') {
			setCanPrompt(true)
		}
	}, [])

	const syncExistingSubscription = async () => {
		try {
			const registration = await navigator.serviceWorker.ready
			const subscription = await registration.pushManager.getSubscription()
			if (!subscription) {
				setEnabled(false)
				return
			}

			const normalized = toSubscriptionInput(subscription.toJSON())
			if (!normalized) return

			await subscribeToPushNotifications(normalized, navigator.userAgent)
			setEnabled(true)
		} catch (error) {
			console.error('[PUSH SYNC ERROR]', error)
		}
	}

	const handleEnable = async () => {
		if (!VAPID_PUBLIC_KEY) {
			toast.error('Faltan las claves push del servidor.')
			return
		}

		try {
			setLoading(true)
			const permission = await Notification.requestPermission()
			if (permission !== 'granted') {
				toast.error('Necesitás habilitar notificaciones para recibir avisos.')
				return
			}

			const registration = await navigator.serviceWorker.ready
			let subscription = await registration.pushManager.getSubscription()

			if (!subscription) {
				subscription = await registration.pushManager.subscribe({
					userVisibleOnly: true,
					applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
				})
			}

			const normalized = toSubscriptionInput(subscription.toJSON())
			if (!normalized) {
				toast.error('No pudimos registrar este dispositivo.')
				return
			}

			await subscribeToPushNotifications(normalized, navigator.userAgent)
			setEnabled(true)
			setCanPrompt(false)
			toast.success('Notificaciones activadas en este celular.')
		} catch (error) {
			console.error('[PUSH ENABLE ERROR]', error)
			toast.error('No pudimos activar las notificaciones.')
		} finally {
			setLoading(false)
		}
	}

	const handleDisable = async () => {
		try {
			setLoading(true)
			const registration = await navigator.serviceWorker.ready
			const subscription = await registration.pushManager.getSubscription()

			if (subscription) {
				await unsubscribeFromPushNotifications(subscription.endpoint)
				await subscription.unsubscribe()
			}

			setEnabled(false)
			setCanPrompt(false)
			localStorage.setItem(DISMISS_KEY, 'true')
			toast.success('Notificaciones desactivadas en este dispositivo.')
		} catch (error) {
			console.error('[PUSH DISABLE ERROR]', error)
			toast.error('No pudimos desactivar las notificaciones.')
		} finally {
			setLoading(false)
		}
	}

	if (!VAPID_PUBLIC_KEY) return null

	if (enabled) {
		return (
			<button
				type="button"
				onClick={handleDisable}
				disabled={loading}
				className="fixed bottom-[calc(env(safe-area-inset-bottom)+6.3rem)] right-4 z-[95] flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-500 shadow-lg backdrop-blur-xl md:bottom-4"
			>
				<Bell size={14} />
				Activas
			</button>
		)
	}

	if (!canPrompt) return null

	return (
		<div className="fixed bottom-[calc(env(safe-area-inset-bottom)+6.4rem)] left-4 right-4 z-[95] md:bottom-4 md:left-auto md:max-w-sm">
			<div className="rounded-[1.6rem] border border-border/70 bg-card/95 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
				<div className="flex items-start gap-3">
					<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
						<Smartphone size={20} />
					</div>
					<div className="min-w-0 flex-1">
						<p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
							App instalada
						</p>
						<h4 className="mt-1 text-sm font-black text-foreground">
							Activá alertas en este celular
						</h4>
						<p className="mt-1 text-xs leading-relaxed text-muted-foreground">
							Te avisamos al instante cuando entra una reserva, se cancela un turno o aparece algo importante.
						</p>
					</div>
				</div>
				<div className="mt-4 flex gap-2">
					<button
						type="button"
						onClick={() => {
							localStorage.setItem(DISMISS_KEY, 'true')
							setCanPrompt(false)
						}}
						className="flex-1 rounded-2xl border border-border/70 px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground"
					>
						Más tarde
					</button>
					<button
						type="button"
						onClick={handleEnable}
						disabled={loading}
						className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-primary-foreground shadow-sm"
					>
						<Bell size={14} />
						{loading ? 'Activando' : 'Activar'}
					</button>
				</div>
			</div>
		</div>
	)
}
