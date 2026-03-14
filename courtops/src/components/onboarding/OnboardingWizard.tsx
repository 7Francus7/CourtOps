'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
	ArrowRight,
	ArrowLeft,
	Check,
	Clock,
	Copy,
	DollarSign,
	LayoutGrid,
	Loader2,
	Plus,
	Share2,
	Sparkles,
	X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { finishOnboarding } from '@/actions/onboarding'
import type { OnboardingCourt } from '@/actions/onboarding'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const SPORTS = [
	{ value: 'PADEL', label: 'Padel' },
	{ value: 'TENNIS', label: 'Tenis' },
	{ value: 'FOOTBALL', label: 'Futbol' },
] as const

const SLOT_DURATIONS = [
	{ value: 60, label: '60 min' },
	{ value: 90, label: '90 min' },
	{ value: 120, label: '120 min' },
] as const

const TOTAL_STEPS = 4

const WELCOME_STEPS = [
	{ icon: LayoutGrid, label: 'Canchas', step: 1, desc: 'Agrega' },
	{ icon: Clock, label: 'Horarios', step: 2, desc: 'Configura' },
	{ icon: Share2, label: 'Compartir', step: 3, desc: 'Publica' },
] as const

interface OnboardingWizardProps {
	clubName?: string
	slug?: string
}

export default function OnboardingWizard({ clubName = 'tu club', slug }: OnboardingWizardProps) {
	const router = useRouter()
	const [step, setStep] = useState(1)
	const [loading, setLoading] = useState(false)
	const [isCelebration, setIsCelebration] = useState(false)
	const [linkCopied, setLinkCopied] = useState(false)

	// Step 2 state: courts
	const [courts, setCourts] = useState<OnboardingCourt[]>([])
	const [courtName, setCourtName] = useState('')
	const [courtSport, setCourtSport] = useState('PADEL')

	// Step 3 state: schedule & pricing
	const [openTime, setOpenTime] = useState('08:00')
	const [closeTime, setCloseTime] = useState('23:00')
	const [slotDuration, setSlotDuration] = useState(90)
	const [price, setPrice] = useState(15000)

	const publicUrl = slug
		? `courtops.net/p/${slug}`
		: 'courtops.net/p/tu-club'

	const addCourt = useCallback(() => {
		const name = courtName.trim()
		if (!name) {
			toast.error('Ingresa un nombre para la cancha')
			return
		}
		setCourts(prev => [...prev, { name, sport: courtSport }])
		setCourtName('')
	}, [courtName, courtSport])

	const removeCourt = useCallback((index: number) => {
		setCourts(prev => prev.filter((_, i) => i !== index))
	}, [])

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === 'Enter') {
				e.preventDefault()
				addCourt()
			}
		},
		[addCourt]
	)

	const canAdvance = (): boolean => {
		switch (step) {
			case 2:
				return courts.length >= 1
			case 3:
				return price > 0
			default:
				return true
		}
	}

	const handleNext = () => {
		if (!canAdvance()) {
			if (step === 2) toast.error('Agrega al menos 1 cancha para continuar')
			if (step === 3) toast.error('El precio debe ser mayor a 0')
			return
		}
		if (step < TOTAL_STEPS) {
			if (step === 3) {
				handleFinish()
			} else {
				setStep(s => s + 1)
			}
		}
	}

	const handleBack = () => {
		if (step > 1) setStep(s => s - 1)
	}

	const handleFinish = async () => {
		setLoading(true)
		try {
			const res = await finishOnboarding({
				courts,
				openTime,
				closeTime,
				slotDuration,
				price,
			})
			if (res.success) {
				setStep(4)
				setIsCelebration(true)
				setLoading(false)
			} else {
				toast.error('Error al configurar: ' + res.error)
				setLoading(false)
			}
		} catch {
			toast.error('Error de conexion')
			setLoading(false)
		}
	}

	const handleCopyLink = useCallback(() => {
		const url = `https://${publicUrl}`
		navigator.clipboard.writeText(url).then(() => {
			setLinkCopied(true)
			toast.success('Link copiado')
			setTimeout(() => setLinkCopied(false), 2000)
		})
	}, [publicUrl])

	const handleShareWhatsApp = useCallback(() => {
		const url = `https://${publicUrl}`
		const text = encodeURIComponent(
			`Reserva tu cancha online: ${url}`
		)
		window.open(`https://wa.me/?text=${text}`, '_blank')
	}, [publicUrl])

	const handleGoToDashboard = useCallback(() => {
		localStorage.setItem('courtops_onboarding_complete', 'true')
		router.refresh()
	}, [router])

	const sportLabel = (value: string) =>
		SPORTS.find(s => s.value === value)?.label ?? value

	// --------------- RENDER ---------------

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl">
			{/* Progress bar at absolute top */}
			<div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
				<motion.div
					className="h-full bg-brand-green shadow-[0_0_12px_rgba(16,185,129,0.6)]"
					initial={{ width: '0%' }}
					animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
					transition={{ duration: 0.5, ease: 'easeInOut' }}
				/>
			</div>

			{/* Card container */}
			<div className="bg-[#09090b] border border-white/10 p-1 md:p-1.5 rounded-[40px] w-full max-w-lg shadow-2xl relative overflow-hidden">
				<div className="bg-[#09090b] border border-white/5 rounded-[36px] p-8 md:p-12 relative overflow-hidden">
					{/* Decorative blurs */}
					<div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
					<div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

					{/* Step indicator */}
					<div className="flex items-center gap-2 mb-10 relative z-10 justify-center">
						{Array.from({ length: TOTAL_STEPS }).map((_, i) => (
							<React.Fragment key={i}>
								<motion.div
									className={cn(
										'w-2.5 h-2.5 rounded-full transition-all duration-500',
										step === i + 1
											? 'bg-brand-green shadow-[0_0_10px_rgba(16,185,129,0.7)] scale-125'
											: step > i + 1
												? 'bg-brand-green/60 scale-100'
												: 'bg-white/10'
									)}
									animate={step === i + 1 ? { scale: [1, 1.3, 1.15] } : {}}
									transition={{ duration: 0.4 }}
								/>
								{i < TOTAL_STEPS - 1 && (
									<div className={cn(
										'w-6 h-[2px] rounded-full transition-all duration-500',
										step > i + 1 ? 'bg-brand-green/40' : 'bg-white/5'
									)} />
								)}
							</React.Fragment>
						))}
					</div>

					<AnimatePresence mode="wait">
						{/* ====== STEP 1: Welcome ====== */}
						{step === 1 && (
							<motion.div
								key="step1"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								transition={{ duration: 0.4, ease: 'easeOut' }}
								className="space-y-8 relative z-10"
							>
								<div className="space-y-5 text-center">
									<motion.div
										initial={{ opacity: 0, scale: 0.8 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ delay: 0.15, duration: 0.4 }}
										className="inline-flex items-center gap-2 bg-brand-green/10 border border-brand-green/20 text-brand-green px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mx-auto shadow-[0_0_20px_rgba(16,185,129,0.1)]"
									>
										<Sparkles size={12} className="animate-pulse" /> Bienvenido
									</motion.div>
									<h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
										Configura tu club<br />
										<span className="bg-gradient-to-r from-brand-green to-emerald-400 bg-clip-text text-transparent">en minutos</span>
									</h2>
									<p className="text-zinc-400 text-base leading-relaxed max-w-sm mx-auto">
										Hola <span className="text-white font-semibold">{clubName}</span>, solo necesitas <span className="text-brand-green font-bold">3 pasos</span> para empezar a recibir reservas.
									</p>
								</div>

								<div className="grid grid-cols-3 gap-2.5">
									{WELCOME_STEPS.map(({ icon: Icon, label, step: s, desc }, i) => (
										<motion.div
											key={label}
											initial={{ opacity: 0, y: 16 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: 0.25 + i * 0.1, duration: 0.35 }}
											className="group relative bg-white/[0.03] border border-white/[0.06] hover:border-brand-green/20 rounded-2xl p-4 flex flex-col items-center gap-2.5 transition-all duration-300 hover:bg-brand-green/[0.04]"
										>
											<span className="absolute -top-2 -right-1.5 bg-brand-green text-black text-[9px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.4)]">
												{s}
											</span>
											<div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center group-hover:bg-brand-green/15 transition-colors">
												<Icon size={18} className="text-brand-green" />
											</div>
											<div className="text-center">
												<span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider leading-none mb-0.5">
													{desc}
												</span>
												<span className="block text-xs font-bold text-zinc-300">
													{label}
												</span>
											</div>
										</motion.div>
									))}
								</div>

								<motion.button
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.55, duration: 0.35 }}
									onClick={() => setStep(2)}
									className="w-full group relative bg-brand-green hover:bg-brand-green/90 active:scale-[0.97] transition-all text-black h-14 rounded-2xl flex items-center justify-center gap-3 font-black text-lg shadow-[0_0_40px_rgba(16,185,129,0.25)] overflow-hidden"
								>
									<span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
									<span className="relative flex items-center gap-3">
										Comenzar <ArrowRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
									</span>
								</motion.button>
							</motion.div>
						)}

						{/* ====== STEP 2: Create Courts ====== */}
						{step === 2 && (
							<motion.div
								key="step2"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								transition={{ duration: 0.3 }}
								className="space-y-6 relative z-10"
							>
								<div className="space-y-1">
									<h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
										Crea tus Canchas
									</h2>
									<p className="text-zinc-500 text-sm">
										Agrega al menos 1 cancha para continuar.
									</p>
								</div>

								{/* Court input form */}
								<div className="space-y-3">
									<div className="flex gap-2">
										<input
											type="text"
											value={courtName}
											onChange={e => setCourtName(e.target.value)}
											onKeyDown={handleKeyDown}
											placeholder="Ej. Cancha 1"
											className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 outline-none focus:border-brand-green/50 transition-colors text-sm"
											autoFocus
										/>
										<select
											value={courtSport}
											onChange={e => setCourtSport(e.target.value)}
											className="bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white outline-none focus:border-brand-green/50 transition-colors text-sm appearance-none cursor-pointer"
										>
											{SPORTS.map(s => (
												<option key={s.value} value={s.value} className="bg-zinc-900">
													{s.label}
												</option>
											))}
										</select>
									</div>
									<button
										onClick={addCourt}
										className="w-full border border-dashed border-white/10 hover:border-brand-green/40 text-zinc-400 hover:text-brand-green h-10 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all"
									>
										<Plus size={16} /> Agregar cancha
									</button>
								</div>

								{/* Court pills */}
								{courts.length > 0 && (
									<div className="flex flex-wrap gap-2">
										{courts.map((court, i) => (
											<motion.div
												key={`${court.name}-${i}`}
												initial={{ opacity: 0, scale: 0.8 }}
												animate={{ opacity: 1, scale: 1 }}
												exit={{ opacity: 0, scale: 0.8 }}
												className="inline-flex items-center gap-2 bg-brand-green/10 border border-brand-green/20 text-brand-green px-3 py-1.5 rounded-full text-sm font-medium"
											>
												<span>{court.name}</span>
												<span className="text-brand-green/50 text-[10px] uppercase tracking-wider">
													{sportLabel(court.sport)}
												</span>
												<button
													onClick={() => removeCourt(i)}
													className="hover:bg-brand-green/20 rounded-full p-0.5 transition-colors"
												>
													<X size={12} />
												</button>
											</motion.div>
										))}
									</div>
								)}

								{courts.length === 0 && (
									<div className="text-center py-6 text-zinc-600 text-sm">
										Todavia no agregaste canchas
									</div>
								)}

								{/* Navigation */}
								<div className="flex gap-3 pt-2">
									<button
										onClick={handleBack}
										className="w-1/3 border border-white/10 hover:bg-white/5 text-white h-14 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
									>
										<ArrowLeft size={16} /> Atras
									</button>
									<button
										onClick={handleNext}
										disabled={!canAdvance()}
										className="w-2/3 bg-brand-green hover:bg-brand-green/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-black h-14 rounded-2xl flex items-center justify-center gap-3 font-black text-lg"
									>
										Continuar <ArrowRight size={20} />
									</button>
								</div>
							</motion.div>
						)}

						{/* ====== STEP 3: Schedule & Pricing ====== */}
						{step === 3 && (
							<motion.div
								key="step3"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								transition={{ duration: 0.3 }}
								className="space-y-6 relative z-10"
							>
								<div className="space-y-1">
									<h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
										Configura tus Horarios
									</h2>
									<p className="text-zinc-500 text-sm">
										Define apertura, cierre y precio base.
									</p>
								</div>

								{/* Open / Close */}
								<div className="space-y-4">
									<label className="text-xs font-black text-zinc-400 uppercase tracking-[0.15em] flex items-center gap-2">
										<Clock size={14} className="text-brand-green" /> Horarios
									</label>
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest pl-1">
												Apertura
											</span>
											<div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-2 focus-within:border-brand-green/50 transition-colors">
												<Clock size={16} className="text-zinc-600 shrink-0" />
												<input
													type="time"
													value={openTime}
													onChange={e => setOpenTime(e.target.value)}
													className="bg-transparent text-white outline-none w-full font-bold text-sm"
												/>
											</div>
										</div>
										<div className="space-y-2">
											<span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest pl-1">
												Cierre
											</span>
											<div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-2 focus-within:border-brand-green/50 transition-colors">
												<Clock size={16} className="text-zinc-600 shrink-0" />
												<input
													type="time"
													value={closeTime}
													onChange={e => setCloseTime(e.target.value)}
													className="bg-transparent text-white outline-none w-full font-bold text-sm"
												/>
											</div>
										</div>
									</div>
								</div>

								{/* Slot Duration */}
								<div className="space-y-3">
									<label className="text-xs font-black text-zinc-400 uppercase tracking-[0.15em] flex items-center gap-2">
										<Clock size={14} className="text-brand-green" /> Duracion del turno
									</label>
									<div className="grid grid-cols-3 gap-2">
										{SLOT_DURATIONS.map(d => (
											<button
												key={d.value}
												onClick={() => setSlotDuration(d.value)}
												className={cn(
													'py-3 rounded-xl font-bold text-sm transition-all border',
													slotDuration === d.value
														? 'bg-brand-green/10 border-brand-green text-brand-green shadow-[0_0_15px_rgba(16,185,129,0.15)]'
														: 'bg-white/5 border-white/5 text-zinc-400 hover:border-white/20 hover:text-white'
												)}
											>
												{d.label}
											</button>
										))}
									</div>
								</div>

								{/* Price */}
								<div className="space-y-3">
									<label className="text-xs font-black text-zinc-400 uppercase tracking-[0.15em] flex items-center gap-2">
										<DollarSign size={14} className="text-brand-green" /> Precio por hora
									</label>
									<div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-2 focus-within:border-brand-green/50 transition-colors">
										<span className="text-2xl font-light text-zinc-600">$</span>
										<input
											type="number"
											value={price}
											onChange={e => setPrice(Number(e.target.value))}
											className="bg-transparent text-3xl font-black text-white w-full outline-none placeholder:text-zinc-800"
											placeholder="0"
										/>
									</div>
									<p className="text-xs text-zinc-500 italic pl-1">
										Podras personalizar precios por dia y horario desde Configuracion.
									</p>
								</div>

								{/* Navigation */}
								<div className="flex gap-3 pt-2">
									<button
										onClick={handleBack}
										className="w-1/3 border border-white/10 hover:bg-white/5 text-white h-14 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
									>
										<ArrowLeft size={16} /> Atras
									</button>
									<button
										onClick={handleNext}
										disabled={loading || !canAdvance()}
										className="w-2/3 bg-brand-green hover:bg-brand-green/90 disabled:opacity-50 transition-all text-black h-14 rounded-2xl flex items-center justify-center gap-3 font-black text-lg"
									>
										{loading ? (
											<Loader2 className="animate-spin" size={22} />
										) : (
											<>
												Completar <Check size={20} />
											</>
										)}
									</button>
								</div>
							</motion.div>
						)}

						{/* ====== STEP 4: Done / Share Link ====== */}
						{step === 4 && isCelebration && (
							<motion.div
								key="step4"
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.5, ease: 'easeOut' }}
								className="space-y-8 relative z-10"
							>
								{/* Success animation */}
								<div className="flex flex-col items-center gap-6">
									<div className="relative">
										<motion.div
											initial={{ scale: 0 }}
											animate={{ scale: 1 }}
											transition={{
												type: 'spring',
												stiffness: 200,
												damping: 12,
												delay: 0.2,
											}}
											className="w-20 h-20 bg-brand-green rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.5)]"
										>
											<Check size={40} className="text-black" strokeWidth={3} />
										</motion.div>
										<motion.div
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ delay: 0.5 }}
											className="absolute -top-2 -right-2"
										>
											<Sparkles size={20} className="text-brand-green animate-pulse" />
										</motion.div>
									</div>

									<div className="text-center space-y-2">
										<h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
											Listo!
										</h2>
										<p className="text-zinc-400 text-base max-w-sm mx-auto">
											Tu club esta configurado. Comparte tu link para que tus clientes reserven online.
										</p>
									</div>
								</div>

								{/* Public URL display */}
								<div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
									<div className="flex-1 font-mono text-sm text-white truncate">
										{publicUrl}
									</div>
									<button
										onClick={handleCopyLink}
										className={cn(
											'shrink-0 p-2.5 rounded-xl transition-all',
											linkCopied
												? 'bg-brand-green text-black'
												: 'bg-white/10 hover:bg-white/20 text-white'
										)}
									>
										{linkCopied ? <Check size={16} /> : <Copy size={16} />}
									</button>
								</div>

								{/* Share buttons */}
								<div className="grid grid-cols-2 gap-3">
									<button
										onClick={handleCopyLink}
										className="border border-white/10 hover:bg-white/5 text-white h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all"
									>
										<Copy size={16} /> Copiar Link
									</button>
									<button
										onClick={handleShareWhatsApp}
										className="bg-[#25D366] hover:bg-[#20BD5A] text-white h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all"
									>
										<Share2 size={16} /> WhatsApp
									</button>
								</div>

								{/* Go to dashboard */}
								<button
									onClick={handleGoToDashboard}
									className="w-full bg-brand-green hover:bg-brand-green/90 active:scale-[0.98] transition-all text-black h-14 rounded-2xl flex items-center justify-center gap-3 font-black text-lg shadow-[0_0_40px_rgba(16,185,129,0.2)]"
								>
									Ir al Dashboard <ArrowRight size={20} />
								</button>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		</div>
	)
}
