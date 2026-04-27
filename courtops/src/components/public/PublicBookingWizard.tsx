'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { format, addDays, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { getPublicAvailability, createPublicBooking, getPublicClient, getPublicBooking } from '@/actions/public-booking'
import { createPreference } from '@/actions/mercadopago'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { OpenMatch } from '@/actions/open-matches'
import OpenMatchesFeed from './OpenMatchesFeed'
import {
	ChevronRight,
	ArrowRight,
	Clock,
	Trophy,
	Calendar,
	Users,
	ShieldCheck,
	CreditCard,
	MessageCircle,
	Loader2,
	Check,
	Lock,
	Share2,
	CalendarPlus,
	User,
	ChevronDown,
	AlertTriangle,
	Smartphone,
	X
} from 'lucide-react'
import VenueLayout from './VenueLayout'

type Props = {
	club: {
		id: string
		name: string
		slug: string
		logoUrl?: string | null
		coverUrl?: string | null
		description?: string | null
		amenities?: string | null
		socialInstagram?: string | null
		socialFacebook?: string | null
		socialTwitter?: string | null
		socialTiktok?: string | null
		mpAlias?: string | null
		mpCvu?: string | null
		mpPublicKey?: string | null
		hasOnlinePayments?: boolean | null
		canUseOnlinePayments?: boolean | null
		bookingDeposit?: number | null
		phone?: string | null
		themeColor?: string | null
		address?: string | null
		slotDuration?: number | null
	}
	initialDateStr: string
	openMatches?: OpenMatch[]
}

function parseDateOnly(dateStr: string) {
	const [year, month, day] = dateStr.slice(0, 10).split('-').map(Number)
	return new Date(year, month - 1, day, 12, 0, 0, 0)
}

function getWhatsappNumber(phone?: string | null) {
	return phone?.replace(/\D/g, '') || ''
}

type BookingMode = 'guest' | 'premium' | null
type PublicStep = number | 'register' | 'login' | 'matchmaking'

export default function PublicBookingWizard({ club, initialDateStr, openMatches = [] }: Props) {
	const today = useMemo(() => parseDateOnly(initialDateStr), [initialDateStr])
	const defaultDuration = club.slotDuration || 90
	const canUseOnlinePayments = Boolean(club.canUseOnlinePayments || club.hasOnlinePayments)

	const [layoutTab, setLayoutTab] = useState<'booking' | 'info'>('booking')
	const [step, setStep] = useState<PublicStep>(0)
	const [mode, setMode] = useState<BookingMode>(null)
	const [selectedDate, setSelectedDate] = useState<Date>(today)
	const [slots, setSlots] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [selectedSlot, setSelectedSlot] = useState<{
		time: string
		price: number
		courtId: number
		courtName: string
		duration: number
	} | null>(null)
	const [clientData, setClientData] = useState({ name: '', lastname: '', phone: '', email: '' })
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [registerError, setRegisterError] = useState('')
	const [authError, setAuthError] = useState('')
	const [bookingError, setBookingError] = useState('')
	const [paymentError, setPaymentError] = useState('')
	const [createdBookingId, setCreatedBookingId] = useState<number | null>(null)
	const [isPaying, setIsPaying] = useState(false)
	const [createOpenMatch, setCreateOpenMatch] = useState(false)
	const [matchLevel, setMatchLevel] = useState('6ta')
	const [matchGender, setMatchGender] = useState('Masculino')
	const [copiedPaymentField, setCopiedPaymentField] = useState<string | null>(null)
	const [expandedSlot, setExpandedSlot] = useState<string | null>(null)

	const goToStep = (newStep: PublicStep) => {
		setStep(newStep)
	}

	const handleBack = () => {
		if (step === 1) goToStep(2)
		else if (step === 2) goToStep(0)
		else if (step === 'register') goToStep(2)
		else if (step === 'login') goToStep(2)
		else if (step === 'matchmaking') goToStep(0)
	}

	// Payment return handler
	const searchParams = useSearchParams()
	useEffect(() => {
		const status = searchParams.get('status')
		const externalRef = searchParams.get('external_reference')
		if (status === 'approved' && externalRef) {
			getPublicBooking(Number(externalRef), club.id)
				.then(booking => {
					if (booking && booking.court) {
						setStep(3)
						setCreatedBookingId(booking.id)
						setMode(booking.guestName ? 'guest' : 'premium')
						const date = new Date(booking.startTime)
						setSelectedDate(date)
						setSelectedSlot({
							time: format(date, 'HH:mm'),
							price: Number(booking.price),
							courtId: booking.court.id,
							courtName: booking.court.name,
							duration: Math.max(
								1,
								Math.round((new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / 60000)
							)
						})
						import('canvas-confetti').then(mod =>
							mod.default({ particleCount: 150, spread: 80, origin: { y: 0.6 } })
						)
					}
				})
				.catch(console.error)
		}
	}, [searchParams, club.id])

	useEffect(() => {
		if (step !== 0) return
		const fetchSlots = async () => {
			setLoading(true)
			setSelectedSlot(null)
			try {
				const data = await getPublicAvailability(club.id, format(selectedDate, 'yyyy-MM-dd'))
				setSlots(data)
			} catch (error) {
				console.error(error)
			} finally {
				setLoading(false)
			}
		}
		fetchSlots()
	}, [selectedDate, club.id, step])

	const days = useMemo(() => Array.from({ length: 14 }, (_, i) => addDays(today, i)), [today])
	const availabilityDurationLabel = useMemo(() => {
		const durations = Array.from(
			new Set(
				slots
					.flatMap(slot => slot.courts?.map((court: any) => Number(court.duration || defaultDuration)) || [])
					.filter(Boolean)
			)
		)

		if (durations.length === 1) return `${durations[0]} MIN`
		if (durations.length > 1) return 'VARIAS DURACIONES'
		return `${defaultDuration} MIN`
	}, [slots, defaultDuration])

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!clientData.phone.trim()) return
		setIsSubmitting(true)
		setAuthError('')
		try {
			const client = await getPublicClient(club.id, clientData.phone.trim())
			if (client) {
				const parts = client.name.split(' ')
				setClientData({
					name: parts[0],
					lastname: parts.slice(1).join(' ') || '',
					phone: client.phone,
					email: client.email || ''
				})
				setMode('premium')
				goToStep(1)
			} else {
				goToStep('register')
			}
		} catch {
			setAuthError('Error al verificar tu cuenta. Intentá de nuevo.')
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleRegisterSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!clientData.name || !clientData.lastname || !clientData.phone) return
		setIsSubmitting(true)
		setRegisterError('')
		try {
			const existing = await getPublicClient(club.id, clientData.phone)
			if (existing) {
				setRegisterError('Ya existe una cuenta con este número. Usá "Ingresar" para entrar.')
				return
			}
			setMode('premium')
			goToStep(1)
		} catch {
			setRegisterError('Error al verificar. Intentá de nuevo.')
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleBooking = async (e?: React.FormEvent) => {
		if (e) e.preventDefault()
		if (!selectedSlot) return
		setIsSubmitting(true)
		setBookingError('')

		const fullName =
			mode === 'premium'
				? `${clientData.name} ${clientData.lastname}`.trim()
				: clientData.name

		const res = await createPublicBooking({
			clubId: club.id,
			courtId: selectedSlot.courtId,
			dateStr: format(selectedDate, 'yyyy-MM-dd'),
			timeStr: selectedSlot.time,
			clientName: fullName,
			clientPhone: clientData.phone,
			email: clientData.email,
			isGuest: mode === 'guest',
			isOpenMatch: createOpenMatch,
			matchLevel: createOpenMatch ? matchLevel : undefined,
			matchGender: createOpenMatch ? matchGender : undefined,
			durationMinutes: selectedSlot.duration
		})

		if (res.success && res.bookingId) {
			setCreatedBookingId(res.bookingId)
			goToStep(3)
			import('canvas-confetti').then(mod =>
				mod.default({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
			)
		} else {
			setBookingError(res.error || 'Error al crear la reserva. Intentá de nuevo.')
		}
		setIsSubmitting(false)
	}

	const handlePayment = async () => {
		if (!createdBookingId) return
		setIsPaying(true)
		setPaymentError('')
		const res = await createPreference(createdBookingId, `/p/${club.slug}`)
		setIsPaying(false)
		if (res.success && res.init_point) {
			window.location.href = res.init_point
		} else {
			setPaymentError('No se pudo iniciar el pago. Intentá de nuevo.')
		}
	}

	const copyPaymentValue = async (label: string, value: string) => {
		try {
			await navigator.clipboard.writeText(value)
			setCopiedPaymentField(label)
			setTimeout(() => setCopiedPaymentField(null), 2000)
		} catch {
			setPaymentError('No se pudo copiar el dato de pago.')
		}
	}

	// ============================================
	// MINI BOOKING SUMMARY (reusable in auth steps)
	// ============================================
	const BookingSummaryChip = () =>
		selectedSlot ? (
			<div className="flex items-center gap-3 p-4 bg-white dark:bg-white/[0.04] border border-slate-100 dark:border-white/[0.05] rounded-2xl">
				<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
					<Trophy size={18} className="text-primary" />
				</div>
				<div className="min-w-0 flex-1">
					<p className="text-sm font-black tracking-tight text-slate-800 dark:text-white truncate">
						{selectedSlot.courtName}
					</p>
					<p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold capitalize">
						{format(selectedDate, 'EEE d MMM', { locale: es })} · {selectedSlot.time}hs ·{' '}
						{new Intl.NumberFormat('es-AR', {
							style: 'currency',
							currency: 'ARS',
							maximumFractionDigits: 0
						}).format(selectedSlot.price)}
					</p>
				</div>
				<button
					onClick={() => goToStep(0)}
					className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
				>
					<X size={13} strokeWidth={2.5} />
				</button>
			</div>
		) : null

	// ============================================
	// STEP 3 — SUCCESS
	// ============================================
	if (step === 3 && selectedSlot) {
		const isGuest = mode === 'guest'
		return (
			<div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-slate-800 dark:text-slate-100 font-sans flex flex-col overflow-x-hidden transition-colors duration-300">
				<div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
					<div className="absolute top-[-20%] left-[20%] w-[60%] h-[40%] bg-primary/8 dark:bg-primary/5 rounded-full blur-[150px]" />
				</div>
				<main className="flex-1 flex flex-col w-full max-w-md mx-auto px-5 py-6 relative z-10 items-center justify-center">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="w-full"
					>
						{/* Ticket card */}
						<div className="w-full rounded-3xl overflow-hidden shadow-2xl shadow-black/20 dark:shadow-black/50 mb-5">
							{/* Header */}
							<div className="relative p-7 pb-10 bg-gradient-to-br from-primary via-primary to-primary/90 text-white text-center overflow-hidden">
								<div className="absolute top-[-30%] right-[-20%] w-[60%] h-[120%] bg-white/[0.06] rounded-full blur-sm" />
								<div className="absolute bottom-[-20%] left-[-15%] w-[40%] h-[80%] bg-white/[0.04] rounded-full" />
								<div className="relative z-10 flex flex-col items-center">
									<motion.div
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
										className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm border border-white/30"
									>
										<Check size={26} strokeWidth={3} />
									</motion.div>
									<motion.h2
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.3 }}
										className="text-xl font-black uppercase tracking-tight mb-1"
									>
										¡Turno Reservado!
									</motion.h2>
									<p className="text-white/70 text-[10px] font-semibold uppercase tracking-[0.15em]">
										{club.name}
									</p>
								</div>
							</div>

							{/* Tear */}
							<div className="relative flex items-center justify-between -mt-4 px-0 z-20">
								<div className="w-7 h-7 rounded-full bg-gray-50 dark:bg-zinc-950 -ml-3.5" />
								<div className="flex-1 border-b-2 border-dashed border-gray-200/30 dark:border-white/[0.06] mx-1" />
								<div className="w-7 h-7 rounded-full bg-gray-50 dark:bg-zinc-950 -mr-3.5" />
							</div>

							{/* Body */}
							<div className="bg-white dark:bg-zinc-900 p-6 pt-4 space-y-4">
								<div className="flex justify-between items-start">
									<div>
										<p className="text-[8px] text-gray-400 uppercase font-semibold tracking-widest mb-1">
											Fecha
										</p>
										<p className="font-black text-base text-slate-800 dark:text-white capitalize leading-tight">
											{format(selectedDate, 'EEEE d', { locale: es })}
										</p>
									</div>
									<div className="text-right">
										<p className="text-[8px] text-gray-400 uppercase font-semibold tracking-widest mb-1">
											Hora
										</p>
										<p className="font-black text-3xl text-primary leading-none tracking-tight">
											{selectedSlot.time}
											<span className="text-xs ml-0.5 text-gray-400">HS</span>
										</p>
									</div>
								</div>

								<div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-white/[0.04] rounded-xl border border-slate-100 dark:border-white/[0.04]">
									<span className="text-[11px] font-black uppercase text-slate-700 dark:text-white tracking-wider">
										{selectedSlot.courtName}
									</span>
									<span className="text-[13px] font-black text-primary">
										{new Intl.NumberFormat('es-AR', {
											style: 'currency',
											currency: 'ARS',
											maximumFractionDigits: 0
										}).format(selectedSlot.price)}
									</span>
								</div>

								{isGuest && (
									<div className="flex items-center justify-center gap-2 py-3 bg-amber-50 dark:bg-amber-500/[0.08] rounded-xl border border-amber-200 dark:border-amber-500/10">
										<Lock size={11} className="text-amber-500" />
										<span className="text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
											Reserva Pendiente de Confirmación
										</span>
									</div>
								)}
							</div>
						</div>

						{/* Action buttons */}
						<div className="grid grid-cols-2 gap-2.5 mb-3">
							<a
								href={(() => {
									const startDate = new Date(selectedDate)
									const [hh, mm] = selectedSlot.time.split(':').map(Number)
									startDate.setHours(hh, mm, 0)
									const endDate = new Date(startDate)
									endDate.setMinutes(endDate.getMinutes() + selectedSlot.duration)
									const fmt = (d: Date) =>
										d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
									const title = encodeURIComponent('Turno en ' + club.name)
									const details = encodeURIComponent(
										'Cancha: ' +
										selectedSlot.courtName +
										'\nPrecio: $' +
										selectedSlot.price +
										'\nReserva #' +
										createdBookingId
									)
									const loc = encodeURIComponent(club.address || club.name)
									return (
										'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' +
										title +
										'&dates=' +
										fmt(startDate) +
										'/' +
										fmt(endDate) +
										'&details=' +
										details +
										'&location=' +
										loc
									)
								})()}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center justify-center gap-2 h-12 bg-white dark:bg-white/[0.04] rounded-2xl font-bold text-[10px] uppercase tracking-widest text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/[0.06] hover:border-primary/40 hover:text-primary active:scale-[0.98] transition-all"
							>
								<CalendarPlus size={14} className="text-primary" />
								Calendario
							</a>
							<button
								onClick={() => {
									const dateStr = format(selectedDate, 'EEEE d/M', { locale: es })
									const text =
										'Reservé cancha\n\nClub: ' +
										club.name +
										'\nFecha: ' +
										dateStr +
										'\nHora: ' +
										selectedSlot.time +
										'hs\nCancha: ' +
										selectedSlot.courtName +
										'\n\n¿Jugamos?'
									window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank')
								}}
								className="flex items-center justify-center gap-2 h-12 bg-[#25D366] text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-md shadow-emerald-500/20 hover:brightness-110 active:scale-[0.98] transition-all"
							>
								<Share2 size={14} />
								Compartir
							</button>
						</div>

						{/* Payment section */}
						<div className="space-y-2.5">
							{isGuest ? (
								canUseOnlinePayments ? (
									<>
										<button
											onClick={handlePayment}
											disabled={isPaying}
											className="w-full h-14 bg-[#009EE3] hover:bg-[#0088c9] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-sky-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
										>
											{isPaying ? (
												<Loader2 className="animate-spin" size={16} />
											) : (
												<>
													<CreditCard size={16} />
													Pagar seña con MercadoPago
												</>
											)}
										</button>
										{paymentError && (
											<p className="text-[11px] font-bold text-red-400 text-center flex items-center justify-center gap-1.5">
												<AlertTriangle size={12} /> {paymentError}
											</p>
										)}
									</>
								) : (
									<>
										{(club.mpAlias || club.mpCvu) && (
											<div className="space-y-2 p-4 bg-white dark:bg-white/[0.04] rounded-2xl border border-slate-100 dark:border-white/[0.04]">
												<p className="text-[8px] text-gray-400 uppercase font-semibold tracking-widest mb-2">
													Transferir seña
												</p>
												{club.mpAlias && (
													<button
														type="button"
														onClick={() => copyPaymentValue('alias', club.mpAlias!)}
														className="w-full flex items-center justify-between gap-3 rounded-xl border border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.03] px-3 py-2.5 text-left"
													>
														<span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Alias</span>
														<span className="text-sm font-black text-slate-800 dark:text-white truncate">
															{club.mpAlias}
														</span>
														<span className="text-[9px] font-black uppercase tracking-widest text-primary">
															{copiedPaymentField === 'alias' ? 'Copiado' : 'Copiar'}
														</span>
													</button>
												)}
												{club.mpCvu && (
													<button
														type="button"
														onClick={() => copyPaymentValue('cvu', club.mpCvu!)}
														className="w-full flex items-center justify-between gap-3 rounded-xl border border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.03] px-3 py-2.5 text-left"
													>
														<span className="text-[9px] font-black uppercase tracking-widest text-slate-400">CVU</span>
														<span className="text-sm font-black text-slate-800 dark:text-white truncate">
															{club.mpCvu}
														</span>
														<span className="text-[9px] font-black uppercase tracking-widest text-primary">
															{copiedPaymentField === 'cvu' ? 'Copiado' : 'Copiar'}
														</span>
													</button>
												)}
											</div>
										)}
										{getWhatsappNumber(club.phone) && (
											<a
												href={`https://wa.me/${getWhatsappNumber(club.phone)}?text=${encodeURIComponent(
													`Hola! Reservé el ${format(selectedDate, 'd/M')} a las ${selectedSlot.time}hs. Te envío el comprobante.`
												)}`}
												target="_blank"
												rel="noopener noreferrer"
												className="w-full h-12 bg-[#25D366] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-md shadow-emerald-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
											>
												<MessageCircle size={15} />
												Enviar comprobante por WhatsApp
											</a>
										)}
									</>
								)
							) : (
								<button
									onClick={() => goToStep(0)}
									className="w-full h-12 bg-white dark:bg-white/[0.04] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/[0.06] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-gray-300 active:scale-[0.98] transition-all"
								>
									Volver al Inicio
								</button>
							)}
						</div>

						<p className="text-center text-[10px] text-slate-400 mt-4 font-medium">
							Reserva #{createdBookingId} · {club.name}
						</p>
					</motion.div>
				</main>
			</div>
		)
	}

	// ============================================
	// STEPS 0, 2, register, 1, matchmaking
	// ============================================
	return (
		<VenueLayout
			club={club}
			activeTab={layoutTab}
			setActiveTab={setLayoutTab}
			onBack={step !== 0 ? handleBack : undefined}
		>
			{layoutTab === 'booking' && (
				<div>
					{/* ── STEP 0: Date & Slot Selection ── */}
					{step === 0 && (
						<div className="space-y-8">
							{/* Calendar */}
							<div className="space-y-4">
								<div className="flex items-center justify-between px-1">
									<h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em]">
										{format(selectedDate, 'MMMM yyyy', { locale: es })}
									</h3>
									<div className="flex items-center gap-1.5 px-3 py-1 bg-primary/5 rounded-full border border-primary/10">
										<div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
										<span className="text-[10px] font-black text-primary uppercase tracking-widest">
											Hoy: {format(today, 'd/M')}
										</span>
									</div>
								</div>
								<div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 snap-x">
									{days.map(date => {
										const isSelected = isSameDay(date, selectedDate)
										return (
											<button
												key={date.toString()}
												onClick={() => setSelectedDate(date)}
												className={cn(
													'flex flex-col items-center justify-center min-w-[68px] h-[90px] rounded-[1.75rem] transition-all duration-300 snap-center border-2',
													isSelected
														? 'bg-zinc-950 dark:bg-primary text-white shadow-[0_15px_30px_-10px_rgba(34,197,94,0.3)] border-transparent scale-105'
														: 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-400 dark:text-slate-500 hover:border-primary/30'
												)}
											>
												<span
													className={cn(
														'text-[9px] font-black uppercase tracking-[0.15em] mb-1 opacity-60',
														isSelected && 'text-white/70'
													)}
												>
													{format(date, 'eee', { locale: es })}
												</span>
												<span
													className={cn(
														'text-xl font-black tracking-tighter',
														isSelected ? 'text-white' : 'text-zinc-800 dark:text-zinc-200'
													)}
												>
													{format(date, 'd')}
												</span>
												{isSelected && (
													<motion.div
														layoutId="dot"
														className="w-1 h-1 bg-white rounded-full mt-1.5"
													/>
												)}
											</button>
										)
									})}
								</div>
							</div>

							{/* Slots */}
							<div className="space-y-5">
								<div className="flex items-center justify-between px-1">
									<h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
										Seleccioná un Horario
									</h3>
									<div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200/60 dark:border-white/5">
										<Clock size={10} className="text-slate-400" />
										<span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
											{availabilityDurationLabel}
										</span>
									</div>
								</div>

								<div className="grid grid-cols-1 gap-3.5">
									{loading ? (
										<div className="flex flex-col items-center justify-center py-24 gap-6">
											<div className="relative">
												<div className="w-14 h-14 rounded-full border-[3px] border-primary/10 border-t-primary animate-spin" />
												<div className="absolute inset-0 flex items-center justify-center">
													<div className="w-6 h-6 bg-primary/20 rounded-full animate-pulse" />
												</div>
											</div>
											<p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400/60 animate-pulse">
												Consultando disponibilidad
											</p>
										</div>
									) : slots.length > 0 ? (
										slots.map((slot, idx) => {
											const isExpanded = expandedSlot === slot.time
											return (
												<div key={slot.time} className="space-y-3">
													<motion.button
														initial={{ opacity: 0, x: -10 }}
														animate={{ opacity: 1, x: 0 }}
														transition={{ delay: idx * 0.04 }}
														onClick={() => setExpandedSlot(isExpanded ? null : slot.time)}
														className={cn(
															'w-full flex items-center justify-between p-5 bg-white dark:bg-zinc-900/40 border transition-all duration-500 group overflow-hidden relative',
															isExpanded
																? 'border-primary/40 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] ring-1 ring-primary/20'
																: 'border-slate-100 dark:border-white/[0.05] rounded-[1.75rem] hover:border-primary/30'
														)}
													>
														{isExpanded && (
															<div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
														)}
														<div className="flex items-center gap-5 relative z-10">
															<div
																className={cn(
																	'w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5',
																	isExpanded &&
																	'scale-110 bg-primary/10 border-primary/20 text-primary'
																)}
															>
																<Clock
																	size={22}
																	className={cn(
																		'transition-colors',
																		isExpanded ? 'text-primary' : 'text-slate-400'
																	)}
																/>
															</div>
															<div className="text-left">
																<p className="text-[22px] font-black tracking-tighter dark:text-white leading-none">
																	{slot.time}
																	<span className="text-[10px] text-zinc-500 ml-1.5 font-black uppercase">
																		hs
																	</span>
																</p>
																<div className="flex items-center gap-1.5 mt-1.5">
																	<span className="text-[9px] font-black text-primary uppercase tracking-[0.15em] bg-primary/10 px-2 py-0.5 rounded-md">
																		Desde ${slot.price}
																	</span>
																	<span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
																		{slot.courts.length} cancha{slot.courts.length !== 1 ? 's' : ''}
																	</span>
																</div>
															</div>
														</div>
														<div
															className={cn(
																'w-9 h-9 rounded-full flex items-center justify-center text-slate-300 dark:text-zinc-600 transition-all duration-500 border border-transparent',
																isExpanded &&
																'rotate-180 bg-primary/10 text-primary border-primary/20'
															)}
														>
															<ChevronDown size={18} strokeWidth={3} />
														</div>
													</motion.button>

													<AnimatePresence>
														{isExpanded && (
															<motion.div
																initial={{ height: 0, opacity: 0, y: -10 }}
																animate={{ height: 'auto', opacity: 1, y: 0 }}
																exit={{ height: 0, opacity: 0, y: -10 }}
																transition={{ duration: 0.3, ease: 'circOut' }}
																className="grid grid-cols-1 gap-2.5 pt-1.5 pb-4 px-3"
															>
																{slot.courts.map((court: any) => (
																	<motion.button
																		initial={{ opacity: 0, scale: 0.95 }}
																		animate={{ opacity: 1, scale: 1 }}
																		key={court.id}
																		onClick={() => {
																			setSelectedSlot({
																				time: slot.time,
																				courtId: court.id,
																				courtName: court.name,
																				price: court.price,
																				duration: court.duration || defaultDuration
																			})
																			setAuthError('')
																			setBookingError('')
																			setRegisterError('')
																			setClientData({ name: '', lastname: '', phone: '', email: '' })
																			setMode(null)
																			setCreateOpenMatch(false)
																			goToStep(2)
																		}}
																		className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-[1.5rem] hover:bg-zinc-950 dark:hover:bg-primary hover:text-white transition-all duration-300 group/court shadow-sm active:scale-[0.98]"
																	>
																		<div className="flex items-center gap-4">
																			<div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 shadow-sm flex items-center justify-center text-primary group-hover/court:bg-white/20 group-hover/court:text-white transition-all duration-500">
																				<Trophy size={18} strokeWidth={2.5} />
																			</div>
																			<div className="text-left">
																				<span className="text-[14px] font-black tracking-tight block leading-tight">
																					{court.name}
																				</span>
																				<span className="text-[9px] font-bold text-slate-400 group-hover/court:text-white/50 uppercase tracking-widest">
																					{court.duration || defaultDuration} MIN
																				</span>
																			</div>
																		</div>
																		<div className="text-right">
																			<p className="text-[18px] font-black tracking-tighter">
																				${court.price}
																			</p>
																			<ArrowRight
																				size={14}
																				className="ml-auto mt-1 opacity-0 group-hover/court:opacity-100 group-hover/court:translate-x-1 transition-all"
																			/>
																		</div>
																	</motion.button>
																))}
															</motion.div>
														)}
													</AnimatePresence>
												</div>
											)
										})
									) : (
										<div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-white/[0.02] border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[3rem] opacity-60">
											<div className="w-20 h-20 rounded-[2.5rem] bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-6">
												<Calendar
													size={40}
													strokeWidth={1}
													className="text-slate-300 dark:text-zinc-600"
												/>
											</div>
											<p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">
												Sin turnos disponibles
											</p>
										</div>
									)}
								</div>
							</div>

							{/* Open matches CTA */}
							{openMatches.length > 0 && (
								<motion.button
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									onClick={() => goToStep('matchmaking')}
									className="w-full relative overflow-hidden p-6 rounded-[2rem] bg-slate-900 text-white shadow-2xl shadow-slate-900/30 group"
								>
									<div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[40px] -mr-16 -mt-16 group-hover:bg-primary/30 transition-colors duration-500" />
									<div className="relative z-10 flex items-center justify-between">
										<div className="flex items-center gap-5 text-left">
											<div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-primary border border-white/10 shadow-inner">
												<Trophy size={28} />
											</div>
											<div>
												<h4 className="text-lg font-black tracking-tight leading-tight">
													Matchmaking
												</h4>
												<p className="text-xs text-white/50 font-bold uppercase tracking-widest mt-1">
													{openMatches.length} Partidos Abiertos
												</p>
											</div>
										</div>
										<div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-1 transition-transform border border-white/5">
											<ChevronRight size={20} className="text-primary" />
										</div>
									</div>
								</motion.button>
							)}
						</div>
					)}

					{/* ── STEP 2: Auth ── */}
					{step === 2 && (
						<motion.div
							initial={{ opacity: 0, y: 16 }}
							animate={{ opacity: 1, y: 0 }}
							className="space-y-6 pt-2"
						>
							<BookingSummaryChip />

							<div>
								<p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">
									Identificación
								</p>
								<h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">
									¿Tenés cuenta?
								</h2>
								<p className="text-sm text-slate-400 dark:text-slate-500 mt-1.5 font-medium leading-relaxed">
									Ingresá tu número para acceder o continuar como invitado
								</p>
							</div>

							<form onSubmit={handleLogin} className="space-y-4">
								<div className="space-y-1.5">
									<label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
										Teléfono
									</label>
									<div className="relative">
										<div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
											<Smartphone size={16} className="text-slate-400" />
										</div>
										<input
											type="tel"
											value={clientData.phone}
											onChange={e =>
												setClientData(p => ({ ...p, phone: e.target.value }))
											}
											placeholder="Ej: 11 1234-5678"
											className="w-full h-14 pl-11 pr-4 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.07] rounded-2xl text-base font-bold text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
										/>
									</div>
									{authError && (
										<p className="text-[11px] font-bold text-red-400 flex items-center gap-1.5 mt-1">
											<AlertTriangle size={12} className="shrink-0" />
											{authError}
										</p>
									)}
								</div>

								<button
									type="submit"
									disabled={!clientData.phone.trim() || isSubmitting}
									className="w-full h-14 bg-zinc-950 dark:bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-[0.1em] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
								>
									{isSubmitting ? (
										<Loader2 size={18} className="animate-spin" />
									) : (
										<>
											Buscar mi cuenta
											<ArrowRight size={16} />
										</>
									)}
								</button>
							</form>

							<div className="flex items-center gap-3">
								<div className="h-px flex-1 bg-slate-200 dark:bg-white/[0.05]" />
								<span className="text-[11px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">
									o
								</span>
								<div className="h-px flex-1 bg-slate-200 dark:bg-white/[0.05]" />
							</div>

							<button
								onClick={() => {
									setMode('guest')
									setClientData({ name: '', lastname: '', phone: '', email: '' })
									goToStep(1)
								}}
								className="w-full h-12 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-2xl font-bold text-sm text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/[0.1] active:scale-[0.98] transition-all"
							>
								Reservar sin cuenta
							</button>
						</motion.div>
					)}

					{/* ── STEP 'register': New user form ── */}
					{step === 'register' && (
						<motion.div
							initial={{ opacity: 0, y: 16 }}
							animate={{ opacity: 1, y: 0 }}
							className="space-y-6 pt-2"
						>
							<BookingSummaryChip />

							<div>
								<p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">
									Primera vez
								</p>
								<h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">
									Creá tu cuenta
								</h2>
								<p className="text-sm text-slate-400 dark:text-slate-500 mt-1.5 font-medium">
									Tus datos quedan guardados para la próxima reserva
								</p>
							</div>

							<form onSubmit={handleRegisterSubmit} className="space-y-3">
								<div className="grid grid-cols-2 gap-3">
									<div className="space-y-1.5">
										<label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
											Nombre
										</label>
										<input
											type="text"
											value={clientData.name}
											onChange={e =>
												setClientData(p => ({ ...p, name: e.target.value }))
											}
											placeholder="Franco"
											className="w-full h-12 px-4 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.07] rounded-2xl text-sm font-bold text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
										/>
									</div>
									<div className="space-y-1.5">
										<label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
											Apellido
										</label>
										<input
											type="text"
											value={clientData.lastname}
											onChange={e =>
												setClientData(p => ({ ...p, lastname: e.target.value }))
											}
											placeholder="García"
											className="w-full h-12 px-4 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.07] rounded-2xl text-sm font-bold text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
										/>
									</div>
								</div>

								<div className="space-y-1.5">
									<label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
										Teléfono
									</label>
									<input
										type="tel"
										value={clientData.phone}
										onChange={e =>
											setClientData(p => ({ ...p, phone: e.target.value }))
										}
										placeholder="11 1234-5678"
										className="w-full h-12 px-4 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.07] rounded-2xl text-sm font-bold text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
									/>
								</div>

								<div className="space-y-1.5">
									<label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
										Email{' '}
										<span className="normal-case font-medium text-slate-300 dark:text-slate-600">
											(opcional)
										</span>
									</label>
									<input
										type="email"
										value={clientData.email}
										onChange={e =>
											setClientData(p => ({ ...p, email: e.target.value }))
										}
										placeholder="tu@email.com"
										className="w-full h-12 px-4 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.07] rounded-2xl text-sm font-bold text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
									/>
								</div>

								{registerError && (
									<div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
										<AlertTriangle size={13} className="text-red-400 shrink-0" />
										<p className="text-[11px] font-bold text-red-500">{registerError}</p>
									</div>
								)}

								<button
									type="submit"
									disabled={
										!clientData.name || !clientData.lastname || !clientData.phone || isSubmitting
									}
									className="w-full h-14 bg-zinc-950 dark:bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-[0.1em] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-primary/20 mt-2"
								>
									{isSubmitting ? (
										<Loader2 size={18} className="animate-spin" />
									) : (
										<>
											Continuar
											<ArrowRight size={16} />
										</>
									)}
								</button>
							</form>
						</motion.div>
					)}

					{/* ── STEP 1: Booking Confirmation ── */}
					{step === 1 && selectedSlot && (
						<motion.div
							initial={{ opacity: 0, y: 16 }}
							animate={{ opacity: 1, y: 0 }}
							className="space-y-5 pt-2"
						>
							<div>
								<p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">
									Último paso
								</p>
								<h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">
									Confirmá tu reserva
								</h2>
							</div>

							{/* Booking summary card */}
							<div className="bg-white dark:bg-zinc-900/60 border border-slate-100 dark:border-white/[0.05] rounded-3xl overflow-hidden">
								<div className="p-5 space-y-4">
									<div className="flex items-start justify-between">
										<div>
											<p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
												Cancha
											</p>
											<p className="text-lg font-black text-slate-800 dark:text-white">
												{selectedSlot.courtName}
											</p>
										</div>
										<div className="text-right">
											<p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
												Total
											</p>
											<p className="text-3xl font-black text-primary tracking-tight leading-none">
												{new Intl.NumberFormat('es-AR', {
													style: 'currency',
													currency: 'ARS',
													maximumFractionDigits: 0
												}).format(selectedSlot.price)}
											</p>
										</div>
									</div>
									<div className="h-px bg-slate-100 dark:bg-white/[0.04]" />
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<Calendar size={13} className="text-slate-400" />
											<span className="text-sm font-bold text-slate-600 dark:text-slate-300 capitalize">
												{format(selectedDate, 'EEEE d/M', { locale: es })}
											</span>
										</div>
										<div className="flex items-center gap-2">
											<Clock size={13} className="text-slate-400" />
											<span className="text-sm font-bold text-slate-600 dark:text-slate-300">
												{selectedSlot.time}hs · {selectedSlot.duration}min
											</span>
										</div>
									</div>
								</div>
							</div>

							{/* User identity */}
							{mode === 'premium' ? (
								<div className="flex items-center gap-4 p-4 bg-primary/5 border border-primary/10 rounded-2xl">
									<div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
										<User size={20} className="text-primary" />
									</div>
									<div className="min-w-0">
										<p className="text-sm font-black text-slate-800 dark:text-white">
											{clientData.name} {clientData.lastname}
										</p>
										<p className="text-[11px] font-bold text-slate-400 truncate">
											{clientData.phone}
										</p>
									</div>
									<div className="ml-auto shrink-0">
										<div className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 rounded-full border border-primary/10">
											<Check size={10} strokeWidth={3} className="text-primary" />
											<span className="text-[9px] font-black text-primary uppercase tracking-wider">
												Cuenta
											</span>
										</div>
									</div>
								</div>
							) : (
								<div className="space-y-3">
									<p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
										Tus datos
									</p>
									<div className="space-y-3">
										<div className="space-y-1.5">
											<label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
												Nombre *
											</label>
											<input
												type="text"
												value={clientData.name}
												onChange={e =>
													setClientData(p => ({ ...p, name: e.target.value }))
												}
												placeholder="Tu nombre"
												className="w-full h-12 px-4 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.07] rounded-2xl text-sm font-bold text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
											/>
										</div>
										<div className="space-y-1.5">
											<label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
												Teléfono *
											</label>
											<input
												type="tel"
												value={clientData.phone}
												onChange={e =>
													setClientData(p => ({ ...p, phone: e.target.value }))
												}
												placeholder="11 1234-5678"
												className="w-full h-12 px-4 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.07] rounded-2xl text-sm font-bold text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
											/>
										</div>
									</div>
								</div>
							)}

							{/* Open match toggle */}
							<button
								type="button"
								onClick={() => setCreateOpenMatch(!createOpenMatch)}
								className={cn(
									'w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300',
									createOpenMatch
										? 'bg-primary/5 border-primary/20'
										: 'bg-white dark:bg-white/[0.02] border-slate-100 dark:border-white/[0.04]'
								)}
							>
								<div className="flex items-center gap-3">
									<Users
										size={18}
										className={createOpenMatch ? 'text-primary' : 'text-slate-400'}
									/>
									<div className="text-left">
										<p
											className={cn(
												'text-sm font-black',
												createOpenMatch ? 'text-primary' : 'text-slate-700 dark:text-slate-300'
											)}
										>
											Partido abierto
										</p>
										<p className="text-[10px] font-bold text-slate-400 mt-0.5">
											Otros jugadores pueden unirse
										</p>
									</div>
								</div>
								<div
									className={cn(
										'w-11 h-6 rounded-full transition-all duration-300 relative shrink-0',
										createOpenMatch ? 'bg-primary' : 'bg-slate-200 dark:bg-white/10'
									)}
								>
									<div
										className={cn(
											'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300',
											createOpenMatch ? 'left-5' : 'left-0.5'
										)}
									/>
								</div>
							</button>

							{createOpenMatch && (
								<div className="grid grid-cols-2 gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-3">
									<div className="space-y-1.5">
										<label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
											Nivel
										</label>
										<select
											value={matchLevel}
											onChange={e => setMatchLevel(e.target.value)}
											className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 outline-none focus:border-primary/50 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white"
										>
											{['1ra', '2da', '3ra', '4ta', '5ta', '6ta', '7ma', 'Principiante'].map(level => (
												<option key={level} value={level}>
													{level}
												</option>
											))}
										</select>
									</div>
									<div className="space-y-1.5">
										<label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
											Categoría
										</label>
										<select
											value={matchGender}
											onChange={e => setMatchGender(e.target.value)}
											className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 outline-none focus:border-primary/50 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white"
										>
											{['Masculino', 'Femenino', 'Mixto', 'Libre'].map(gender => (
												<option key={gender} value={gender}>
													{gender}
												</option>
											))}
										</select>
									</div>
								</div>
							)}

							{/* Error display */}
							{bookingError && (
								<div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl">
									<AlertTriangle size={14} className="text-red-400 shrink-0" />
									<p className="text-[12px] font-bold text-red-500">{bookingError}</p>
								</div>
							)}

							{/* CTA */}
							<button
								onClick={() => handleBooking()}
								disabled={
									isSubmitting ||
									mode === null ||
									(mode === 'guest' && (!clientData.name.trim() || !clientData.phone.trim()))
								}
								className="w-full h-14 bg-zinc-950 dark:bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-[0.1em] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
							>
								{isSubmitting ? (
									<>
										<Loader2 size={18} className="animate-spin" />
										Reservando...
									</>
								) : (
									<>
										<ShieldCheck size={18} />
										Confirmar Reserva
									</>
								)}
							</button>

							<p className="text-center text-[10px] text-slate-400 font-medium">
								Al confirmar aceptás los términos del club.
							</p>
						</motion.div>
					)}

					{/* ── STEP 'matchmaking' ── */}
					{step === 'matchmaking' && (
						<div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
							<OpenMatchesFeed matches={openMatches} />
						</div>
					)}
				</div>
			)}
		</VenueLayout>
	)
}
