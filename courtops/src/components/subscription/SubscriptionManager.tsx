'use client'

import React, { useState } from 'react'
import { Check, Loader2, CreditCard, Calendar, AlertCircle, CheckCircle2, X, ChevronRight, Shield, Building2, Zap, Rocket } from 'lucide-react'
import { toast } from 'sonner'
import { initiateSubscription, cancelSubscription, changePlan } from '@/actions/subscription'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

interface Plan {
	id: string
	name: string
	price: number
	features: string[]
}

interface SubscriptionManagerProps {
	currentPlan: any
	subscriptionStatus: string | null
	nextBillingDate: Date | string | null
	availablePlans: Plan[]
	isConfigured: boolean
	isDevMode?: boolean
}

const PLAN_ICONS: Record<string, React.ReactNode> = {
	'Arranque': <Rocket className="w-5 h-5" />,
	'Élite': <Zap className="w-5 h-5" />,
	'VIP': <Building2 className="w-5 h-5" />,
}

const PLAN_COLORS: Record<string, { bg: string, border: string, text: string }> = {
	'Arranque': { bg: 'bg-sky-500', border: 'border-sky-500/30', text: 'text-sky-500' },
	'Élite': { bg: 'bg-emerald-500', border: 'border-emerald-500/30', text: 'text-emerald-500' },
	'VIP': { bg: 'bg-violet-500', border: 'border-violet-500/30', text: 'text-violet-500' },
}

export default function SubscriptionManager({
	currentPlan,
	subscriptionStatus,
	nextBillingDate,
	availablePlans,
	isConfigured,
	isDevMode = false
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
				const res = await initiateSubscription(selectedPlan.id, billingCycle)
				if (res.success && res.init_point) {
					window.location.href = res.init_point
				} else {
					toast.error((res as any)?.error || "Error al procesar")
				}
			} else {
				const res = await changePlan(selectedPlan.id, billingCycle)
				if (res.success && res.init_point) {
					window.location.href = res.init_point
				} else {
					const msg = (res as any)?.message || (res as any)?.error
					if (msg) {
						toast.success(msg)
					} else {
						toast.error("Error al cambiar de plan")
					}
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

			{/* Billing Toggle */}
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
						−20%
					</span>
				</button>
			</div>

			{/* Plans Table */}
			<div className="border border-border rounded-2xl overflow-hidden">
				{/* Table Header */}
				<div className="grid grid-cols-4 bg-muted/50 p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
					<div>Plan</div>
					<div className="text-center">Precio</div>
					<div className="text-center">Facturación</div>
					<div className="text-right">Acción</div>
				</div>

				{/* Plans */}
				{sortedPlans.map((plan, idx) => {
					const isCurrent = currentPlan?.id === plan.id && isActive
					const colors = PLAN_COLORS[plan.name] || PLAN_COLORS['Arranque']
					const price = getPrice(plan)
					const isUpgrade = currentPlan ? plan.price > currentPlan.price : true
					const isDowngrade = currentPlan ? plan.price < currentPlan.price : false

					return (
						<div
							key={plan.id}
							className={cn(
								"grid grid-cols-4 p-4 items-center border-t border-border transition-colors",
								isCurrent && "bg-emerald-500/5",
								!isCurrent && "hover:bg-muted/30"
							)}
						>
							{/* Plan Name */}
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
									</div>
									<span className="text-xs text-muted-foreground">{plan.features.length} características</span>
								</div>
							</div>

							{/* Price */}
							<div className="text-center">
								<span className="text-lg font-bold text-foreground tabular-nums">
									{formatPrice(price)}
								</span>
								<span className="text-xs text-muted-foreground">
									{billingCycle === 'yearly' ? '/año' : '/mes'}
								</span>
								{billingCycle === 'yearly' && (
									<div className="text-[10px] text-emerald-500 font-medium">
										equivale a {formatPrice(Math.round(plan.price * 0.8))}/mes
									</div>
								)}
							</div>

							{/* Billing */}
							<div className="text-center">
								<span className="text-sm text-muted-foreground">
									{billingCycle === 'monthly' ? 'Mensual' : 'Anual'}
								</span>
							</div>

							{/* Action */}
							<div className="text-right">
								{isCurrent ? (
									<span className="text-sm text-emerald-500 font-medium flex items-center justify-end gap-1">
										<CheckCircle2 className="w-4 h-4" />
										Plan activo
									</span>
								) : currentPlan ? (
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
										{isUpgrade ? 'Mejorar' : 'Cambiar'}
										<ChevronRight className="w-4 h-4" />
									</button>
								) : (
									<button
										onClick={() => openPlanModal(plan, 'new')}
										disabled={!!loadingId}
										className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1 ml-auto"
									>
										Comenzar
										<ChevronRight className="w-4 h-4" />
									</button>
								)}
							</div>
						</div>
					)
				})}
			</div>

			{/* Features Comparison */}
			<div className="border border-border rounded-2xl p-6">
				<h3 className="text-lg font-bold mb-4">Características por plan</h3>
				<div className="grid md:grid-cols-3 gap-4">
					{sortedPlans.map((plan) => {
						const colors = PLAN_COLORS[plan.name] || PLAN_COLORS['Arranque']
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

			{/* Current Subscription Info */}
			{currentPlan && isActive && (
				<div className="border border-border rounded-2xl p-6">
					<h3 className="text-lg font-bold mb-4">Tu suscripción</h3>
					<div className="grid md:grid-cols-3 gap-6">
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

					<div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
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

			{/* Plan Change Confirmation Modal */}
			<Dialog open={showPlanModal} onOpenChange={setShowPlanModal}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{planAction === 'upgrade' ? 'Mejorar a ' + selectedPlan?.name : planAction === 'downgrade' ? 'Cambiar a ' + selectedPlan?.name : 'Comenzar con ' + selectedPlan?.name}
						</DialogTitle>
						<DialogDescription>
							{(planAction === 'upgrade' || planAction === 'new') && selectedPlan && (
								<>Serás redirigido a MercadoPago para completar el pago. Se te cobrará {billingCycle === 'yearly' ? 'el total anual' : 'mensualmente'}.</>
							)}
							{planAction === 'downgrade' && selectedPlan && (
								<>Tu plan {currentPlan?.name} seguirá activo hasta tu próxima facturación. Luego se cambiará a {selectedPlan.name}.</>
							)}
						</DialogDescription>
					</DialogHeader>
					{selectedPlan && (
						<div className="bg-muted/50 rounded-xl p-4 my-4 space-y-2">
							<div className="flex justify-between items-center">
								<span className="text-sm text-muted-foreground">
									{billingCycle === 'yearly' ? 'Total a pagar hoy (12 meses)' : 'Cargo mensual'}
								</span>
								<span className="text-xl font-bold">
									{formatPrice(getPrice(selectedPlan))}
									<span className="text-sm font-normal text-muted-foreground">
										{billingCycle === 'yearly' ? '/año' : '/mes'}
									</span>
								</span>
							</div>
							{billingCycle === 'yearly' && (
								<div className="flex justify-between items-center text-xs text-muted-foreground">
									<span>Precio mensual equivalente</span>
									<span className="text-emerald-500 font-medium">
										{formatPrice(Math.round(selectedPlan.price * 0.8))}/mes <span className="text-muted-foreground">(ahorrás {formatPrice(selectedPlan.price * 12 - getPrice(selectedPlan))})</span>
									</span>
								</div>
							)}
						</div>
					)}
					<DialogFooter>
						<button
							onClick={() => setShowCancelModal(false)}
							className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
						>
							Cancelar
						</button>
						<button
							onClick={handlePlanChange}
							disabled={!!loadingId}
							className={cn(
								"px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors flex items-center gap-2",
								planAction === 'downgrade' ? "bg-muted hover:bg-muted/80 text-foreground" : "bg-primary hover:bg-primary/90"
							)}
						>
							{loadingId === selectedPlan?.id && <Loader2 className="w-4 h-4 animate-spin" />}
							{planAction === 'upgrade' ? 'Ir a MercadoPago' : planAction === 'downgrade' ? 'Confirmar cambio' : 'Comenzar'}
						</button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Cancel Confirmation Modal */}
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
