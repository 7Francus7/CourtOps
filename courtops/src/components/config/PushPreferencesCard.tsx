'use client'

import { useEffect, useState, useTransition } from 'react'
import { BellRing, CalendarClock, CreditCard, Loader2, Package, XCircle } from 'lucide-react'
import { toast } from 'sonner'

import {
	getMyPushPreferences,
	updateMyPushPreferences
} from '@/actions/push-notifications'
import {
	DEFAULT_PUSH_PREFERENCES,
	type PushPreferenceKey,
	type PushPreferences
} from '@/lib/push-preferences'

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
	const [isPending, startTransition] = useTransition()

	useEffect(() => {
		let mounted = true

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

		return () => {
			mounted = false
		}
	}, [])

	const updatePreference = (key: PushPreferenceKey, value: boolean) => {
		const nextPreferences = {
			...preferences,
			[key]: value
		}

		setPreferences(nextPreferences)

		startTransition(async () => {
			try {
				const res = await updateMyPushPreferences(nextPreferences)
				if (!res.success) {
					throw new Error('No se pudieron guardar las preferencias')
				}
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
				<div className="min-w-0">
					<h3 className="text-lg font-black text-foreground">Notificaciones al celular</h3>
					<p className="mt-1 text-sm text-muted-foreground">
						Definí qué eventos te pueden interrumpir cuando tengas instalada la app.
					</p>
				</div>
			</div>

			<div className="mt-5 space-y-3">
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
