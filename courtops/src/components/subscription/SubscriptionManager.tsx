'use client'

import React, { useState } from 'react'
import { Check, Loader2, CreditCard, Calendar, AlertCircle, CheckCircle2, ChevronRight, Shield, Building2, Zap, Rocket, Clock, X, QrCode, Smartphone } from 'lucide-react'
import { toast } from 'sonner'
import { initiateSubscription, cancelSubscription, changePlan, cancelPendingDowngrade } from '@/actions/subscription'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

interface Plan {
	id: string
	name: string
	price: number
	setupFee?: number
	features: string[]
}

type CurrentPlan = {
	id: string
	name: string
	price: number
	setupFee?: number
	features?: string[] | string
	setupFeePaidAt?: Date | string | null
	setupFeePaymentId?: string | null
}

type SubscriptionActionResult = {
	success?: boolean
	init_point?: string
	pending?: boolean
	message?: string
	error?: string
}

interface SubscriptionManagerProps {
	currentPlan: CurrentPlan | null
	subscriptionStatus: string | null
	nextBillingDate: Date | string | null
	setupFeePaidAt?: Date | string | null
	availablePlans: Plan[]
	pendingPlan?: Plan | null
	pendingBillingCycle?: 'monthly' | 'yearly' | null
	isConfigured: boolean
	isDevMode?: boolean
}

const PLAN_ICONS: Record<string, React.ReactNode> = {
	'Base': <Rocket className="w-5 h-5" />,
	'Pro': <Zap className="w-5 h-5" />,
	'Max': <Building2 className="w-5 h-5" />,
}

const PLAN_COLORS: Record<string, { bg: string, border: string, text: string }> = {
	'Base': { bg: 'bg-sky-500', border: 'border-sky-500/30', text: 'text-sky-500' },
	'Pro': { bg: 'bg-emerald-500', border: 'border-emerald-500/30', text: 'text-emerald-500' },
	'Max': { bg: 'bg-violet-500', border: 'border-violet-500/30', text: 'text-violet-500' },
}

export default function SubscriptionManager({
	currentPlan,
	subscriptionStatus,
	nextBillingDate,
	setupFeePaidAt,
	availablePlans,
	pendingPlan,
	pendingBillingCycle,
	isConfigured
}: SubscriptionManagerProps) {
	const router = useRouter()
	const [loadingId, setLoadingId] = useState<string | null>(null)
	const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
	const [showCancelModal, setShowCancelModal] = useState(false)
	const [showPlanModal, setShowPlanModal] = useState(false)
	const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
	const [planAction, setPlanAction] = useState<'upgrade' | 'downgrade' | 'new'>('new')

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('es-AR', {
			style: 'currency',
			currency: 'ARS',
			maximumFractionDigits: 0
		}).format(price)
	}

	const isActive = subscriptionStatus?.toLowerCase() === 'authorized' || subscriptionStatus?.toLowerCase() === 'active'
	const hasPaidSubscription = Boolean(currentPlan && isActive)
	const setupFeeAlreadyPaid = Boolean(setupFeePaidAt || currentPlan?.setupFeePaidAt || currentPlan?.setupFeePaymentId || hasPaidSubscription)

	const openPlanModal = (plan: Plan, action: 'upgrade' | 'downgrade' | 'new') => {
		setSelectedPlan(plan)
		setPlanAction(action)
		setShowPlanModal(true)
	}

	const handlePlanChange = async () => {
		if (!selectedPlan) return

		setLoadingId(selectedPlan.id)
		setShowPlanModal(false)

		try {
			if (planAction === 'new') {
				const res = await initiateSubscription(selectedPlan.id, billingCycle) as SubscriptionActionResult
				if (res.success && res.init_point) {
					window.location.href = res.init_point
				} else {
					toast.error(res.error || "Error al procesar")
				}
			} else {
				const res = await changePlan(selectedPlan.id, billingCycle) as SubscriptionActionResult
				if (res.success && res.init_point) {
					window.location.href = res.init_point
				} else if (res.success && res.pending) {
					toast.success(res.message || "Cambio programado")
					router.refresh()
				} else {
					const msg = res.message || res.error
					if (msg) toast.success(msg)
					else toast.error("Error al cambiar de plan")
					router.refresh()
				}
			}
		} catch (err) {
			console.error(err)
			toast.error("Error de conexión")
		} finally {
			setLoadingId(null)
		}
	}

	const handleCancelDowngrade = async () => {
		setLoadingId('cancel-downgrade')
		try {
			await cancelPendingDowngrade()
			toast.success("Cambio de plan cancelado")
			router.refresh()
		} catch {
			toast.error("Error al cancelar el cambio")
		} finally {
			setLoadingId(null)
		}
	}

	const handleCancel = async () => {
		setLoadingId('cancel')
		try {
			const res = await cancelSubscription()
			if (res.success) {
				toast.success(res.message)
				router.refresh()
			} else {
				toast.error("Error al cancelar")
			}
		} finally {
			setLoadingId(null)
			setShowCancelModal(false)
		}
	}

	const getPrice = (plan: Plan) => {
		return billingCycle === 'yearly' ? Math.round(plan.price * 12 * 0.8) : plan.price
	}

	const sortedPlans = [...availablePlans].sort((a, b) => a.price - b.price)

	return (
		<div className="space-y-8">
			{!isConfigured && (
				<div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
					<AlertCircle className="text-amber-500 w-5 h-5 shrink-0" />
					<div>
						<p className="text-amber-400 font-semibold text-sm">Modo Demo</p>
						<p className="text-amber-400/60 text-xs">No se procesarán pagos reales.</p>
					</div>
				</div>
			)}

			<div className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-5 text-white shadow-xl md:p-6">
				<div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/25 blur-3xl" />
				<div className="relative z-10 grid gap-5 lg:grid-cols-[1.1fr_1fr] lg:items-center">
					<div>
						<p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">
							Por que pagar CourtOps
						</p>
						<h2 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">
							Si te recupera unos pocos turnos perdidos, ya se paga solo.
						</h2>
						<p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-white/65">
							La suscripcion no es solo software: es reservas online, cobros, QR compartible, caja y operacion movil para vender mas sin perseguir mensajes.
						</p>
					</div>
					<div className="grid grid-cols-3 gap-2">
						<ValueCard icon={QrCode} label="Canales" value="QR y link" />
						<ValueCard icon={CreditCard} label="Cobro" value="Menos deuda" />
						<ValueCard icon={Smartphone} label="Movil" value="App PWA" />
					</div>
				</div>
			</div>

			<div className="inline-flex items-center gap-1 rounded-full border border-border bg-muted p-1">
				<button
					onClick={() => setBillingCycle('monthly')}
					className={cn(
						'rounded-full px-5 py-2 text-sm font-medium transition-all',
						billingCycle === 'monthly'
							? 'bg-background text-foreground shadow-sm'
							: 'text-muted-foreground hover:text-foreground'
					)}
				>
					Mensual
				</button>
				<button
					onClick={() => setBillingCycle('yearly')}
					className={cn(
						'flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all',
						billingCycle === 'yearly'
							? 'bg-background text-foreground shadow-sm'
							: 'text-muted-foreground hover:text-foreground'
					)}
				>
					Anual
					<span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
						-20%
					</span>
				</button>
			</div>

			{pendingPlan && (
				<div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
					<Clock className="text-amber-500 w-5 h-5 shrink-0 mt-0.5" />
					<div className="flex-1 min-w-0">
						<p className="text-sm font-semibold text-amber-400">Cambio de plan programado</p>
						<p className="text-xs text-amber-400/70 mt-0.5">
							Tu plan cambiará a <strong>{pendingPlan.name}</strong> ({pendingBillingCycle === 'yearly' ? 'anual' : 'mensual'}) cuando venza el período actual
							{nextBillingDate ? ` (${new Date(nextBillingDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })})` : ''}.
							No se reembolsa la diferencia.
						</p>
					</div>
					<button
						onClick={handleCancelDowngrade}
						disabled={loadingId === 'cancel-downgrade'}
						className="shrink-0 text-xs text-amber-400/60 hover:text-amber-400 transition-colors flex items-center gap-1"
					>
						{loadingId === 'cancel-downgrade' ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
						Cancelar cambio
					</button>
				</div>
			)}

			{/* MOBILE: cards apiladas */}
			<div className="md:hidden space-y-3">
				{sortedPlans.map((plan) => {
					const isCurrent = currentPlan?.id === plan.id && isActive
					const colors = PLAN_COLORS[plan.name] || PLAN_COLORS['Arranque']
					const price = getPrice(plan)
					const isUpgrade = currentPlan ? plan.price > currentPlan.price : true
					const isRecommended = plan.name.toLowerCase() === 'pro'

					return (
						<div
							key={plan.id}
							className={cn(
								"relative rounded-2xl border p-4 transition-colors",
								isCurrent
									? "border-emerald-500/40 bg-emerald-500/5"
									: isRecommended
										? "border-primary/35 bg-primary/5"
										: "border-border bg-card"
							)}
						>
							{isRecommended && !isCurrent && (
								<span className="absolute right-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-primary-foreground">
									Recomendado
								</span>
							)}
							{/* Header row: icon + name + badge */}
							<div className="flex items-center justify-between mb-3">
								<div className="flex items-center gap-3">
									<div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white", colors.bg)}>
										{PLAN_ICONS[plan.name] || <Zap className="w-5 h-5" />}
									</div>
									<div>
										<div className="flex items-center gap-2 flex-wrap">
											<span className="font-bold text-foreground">{plan.name}</span>
											{isCurrent && (
												<span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
													Actual
												</span>
											)}
										</div>
										<span className="text-xs text-muted-foreground">{plan.features.length} características</span>
									</div>
								</div>
								<span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg shrink-0">
									{billingCycle === 'monthly' ? 'Mensual' : 'Anual'}
								</span>
							</div>

							{/* Price row */}
							<div className="mb-3">
								<div className="flex items-baseline gap-1">
									<span className="text-2xl font-black text-foreground tabular-nums">{formatPrice(price)}</span>
									<span className="text-sm text-muted-foreground">{billingCycle === 'yearly' ? '/año' : '/mes'}</span>
								</div>
								{(plan.setupFee ?? 0) > 0 && (
									<p className="text-[11px] text-muted-foreground mt-0.5">
										+ {formatPrice(plan.setupFee ?? 0)} licencia única al inicio
									</p>
								)}
								{billingCycle === 'yearly' && (
									<p className="text-[11px] text-emerald-500 font-medium mt-0.5">
										equivale a {formatPrice(Math.round(plan.price * 0.8))}/mes
									</p>
								)}
							</div>

							{/* Action button */}
							{isCurrent ? (
								<div className="flex items-center gap-2 text-emerald-500 font-semibold text-sm">
									<CheckCircle2 className="w-4 h-4 shrink-0" />
									Plan activo
								</div>
							) : currentPlan ? (
								<button
									onClick={() => openPlanModal(plan, isUpgrade ? 'upgrade' : 'downgrade')}
									disabled={!!loadingId}
									className={cn(
										"w-full py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2",
										isUpgrade
											? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
											: "bg-muted text-muted-foreground hover:bg-muted/80"
									)}
								>
									{isUpgrade ? `Activar ${plan.name}` : 'Cambiar plan'}
									<ChevronRight className="w-4 h-4" />
								</button>
							) : (
								<button
									onClick={() => openPlanModal(plan, 'new')}
									disabled={!!loadingId}
									className="w-full py-2.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
								>
									Activar {plan.name}
									<ChevronRight className="w-4 h-4" />
								</button>
							)}
						</div>
					)
				})}
			</div>

			{/* DESKTOP: tabla con grid */}
			<div className="hidden md:block border border-border rounded-2xl overflow-hidden">
				<div className="grid grid-cols-4 bg-muted/50 p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
					<div>Plan</div>
					<div className="text-center">Precio</div>
					<div className="text-center">Facturación</div>
					<div className="text-right">Acción</div>
				</div>

				{sortedPlans.map((plan) => {
					const isCurrent = currentPlan?.id === plan.id && isActive
					const colors = PLAN_COLORS[plan.name] || PLAN_COLORS['Base']
					const price = getPrice(plan)
					const isUpgrade = hasPaidSubscription && currentPlan ? plan.price > currentPlan.price : true
					const showSetupFee = !setupFeeAlreadyPaid && (plan.setupFee ?? 0) > 0
					const isRecommended = plan.name.toLowerCase() === 'pro'

					return (
						<div
							key={plan.id}
							className={cn(
								"grid grid-cols-4 p-4 items-center border-t border-border transition-colors",
								isCurrent && "bg-emerald-500/5",
								isRecommended && !isCurrent && "bg-primary/5",
								!isCurrent && "hover:bg-muted/30"
							)}
						>
							<div className="flex items-center gap-3">
								<div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colors.bg, "text-white")}>
									{PLAN_ICONS[plan.name] || <Zap className="w-5 h-5" />}
								</div>
								<div>
									<div className="flex items-center gap-2">
										<span className="font-bold text-foreground">{plan.name}</span>
										{isCurrent && (
											<span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
												Actual
											</span>
										)}
										{isRecommended && !isCurrent && (
											<span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
												Recomendado
											</span>
										)}
									</div>
									<span className="text-xs text-muted-foreground">{plan.features.length} características</span>
								</div>
							</div>

							<div className="text-center">
								<span className="text-lg font-bold text-foreground tabular-nums">
									{formatPrice(price)}
								</span>
								<span className="text-xs text-muted-foreground">
									{billingCycle === 'yearly' ? '/año' : '/mes'}
								</span>
								{showSetupFee && (
									<div className="text-[10px] text-muted-foreground">
										+ {formatPrice(plan.setupFee ?? 0)} pago único inicial. Primer mes bonificado.
									</div>
								)}
								{billingCycle === 'yearly' && (
									<div className="text-[10px] text-emerald-500 font-medium">
										equivale a {formatPrice(Math.round(plan.price * 0.8))}/mes
									</div>
								)}
							</div>

							<div className="text-center">
								<span className="text-sm text-muted-foreground">
									{billingCycle === 'monthly' ? 'Mensual' : 'Anual'}
								</span>
							</div>

							<div className="text-right">
								{isCurrent ? (
									<span className="text-sm text-emerald-500 font-medium flex items-center justify-end gap-1">
										<CheckCircle2 className="w-4 h-4" />
										Plan activo
									</span>
								) : hasPaidSubscription ? (
									<button
										onClick={() => openPlanModal(plan, isUpgrade ? 'upgrade' : 'downgrade')}
										disabled={!!loadingId}
										className={cn(
											"text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1 ml-auto",
											isUpgrade
												? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
												: "bg-muted text-muted-foreground hover:bg-muted/80"
										)}
									>
										{isUpgrade ? `Activar ${plan.name}` : 'Cambiar'}
										<ChevronRight className="w-4 h-4" />
									</button>
								) : (
									<button
										onClick={() => openPlanModal(plan, 'new')}
										disabled={!!loadingId}
										className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1 ml-auto"
									>
										Activar {plan.name}
										<ChevronRight className="w-4 h-4" />
									</button>
								)}
							</div>
						</div>
					)
				})}
			</div>

			<div className="border border-border rounded-2xl p-4 md:p-6">
				<h3 className="text-lg font-bold mb-4">Características por plan</h3>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
					{sortedPlans.map((plan) => {
						const colors = PLAN_COLORS[plan.name] || PLAN_COLORS['Base']
						const isCurrent = currentPlan?.id === plan.id && isActive

						return (
							<div key={plan.id} className={cn(
								"p-4 rounded-xl border transition-colors",
								isCurrent ? cn("border-emerald-500/30 bg-emerald-500/5") : "border-border"
							)}>
								<div className="flex items-center gap-2 mb-3">
									<div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", colors.bg, "text-white")}>
										{PLAN_ICONS[plan.name] || <Zap className="w-4 h-4" />}
									</div>
									<span className="font-bold">{plan.name}</span>
								</div>
								<ul className="space-y-2">
									{plan.features.map((feature, i) => (
										<li key={i} className="flex items-start gap-2 text-sm">
											<Check className={cn("w-4 h-4 mt-0.5 shrink-0", colors.text)} />
											<span className="text-muted-foreground">{feature}</span>
										</li>
									))}
								</ul>
							</div>
						)
					})}
				</div>
			</div>

			{currentPlan && isActive && (
				<div className="border border-border rounded-2xl p-4 md:p-6">
					<h3 className="text-lg font-bold mb-4">Tu suscripción</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
						<div className="flex items-start gap-3">
							<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
								<CreditCard className="w-5 h-5 text-primary" />
							</div>
							<div>
								<p className="text-xs text-muted-foreground">Plan actual</p>
								<p className="font-bold">{currentPlan.name}</p>
								<p className="text-sm text-muted-foreground">{formatPrice(currentPlan.price)}/mes</p>
							</div>
						</div>

						<div className="flex items-start gap-3">
							<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
								<Calendar className="w-5 h-5 text-primary" />
							</div>
							<div>
								<p className="text-xs text-muted-foreground">Próxima facturación</p>
								<p className="font-bold">
									{nextBillingDate
										? new Date(nextBillingDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
										: 'No disponible'}
								</p>
								<p className="text-sm text-emerald-500 font-medium">{formatPrice(currentPlan.price)}</p>
							</div>
						</div>

						<div className="flex items-start gap-3">
							<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
								<Shield className="w-5 h-5 text-primary" />
							</div>
							<div>
								<p className="text-xs text-muted-foreground">Estado</p>
								<p className="font-bold capitalize">{subscriptionStatus?.toLowerCase()}</p>
								<p className="text-sm text-muted-foreground">Pagos seguros con MercadoPago</p>
							</div>
						</div>
					</div>

					<div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
						<p className="text-sm text-muted-foreground">
							¿Necesitas ayuda? <a href="mailto:soporte@courtops.com" className="text-primary hover:underline">Contactá soporte</a>
						</p>
						<button
							onClick={() => setShowCancelModal(true)}
							className="text-sm text-muted-foreground hover:text-red-500 transition-colors"
						>
							Cancelar suscripción
						</button>
					</div>
				</div>
			)}

			<Dialog open={showPlanModal} onOpenChange={setShowPlanModal}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{planAction === 'upgrade' ? `Mejorar a ${selectedPlan?.name}` : planAction === 'downgrade' ? `Bajar a ${selectedPlan?.name}` : `Comenzar con ${selectedPlan?.name}`}
						</DialogTitle>
						<DialogDescription>
							{(planAction === 'upgrade' || planAction === 'new') && (
								<>{planAction === 'new' && !setupFeeAlreadyPaid ? 'Primero vas a pagar el alta única. Después vas a autorizar la suscripción del plan.' : `Serás redirigido a MercadoPago para autorizar el cobro ${billingCycle === 'yearly' ? 'anual' : 'mensual'}. Los cobros siguientes son automáticos.`}</>
							)}
							{planAction === 'downgrade' && (
								<>Tu plan actual continúa hasta que venza el período. El nuevo plan arranca en la próxima fecha de facturación.</>
							)}
						</DialogDescription>
					</DialogHeader>

					{selectedPlan && planAction !== 'downgrade' && (
						<div className="bg-muted/50 rounded-xl p-4 my-4 space-y-2">
							<div className="flex justify-between items-center">
								<span className="text-sm text-muted-foreground">
									{billingCycle === 'yearly' ? 'Total a pagar (12 meses)' : 'Cargo mensual'}
								</span>
								<span className="text-xl font-bold">
									{formatPrice(getPrice(selectedPlan))}
									<span className="text-sm font-normal text-muted-foreground ml-1">
										{billingCycle === 'yearly' ? '/año' : '/mes'}
									</span>
								</span>
							</div>
							{billingCycle === 'yearly' && (
								<div className="flex justify-between items-center text-xs text-muted-foreground">
									<span>Equivale a</span>
									<span className="text-emerald-500 font-medium">
										{formatPrice(Math.round(selectedPlan.price * 0.8))}/mes · ahorrás {formatPrice(selectedPlan.price * 12 - getPrice(selectedPlan))}
									</span>
								</div>
							)}
							<p className="text-xs text-muted-foreground pt-1">
								MercadoPago debitará automáticamente en cada período.
							</p>
							{planAction === 'new' && !setupFeeAlreadyPaid && (selectedPlan.setupFee ?? 0) > 0 && (
								<p className="text-xs text-muted-foreground">
									+ {formatPrice(selectedPlan.setupFee ?? 0)} pago único inicial. Ese pago bonifica el primer mes; luego se cobra la mensualidad.
								</p>
							)}
						</div>
					)}

					{selectedPlan && planAction === 'downgrade' && (
						<div className="space-y-3 my-4">
							<div className="bg-muted/50 rounded-xl p-4">
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Nuevo cargo {billingCycle === 'yearly' ? 'anual' : 'mensual'}</span>
									<span className="text-lg font-bold">
										{formatPrice(getPrice(selectedPlan))}
										<span className="text-sm font-normal text-muted-foreground ml-1">{billingCycle === 'yearly' ? '/año' : '/mes'}</span>
									</span>
								</div>
								{nextBillingDate && (
									<p className="text-xs text-muted-foreground mt-2">
										Efectivo a partir del {new Date(nextBillingDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
									</p>
								)}
							</div>
							<div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
								<AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
								<p className="text-xs text-amber-400">
									No se reembolsa la diferencia del período actual. Tu plan {currentPlan?.name} sigue activo hasta la próxima fecha de facturación.
								</p>
							</div>
						</div>
					)}

					<DialogFooter>
						<button
							onClick={() => setShowPlanModal(false)}
							className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
						>
							Cancelar
						</button>
						<button
							onClick={handlePlanChange}
							disabled={!!loadingId}
							className={cn(
								"px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
								planAction === 'downgrade'
									? "bg-muted hover:bg-muted/80 text-foreground border border-border"
									: "bg-primary hover:bg-primary/90 text-white"
							)}
						>
							{loadingId === selectedPlan?.id && <Loader2 className="w-4 h-4 animate-spin" />}
							{planAction === 'upgrade' ? 'Ir a MercadoPago' : planAction === 'downgrade' ? 'Programar cambio' : 'Ir a MercadoPago'}
						</button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<AlertCircle className="w-5 h-5 text-red-500" />
							Cancelar suscripción
						</DialogTitle>
						<DialogDescription>
							¿Estás seguro de que querés cancelar tu suscripción? Perderás acceso a las funciones premium de tu plan {currentPlan?.name}.
						</DialogDescription>
					</DialogHeader>
					<div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 my-4">
						<p className="text-sm text-amber-400">
							Tu suscripción seguirá activa hasta el {nextBillingDate ? new Date(nextBillingDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'próxima fecha de facturación'}.
						</p>
					</div>
					<DialogFooter>
						<button
							onClick={() => setShowCancelModal(false)}
							className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
						>
							Mantener suscripción
						</button>
						<button
							onClick={handleCancel}
							disabled={loadingId === 'cancel'}
							className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors flex items-center gap-2"
						>
							{loadingId === 'cancel' && <Loader2 className="w-4 h-4 animate-spin" />}
							Cancelar suscripción
						</button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}

function ValueCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
	return (
		<div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm">
			<Icon className="h-5 w-5 text-primary" />
			<p className="mt-3 text-[9px] font-black uppercase tracking-widest text-white/45">{label}</p>
			<p className="mt-1 text-sm font-black text-white">{value}</p>
		</div>
	)
}
