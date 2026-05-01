'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
	X, ChevronRight, ChevronLeft, Check,
	CalendarDays, Users, Store, BarChart3, Globe, Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Mini Mockups (system tokens) ────────────────────────────────────────────

function CalendarMockup() {
	const slots = [
		{ active: true, label: 'Juan Martínez', time: '14:00' },
		{ active: true, label: 'María González', time: '15:30' },
		{ active: false, label: '+ Espacio libre', time: '17:00' },
		{ active: true, label: 'Club Padel', time: '18:30' },
	]
	return (
		<div className="bg-muted/40 border border-border/60 rounded-2xl p-3 space-y-1.5">
			<div className="flex items-center justify-between px-0.5 mb-2">
				<span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
					Hoy · Cancha 1
				</span>
				<div className="flex gap-1">
					{['bg-red-400/50', 'bg-yellow-400/50', 'bg-green-400/50'].map((c, i) => (
						<div key={i} className={cn('w-1.5 h-1.5 rounded-full', c)} />
					))}
				</div>
			</div>
			{slots.map((s, i) => (
				<div
					key={i}
					className={cn(
						'flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs transition-colors',
						s.active
							? 'bg-primary/8 border-primary/20 text-foreground'
							: 'bg-muted/30 border-border/40 text-muted-foreground'
					)}
				>
					<span className="font-mono text-[10px] text-muted-foreground w-9 shrink-0">{s.time}</span>
					<span className={cn('font-medium', s.active ? 'text-foreground' : 'italic text-muted-foreground/60')}>{s.label}</span>
				</div>
			))}
		</div>
	)
}

function ClientsMockup() {
	const clients = [
		{ initial: 'J', name: 'Juan Martínez', sub: '12 turnos', tag: 'VIP' },
		{ initial: 'M', name: 'María González', sub: '8 turnos', tag: null },
		{ initial: 'C', name: 'Carlos Ruiz', sub: '3 turnos', tag: 'Nuevo' },
	]
	return (
		<div className="space-y-1.5">
			{clients.map((c, i) => (
				<div key={i} className="flex items-center gap-3 bg-muted/40 border border-border/60 rounded-xl px-3 py-2.5">
					<div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center text-primary text-xs font-black shrink-0">
						{c.initial}
					</div>
					<div className="flex-1 min-w-0">
						<div className="text-xs font-semibold text-foreground truncate">{c.name}</div>
						<div className="text-[10px] text-muted-foreground">{c.sub}</div>
					</div>
					{c.tag && (
						<span className={cn(
							'text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0',
							c.tag === 'VIP'
								? 'bg-amber-500/15 text-amber-500 dark:text-amber-400'
								: 'bg-primary/10 text-primary'
						)}>
							{c.tag}
						</span>
					)}
				</div>
			))}
		</div>
	)
}

function KioscoMockup() {
	const items = [
		{ name: 'Agua 500ml', price: '$1.200' },
		{ name: 'Gatorade', price: '$2.500' },
		{ name: 'Pelota Padel', price: '$8.000' },
		{ name: 'Muñequera', price: '$3.500' },
	]
	return (
		<div className="grid grid-cols-2 gap-2">
			{items.map((item, i) => (
				<div key={i} className="bg-muted/40 border border-border/60 rounded-xl p-2.5">
					<div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/15 mb-2" />
					<div className="text-[10px] font-semibold text-foreground leading-tight">{item.name}</div>
					<div className="text-[10px] font-black text-primary mt-0.5">{item.price}</div>
				</div>
			))}
		</div>
	)
}

function LinkMockup({ slug }: { slug?: string }) {
	return (
		<div className="space-y-2">
			<div className="bg-muted/40 border border-border/60 rounded-xl p-3 flex items-center gap-2.5">
				<Globe size={11} className="text-primary shrink-0" />
				<span className="text-[10px] font-mono text-foreground truncate flex-1">
					courtops.net/p/{slug || 'tu-club'}
				</span>
				<span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-md font-black shrink-0">ACTIVO</span>
			</div>
			<div className="bg-muted/20 border border-border/40 rounded-xl p-3 space-y-2">
				<div className="h-2 bg-foreground/8 rounded-full w-3/4" />
				<div className="h-2 bg-foreground/5 rounded-full w-1/2" />
				<div className="mt-3 h-7 bg-primary/15 border border-primary/25 rounded-xl flex items-center justify-center">
					<span className="text-[10px] font-semibold text-primary">Reservar turno →</span>
				</div>
			</div>
		</div>
	)
}

function ReportsMockup() {
	const bars = [42, 68, 50, 85, 60, 92, 74]
	const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
	return (
		<div className="bg-muted/40 border border-border/60 rounded-2xl p-3">
			<div className="flex items-center justify-between mb-3">
				<span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
					Ingresos · semana
				</span>
				<span className="text-[10px] font-black text-primary">+24%</span>
			</div>
			<div className="flex items-end gap-1.5 h-12">
				{bars.map((h, i) => (
					<div key={i} className="flex-1 flex flex-col items-center gap-1">
						<div
							className="w-full rounded-t-md bg-primary/60"
							style={{ height: `${h}%` }}
						/>
						<span className="text-[8px] text-muted-foreground/50">{days[i]}</span>
					</div>
				))}
			</div>
		</div>
	)
}

// ─── Step definitions ─────────────────────────────────────────────────────────

const STEPS = [
	{
		id: 'welcome',
		category: 'CourtOps · Bienvenida',
		title: '¡Tu club ya está listo!',
		description: 'Te mostramos en minutos todo lo que podés hacer desde el primer día.',
		icon: null,
		mockup: null,
	},
	{
		id: 'agenda',
		category: 'Reservas',
		title: 'Agenda digital',
		description: 'Hacé clic en cualquier espacio libre para crear una reserva. Disponibilidad, cobros y recordatorios automáticos.',
		icon: CalendarDays,
		mockup: 'calendar',
	},
	{
		id: 'clientes',
		category: 'Clientes',
		title: 'Ficha digital completa',
		description: 'Historial de turnos, deudas, membresías y firma de waivers. Todo centralizado por cliente.',
		icon: Users,
		mockup: 'clients',
	},
	{
		id: 'kiosco',
		category: 'Kiosco & Caja',
		title: 'Punto de venta integrado',
		description: 'Vendé bebidas y accesorios. La caja diaria queda registrada y todo se suma automáticamente.',
		icon: Store,
		mockup: 'kiosco',
	},
	{
		id: 'link',
		category: 'Reservas Online',
		title: 'Tu link personalizado',
		description: 'Compartí tu link y tus clientes reservan solos las 24hs. Sin llamadas, sin WhatsApps para coordinar.',
		icon: Globe,
		mockup: 'link',
	},
	{
		id: 'reportes',
		category: 'Analytics',
		title: 'Decisiones con datos',
		description: 'Ingresos diarios, ocupación por cancha y productos más vendidos. Todo en tiempo real.',
		icon: BarChart3,
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

	useEffect(() => {
		if (manualOpen !== undefined) return
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
	const progress = ((currentStep + 1) / STEPS.length) * 100

	return (
		<AnimatePresence>
			<div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-2xl p-4">

				{/* Card */}
				<motion.div
					initial={{ opacity: 0, scale: 0.95, y: 20 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.95, y: 20 }}
					transition={{ type: 'spring', stiffness: 300, damping: 28 }}
					className="bg-card border border-border rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden relative"
				>
					{/* Progress bar */}
					<div className="h-[3px] bg-border w-full">
						<motion.div
							className="h-full bg-primary"
							animate={{ width: `${progress}%` }}
							transition={{ duration: 0.4, ease: 'easeInOut' }}
						/>
					</div>

					{/* Step counter */}
					<div className="flex items-center justify-between px-6 pt-4 pb-0">
						<span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
							{isWelcome ? 'Tour de bienvenida' : `${currentStep} de ${STEPS.length - 1}`}
						</span>
						<button
							onClick={handleClose}
							className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
						>
							<X size={15} />
						</button>
					</div>

					{/* Content */}
					<div className="px-6 pb-6 pt-4">
						<AnimatePresence mode="wait">
							<motion.div
								key={currentStep}
								initial={{ opacity: 0, x: 12 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -12 }}
								transition={{ type: 'spring', stiffness: 380, damping: 34 }}
								className="space-y-4"
							>
								{/* Icon / welcome badge */}
								{isWelcome ? (
									<motion.div
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
										className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg"
									>
										<Sparkles size={26} className="text-primary-foreground" />
									</motion.div>
								) : Icon ? (
									<div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center">
										<Icon size={18} className="text-primary" />
									</div>
								) : null}

								{/* Text */}
								<div className="space-y-1.5">
									<p className="text-[10px] font-black uppercase tracking-[0.15em] text-primary">
										{step.category}
									</p>
									<h2 className={cn(
										'font-black text-foreground leading-tight',
										isWelcome ? 'text-2xl' : 'text-xl'
									)}>
										{step.title}
									</h2>
									<p className="text-sm text-muted-foreground leading-relaxed">
										{step.description}
									</p>
								</div>

								{/* Mockup */}
								{step.mockup && (
									<div className="mt-1">
										{step.mockup === 'calendar' && <CalendarMockup />}
										{step.mockup === 'clients' && <ClientsMockup />}
										{step.mockup === 'kiosco' && <KioscoMockup />}
										{step.mockup === 'link' && <LinkMockup slug={slug} />}
										{step.mockup === 'reports' && <ReportsMockup />}
									</div>
								)}
							</motion.div>
						</AnimatePresence>

						{/* Footer nav */}
						<div className="flex items-center justify-between mt-6 pt-5 border-t border-border/60">
							{/* Dots */}
							<div className="flex gap-1.5 items-center">
								{STEPS.map((_, i) => (
									<button
										key={i}
										onClick={() => setCurrentStep(i)}
										className={cn(
											'h-1.5 rounded-full transition-all duration-300',
											i === currentStep ? 'w-5 bg-primary' : 'w-1.5 bg-border hover:bg-muted-foreground/40'
										)}
									/>
								))}
							</div>

							{/* Buttons */}
							<div className="flex gap-2">
								{currentStep > 0 && (
									<button
										onClick={prev}
										className="p-2.5 border border-border hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl transition-all active:scale-95"
									>
										<ChevronLeft size={16} />
									</button>
								)}
								<button
									onClick={next}
									className="bg-primary hover:brightness-110 text-primary-foreground px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-md"
								>
									{isLast
										? <><span>¡Entendido!</span> <Check size={14} strokeWidth={3} /></>
										: isWelcome
										? <><span>Comenzar</span> <ChevronRight size={14} /></>
										: <><span>Siguiente</span> <ChevronRight size={14} /></>
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
