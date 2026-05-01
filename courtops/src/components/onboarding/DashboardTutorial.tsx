
'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronLeft, CheckCircle2, CalendarDays, Users, Store, BarChart3, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Mini UI Mockups ─────────────────────────────────────────────────────────

function CalendarMockup() {
	const slots = [
		{ color: 'bg-emerald-500/30 border-emerald-500/50', label: 'Juan Martínez', time: '14:00' },
		{ color: 'bg-blue-500/30 border-blue-500/50', label: 'María González', time: '15:30' },
		{ color: 'bg-zinc-800/60 border-white/8', label: '+ Nueva reserva', time: '17:00', empty: true },
		{ color: 'bg-amber-500/30 border-amber-500/50', label: 'Club Padel', time: '18:30' },
	]
	return (
		<div className="w-full bg-zinc-900/70 rounded-2xl border border-white/8 p-3 space-y-1.5">
			<div className="flex items-center justify-between mb-2 px-1">
				<span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Hoy — Cancha 1</span>
				<div className="flex gap-1">
					<div className="w-1.5 h-1.5 rounded-full bg-red-500/60" />
					<div className="w-1.5 h-1.5 rounded-full bg-yellow-500/60" />
					<div className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
				</div>
			</div>
			{slots.map((slot, i) => (
				<div key={i} className={cn('flex items-center gap-2.5 p-2 rounded-xl border text-xs transition-colors', slot.color)}>
					<span className="text-zinc-500 font-mono w-9 shrink-0 text-[10px]">{slot.time}</span>
					<span className={slot.empty ? 'text-zinc-600 italic' : 'text-white/90 font-medium'}>{slot.label}</span>
					{slot.empty && <span className="ml-auto text-[9px] text-zinc-700">clic para crear</span>}
				</div>
			))}
		</div>
	)
}

function ClientsMockup() {
	const clients = [
		{ name: 'Juan Martínez', info: '12 turnos', tag: 'VIP', tagColor: 'bg-amber-500/20 text-amber-400' },
		{ name: 'María González', info: '8 turnos', tag: null, tagColor: '' },
		{ name: 'Carlos Ruiz', info: '3 turnos', tag: 'Nuevo', tagColor: 'bg-blue-500/20 text-blue-400' },
	]
	return (
		<div className="w-full bg-zinc-900/70 rounded-2xl border border-white/8 p-3 space-y-2">
			{clients.map((c, i) => (
				<div key={i} className="flex items-center gap-3 p-2 bg-white/4 rounded-xl">
					<div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
						{c.name[0]}
					</div>
					<div className="flex-1 min-w-0">
						<div className="text-xs text-white/90 font-medium truncate">{c.name}</div>
						<div className="text-[10px] text-zinc-500">{c.info}</div>
					</div>
					{c.tag && (
						<span className={cn('text-[10px] px-1.5 py-0.5 rounded-md font-bold shrink-0', c.tagColor)}>{c.tag}</span>
					)}
				</div>
			))}
		</div>
	)
}

function KioscoMockup() {
	const items = [
		{ name: 'Agua 500ml', price: '$1.200', emoji: '💧' },
		{ name: 'Gatorade', price: '$2.500', emoji: '🏃' },
		{ name: 'Pelota Padel', price: '$8.000', emoji: '🎾' },
		{ name: 'Muñequera', price: '$3.500', emoji: '🎽' },
	]
	return (
		<div className="w-full bg-zinc-900/70 rounded-2xl border border-white/8 p-3">
			<div className="grid grid-cols-2 gap-2">
				{items.map((item, i) => (
					<div key={i} className="p-2.5 bg-white/4 rounded-xl border border-white/5 hover:bg-white/8 transition-colors cursor-default">
						<div className="text-xl mb-1">{item.emoji}</div>
						<div className="text-[10px] text-white/80 font-medium leading-tight">{item.name}</div>
						<div className="text-[10px] text-emerald-400 font-mono mt-0.5">{item.price}</div>
					</div>
				))}
			</div>
		</div>
	)
}

function LinkMockup({ slug }: { slug?: string }) {
	return (
		<div className="w-full space-y-2">
			<div className="bg-zinc-900/70 rounded-2xl border border-white/8 p-3 flex items-center gap-2.5">
				<Globe size={11} className="text-emerald-400 shrink-0" />
				<span className="text-[10px] text-zinc-300 font-mono truncate flex-1">
					courtops.com/p/{slug || 'tu-club'}
				</span>
				<span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md font-bold shrink-0">ACTIVO</span>
			</div>
			<div className="bg-zinc-900/50 rounded-2xl border border-white/5 p-3 space-y-2">
				<div className="h-2 bg-white/8 rounded-full w-2/3" />
				<div className="h-2 bg-white/5 rounded-full w-1/2" />
				<div className="h-8 bg-emerald-500/20 border border-emerald-500/30 rounded-xl mt-3 flex items-center justify-center">
					<span className="text-[10px] text-emerald-400 font-medium">Reservar turno →</span>
				</div>
			</div>
		</div>
	)
}

function ReportsMockup() {
	const bars = [42, 68, 50, 85, 60, 92, 74]
	const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
	return (
		<div className="w-full bg-zinc-900/70 rounded-2xl border border-white/8 p-3">
			<div className="flex items-center justify-between mb-3">
				<span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Ingresos — semana</span>
				<span className="text-[10px] text-emerald-400 font-bold">+24%</span>
			</div>
			<div className="flex items-end gap-1.5 h-14">
				{bars.map((h, i) => (
					<div key={i} className="flex-1 flex flex-col items-center gap-1">
						<div
							className="w-full rounded-t-md bg-gradient-to-t from-emerald-700 to-emerald-400"
							style={{ height: `${h}%` }}
						/>
						<span className="text-[8px] text-zinc-600">{days[i]}</span>
					</div>
				))}
			</div>
		</div>
	)
}

// ─── Step Definitions ─────────────────────────────────────────────────────────

const STEPS = [
	{
		id: 'welcome',
		subtitle: 'Bienvenido a CourtOps',
		title: '¡Tu club ya está listo!',
		description: 'En 60 segundos te mostramos todo lo que podés hacer desde el primer día.',
		gradient: 'from-amber-500 to-orange-500',
		glow: 'bg-orange-500',
		icon: null,
		emoji: '🎉',
		mockup: null,
	},
	{
		id: 'agenda',
		subtitle: 'Reservas',
		title: 'Agenda digital',
		description: 'Hacé clic en cualquier espacio libre para crear una reserva. Disponibilidad, cobros y recordatorios van solos.',
		gradient: 'from-blue-500 to-indigo-600',
		glow: 'bg-blue-500',
		icon: CalendarDays,
		emoji: null,
		mockup: 'calendar',
	},
	{
		id: 'clientes',
		subtitle: 'Clientes',
		title: 'Ficha digital completa',
		description: 'Historial de turnos, deudas, membresías y firma de waivers. Todo centralizado por cliente.',
		gradient: 'from-violet-500 to-purple-600',
		glow: 'bg-violet-500',
		icon: Users,
		emoji: null,
		mockup: 'clients',
	},
	{
		id: 'kiosco',
		subtitle: 'Kiosco & Caja',
		title: 'Punto de venta integrado',
		description: 'Vendé bebidas y accesorios. La caja diaria queda registrada y todo se suma automáticamente.',
		gradient: 'from-rose-500 to-pink-600',
		glow: 'bg-rose-500',
		icon: Store,
		emoji: null,
		mockup: 'kiosco',
	},
	{
		id: 'link',
		subtitle: 'Reservas Online',
		title: 'Tu link personalizado',
		description: 'Compartí tu link y tus clientes reservan solos, las 24hs. Sin llamadas, sin WhatsApps.',
		gradient: 'from-emerald-500 to-teal-600',
		glow: 'bg-emerald-500',
		icon: Globe,
		emoji: null,
		mockup: 'link',
	},
	{
		id: 'reportes',
		subtitle: 'Analytics',
		title: 'Decisiones con datos',
		description: 'Ingresos diarios, ocupación por cancha y productos más vendidos. Todo en tiempo real.',
		gradient: 'from-amber-500 to-yellow-500',
		glow: 'bg-amber-500',
		icon: BarChart3,
		emoji: null,
		mockup: 'reports',
	},
]

// ─── Component ────────────────────────────────────────────────────────────────

interface DashboardTutorialProps {
	manualOpen?: boolean
	onManualClose?: () => void
	forceOpen?: boolean
	onClose?: () => void
	slug?: string
}

export default function DashboardTutorial({
	manualOpen,
	onManualClose,
	forceOpen,
	onClose,
	slug,
}: DashboardTutorialProps) {
	const [internalOpen, setInternalOpen] = useState(false)
	const [currentStep, setCurrentStep] = useState(0)

	// Auto-open logic (runs once on mount)
	useEffect(() => {
		if (manualOpen !== undefined) return // manual mode — skip auto logic
		const hasSeen = localStorage.getItem('courtops_tutorial_v2')
		if (forceOpen || !hasSeen) {
			setInternalOpen(true)
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const isOpen = manualOpen !== undefined ? manualOpen : internalOpen

	const handleClose = () => {
		localStorage.setItem('courtops_tutorial_v2', 'true')
		if (manualOpen !== undefined && onManualClose) {
			onManualClose()
			setTimeout(() => setCurrentStep(0), 300)
		} else {
			setInternalOpen(false)
			onClose?.()
		}
	}

	const next = () => {
		if (currentStep < STEPS.length - 1) setCurrentStep(s => s + 1)
		else handleClose()
	}

	const prev = () => {
		if (currentStep > 0) setCurrentStep(s => s - 1)
	}

	if (!isOpen) return null

	const step = STEPS[currentStep]
	const Icon = step.icon
	const isWelcome = step.id === 'welcome'
	const isLast = currentStep === STEPS.length - 1

	return (
		<AnimatePresence>
			<div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md">
				<motion.div
					initial={{ opacity: 0, scale: 0.94, y: 32 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.94, y: 32 }}
					transition={{ type: 'spring', stiffness: 300, damping: 28 }}
					className="bg-[#09090c] border border-white/8 rounded-[2rem] w-full max-w-sm shadow-[0_0_140px_rgba(0,0,0,0.95)] overflow-hidden relative"
				>
					{/* Animated gradient glow */}
					<div className={cn(
						'absolute -top-24 -right-24 w-80 h-80 rounded-full blur-[120px] opacity-15 transition-all duration-700 pointer-events-none',
						step.glow
					)} />

					{/* Top color strip */}
					<div className={cn('h-[3px] w-full bg-gradient-to-r transition-all duration-500', step.gradient)} />

					<div className="relative z-10 p-6">
						{/* Header row */}
						<div className="flex items-start justify-between mb-5">
							<div>
								{isWelcome ? (
									<motion.div
										key="emoji"
										initial={{ scale: 0.5, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
										className="text-4xl leading-none"
									>
										{step.emoji}
									</motion.div>
								) : Icon ? (
									<div className={cn(
										'p-2.5 rounded-2xl bg-gradient-to-br text-white shadow-lg w-fit',
										step.gradient
									)}>
										<Icon size={20} />
									</div>
								) : null}
							</div>
							<button
								onClick={handleClose}
								className="p-2 text-zinc-700 hover:text-zinc-300 hover:bg-white/5 rounded-xl transition-colors ml-2 shrink-0"
							>
								<X size={16} />
							</button>
						</div>

						{/* Step content */}
						<AnimatePresence mode="wait">
							<motion.div
								key={currentStep}
								initial={{ opacity: 0, x: 14 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -14 }}
								transition={{ type: 'spring', stiffness: 380, damping: 34 }}
							>
								{/* Subtitle label */}
								<div className={cn(
									'text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5 bg-gradient-to-r bg-clip-text text-transparent',
									step.gradient
								)}>
									{step.subtitle}
								</div>

								{/* Title */}
								<h2 className={cn(
									'font-black text-white leading-tight mb-2',
									isWelcome ? 'text-2xl' : 'text-xl'
								)}>
									{step.title}
								</h2>

								{/* Description */}
								<p className="text-zinc-400 text-sm leading-relaxed">
									{step.description}
								</p>

								{/* Mockup */}
								{step.mockup && (
									<div className="mt-4">
										{step.mockup === 'calendar' && <CalendarMockup />}
										{step.mockup === 'clients' && <ClientsMockup />}
										{step.mockup === 'kiosco' && <KioscoMockup />}
										{step.mockup === 'link' && <LinkMockup slug={slug} />}
										{step.mockup === 'reports' && <ReportsMockup />}
									</div>
								)}
							</motion.div>
						</AnimatePresence>

						{/* Footer */}
						<div className="flex items-center justify-between mt-6 pt-5 border-t border-white/5">
							{/* Progress dots */}
							<div className="flex gap-1.5 items-center">
								{STEPS.map((_, i) => (
									<button
										key={i}
										onClick={() => setCurrentStep(i)}
										className={cn(
											'h-1.5 rounded-full transition-all duration-300',
											i === currentStep
												? cn('w-5 bg-gradient-to-r', step.gradient)
												: 'w-1.5 bg-white/10 hover:bg-white/20'
										)}
									/>
								))}
							</div>

							{/* Nav buttons */}
							<div className="flex gap-2">
								{currentStep > 0 && (
									<button
										onClick={prev}
										className="p-2.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl transition-all active:scale-95"
									>
										<ChevronLeft size={16} />
									</button>
								)}
								<button
									onClick={next}
									className={cn(
										'px-4 py-2.5 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 active:scale-95 bg-gradient-to-r shadow-lg',
										step.gradient
									)}
								>
									{isLast
										? <><span>¡Empezar!</span><CheckCircle2 size={14} /></>
										: isWelcome
										? <><span>Ver tour</span><ChevronRight size={14} /></>
										: <><span>Siguiente</span><ChevronRight size={14} /></>
									}
								</button>
							</div>
						</div>
					</div>
				</motion.div>
			</div>
		</AnimatePresence>
	)
}
