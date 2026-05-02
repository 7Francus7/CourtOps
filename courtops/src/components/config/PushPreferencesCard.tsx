'use client'

import { useEffect, useState, useTransition } from 'react'
import { Bell, BellOff, BellRing, CalendarClock, CreditCard, Loader2, Package, Smartphone, XCircle } from 'lucide-react'
import { toast } from 'sonner'

import {
	subscribeToPushNotifications,
	unsubscribeFromPushNotifications,
	getMyPushPreferences,
	updateMyPushPreferences,
	type PushSubscriptionInput
} from '@/actions/push-notifications'
import {
	DEFAULT_PUSH_PREFERENCES,
	type PushPreferenceKey,
	type PushPreferences
} from '@/lib/push-preferences'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const DISMISS_KEY = 'courtops_push_prompt_dismissed'

function urlBase64ToUint8Array(base64String: string) {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
	const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
	const rawData = window.atob(base64)
	return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)))
}

function toSubscriptionInput(subscription: PushSubscriptionJSON): PushSubscriptionInput | null {
	if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) return null
	return {
		endpoint: subscription.endpoint,
		keys: { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth }
	}
}

const OPTIONS: {
	key: PushPreferenceKey
	title: string
	description: string
	icon: typeof BellRing
}[] = [
	{
		key: 'bookings',
		title: 'Reservas nuevas',
		description: 'Cuando entra un turno nuevo desde panel o link público.',
		icon: CalendarClock
	},
	{
		key: 'cancellations',
		title: 'Cancelaciones',
		description: 'Cuando un cliente cancela y se libera una cancha.',
		icon: XCircle
	},
	{
		key: 'waitingList',
		title: 'Lista de espera',
		description: 'Cuando alguien pide aviso para una franja sin disponibilidad.',
		icon: BellRing
	},
	{
		key: 'payments',
		title: 'Pagos',
		description: 'Reservado para próximos avisos de cobros y movimientos.',
		icon: CreditCard
	},
	{
		key: 'stock',
		title: 'Stock',
		description: 'Reservado para alertas de faltantes y reposición.',
		icon: Package
	}
]

export default function PushPreferencesCard() {
	const [preferences, setPreferences] = useState<PushPreferences>(DEFAULT_PUSH_PREFERENCES)
	const [loading, setLoading] = useState(true)
	const [subscribed, setSubscribed] = useState(false)
	const [pushSupported, setPushSupported] = useState(false)
	const [subLoading, setSubLoading] = useState(false)
	const [isPending, startTransition] = useTransition()

	useEffect(() => {
		let mounted = true

		// Load preferences
		startTransition(async () => {
			try {
				const res = await getMyPushPreferences()
				if (!mounted || !res.success) return
				setPreferences(res.data)
			} catch (error) {
				console.error('[PUSH PREF LOAD ERROR]', error)
			} finally {
				if (mounted) setLoading(false)
			}
		})

		// Check subscription state
		if (
			typeof window !== 'undefined' &&
			'serviceWorker' in navigator &&
			'PushManager' in window &&
			VAPID_PUBLIC_KEY
		) {
			setPushSupported(true)
			navigator.serviceWorker.ready
				.then(reg => reg.pushManager.getSubscription())
				.then(sub => {
					if (mounted) setSubscribed(!!sub)
				})
				.catch(() => {})
		}

		return () => { mounted = false }
	}, [])

	const handleEnable = async () => {
		if (!VAPID_PUBLIC_KEY) {
			toast.error('Faltan las claves push del servidor.')
			return
		}
		try {
			setSubLoading(true)
			const permission = await Notification.requestPermission()
			if (permission !== 'granted') {
				toast.error('Necesitás habilitar notificaciones en ajustes del sistema.')
				return
			}
			const registration = await navigator.serviceWorker.ready
			let sub = await registration.pushManager.getSubscription()
			if (!sub) {
				sub = await registration.pushManager.subscribe({
					userVisibleOnly: true,
					applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
				})
			}
			const normalized = toSubscriptionInput(sub.toJSON())
			if (!normalized) {
				toast.error('No pudimos registrar este dispositivo.')
				return
			}
			await subscribeToPushNotifications(normalized, navigator.userAgent)
			localStorage.removeItem(DISMISS_KEY)
			setSubscribed(true)
			toast.success('Notificaciones activadas en este dispositivo.')
		} catch (error) {
			console.error('[PUSH ENABLE ERROR]', error)
			toast.error('No pudimos activar las notificaciones.')
		} finally {
			setSubLoading(false)
		}
	}

	const handleDisable = async () => {
		try {
			setSubLoading(true)
			const registration = await navigator.serviceWorker.ready
			const sub = await registration.pushManager.getSubscription()
			if (sub) {
				await unsubscribeFromPushNotifications(sub.endpoint)
				await sub.unsubscribe()
			}
			setSubscribed(false)
			toast.success('Notificaciones desactivadas en este dispositivo.')
		} catch (error) {
			console.error('[PUSH DISABLE ERROR]', error)
			toast.error('No pudimos desactivar las notificaciones.')
		} finally {
			setSubLoading(false)
		}
	}

	const updatePreference = (key: PushPreferenceKey, value: boolean) => {
		const nextPreferences = { ...preferences, [key]: value }
		setPreferences(nextPreferences)

		startTransition(async () => {
			try {
				const res = await updateMyPushPreferences(nextPreferences)
				if (!res.success) throw new Error('No se pudieron guardar las preferencias')
				toast.success('Preferencias de push guardadas')
			} catch (error) {
				console.error('[PUSH PREF SAVE ERROR]', error)
				setPreferences(preferences)
				toast.error('No pudimos guardar las preferencias')
			}
		})
	}

	return (
		<div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
			<div className="flex items-start gap-3">
				<div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
					<BellRing size={20} />
				</div>
				<div className="min-w-0 flex-1">
					<h3 className="text-lg font-black text-foreground">Notificaciones al celular</h3>
					<p className="mt-1 text-sm text-muted-foreground">
						Definí qué eventos te pueden interrumpir cuando tengas instalada la app.
					</p>
				</div>
			</div>

			{/* Subscription status row */}
			{pushSupported && (
				<div className="mt-4 flex items-center justify-between rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
					<div className="flex items-center gap-3">
						<div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${subscribed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
							{subscribed ? <Smartphone size={16} /> : <BellOff size={16} />}
						</div>
						<div>
							<p className="text-sm font-black text-foreground">
								{subscribed ? 'Este dispositivo recibe notificaciones' : 'Este dispositivo no está suscripto'}
							</p>
							<p className="text-xs text-muted-foreground">
								{subscribed ? 'Las preferencias de abajo aplican.' : 'Activá para recibir alertas en tiempo real.'}
							</p>
						</div>
					</div>
					<button
						type="button"
						disabled={subLoading}
						onClick={subscribed ? handleDisable : handleEnable}
						className={`flex shrink-0 items-center gap-1.5 rounded-2xl px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] transition-colors ${
							subscribed
								? 'border border-border/70 text-muted-foreground hover:text-foreground'
								: 'bg-primary text-primary-foreground shadow-sm'
						}`}
					>
						{subLoading ? (
							<Loader2 size={13} className="animate-spin" />
						) : subscribed ? (
							<><Bell size={13} /> Desactivar</>
						) : (
							<><Bell size={13} /> Activar</>
						)}
					</button>
				</div>
			)}

			<div className="mt-3 space-y-3">
				{OPTIONS.map(option => {
					const Icon = option.icon
					return (
						<div
							key={option.key}
							className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-background/60 px-4 py-3"
						>
							<div className="flex min-w-0 items-start gap-3">
								<div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
									<Icon size={16} />
								</div>
								<div className="min-w-0">
									<p className="text-sm font-black text-foreground">{option.title}</p>
									<p className="text-xs leading-relaxed text-muted-foreground">
										{option.description}
									</p>
								</div>
							</div>

							<button
								type="button"
								disabled={loading || isPending}
								onClick={() => updatePreference(option.key, !preferences[option.key])}
								aria-pressed={preferences[option.key]}
								className={`relative inline-flex h-7 w-12 shrink-0 rounded-full border transition-all ${
									preferences[option.key]
										? 'border-primary bg-primary'
										: 'border-border bg-muted'
								}`}
							>
								<span
									className={`absolute top-0.5 h-5.5 w-5.5 rounded-full bg-white shadow-sm transition-all ${
										preferences[option.key] ? 'left-[1.35rem]' : 'left-0.5'
									}`}
								/>
							</button>
						</div>
					)
				})}
			</div>

			<div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
				{loading || isPending ? <Loader2 size={14} className="animate-spin" /> : <BellRing size={14} />}
				<span>Estas preferencias aplican a tu usuario en todos tus dispositivos con la PWA activa.</span>
			</div>
		</div>
	)
}
