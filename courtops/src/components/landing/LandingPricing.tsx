'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, ArrowRight, Zap, Shield, Clock, TrendingUp, Star, Gift } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

const plans = [
	{
		name: 'Arranque',
		badge: null,
		price: 45000,
		description: 'Para empezar sin fricción.',
		roi: 'Operativo en menos de 1 hora',
		features: [
			{ text: 'Hasta 2 canchas gestionadas', highlight: false },
			{ text: 'Agenda digital — adiós a los cuadernos', highlight: false },
			{ text: 'Base de clientes centralizada', highlight: false },
			{ text: 'Caja y cobros integrados', highlight: false },
			{ text: 'Reportes diarios en segundos', highlight: false },
		],
		notIncluded: ['Kiosko / POS', 'WhatsApp automatizado', 'Torneos'],
		cta: 'Empezar gratis 7 días',
		ctaSub: 'Sin tarjeta de crédito',
		highlight: false,
		color: 'slate',
	},
	{
		name: 'Élite',
		badge: 'Más elegido',
		price: 85000,
		description: 'El sistema completo que tu club necesita.',
		roi: 'Promedio: +$120.000/mes de ingresos adicionales',
		features: [
			{ text: 'Hasta 8 canchas sin límites', highlight: true },
			{ text: 'Kiosko / Buffet con stock integrado', highlight: true },
			{ text: 'WhatsApp automático → -40% no-shows', highlight: true },
			{ text: 'Torneos y brackets digitales', highlight: false },
			{ text: 'Reportes financieros completos', highlight: false },
			{ text: 'QR Check-in y firma digital', highlight: false },
			{ text: 'Soporte prioritario 24/7', highlight: false },
		],
		notIncluded: [],
		cta: 'Elegir Plan Élite',
		ctaSub: '7 días gratis incluidos',
		highlight: true,
		color: 'emerald',
	},
	{
		name: 'VIP',
		badge: 'Enterprise',
		price: 150000,
		description: 'Gestión multi-sede a escala empresarial.',
		roi: 'Diseñado para cadenas y grupos deportivos',
		features: [
			{ text: 'Canchas ilimitadas en todas las sedes', highlight: false },
			{ text: 'Multi-sede desde un solo panel', highlight: false },
			{ text: 'API + Webhooks para integradores', highlight: false },
			{ text: 'Marca blanca con tu branding', highlight: false },
			{ text: 'Account Manager dedicado', highlight: false },
		],
		notIncluded: [],
		cta: 'Hablar con Ventas',
		ctaSub: 'Demo personalizada',
		highlight: false,
		color: 'violet',
	},
]

const comparisonRows: { feature: string; arranque: boolean | string; elite: boolean | string; vip: boolean | string }[] = [
	{ feature: 'Canchas', arranque: 'Hasta 2', elite: 'Hasta 8', vip: 'Ilimitadas' },
	{ feature: 'Turnero Digital', arranque: true, elite: true, vip: true },
	{ feature: 'Caja & Cobros', arranque: true, elite: true, vip: true },
	{ feature: 'QR Check-in', arranque: true, elite: true, vip: true },
	{ feature: 'Kiosco / POS', arranque: false, elite: true, vip: true },
	{ feature: 'WhatsApp Automático', arranque: false, elite: true, vip: true },
	{ feature: 'Torneos', arranque: false, elite: true, vip: true },
	{ feature: 'Firma Digital', arranque: false, elite: true, vip: true },
	{ feature: 'Reportes Avanzados', arranque: false, elite: true, vip: true },
	{ feature: 'Multi-Sede', arranque: false, elite: false, vip: true },
	{ feature: 'API / Webhooks', arranque: false, elite: false, vip: true },
	{ feature: 'Marca Blanca', arranque: false, elite: false, vip: true },
	{ feature: 'Soporte', arranque: 'Email', elite: 'Prioritario 24/7', vip: 'Account Manager' },
]

export default function LandingPricing() {
	const router = useRouter()
	const [isYearly, setIsYearly] = useState(false)

	return (
		<section className="py-24 md:py-32 px-4 md:px-6 bg-transparent" id="pricing">
			<div className="max-w-7xl mx-auto">

				{/* Header */}
				<div className="text-center mb-16 md:mb-20 space-y-5 max-w-3xl mx-auto">
					<div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
						<Zap size={9} fill="currentColor" /> Planes y Precios
					</div>

					<h3 className="text-3xl md:text-5xl font-medium text-slate-900 dark:text-white tracking-tight leading-tight">
						Invertí en crecimiento,<br className="hidden md:block" />
						<span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">no en papeles.</span>
					</h3>

					<p className="text-slate-500 dark:text-zinc-400 text-sm md:text-base leading-relaxed">
						Cada plan incluye <strong className="text-slate-900 dark:text-white">7 días gratis</strong> y configuración express. Los clubes que usan CourtOps recuperan la inversión en las primeras semanas.
					</p>

					{/* Social proof mini strip */}
					<div className="flex flex-wrap items-center justify-center gap-4 pt-2">
						<div className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500">
							<div className="flex -space-x-1.5">
								{['bg-emerald-500', 'bg-violet-500', 'bg-sky-500', 'bg-amber-500'].map((c, i) => (
									<div key={i} className={`w-5 h-5 rounded-full border-2 border-white dark:border-zinc-950 ${c}`} />
								))}
							</div>
							<span className="text-[10px] font-bold uppercase tracking-wider">+143 clubes activos</span>
						</div>
						<span className="hidden sm:block text-slate-200 dark:text-zinc-700">|</span>
						<div className="flex items-center gap-1 text-amber-500">
							{[1,2,3,4,5].map(s => <Star key={s} size={11} fill="currentColor" />)}
							<span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 ml-1">4.9 / 5 promedio</span>
						</div>
					</div>

					{/* Billing Toggle */}
					<div className="flex items-center justify-center gap-4 pt-4">
						<span className={cn("text-xs md:text-sm font-medium transition-colors", !isYearly ? "text-slate-900 dark:text-white" : "text-zinc-400")}>Mensual</span>
						<button
							onClick={() => setIsYearly(!isYearly)}
							className={cn(
								"w-11 h-6 rounded-full relative transition-colors border",
								isYearly ? "bg-emerald-500 border-emerald-500" : "bg-slate-200 dark:bg-white/10 border-slate-300 dark:border-white/10"
							)}
						>
							<motion.div
								animate={{ x: isYearly ? 22 : 3 }}
								transition={{ type: 'spring', stiffness: 500, damping: 30 }}
								className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
							/>
						</button>
						<span className={cn("text-xs md:text-sm font-medium flex items-center gap-2 transition-colors", isYearly ? "text-slate-900 dark:text-white" : "text-zinc-400")}>
							Anual
							<span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">Ahorrá 20%</span>
						</span>
					</div>

					<AnimatePresence>
						{isYearly && (
							<motion.div
								initial={{ opacity: 0, y: -8 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -8 }}
								className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold"
							>
								<Gift size={12} /> Con el plan anual ahorrás hasta <strong>$408.000 por año</strong>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				{/* Plan Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-start">
					{plans.map((plan, i) => (
						<motion.div
							key={i}
							initial={{ opacity: 0, y: 24 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: i * 0.12, duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
							className={cn(
								"relative rounded-3xl border flex flex-col transition-all backdrop-blur-xl overflow-hidden",
								plan.highlight
									? "bg-gradient-to-b from-emerald-500/[0.08] to-emerald-500/[0.03] dark:from-emerald-500/[0.10] dark:to-emerald-500/[0.04] border-emerald-500/60 dark:border-emerald-500/40 shadow-2xl shadow-emerald-500/10 scale-[1.02] md:scale-[1.04]"
									: "bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/15 shadow-sm dark:shadow-none"
							)}
						>
							{/* Top badge */}
							{plan.badge && (
								<div className={cn(
									"absolute top-0 left-0 right-0 py-2 text-center text-[9px] font-black uppercase tracking-widest",
									plan.highlight
										? "bg-emerald-500 text-white"
										: "bg-violet-500/10 text-violet-500 border-b border-violet-500/20"
								)}>
									{plan.highlight && <span className="mr-2">⚡</span>}
									{plan.badge}
								</div>
							)}

							<div className={cn("p-7 md:p-9 flex flex-col gap-6 flex-1", plan.badge ? "pt-10 md:pt-12" : "")}>

								{/* Plan header */}
								<div>
									<h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{plan.name}</h4>
									<p className="text-slate-500 dark:text-zinc-400 text-xs leading-relaxed">{plan.description}</p>
								</div>

								{/* Price */}
								<div>
									<div className="flex items-baseline gap-1">
										{isYearly && (
											<span className="text-sm text-zinc-400 line-through mr-1">
												${new Intl.NumberFormat('es-AR').format(plan.price)}
											</span>
										)}
										<span className={cn(
											"text-4xl md:text-5xl font-black tracking-tight",
											plan.highlight ? "text-emerald-500" : "text-slate-900 dark:text-white"
										)}>
											${new Intl.NumberFormat('es-AR').format(isYearly ? Math.round(plan.price * 0.8) : plan.price)}
										</span>
										<span className="text-zinc-400 text-xs">/mes</span>
									</div>
									{isYearly && (
										<div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
											Ahorrás ${new Intl.NumberFormat('es-AR').format(Math.round(plan.price * 0.2 * 12))} al año
										</div>
									)}
								</div>

								{/* ROI hint */}
								<div className={cn(
									"flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold",
									plan.highlight
										? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
										: "bg-slate-50 dark:bg-white/[0.04] text-slate-500 dark:text-zinc-400 border border-slate-100 dark:border-white/5"
								)}>
									<TrendingUp size={11} className="shrink-0" />
									{plan.roi}
								</div>

								{/* Features */}
								<div className="space-y-3 flex-1">
									{plan.features.map((feat, j) => (
										<div key={j} className="flex items-start gap-3">
											<div className={cn(
												"w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5",
												feat.highlight
													? "bg-emerald-500 text-white"
													: "bg-emerald-500/10"
											)}>
												<Check size={9} className={feat.highlight ? "text-white" : "text-emerald-500"} />
											</div>
											<span className={cn(
												"text-xs leading-relaxed",
												feat.highlight
													? "text-slate-900 dark:text-white font-semibold"
													: "text-slate-600 dark:text-zinc-300"
											)}>{feat.text}</span>
										</div>
									))}
									{plan.notIncluded.map((feat, j) => (
										<div key={j} className="flex items-start gap-3 opacity-35">
											<div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-slate-100 dark:bg-white/5">
												<X size={8} className="text-slate-400" />
											</div>
											<span className="text-xs text-slate-400 dark:text-zinc-500 line-through">{feat}</span>
										</div>
									))}
								</div>

								{/* CTA */}
								<div className="space-y-2">
									<button
										onClick={() => plan.name === 'VIP' ? null : router.push('/register')}
										className={cn(
											"w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 group",
											plan.highlight
												? "bg-emerald-500 text-white hover:bg-emerald-400 shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-[0.98]"
												: plan.color === 'violet'
													? "bg-slate-900 dark:bg-white/[0.08] text-white border border-slate-800 dark:border-white/10 hover:bg-slate-800 dark:hover:bg-white/15"
													: "bg-slate-100 dark:bg-white/[0.06] text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10"
										)}
									>
										{plan.cta} <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
									</button>
									<p className="text-center text-[9px] text-zinc-400 dark:text-zinc-600 font-medium">{plan.ctaSub}</p>
								</div>
							</div>
						</motion.div>
					))}
				</div>

				{/* Guarantee strip */}
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.4, duration: 0.5 }}
					className="mt-12 flex flex-wrap items-center justify-center gap-6 md:gap-10 py-6 border-y border-slate-100 dark:border-white/[0.06]"
				>
					{[
						{ icon: Shield, text: '7 días gratis en todos los planes' },
						{ icon: Clock, text: 'Configuración en menos de 1 hora' },
						{ icon: Zap, text: 'Sin contratos ni permanencia' },
					].map((item, i) => (
						<div key={i} className="flex items-center gap-2.5 text-slate-500 dark:text-zinc-400">
							<item.icon size={14} className="text-emerald-500 shrink-0" />
							<span className="text-xs font-semibold">{item.text}</span>
						</div>
					))}
				</motion.div>

				{/* Comparison Table */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6, delay: 0.2 }}
					className="mt-20 md:mt-28"
				>
					<div className="text-center mb-10 space-y-2">
						<h4 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
							Comparación detallada
						</h4>
						<p className="text-xs text-zinc-400">Todo lo que incluye cada plan, sin letra chica.</p>
					</div>

					<div className="overflow-x-auto -mx-4 px-4">
						<table className="w-full min-w-[600px] border-collapse">
							<thead>
								<tr className="border-b border-slate-200 dark:border-white/[0.07]">
									<th className="sticky left-0 bg-white dark:bg-zinc-950 text-left py-4 px-4 text-xs font-bold text-zinc-400 uppercase tracking-wider w-[220px]">
										Funcionalidad
									</th>
									<th className="py-4 px-4 text-center text-xs font-bold text-zinc-400 uppercase tracking-wider">
										Arranque
									</th>
									<th className="py-4 px-4 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
										Élite ⚡
									</th>
									<th className="py-4 px-4 text-center text-xs font-bold text-violet-500 uppercase tracking-wider">
										VIP
									</th>
								</tr>
							</thead>
							<tbody>
								{comparisonRows.map((row, i) => (
									<tr key={i} className="border-b border-slate-100 dark:border-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
										<td className="sticky left-0 bg-white dark:bg-zinc-950 py-4 px-4 text-sm font-medium text-slate-700 dark:text-zinc-300">
											{row.feature}
										</td>
										{[row.arranque, row.elite, row.vip].map((val, j) => (
											<td key={j} className="py-4 px-4 text-center">
												{val === true ? (
													<div className="flex justify-center">
														<div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center">
															<Check className="text-emerald-500" size={11} />
														</div>
													</div>
												) : val === false ? (
													<X className="mx-auto text-slate-300 dark:text-zinc-700" size={14} />
												) : (
													<span className="text-xs font-medium text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-white/[0.04] px-2 py-0.5 rounded-lg border border-slate-100 dark:border-white/5">{val}</span>
												)}
											</td>
										))}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</motion.div>

			</div>
		</section>
	)
}
