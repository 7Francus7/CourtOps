'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
	ArrowRight,
	ArrowLeft,
	Check,
	Clock,
	Copy,
	LayoutGrid,
	Loader2,
	Plus,
	Share2,
	Sparkles,
	Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { finishOnboarding } from '@/actions/onboarding'
import type { OnboardingCourt } from '@/actions/onboarding'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const PADEL_SLOT_MINUTES = 90

const TOTAL_STEPS = 4

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

	const [courts, setCourts] = useState<OnboardingCourt[]>([])
	const [courtName, setCourtName] = useState('')
	const [openTime, setOpenTime] = useState('08:00')
	const [closeTime, setCloseTime] = useState('23:00')
	const slotDuration = PADEL_SLOT_MINUTES
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
		if (courts.some(c => c.name.toLowerCase() === name.toLowerCase())) {
			toast.error('Ya existe una cancha con ese nombre')
			return
		}
		setCourts(prev => [...prev, { name, sport: 'PADEL' }])
		setCourtName('')
	}, [courtName, courts])

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

	const stepTitles = ['', 'Bienvenido', 'Canchas', 'Horarios', 'Listo']

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/98 backdrop-blur-2xl">
			{/* Top bar */}
			<div className="absolute top-0 left-0 right-0 z-10">
				<div className="h-1 bg-border">
					<motion.div
						className="h-full bg-primary"
						initial={{ width: '0%' }}
						animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
						transition={{ duration: 0.5, ease: 'easeInOut' }}
					/>
				</div>
				<div className="flex items-center justify-between px-5 py-3">
					<span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
						Paso {step} de {TOTAL_STEPS}
					</span>
					<span className="text-xs font-bold text-foreground/60">
						{stepTitles[step]}
					</span>
				</div>
			</div>

			{/* Scrollable content */}
			<div className="w-full h-full overflow-y-auto flex items-center justify-center p-4 pt-16 pb-6">
				<div className="w-full max-w-md mx-auto">
					<div className="bg-card border border-border rounded-3xl p-6 md:p-10 relative shadow-xl dark:shadow-2xl">

						<AnimatePresence mode="wait">
							{/* ====== STEP 1: Welcome ====== */}
							{step === 1 && (
								<motion.div
									key="step1"
									initial={{ opacity: 0, y: 16 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -16 }}
									transition={{ duration: 0.3 }}
									className="space-y-7"
								>
									<div className="space-y-4 text-center">
										<motion.div
											initial={{ opacity: 0, scale: 0.85 }}
											animate={{ opacity: 1, scale: 1 }}
											transition={{ delay: 0.1, duration: 0.35 }}
											className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest"
										>
											<Sparkles size={11} /> Configuracion inicial
										</motion.div>

										<h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight leading-[1.1]">
											Hola{' '}
											<span className="text-primary">
												{clubName}
											</span>
										</h2>

										<p className="text-muted-foreground text-[15px] leading-relaxed max-w-xs mx-auto">
											Configura tu club en <span className="text-foreground font-semibold">3 pasos</span> y empieza a recibir reservas online.
										</p>
									</div>

									{/* Steps preview */}
									<div className="space-y-2.5">
										{[
											{ icon: LayoutGrid, label: 'Agrega tus canchas', num: 1 },
											{ icon: Clock, label: 'Configura horarios y precio', num: 2 },
											{ icon: Share2, label: 'Comparte tu link de reservas', num: 3 },
										].map(({ icon: Icon, label, num }, i) => (
											<motion.div
												key={num}
												initial={{ opacity: 0, x: -12 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ delay: 0.2 + i * 0.08, duration: 0.3 }}
												className="flex items-center gap-3.5 bg-muted/50 dark:bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 transition-colors"
											>
												<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
													<Icon size={15} className="text-primary" />
												</div>
												<span className="text-sm text-foreground/80 font-medium">{label}</span>
												<span className="ml-auto text-[10px] font-black text-muted-foreground bg-muted dark:bg-secondary px-2 py-0.5 rounded-md">
													{num}/{3}
												</span>
											</motion.div>
										))}
									</div>

									<motion.button
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: 0.5, duration: 0.3 }}
										onClick={() => setStep(2)}
										className="w-full bg-primary hover:brightness-110 active:scale-[0.98] transition-all text-primary-foreground h-12 rounded-xl flex items-center justify-center gap-2.5 font-bold text-sm shadow-md"
									>
										Comenzar <ArrowRight size={16} />
									</motion.button>
								</motion.div>
							)}

							{/* ====== STEP 2: Create Courts ====== */}
							{step === 2 && (
								<motion.div
									key="step2"
									initial={{ opacity: 0, y: 16 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -16 }}
									transition={{ duration: 0.3 }}
									className="space-y-5"
								>
									<div className="space-y-1">
										<h2 className="text-2xl font-black text-foreground tracking-tight">
											Tus canchas
										</h2>
										<p className="text-muted-foreground text-sm">
											Agrega las canchas de tu club. Minimo 1.
										</p>
									</div>

									{/* Input */}
									<div className="flex gap-2">
										<input
											type="text"
											value={courtName}
											onChange={e => setCourtName(e.target.value)}
											onKeyDown={handleKeyDown}
											placeholder="Ej. Cancha 1"
											className="flex-1 input-theme rounded-xl !py-2.5 text-sm"
											autoFocus
										/>
										<button
											onClick={addCourt}
											className="bg-primary hover:brightness-110 text-primary-foreground w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-95"
										>
											<Plus size={18} />
										</button>
									</div>

									{/* Court list */}
									<div className="space-y-1.5 min-h-[120px]">
										<div className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 text-xs font-medium text-muted-foreground">
											Todas las canchas se crean como <span className="text-foreground font-semibold">Padel</span> con turnos de <span className="text-foreground font-semibold">90 minutos</span>.
										</div>
										{courts.length === 0 ? (
											<div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
												<LayoutGrid size={28} className="mb-2 opacity-30" />
												<span className="text-sm">Sin canchas aun</span>
												<span className="text-xs text-muted-foreground/60 mt-0.5">Escribe un nombre y presiona +</span>
											</div>
										) : (
											courts.map((court, i) => (
												<motion.div
													key={`${court.name}-${i}`}
													initial={{ opacity: 0, height: 0 }}
													animate={{ opacity: 1, height: 'auto' }}
													exit={{ opacity: 0, height: 0 }}
													className="flex items-center gap-3 bg-muted/50 dark:bg-secondary/50 border border-border/50 rounded-xl px-4 py-2.5"
												>
													<div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
														<LayoutGrid size={13} className="text-primary" />
													</div>
													<div className="flex-1 min-w-0">
														<span className="text-sm text-foreground font-medium block truncate">{court.name}</span>
														<span className="text-[10px] text-muted-foreground uppercase tracking-wider">Padel · 90 min</span>
													</div>
													<button
														onClick={() => removeCourt(i)}
														className="text-muted-foreground hover:text-destructive p-1 rounded-lg hover:bg-destructive/10 transition-all shrink-0"
													>
														<Trash2 size={14} />
													</button>
												</motion.div>
											))
										)}
									</div>

									{courts.length > 0 && (
										<div className="text-xs text-muted-foreground text-center">
											{courts.length} {courts.length === 1 ? 'cancha agregada' : 'canchas agregadas'}
										</div>
									)}

									{/* Nav */}
									<div className="flex gap-2.5 pt-1">
										<button
											onClick={handleBack}
											className="border border-border hover:bg-muted text-muted-foreground h-12 px-5 rounded-xl font-semibold transition-all flex items-center gap-2 text-sm"
										>
											<ArrowLeft size={15} />
										</button>
										<button
											onClick={handleNext}
											disabled={!canAdvance()}
											className="flex-1 bg-primary hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-primary-foreground h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-sm"
										>
											Siguiente <ArrowRight size={16} />
										</button>
									</div>
								</motion.div>
							)}

							{/* ====== STEP 3: Schedule & Pricing ====== */}
							{step === 3 && (
								<motion.div
									key="step3"
									initial={{ opacity: 0, y: 16 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -16 }}
									transition={{ duration: 0.3 }}
									className="space-y-5"
								>
									<div className="space-y-1">
										<h2 className="text-2xl font-black text-foreground tracking-tight">
											Horarios y precio
										</h2>
										<p className="text-muted-foreground text-sm">
											Define cuando operas y tu tarifa base.
										</p>
									</div>

									{/* Hours */}
									<div className="grid grid-cols-2 gap-3">
										<div className="space-y-1.5">
											<label className="section-label pl-0.5">
												Apertura
											</label>
											<div className="bg-muted border border-border rounded-xl px-3 py-2.5 flex items-center gap-2 focus-within:border-primary/50 transition-colors">
												<Clock size={14} className="text-muted-foreground/50 shrink-0" />
												<input
													type="time"
													value={openTime}
													onChange={e => setOpenTime(e.target.value)}
													className="bg-transparent text-foreground outline-none w-full font-semibold text-sm"
												/>
											</div>
										</div>
										<div className="space-y-1.5">
											<label className="section-label pl-0.5">
												Cierre
											</label>
											<div className="bg-muted border border-border rounded-xl px-3 py-2.5 flex items-center gap-2 focus-within:border-primary/50 transition-colors">
												<Clock size={14} className="text-muted-foreground/50 shrink-0" />
												<input
													type="time"
													value={closeTime}
													onChange={e => setCloseTime(e.target.value)}
													className="bg-transparent text-foreground outline-none w-full font-semibold text-sm"
												/>
											</div>
										</div>
									</div>

									{/* Duration */}
									<div className="space-y-1.5">
										<label className="section-label pl-0.5">
											Duracion del turno
										</label>
										<div className="rounded-2xl border border-primary/15 bg-primary/5 px-4 py-4">
											<div className="flex items-center justify-between gap-4">
												<div>
													<p className="text-sm font-bold text-foreground">Padel estandar</p>
													<p className="text-[11px] text-muted-foreground">La agenda queda configurada en bloques fijos de 90 minutos.</p>
												</div>
												<span className="rounded-xl bg-primary/10 px-3 py-2 text-sm font-black text-primary">
													90 min
												</span>
											</div>
										</div>
									</div>

									{/* Price */}
									<div className="space-y-1.5">
										<label className="section-label pl-0.5">
											Precio por turno
										</label>
										<div className="bg-muted border border-border rounded-xl px-4 py-3 flex items-center gap-2 focus-within:border-primary/50 transition-colors">
											<span className="text-xl font-light text-muted-foreground/50">$</span>
											<input
												type="number"
												value={price}
												onChange={e => setPrice(Number(e.target.value))}
												className="bg-transparent text-2xl font-black text-foreground w-full outline-none placeholder:text-muted-foreground/30"
												placeholder="0"
											/>
										</div>
										<p className="text-[11px] text-muted-foreground/70 pl-0.5">
											Despues podes personalizar por dia, horario y cancha.
										</p>
									</div>

									{/* Nav */}
									<div className="flex gap-2.5 pt-1">
										<button
											onClick={handleBack}
											className="border border-border hover:bg-muted text-muted-foreground h-12 px-5 rounded-xl font-semibold transition-all flex items-center gap-2 text-sm"
										>
											<ArrowLeft size={15} />
										</button>
										<button
											onClick={handleNext}
											disabled={loading || !canAdvance()}
											className="flex-1 bg-primary hover:brightness-110 disabled:opacity-50 transition-all text-primary-foreground h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-sm"
										>
											{loading ? (
												<Loader2 className="animate-spin" size={18} />
											) : (
												<>
													Finalizar <Check size={16} />
												</>
											)}
										</button>
									</div>
								</motion.div>
							)}

							{/* ====== STEP 4: Done ====== */}
							{step === 4 && isCelebration && (
								<motion.div
									key="step4"
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ duration: 0.4, ease: 'easeOut' }}
									className="space-y-6"
								>
									<div className="flex flex-col items-center gap-5">
										<motion.div
											initial={{ scale: 0 }}
											animate={{ scale: 1 }}
											transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.15 }}
											className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg"
										>
											<Check size={32} className="text-primary-foreground" strokeWidth={3} />
										</motion.div>

										<div className="text-center space-y-1.5">
											<h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
												Todo listo!
											</h2>
											<p className="text-muted-foreground text-sm max-w-xs mx-auto">
												Tu club esta configurado. Comparte tu link para recibir reservas.
											</p>
										</div>
									</div>

									{/* URL */}
									<div className="bg-muted border border-border rounded-xl p-3.5 flex items-center gap-3">
										<div className="flex-1 font-mono text-sm text-foreground truncate">
											{publicUrl}
										</div>
										<button
											onClick={handleCopyLink}
											className={cn(
												'shrink-0 p-2 rounded-lg transition-all',
												linkCopied
													? 'bg-primary text-primary-foreground'
													: 'bg-secondary hover:bg-secondary/80 text-foreground'
											)}
										>
											{linkCopied ? <Check size={14} /> : <Copy size={14} />}
										</button>
									</div>

									{/* Share */}
									<div className="grid grid-cols-2 gap-2.5">
										<button
											onClick={handleCopyLink}
											className="border border-border hover:bg-muted text-foreground h-11 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all"
										>
											<Copy size={14} /> Copiar
										</button>
										<button
											onClick={handleShareWhatsApp}
											className="bg-[#25D366] hover:bg-[#20BD5A] text-white h-11 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all"
										>
											<Share2 size={14} /> WhatsApp
										</button>
									</div>

									<button
										onClick={handleGoToDashboard}
										className="w-full bg-primary hover:brightness-110 active:scale-[0.98] transition-all text-primary-foreground h-12 rounded-xl flex items-center justify-center gap-2.5 font-bold text-sm shadow-md"
									>
										Ir al Dashboard <ArrowRight size={16} />
									</button>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</div>
			</div>
		</div>
	)
}
