'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Users, ChevronRight, BarChart3, Receipt, Check, TrendingUp, DollarSign, MessageSquare, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePerformance } from '@/contexts/PerformanceContext'

export default function LandingMockup() {
	const [cursorState, setCursorState] = useState({ x: '25%', y: '40%', label: 'Explorando...' })
	const [activeSlot, setActiveSlot] = useState<number | null>(null)
	const { isLowEnd } = usePerformance()

	useEffect(() => {
		if (isLowEnd) return

		const sequence = [
			{ x: '15%', y: '35%', label: 'Gestión de Turnos', delay: 2000 },
			{ x: '42%', y: '50%', label: 'Cancha 2 - Reservado', delay: 1500, highlight: 1 },
			{ x: '88%', y: '12%', label: 'Nuevo Registro', delay: 1000, click: true },
			{ x: '35%', y: '78%', label: 'Ver Kiosco Hub', delay: 2000, highlight: 2 },
		]

		let step = 0
		const runStep = () => {
			const s = sequence[step]
			setCursorState({ x: s.x, y: s.y, label: s.label })
			if (s.highlight !== undefined) setActiveSlot(s.highlight)
			else setActiveSlot(null)

			step = (step + 1) % sequence.length
			const timer = setTimeout(runStep, s.delay)
			return () => clearTimeout(timer)
		}

		const timeout = setTimeout(runStep, 1000)
		return () => clearTimeout(timeout)
	}, [isLowEnd])

	return (
		<section className="relative py-32 px-4 overflow-hidden bg-white dark:bg-zinc-950 transition-colors duration-1000 border-t border-slate-100 dark:border-white/5">
			<motion.div
				initial={isLowEnd ? { opacity: 0 } : { opacity: 0, y: 30 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
				className="max-w-7xl mx-auto relative px-4 md:px-12"
			>
				{!isLowEnd && (
					<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-emerald-500/5 blur-[180px] pointer-events-none" />
				)}

				<div className="relative grid grid-cols-12 gap-8 lg:gap-12 items-center">

					{/* --- DESKTOP MOCKUP --- */}
					<div className="col-span-12 lg:col-span-8 relative">
						<div className={cn(
							"relative rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-zinc-950/80 shadow-2xl overflow-hidden h-[400px] md:h-[600px] flex flex-col transition-all duration-1000",
							isLowEnd ? "" : "backdrop-blur-xl"
						)}>

							{/* Header Bar */}
							<div className="h-12 md:h-14 px-4 md:px-6 flex items-center justify-between border-b border-slate-100 dark:border-white/5 bg-white/50 dark:bg-white/[0.02]">
								<div className="flex items-center gap-4">
									<div className="flex gap-1.5">
										<div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-red-400/60" />
										<div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-yellow-400/60" />
										<div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-emerald-400/60" />
									</div>
								</div>
								<div className="flex items-center gap-3">
									<div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-lg">
										<div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
										<span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Online</span>
									</div>
									<div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20" />
								</div>
							</div>

							<div className="flex-1 flex overflow-hidden">
								{/* Sidebar */}
								<div className="hidden lg:flex w-56 border-r border-slate-100 dark:border-white/5 p-5 flex flex-col gap-1.5 bg-slate-50/50 dark:bg-white/[0.01]">
									{[
										{ icon: <BarChart3 size={14} />, label: 'Analytics' },
										{ icon: <Calendar size={14} />, label: 'Agenda', active: true },
										{ icon: <Receipt size={14} />, label: 'Kiosko Hub' },
										{ icon: <Users size={14} />, label: 'Clientes' }
									].map((it, i) => (
										<div key={i} className={cn(
											"flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
											it.active
												? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-emerald-400 border border-slate-200 dark:border-white/10 shadow-sm"
												: "text-slate-400 hover:bg-slate-100/50 dark:hover:bg-white/[0.02]"
										)}>
											<div className={cn("p-1.5 rounded-lg", it.active ? "bg-emerald-500/10" : "bg-slate-100 dark:bg-white/5")}>{it.icon}</div>
											<span className="text-[9px] font-bold uppercase tracking-widest">{it.label}</span>
										</div>
									))}
								</div>

								{/* Main Content */}
								<div className="flex-1 p-4 md:p-8 relative overflow-hidden flex flex-col gap-4 md:gap-5 bg-white dark:bg-transparent">
									{/* Mini header inside content */}
									<div className="flex items-center justify-between">
										<div className="space-y-1">
											<div className="h-2.5 w-20 bg-slate-200 dark:bg-white/5 rounded-full" />
											<div className="h-2 w-14 bg-slate-100 dark:bg-white/[0.03] rounded-full" />
										</div>
										<div className="flex gap-2">
											<div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center">
												<ChevronRight size={10} className="text-slate-400 rotate-180" />
											</div>
											<div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center">
												<ChevronRight size={10} className="text-slate-400" />
											</div>
										</div>
									</div>

									<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-3.5 flex-1">
										{[
											{ booked: true, time: '09:00', player: 'Rodriguez' },
											{ booked: false, time: '10:30', player: '' },
											{ booked: true, time: '12:00', player: 'Martinez' },
											{ booked: true, time: '14:00', player: 'Socio VIP' },
											{ booked: false, time: '16:00', player: '' },
											{ booked: false, time: '18:00', player: '' },
										].map((slot, i) => (
											<div key={i} className="border border-slate-100 dark:border-white/5 rounded-2xl md:rounded-[1.25rem] bg-slate-50/50 dark:bg-white/[0.02] p-2.5 md:p-3 flex flex-col justify-between min-h-[70px] md:min-h-[110px]">
												{slot.booked ? (
													<div className="h-full w-full bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2 md:p-3 flex flex-col justify-between">
														<div className="flex justify-between items-center">
															<span className="text-[5px] md:text-[7px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider">{slot.player}</span>
															<Check size={8} className="text-emerald-500" />
														</div>
														<div className="flex items-center gap-1.5">
															<div className="h-1.5 md:h-2 w-8 md:w-12 bg-emerald-500/20 rounded-full" />
															<div className="w-2 h-2 rounded-full bg-emerald-500/30" />
														</div>
													</div>
												) : (
													<div className="h-full flex flex-col justify-between py-1">
														<div className="text-[6px] md:text-[8px] font-bold text-slate-300 dark:text-white/10 uppercase tracking-wider">{slot.time}</div>
														<div className="space-y-1.5 opacity-20">
															<div className="h-1.5 w-10 md:w-14 bg-slate-300 dark:bg-white/10 rounded-full" />
															<div className="h-1 w-6 md:w-8 bg-slate-200 dark:bg-white/5 rounded-full" />
														</div>
													</div>
												)}
											</div>
										))}
									</div>

									{/* Cursor */}
									<motion.div
										animate={{ left: cursorState.x, top: cursorState.y }}
										transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
										className="absolute z-50 pointer-events-none"
									>
										<div className="relative">
											<div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center backdrop-blur-sm shadow-xl">
												<div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-emerald-500" />
											</div>
											<div className={cn(
												"absolute top-4 md:top-5 bg-slate-900 dark:bg-slate-800 text-white px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[6px] md:text-[8px] font-bold uppercase tracking-widest whitespace-nowrap shadow-2xl border border-white/10",
												parseFloat(cursorState.x) > 50 ? "right-2 md:right-4" : "left-1 md:left-3"
											)}>
												{cursorState.label}
											</div>
										</div>
									</motion.div>
								</div>
							</div>
						</div>
					</div>

					{/* --- STATS / ACCENT SIDE --- */}
					<div className="col-span-12 lg:col-span-4 space-y-5">
						<div className="space-y-3 md:space-y-4 text-center lg:text-left">
							<div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
								<TrendingUp size={10} /> Tu panel hoy
							</div>
							<h3 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
								Todo lo que importa,<br className="hidden lg:block" />
								<span className="text-slate-400 dark:text-zinc-400">de un vistazo.</span>
							</h3>
							<p className="text-slate-500 dark:text-zinc-400 text-xs md:text-sm leading-relaxed max-w-sm mx-auto lg:mx-0">
								Facturación, ocupación y clientes en tiempo real. Sin planillas, sin demoras.
							</p>
						</div>

						{/* KPI Cards */}
						<div className="grid grid-cols-1 gap-3">
							{[
								{ label: 'Facturación hoy', value: '$84.500', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10', delta: '+12% vs ayer' },
								{ label: 'Canchas ocupadas', value: '7 / 8', icon: BarChart3, color: 'text-violet-500', bg: 'bg-violet-500/10', delta: '87% ocupación' },
								{ label: 'Clientes activos', value: '143', icon: Users, color: 'text-sky-500', bg: 'bg-sky-500/10', delta: '+5 esta semana' },
							].map((stat, i) => (
								<motion.div
									key={i}
									initial={{ opacity: 0, x: 12 }}
									whileInView={{ opacity: 1, x: 0 }}
									viewport={{ once: true }}
									transition={{ delay: i * 0.1, duration: 0.4 }}
									className="p-4 md:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-white/5 flex justify-between items-center transition-all hover:border-slate-200 dark:hover:border-white/10 group"
								>
									<div className="flex items-center gap-3">
										<div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", stat.bg)}>
											<stat.icon size={14} className={stat.color} />
										</div>
										<div>
											<div className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">{stat.label}</div>
											<div className="text-[8px] text-slate-400 dark:text-zinc-600 mt-0.5">{stat.delta}</div>
										</div>
									</div>
									<span className={cn("text-lg font-bold tabular-nums transition-transform group-hover:scale-105", stat.color)}>{stat.value}</span>
								</motion.div>
							))}
						</div>

						{/* WhatsApp Reminders Card */}
						<motion.div
							initial={{ opacity: 0, y: 12 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: 0.35, duration: 0.4 }}
							className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 dark:from-emerald-500/5 dark:to-emerald-500/10 border border-emerald-500/20"
						>
							<div className="flex items-center justify-between mb-3">
								<div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
									<div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
										<MessageSquare size={13} />
									</div>
									<span className="text-[9px] font-bold uppercase tracking-widest">Recordatorios WhatsApp</span>
								</div>
								<div className="flex items-center gap-1.5">
									<div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
									<span className="text-[8px] font-bold text-emerald-500/70 uppercase tracking-wider">Enviando</span>
								</div>
							</div>
							<div className="space-y-2 mb-3">
								{[
									{ name: 'García', time: '18:00', sent: true },
									{ name: 'López', time: '19:30', sent: true },
									{ name: 'Pérez', time: '21:00', sent: false },
								].map((r, i) => (
									<div key={i} className="flex items-center justify-between py-1.5 border-b border-emerald-500/10 last:border-0">
										<div className="flex items-center gap-2">
											<div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[7px] font-black text-emerald-600 dark:text-emerald-400">
												{r.name[0]}
											</div>
											<span className="text-[9px] font-bold text-slate-600 dark:text-zinc-300">{r.name}</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="text-[8px] font-bold text-slate-400 dark:text-zinc-500">{r.time}</span>
											{r.sent ? (
												<Check size={9} className="text-emerald-500" />
											) : (
												<div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-600" />
											)}
										</div>
									</div>
								))}
							</div>
							<div className="flex items-center justify-between pt-1">
								<span className="text-[8px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Satisfacción</span>
								<div className="flex items-center gap-1">
									{[1, 2, 3, 4, 5].map((s) => (
										<Star key={s} size={9} className={s <= 4 ? "text-amber-400 fill-amber-400" : "text-slate-300 dark:text-zinc-600"} />
									))}
									<span className="text-[8px] font-bold text-slate-500 dark:text-zinc-400 ml-1">4.8</span>
								</div>
							</div>
						</motion.div>
					</div>
				</div>
			</motion.div>
		</section>
	)
}
