'use client'

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTheme } from 'next-themes'
import { format, addDays, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { getPublicAvailability, createPublicBooking, getPublicClient, getPublicBooking, createPublicWaitingList } from '@/actions/public-booking'
import { trackPublicBookingEvent } from '@/actions/public-growth'
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
	X,
	Sun,
	Moon
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

function formatArs(amount: number) {
	return new Intl.NumberFormat('es-AR', {
		style: 'currency',
		currency: 'ARS',
		maximumFractionDigits: 0
	}).format(amount)
}

type BookingMode = 'guest' | 'premium' | null
type PublicStep = number | 'register' | 'login' | 'matchmaking'
type PublicAvailabilityCourt = {
	id: number
	name: string
	type: string | null
	sport: string
	duration: number
	price: number
}

type PublicAvailabilitySlot = {
	time: string
	price: number
	courts: PublicAvailabilityCourt[]
}

type SavedPublicPlayer = {
	name: string
	lastname: string
	phone: string
	email: string
}

export default function PublicBookingWizard({ club, initialDateStr, openMatches = [] }: Props) {
	const today = useMemo(() => parseDateOnly(initialDateStr), [initialDateStr])
	const { resolvedTheme, setTheme } = useTheme()
	const searchParams = useSearchParams()
	const initialSelectedDate = useMemo(() => {
		const dateParam = searchParams.get('date')
		if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) return today
		return parseDateOnly(dateParam)
	}, [searchParams, today])
	const defaultDuration = club.slotDuration || 90
	const canUseOnlinePayments = Boolean(club.canUseOnlinePayments || club.hasOnlinePayments)
	const clubWhatsappNumber = getWhatsappNumber(club.phone)
	const savedPlayerStorageKey = useMemo(() => `courtops_public_player_${club.id}`, [club.id])
	const [themeMounted, setThemeMounted] = useState(false)

	const [layoutTab, setLayoutTab] = useState<'booking' | 'info'>('booking')
	const [step, setStep] = useState<PublicStep>(0)
	const [mode, setMode] = useState<BookingMode>(null)
	const [selectedDate, setSelectedDate] = useState<Date>(initialSelectedDate)
	const [slots, setSlots] = useState<PublicAvailabilitySlot[]>([])
	const [loading, setLoading] = useState(true)
	const [selectedSlot, setSelectedSlot] = useState<{
		time: string
		price: number
		courtId: number
		courtName: string
		duration: number
	} | null>(null)
	const [clientData, setClientData] = useState({ name: '', lastname: '', phone: '', email: '' })
	const [savedPlayer, setSavedPlayer] = useState<SavedPublicPlayer | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [registerError, setRegisterError] = useState('')
	const [authError, setAuthError] = useState('')
	const [bookingError, setBookingError] = useState('')
	const [guestErrors, setGuestErrors] = useState<{ name?: string; lastname?: string; phone?: string }>({})
	const [showWaitlistForm, setShowWaitlistForm] = useState(false)
	const [waitlistData, setWaitlistData] = useState({ name: '', phone: '', notes: '' })
	const [waitlistErrors, setWaitlistErrors] = useState<{ name?: string; phone?: string }>({})
	const [waitlistError, setWaitlistError] = useState('')
	const [waitlistSuccess, setWaitlistSuccess] = useState('')
	const [isWaitlistSubmitting, setIsWaitlistSubmitting] = useState(false)

	const [paymentError, setPaymentError] = useState('')
	const [createdBookingId, setCreatedBookingId] = useState<number | null>(null)
	const [cancelToken, setCancelToken] = useState<string | null>(null)
	const [isPaying, setIsPaying] = useState(false)
	const [createOpenMatch, setCreateOpenMatch] = useState(false)
	const [matchLevel, setMatchLevel] = useState('6ta')
	const [matchGender, setMatchGender] = useState('Masculino')
	const [copiedPaymentField, setCopiedPaymentField] = useState<string | null>(null)
	const [expandedSlot, setExpandedSlot] = useState<string | null>(null)
	const trackedPageViewRef = useRef(false)
	const trackedInitialDateRef = useRef(false)

	const trackingSource = useMemo(() => ({
		source: searchParams.get('utm_source') || searchParams.get('source') || 'direct',
		medium: searchParams.get('utm_medium') || 'public_booking',
		campaign: searchParams.get('utm_campaign') || 'public_booking'
	}), [searchParams])

	const trackFunnelEvent = useCallback((
		event: 'page_view' | 'date_selected' | 'slot_selected' | 'booking_created' | 'waitlist_created',
		extra?: { dateStr?: string; timeStr?: string; courtId?: number }
	) => {
		trackPublicBookingEvent({
			clubId: club.id,
			event,
			...trackingSource,
			...extra
		}).catch(console.error)
	}, [club.id, trackingSource])

	useEffect(() => {
		setThemeMounted(true)
	}, [])

	useEffect(() => {
		if (trackedPageViewRef.current) return
		trackedPageViewRef.current = true
		trackFunnelEvent('page_view', { dateStr: format(selectedDate, 'yyyy-MM-dd') })
	}, [selectedDate, trackFunnelEvent])

	useEffect(() => {
		if (!trackedInitialDateRef.current) {
			trackedInitialDateRef.current = true
			return
		}
		trackFunnelEvent('date_selected', { dateStr: format(selectedDate, 'yyyy-MM-dd') })
	}, [selectedDate, trackFunnelEvent])

	const validatePhone = (phone: string) => {
		const digits = phone.replace(/\D/g, '')
		return digits.length >= 8 && digits.length <= 15
	}

	const validateName = (name: string) => name.trim().length >= 2

	useEffect(() => {
		try {
			const raw = localStorage.getItem(savedPlayerStorageKey)
			if (!raw) return
			const parsed = JSON.parse(raw) as Partial<SavedPublicPlayer>
			if (!parsed.name || !parsed.lastname || !parsed.phone) return
			if (!validateName(parsed.name) || !validateName(parsed.lastname) || !validatePhone(parsed.phone)) return

			const player: SavedPublicPlayer = {
				name: parsed.name,
				lastname: parsed.lastname,
				phone: parsed.phone,
				email: parsed.email || ''
			}
			setSavedPlayer(player)
			setClientData(current => current.phone ? current : player)
		} catch {
			localStorage.removeItem(savedPlayerStorageKey)
		}
	}, [savedPlayerStorageKey])

	const rememberCurrentPlayer = () => {
		const player: SavedPublicPlayer = {
			name: clientData.name.trim(),
			lastname: clientData.lastname.trim(),
			phone: clientData.phone.trim(),
			email: clientData.email.trim()
		}

		if (!validateName(player.name) || !validateName(player.lastname) || !validatePhone(player.phone)) return
		setSavedPlayer(player)
		localStorage.setItem(savedPlayerStorageKey, JSON.stringify(player))
	}

	const resetBookingDraft = () => {
		setAuthError('')
		setBookingError('')
		setRegisterError('')
		setClientData(savedPlayer || { name: '', lastname: '', phone: '', email: '' })
		setMode(null)
		setCreateOpenMatch(false)
	}

	const openWaitlistForm = () => {
		setWaitlistError('')
		setWaitlistSuccess('')
		setWaitlistErrors({})
		setShowWaitlistForm(true)
		setWaitlistData(current => ({
			name: current.name || `${clientData.name} ${clientData.lastname}`.trim(),
			phone: current.phone || clientData.phone,
			notes: current.notes
		}))
	}

	const selectCourtFromSlot = (slot: PublicAvailabilitySlot, court: PublicAvailabilityCourt) => {
		setSelectedSlot({
			time: slot.time,
			courtId: court.id,
			courtName: court.name,
			price: court.price,
			duration: court.duration || defaultDuration
		})
		trackFunnelEvent('slot_selected', {
			dateStr: format(selectedDate, 'yyyy-MM-dd'),
			timeStr: slot.time,
			courtId: court.id
		})
		resetBookingDraft()
		goToStep(2)
	}

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

	useEffect(() => {
		if (step !== 0) return
		setExpandedSlot(current => {
			if (slots.length === 0) return null
			if (current && slots.some(slot => slot.time === current && slot.courts.length > 1)) {
				return current
			}
			const firstExpandableSlot = slots.find(slot => slot.courts.length > 1)
			return firstExpandableSlot?.time ?? null
		})
	}, [slots, step])

	const days = useMemo(() => Array.from({ length: 14 }, (_, i) => addDays(today, i)), [today])
	const firstBookableSlot = useMemo(() => {
		const slot = slots.find(item => item.courts.length > 0)
		const court = slot?.courts[0]
		return slot && court ? { slot, court } : null
	}, [slots])
	const availabilityDurationLabel = useMemo(() => {
		const durations = Array.from(
			new Set(
				slots
					.flatMap(slot => slot.courts.map(court => Number(court.duration || defaultDuration)))
					.filter(Boolean)
			)
		)

		if (durations.length === 1) return `${durations[0]} MIN`
		if (durations.length > 1) return 'VARIAS DURACIONES'
		return `${defaultDuration} MIN`
	}, [slots, defaultDuration])

	const bookingStepIndex = useMemo(() => {
		if (step === 3) return 4
		if (step === 1) return 3
		if (step === 2 || step === 'register' || step === 'login') return 2
		return 1
	}, [step])

	const noAvailabilityWhatsappHref = clubWhatsappNumber
		? `https://wa.me/${clubWhatsappNumber}?text=${encodeURIComponent(
			`Hola ${club.name}. Estoy intentando reservar para el ${format(selectedDate, 'd/M', { locale: es })} y no veo horarios disponibles. ¿Me pueden avisar si se libera una cancha o sumarme a lista de espera?`
		)}`
		: null

	const customScheduleWhatsappHref = clubWhatsappNumber
		? `https://wa.me/${clubWhatsappNumber}?text=${encodeURIComponent(
			`Hola ${club.name}. Estoy viendo la reserva online para el ${format(selectedDate, 'd/M', { locale: es })} y quería consultar si tienen otro horario disponible.`
		)}`
		: null

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
		if (!validateName(clientData.name) || !validateName(clientData.lastname)) {
			setRegisterError('Nombre y apellido deben tener al menos 2 caracteres.')
			return
		}
		if (!validatePhone(clientData.phone)) {
			setRegisterError('Ingresá un teléfono válido (mínimo 8 dígitos).')
			return
		}
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

		if (mode === 'guest') {
			const errors: { name?: string; lastname?: string; phone?: string } = {}
			if (!validateName(clientData.name)) errors.name = 'Ingresá tu nombre (mínimo 2 caracteres)'
			if (!validateName(clientData.lastname)) errors.lastname = 'Ingresá tu apellido (mínimo 2 caracteres)'
			if (!validatePhone(clientData.phone)) errors.phone = 'Ingresá un teléfono válido (mínimo 8 dígitos)'
			if (Object.keys(errors).length > 0) {
				setGuestErrors(errors)
				return
			}
			setGuestErrors({})
		}

		setIsSubmitting(true)
		setBookingError('')

		const fullName =
			mode === 'premium'
				? `${clientData.name} ${clientData.lastname}`.trim()
				: `${clientData.name} ${clientData.lastname}`.trim()

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
			if (res.publicToken) setCancelToken(res.publicToken)
			rememberCurrentPlayer()
			trackFunnelEvent('booking_created', {
				dateStr: format(selectedDate, 'yyyy-MM-dd'),
				timeStr: selectedSlot.time,
				courtId: selectedSlot.courtId
			})
			goToStep(3)
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

	const handleJoinWaitlist = async (e: React.FormEvent) => {
		e.preventDefault()

		const errors: { name?: string; phone?: string } = {}
		if (!validateName(waitlistData.name)) {
			errors.name = 'IngresÃ¡ tu nombre completo'
		}
		if (!validatePhone(waitlistData.phone)) {
			errors.phone = 'IngresÃ¡ un telÃ©fono vÃ¡lido'
		}
		if (Object.keys(errors).length > 0) {
			setWaitlistErrors(errors)
			return
		}

		setWaitlistErrors({})
		setWaitlistError('')
		setWaitlistSuccess('')
		setIsWaitlistSubmitting(true)

		const result = await createPublicWaitingList({
			clubId: club.id,
			dateStr: format(selectedDate, 'yyyy-MM-dd'),
			clientName: waitlistData.name,
			clientPhone: waitlistData.phone,
			notes: waitlistData.notes
		})

		setIsWaitlistSubmitting(false)

		if (result.success) {
			trackFunnelEvent('waitlist_created', {
				dateStr: format(selectedDate, 'yyyy-MM-dd')
			})
			setWaitlistSuccess('Listo. Te anotamos en la lista de espera y el club puede contactarte si se libera un horario.')
			setShowWaitlistForm(false)
			return
		}

		setWaitlistError(result.error || 'No se pudo guardar tu solicitud.')
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
						{formatArs(selectedSlot.price)}
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
	const StickyActionBar = ({
		children,
		tone = 'default'
	}: {
		children: React.ReactNode
		tone?: 'default' | 'subtle'
	}) => (
		<div className="sticky bottom-0 z-20 -mx-1 pt-4">
			<div
				className={cn(
					'rounded-[1.75rem] border px-3 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl',
					tone === 'default'
						? 'border-slate-200/80 bg-white/95 dark:border-white/[0.08] dark:bg-zinc-950/92'
						: 'border-slate-200/70 bg-slate-50/95 dark:border-white/[0.06] dark:bg-zinc-900/92'
				)}
			>
				{children}
			</div>
		</div>
	)

	const BookingProgress = () => {
		const steps = [
			{ label: 'Horario', icon: Calendar },
			{ label: 'Datos', icon: Smartphone },
			{ label: 'Confirmar', icon: ShieldCheck }
		]

		return (
			<div className="mb-6 rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-3 shadow-sm dark:border-white/[0.06] dark:bg-white/[0.03]">
				<div className="flex items-center justify-between gap-2">
					{steps.map((item, index) => {
						const position = index + 1
						const isCurrent = bookingStepIndex === position
						const isComplete = bookingStepIndex > position
						const Icon = item.icon

						return (
							<div key={item.label} className="flex flex-1 items-center">
								<div className="flex flex-1 flex-col items-center gap-1.5">
									<div
										className={cn(
											'flex h-9 w-9 items-center justify-center rounded-2xl border transition-all',
											isComplete
												? 'border-primary bg-primary text-primary-foreground'
												: isCurrent
													? 'border-primary/30 bg-primary/10 text-primary'
													: 'border-slate-200 bg-slate-50 text-slate-400 dark:border-white/[0.06] dark:bg-white/[0.04] dark:text-slate-500'
										)}
									>
										{isComplete ? <Check size={15} strokeWidth={3} /> : <Icon size={15} strokeWidth={2.5} />}
									</div>
									<span
										className={cn(
											'text-[9px] font-black uppercase tracking-[0.12em]',
											isCurrent || isComplete ? 'text-slate-800 dark:text-white' : 'text-slate-400'
										)}
									>
										{item.label}
									</span>
								</div>
								{index < steps.length - 1 && (
									<div
										className={cn(
											'mx-1 h-px w-full max-w-8',
											bookingStepIndex > position ? 'bg-primary' : 'bg-slate-200 dark:bg-white/[0.07]'
										)}
									/>
								)}
							</div>
						)
					})}
				</div>
			</div>
		)
	}

	if (step === 3 && selectedSlot) {
		const isGuest = mode === 'guest'
		const playerName = `${clientData.name} ${clientData.lastname}`.trim()

		const calendarHref = (() => {
			const startDate = new Date(selectedDate)
			const [hh, mm] = selectedSlot.time.split(':').map(Number)
			startDate.setHours(hh, mm, 0)
			const endDate = new Date(startDate)
			endDate.setMinutes(endDate.getMinutes() + selectedSlot.duration)
			const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
			const title = encodeURIComponent('Turno en ' + club.name)
			const details = encodeURIComponent(
				'Cancha: ' + selectedSlot.courtName + '\nPrecio: $' + selectedSlot.price + '\nReserva #' + createdBookingId
			)
			const loc = encodeURIComponent(club.address || club.name)
			return (
				'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' +
				title + '&dates=' + fmt(startDate) + '/' + fmt(endDate) +
				'&details=' + details + '&location=' + loc
			)
		})()

		const repeatDate = addDays(selectedDate, 7)
		const repeatDateLabel = format(repeatDate, 'EEEE d/M', { locale: es })
		const buildPlayerShareUrl = () => {
			const origin = typeof window !== 'undefined' ? window.location.origin : ''
			const url = new URL(`/p/${club.slug}`, origin || 'https://courtops.app')
			url.searchParams.set('utm_source', 'player_share')
			url.searchParams.set('utm_medium', 'whatsapp')
			url.searchParams.set('utm_campaign', 'post_booking')
			url.searchParams.set('date', format(selectedDate, 'yyyy-MM-dd'))
			return url.toString()
		}

		const handleShare = () => {
			const dateStr = format(selectedDate, 'EEEE d/M', { locale: es })
			const bookingUrl = buildPlayerShareUrl()
			const text =
				'Reservé cancha\n\nClub: ' + club.name +
				'\nFecha: ' + dateStr +
				'\nHora: ' + selectedSlot.time + 'hs' +
				'\nCancha: ' + selectedSlot.courtName +
				'\n\nSumate o reservá tu turno acá:\n' + bookingUrl +
				'\n\n¿Jugamos?'
			window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank')
		}

		const handleRepeatNextWeek = () => {
			setSelectedDate(repeatDate)
			setSelectedSlot(null)
			setCreatedBookingId(null)
			setCancelToken(null)
			setPaymentError('')
			setBookingError('')
			setCopiedPaymentField(null)
			setCreateOpenMatch(false)
			setLayoutTab('booking')
			goToStep(0)
			setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0)
		}

		const handleBookAnother = () => {
			setSelectedSlot(null)
			setCreatedBookingId(null)
			setCancelToken(null)
			setPaymentError('')
			setBookingError('')
			setCopiedPaymentField(null)
			setCreateOpenMatch(false)
			setLayoutTab('booking')
			goToStep(0)
			setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0)
		}

		return (
			<div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col overflow-x-hidden transition-colors duration-300">
				{/* Theme toggle — top right */}
				<div className="fixed top-4 right-4 z-50">
					<button
						onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
						className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 shadow-sm transition-all"
						aria-label="Cambiar tema"
					>
						{themeMounted ? (
							resolvedTheme === 'dark' ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />
						) : (
							<div className="h-4 w-4" aria-hidden="true" />
						)}
					</button>
				</div>
				{/* Animated background blobs */}
				<div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
					<div
						className="absolute top-[5%] left-[5%] w-[55%] h-[45%] bg-primary/[0.06] dark:bg-primary/[0.07] rounded-full blur-[130px] animate-pulse"
						style={{ animationDuration: '5s' }}
					/>
					<div
						className="absolute bottom-[10%] right-[0%] w-[45%] h-[40%] bg-primary/[0.04] dark:bg-primary/[0.05] rounded-full blur-[100px] animate-pulse"
						style={{ animationDuration: '7s', animationDelay: '2s' }}
					/>
				</div>

				<main className="flex-1 flex flex-col w-full max-w-md mx-auto px-4 py-8 relative z-10 items-center justify-center">
					<motion.div
						initial={{ opacity: 0, y: 24 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4, ease: 'easeOut' }}
						className="w-full space-y-3"
					>
						{/* ── Ticket ── */}
						<div className="w-full rounded-3xl overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/60">

							{/* Header */}
							<div className="relative px-7 pt-7 pb-11 bg-gradient-to-br from-[#1aff6e] via-primary to-[#00b844] text-white text-center overflow-hidden">
								{/* Decorative dots */}
								<div className="absolute top-4 left-7 w-1.5 h-1.5 bg-white/50 rounded-full" />
								<div className="absolute top-7 left-14 w-1 h-1 bg-white/25 rounded-full" />
								<div className="absolute top-4 right-7 w-1.5 h-1.5 bg-white/50 rounded-full" />
								<div className="absolute top-7 right-14 w-1 h-1 bg-white/25 rounded-full" />
								<div className="absolute bottom-7 left-10 w-1 h-1 bg-white/30 rounded-full" />
								<div className="absolute bottom-5 right-10 w-1.5 h-1.5 bg-white/20 rounded-full" />
								{/* Glow orbs */}
								<div className="absolute -top-8 -right-8 w-40 h-40 bg-white/[0.07] rounded-full blur-xl" />
								<div className="absolute -bottom-10 -left-8 w-36 h-36 bg-black/[0.08] rounded-full" />

								<div className="relative z-10 flex flex-col items-center">
									{/* Animated check with pulse rings */}
									<motion.div
										initial={{ scale: 0, rotate: -90 }}
										animate={{ scale: 1, rotate: 0 }}
										transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.15 }}
										className="relative mb-4"
									>
										<div className="w-16 h-16 bg-white/25 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/40 shadow-xl shadow-black/20">
											<Check size={30} strokeWidth={3} className="drop-shadow" />
										</div>
										<motion.div
											initial={{ scale: 1, opacity: 0.7 }}
											animate={{ scale: 2, opacity: 0 }}
											transition={{ duration: 1.1, delay: 0.5, ease: 'easeOut' }}
											className="absolute inset-0 rounded-full border-2 border-white/60"
										/>
										<motion.div
											initial={{ scale: 1, opacity: 0.4 }}
											animate={{ scale: 2.8, opacity: 0 }}
											transition={{ duration: 1.5, delay: 0.65, ease: 'easeOut' }}
											className="absolute inset-0 rounded-full border border-white/40"
										/>
									</motion.div>

									<motion.h2
										initial={{ opacity: 0, y: 8 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.3 }}
										className="text-2xl font-black uppercase tracking-tight drop-shadow-sm"
									>
										¡Turno Reservado!
									</motion.h2>
									<motion.p
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: 0.42 }}
										className="text-white/65 text-[11px] font-bold uppercase tracking-[0.2em] mt-1.5"
									>
										{club.name}
									</motion.p>
								</div>
							</div>

							{/* Tear line — color matches page bg */}
							<div className="relative flex items-center justify-between -mt-4 z-20 bg-transparent">
								<div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-zinc-950 -ml-4 shrink-0" />
								<div className="flex-1 border-b-2 border-dashed border-slate-300 dark:border-zinc-700/70 mx-0.5" />
								<div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-zinc-950 -mr-4 shrink-0" />
							</div>

							{/* Ticket body */}
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.28 }}
								className="bg-white dark:bg-zinc-900 px-6 pb-6 pt-2 space-y-4"
							>
								{/* Date + Time */}
								<div className="flex justify-between items-end pt-1">
									<div>
										<p className="text-[9px] text-slate-400 dark:text-zinc-500 uppercase font-bold tracking-[0.2em] mb-1.5">
											Fecha
										</p>
										<p className="font-black text-lg text-slate-800 dark:text-white capitalize leading-none">
											{format(selectedDate, 'EEEE d', { locale: es })}
										</p>
										<p className="text-[11px] text-slate-400 dark:text-zinc-500 font-semibold capitalize mt-0.5">
											{format(selectedDate, 'MMMM yyyy', { locale: es })}
										</p>
									</div>
									<div className="text-right">
										<p className="text-[9px] text-slate-400 dark:text-zinc-500 uppercase font-bold tracking-[0.2em] mb-1.5">
											Hora
										</p>
										<p className="font-black text-[2.6rem] text-primary leading-none tracking-tighter">
											{selectedSlot.time}
											<span className="text-sm ml-1 text-slate-400 dark:text-zinc-500 font-black">HS</span>
										</p>
										<p className="text-[11px] text-slate-400 dark:text-zinc-600 font-semibold mt-0.5">
											{selectedSlot.duration} min
										</p>
									</div>
								</div>

								{/* Divider */}
								<div className="h-px bg-slate-100 dark:bg-zinc-800" />

								{/* Court + Price */}
								<div className="flex items-center justify-between px-4 py-3.5 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-200 dark:border-zinc-700/40">
									<div className="flex items-center gap-2.5">
										<div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
											<Trophy size={15} className="text-primary" />
										</div>
										<span className="text-sm font-black uppercase text-slate-700 dark:text-white tracking-wider">
											{selectedSlot.courtName}
										</span>
									</div>
									<span className="text-base font-black text-primary tabular-nums">
										{formatArs(selectedSlot.price)}
									</span>
								</div>

								{/* Player name row */}
								{playerName.length > 1 && (
									<div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 dark:bg-zinc-800/30 rounded-2xl border border-slate-200 dark:border-zinc-700/30">
										<div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-zinc-700/80 flex items-center justify-center shrink-0">
											<User size={13} className="text-slate-500 dark:text-zinc-400" />
										</div>
										<span className="text-sm font-bold text-slate-600 dark:text-zinc-300 flex-1 truncate">
											{playerName}
										</span>
										{mode === 'premium' && (
											<div className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 rounded-full border border-primary/20 shrink-0">
												<Check size={9} strokeWidth={3} className="text-primary" />
												<span className="text-[9px] font-black text-primary uppercase tracking-wider">
													Cuenta
												</span>
											</div>
										)}
									</div>
								)}

								{/* Guest pending badge */}
								{isGuest && (
									<div className="flex items-center justify-center gap-2 py-2.5 bg-amber-50 dark:bg-amber-500/[0.08] rounded-xl border border-amber-200 dark:border-amber-500/20">
										<Lock size={11} className="text-amber-500 dark:text-amber-400" />
										<span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
											Pendiente de Confirmación
										</span>
									</div>
								)}

								{/* Booking ref */}
								<div className="flex items-center justify-center pt-1">
									<span className="text-[10px] font-bold text-slate-400 dark:text-zinc-700 tracking-[0.15em] uppercase">
										# {createdBookingId} · {club.name}
									</span>
								</div>
							</motion.div>
						</div>

						{/* ── Action buttons ── */}
						<motion.div
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.42 }}
							className="grid grid-cols-2 gap-2.5"
						>
							<a
								href={calendarHref}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center justify-center gap-2 h-12 bg-white dark:bg-zinc-900 rounded-2xl font-bold text-[10px] uppercase tracking-widest text-slate-500 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 hover:border-primary/40 hover:text-primary active:scale-[0.98] transition-all cursor-pointer"
							>
								<CalendarPlus size={14} className="text-primary shrink-0" />
								Calendario
							</a>
							<button
								onClick={handleShare}
								className="flex items-center justify-center gap-2 h-12 bg-[#25D366] text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-[#25D366]/20 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
							>
								<Share2 size={14} />
								Compartir
							</button>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.48 }}
							className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
						>
							<div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-primary/10 blur-2xl" />
							<div className="relative z-10 space-y-3">
								<div>
									<p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
										Próxima jugada
									</p>
									<h3 className="mt-1 text-lg font-black tracking-tight text-slate-800 dark:text-white">
										Hacé que vuelvan sin pensar
									</h3>
									<p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500 dark:text-zinc-400">
										Repetí el turno para el {repeatDateLabel} o abrí una nueva reserva en segundos.
									</p>
								</div>
								<div className="grid grid-cols-2 gap-2.5">
									<button
										type="button"
										onClick={handleRepeatNextWeek}
										className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-3 text-[10px] font-black uppercase tracking-[0.12em] text-white transition-all active:scale-[0.98] dark:bg-primary dark:text-primary-foreground"
									>
										<CalendarPlus size={14} />
										Repetir
									</button>
									<button
										type="button"
										onClick={openMatches.length > 0 ? () => goToStep('matchmaking') : handleBookAnother}
										className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-[10px] font-black uppercase tracking-[0.12em] text-slate-600 transition-all active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-800/70 dark:text-zinc-200"
									>
										{openMatches.length > 0 ? <Trophy size={14} /> : <ArrowRight size={14} />}
										{openMatches.length > 0 ? 'Partidos' : 'Otro turno'}
									</button>
								</div>
							</div>
						</motion.div>

						{/* ── Payment / Back section ── */}
						<motion.div
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.52 }}
							className="space-y-2.5"
						>
							{isGuest ? (
								canUseOnlinePayments ? (
									<>
										<button
											onClick={handlePayment}
											disabled={isPaying}
											className="w-full h-14 bg-[#009EE3] hover:bg-[#0088c9] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-sky-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
											<div className="space-y-2 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
												<p className="text-[9px] text-slate-400 dark:text-zinc-500 uppercase font-bold tracking-[0.2em] mb-2">
													Transferir seña
												</p>
												{club.mpAlias && (
													<button
														type="button"
														onClick={() => copyPaymentValue('alias', club.mpAlias!)}
														className="w-full flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-zinc-700/60 bg-slate-50 dark:bg-zinc-800/50 px-3 py-2.5 text-left cursor-pointer hover:border-primary/30 transition-colors"
													>
														<span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">
															Alias
														</span>
														<span className="text-sm font-black text-slate-800 dark:text-white truncate flex-1 text-center">
															{club.mpAlias}
														</span>
														<span className="text-[9px] font-black uppercase tracking-widest text-primary shrink-0">
															{copiedPaymentField === 'alias' ? 'Copiado ✓' : 'Copiar'}
														</span>
													</button>
												)}
												{club.mpCvu && (
													<button
														type="button"
														onClick={() => copyPaymentValue('cvu', club.mpCvu!)}
														className="w-full flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-zinc-700/60 bg-slate-50 dark:bg-zinc-800/50 px-3 py-2.5 text-left cursor-pointer hover:border-primary/30 transition-colors"
													>
														<span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">
															CVU
														</span>
														<span className="text-sm font-black text-slate-800 dark:text-white truncate flex-1 text-center">
															{club.mpCvu}
														</span>
														<span className="text-[9px] font-black uppercase tracking-widest text-primary shrink-0">
															{copiedPaymentField === 'cvu' ? 'Copiado ✓' : 'Copiar'}
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
												className="w-full h-12 bg-[#25D366] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#25D366]/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
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
									className="w-full py-3.5 bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-slate-300 dark:hover:border-zinc-600 hover:text-slate-700 dark:hover:text-zinc-200 active:scale-[0.98] transition-all cursor-pointer"
								>
									Volver al Inicio
								</button>
							)}
						</motion.div>

						{/* ── Cancel link ── */}
						{cancelToken && (
							<motion.p
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.7 }}
								className="text-center text-[10px] text-slate-400 dark:text-zinc-600 pb-2"
							>
								¿Necesitás cancelar?{' '}
								<a
									href={`/cancelar/${cancelToken}`}
									className="text-primary font-bold underline underline-offset-2"
								>
									Cancelar esta reserva
								</a>
							</motion.p>
						)}
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
					{step !== 'matchmaking' && <BookingProgress />}
					{/* ── STEP 0: Date & Slot Selection ── */}
					{step === 0 && (
						<div className="space-y-8">
							<div className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-slate-950 p-5 text-white shadow-[0_22px_50px_rgba(15,23,42,0.22)] dark:border-white/[0.08]">
								<div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/30 blur-3xl" />
								<div className="absolute -bottom-14 left-6 h-28 w-28 rounded-full bg-white/10 blur-3xl" />
								<div className="relative z-10 space-y-4">
									<div className="flex items-start justify-between gap-4">
										<div>
											<p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">
												Reserva express
											</p>
											<h2 className="mt-1 text-2xl font-black tracking-tight">
												{loading
													? 'Buscando el mejor turno'
													: firstBookableSlot
														? `${slots.length} horarios disponibles`
														: 'Sin turnos online por ahora'}
											</h2>
											<p className="mt-2 max-w-[18rem] text-sm font-semibold leading-relaxed text-white/60">
												{firstBookableSlot
													? `Primer turno: ${firstBookableSlot.slot.time} hs en ${firstBookableSlot.court.name}.`
													: 'Elegí otro día o dejá tus datos para que el club te avise si se libera una cancha.'}
											</p>
										</div>
										<div className="rounded-2xl bg-white/10 px-3 py-2 text-right backdrop-blur">
											<p className="text-[9px] font-black uppercase tracking-widest text-white/40">
												Día
											</p>
											<p className="text-lg font-black capitalize leading-none">
												{format(selectedDate, 'd MMM', { locale: es })}
											</p>
										</div>
									</div>

									{loading ? (
										<button
											type="button"
											disabled
											className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white/10 text-[11px] font-black uppercase tracking-[0.16em] text-white/60"
										>
											<Loader2 size={15} className="animate-spin" />
											Consultando disponibilidad
										</button>
									) : firstBookableSlot ? (
										<button
											type="button"
											onClick={() => selectCourtFromSlot(firstBookableSlot.slot, firstBookableSlot.court)}
											className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-[11px] font-black uppercase tracking-[0.16em] text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
										>
											Reservar {firstBookableSlot.slot.time} hs
											<ArrowRight size={15} strokeWidth={3} />
										</button>
									) : (
										<button
											type="button"
											onClick={openWaitlistForm}
											className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white text-[11px] font-black uppercase tracking-[0.16em] text-slate-950 transition-all active:scale-[0.98]"
										>
											Sumarme a lista de espera
											<ChevronRight size={15} strokeWidth={3} />
										</button>
									)}
								</div>
							</div>
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
								<div className="flex gap-3 overflow-x-auto py-2 no-scrollbar -mx-4 px-4 snap-x">
									{days.map(date => {
										const isSelected = isSameDay(date, selectedDate)
										return (
											<button
												key={date.toString()}
												onClick={() => setSelectedDate(date)}
												className={cn(
													'flex flex-col items-center justify-center min-w-[68px] h-[90px] rounded-[1.75rem] transition-all duration-300 snap-center border-2',
													isSelected
														? 'bg-zinc-950 dark:bg-primary text-white shadow-md border-transparent scale-105'
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
										Elegí tu horario
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
											const hasSingleCourt = slot.courts.length === 1
											return (
												<div key={slot.time} className="space-y-3">
													<motion.button
														initial={{ opacity: 0, x: -10 }}
														animate={{ opacity: 1, x: 0 }}
														transition={{ delay: idx * 0.04 }}
														onClick={() => {
															if (hasSingleCourt) {
																selectCourtFromSlot(slot, slot.courts[0])
																return
															}
															setExpandedSlot(isExpanded ? null : slot.time)
														}}
														className={cn(
															'w-full flex items-center justify-between p-5 bg-white dark:bg-zinc-900/40 border transition-all duration-500 group overflow-hidden relative',
															isExpanded
																? 'border-primary/40 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] ring-1 ring-primary/20'
																: 'border-slate-100 dark:border-white/[0.05] rounded-[1.75rem] hover:border-primary/30'
														)}
													>
														{isExpanded && !hasSingleCourt && (
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
																		{hasSingleCourt ? formatArs(slot.courts[0].price) : `Desde $${slot.price}`}
																	</span>
																	<span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
																		{hasSingleCourt ? `${slot.courts[0].name} listo para reservar` : `${slot.courts.length} cancha${slot.courts.length !== 1 ? 's' : ''}`}
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
															{hasSingleCourt ? <ArrowRight size={18} strokeWidth={3} /> : <ChevronDown size={18} strokeWidth={3} />}
														</div>
													</motion.button>

													<AnimatePresence>
														{isExpanded && !hasSingleCourt && (
															<motion.div
																initial={{ height: 0, opacity: 0, y: -10 }}
																animate={{ height: 'auto', opacity: 1, y: 0 }}
																exit={{ height: 0, opacity: 0, y: -10 }}
																transition={{ duration: 0.3, ease: 'circOut' }}
																className="grid grid-cols-1 gap-2.5 pt-1.5 pb-4 px-3"
															>
																{slot.courts.map(court => (
																	<motion.button
																		initial={{ opacity: 0, scale: 0.95 }}
																		animate={{ opacity: 1, scale: 1 }}
																		key={court.id}
																		onClick={() => selectCourtFromSlot(slot, court)}
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
																				{formatArs(court.price)}
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
										<div className="flex flex-col items-center justify-center py-12 px-6 bg-white dark:bg-white/[0.02] border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[3rem]">
											<div className="w-20 h-20 rounded-[2.5rem] bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-6">
												<Calendar
													size={40}
													strokeWidth={1}
													className="text-slate-300 dark:text-zinc-600"
												/>
											</div>
											<p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 text-center">
												No hay horarios online para esta fecha
											</p>
											<p className="mt-3 max-w-[280px] text-center text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
												Probá con otro día, dejá tus datos en lista de espera o consultá por WhatsApp si buscás una franja puntual.
											</p>
											<div className="mt-6 flex w-full flex-col gap-3">
												<button
													type="button"
													onClick={openWaitlistForm}
													className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-[11px] font-black uppercase tracking-[0.15em] text-white shadow-lg transition-all active:scale-[0.98] dark:bg-primary dark:text-primary-foreground"
												>
													Sumarme a lista de espera
													<ChevronRight size={15} />
												</button>
												{noAvailabilityWhatsappHref && (
													<a
														href={noAvailabilityWhatsappHref}
														target="_blank"
														rel="noopener noreferrer"
														className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 text-[11px] font-black uppercase tracking-[0.15em] text-white shadow-lg shadow-[#25D366]/20 transition-all active:scale-[0.98]"
													>
														<MessageCircle size={15} />
														Consultar por WhatsApp
													</a>
												)}
												<button
													type="button"
													onClick={() => setLayoutTab('info')}
													className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-[11px] font-black uppercase tracking-[0.15em] text-slate-600 transition-all active:scale-[0.98] dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-slate-300"
												>
													Ver datos del club
													<ChevronRight size={15} />
												</button>
											</div>
										</div>
									)}
								</div>
							</div>

							{slots.length > 0 && customScheduleWhatsappHref && (
								<div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-white/[0.06] dark:bg-white/[0.03]">
									<div className="flex items-start gap-3">
										<div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
											<MessageCircle size={18} />
										</div>
										<div className="min-w-0 flex-1">
											<p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
												¿No ves el horario que buscás?
											</p>
											<p className="mt-1 text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
												Podés dejar tus datos en lista de espera o escribirle al club para consultar una franja especial.
											</p>
											<div className="mt-4 flex flex-col gap-2 sm:flex-row">
												<button
													type="button"
													onClick={openWaitlistForm}
													className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-[11px] font-black uppercase tracking-[0.15em] text-white transition-all active:scale-[0.98] dark:bg-primary dark:text-primary-foreground"
												>
													Sumarme a lista de espera
													<ChevronRight size={14} />
												</button>
												<a
													href={customScheduleWhatsappHref}
													target="_blank"
													rel="noopener noreferrer"
													className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 text-[11px] font-black uppercase tracking-[0.15em] text-slate-600 transition-all active:scale-[0.98] dark:border-white/[0.06] dark:text-slate-300"
												>
													Consultar por WhatsApp
												</a>
											</div>
										</div>
									</div>
								</div>
							)}

							{waitlistSuccess && (
								<div className="rounded-[2rem] border border-primary/20 bg-primary/5 p-4">
									<p className="text-sm font-bold leading-relaxed text-primary">
										{waitlistSuccess}
									</p>
								</div>
							)}

							{showWaitlistForm && (
								<motion.form
									initial={{ opacity: 0, y: 12 }}
									animate={{ opacity: 1, y: 0 }}
									onSubmit={handleJoinWaitlist}
									className="space-y-4 rounded-[2rem] border border-slate-200/80 bg-white/95 p-5 shadow-sm dark:border-white/[0.06] dark:bg-white/[0.03]"
								>
									<div className="flex items-start justify-between gap-3">
										<div>
											<p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
												Lista de espera
											</p>
											<h4 className="mt-1 text-lg font-black tracking-tight text-slate-800 dark:text-white">
												Si se libera un turno, el club te puede avisar
											</h4>
											<p className="mt-1 text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
												Fecha: {format(selectedDate, 'EEEE d MMMM', { locale: es })}
											</p>
										</div>
										<button
											type="button"
											onClick={() => setShowWaitlistForm(false)}
											className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-all active:scale-95 dark:bg-white/[0.05] dark:text-slate-300"
										>
											<X size={16} />
										</button>
									</div>

									<div className="space-y-1.5">
										<label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
											Nombre
										</label>
										<input
											type="text"
											value={waitlistData.name}
											onChange={e => {
												setWaitlistData(current => ({ ...current, name: e.target.value }))
												setWaitlistErrors(current => ({ ...current, name: undefined }))
											}}
											placeholder="Tu nombre"
											className={cn(
												'w-full h-12 rounded-2xl border bg-white px-4 text-sm font-bold text-slate-800 outline-none transition-all dark:bg-white/[0.04] dark:text-white',
												waitlistErrors.name ? 'border-red-400' : 'border-slate-200 focus:border-primary/50 dark:border-white/[0.07]'
											)}
										/>
										{waitlistErrors.name && (
											<p className="text-[10px] font-bold text-red-400">{waitlistErrors.name}</p>
										)}
									</div>

									<div className="space-y-1.5">
										<label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
											TelÃ©fono
										</label>
										<input
											type="tel"
											value={waitlistData.phone}
											onChange={e => {
												setWaitlistData(current => ({ ...current, phone: e.target.value }))
												setWaitlistErrors(current => ({ ...current, phone: undefined }))
											}}
											placeholder="11 1234-5678"
											className={cn(
												'w-full h-12 rounded-2xl border bg-white px-4 text-sm font-bold text-slate-800 outline-none transition-all dark:bg-white/[0.04] dark:text-white',
												waitlistErrors.phone ? 'border-red-400' : 'border-slate-200 focus:border-primary/50 dark:border-white/[0.07]'
											)}
										/>
										{waitlistErrors.phone && (
											<p className="text-[10px] font-bold text-red-400">{waitlistErrors.phone}</p>
										)}
									</div>

									<div className="space-y-1.5">
										<label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
											Comentario
											<span className="ml-1 normal-case font-medium text-slate-300 dark:text-slate-500">(opcional)</span>
										</label>
										<textarea
											value={waitlistData.notes}
											onChange={e => setWaitlistData(current => ({ ...current, notes: e.target.value }))}
											placeholder="Ej: desde las 19 hs, cualquier cancha"
											rows={3}
											className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all focus:border-primary/50 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-slate-200"
										/>
									</div>

									{waitlistError && (
										<div className="rounded-2xl border border-red-200 bg-red-50 p-3 dark:border-red-500/20 dark:bg-red-500/10">
											<p className="text-[11px] font-bold text-red-500">{waitlistError}</p>
										</div>
									)}

									<StickyActionBar tone="subtle">
										<button
											type="submit"
											disabled={isWaitlistSubmitting}
											className="w-full h-12 rounded-2xl bg-slate-950 text-[11px] font-black uppercase tracking-[0.15em] text-white transition-all active:scale-[0.98] disabled:opacity-50 dark:bg-primary dark:text-primary-foreground"
										>
											{isWaitlistSubmitting ? 'Guardando...' : 'Unirme a la lista de espera'}
										</button>
									</StickyActionBar>
								</motion.form>
							)}

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

							{savedPlayer && (
								<button
									type="button"
									onClick={() => {
										setClientData(savedPlayer)
										setMode('guest')
										setGuestErrors({})
										goToStep(1)
									}}
									className="group relative overflow-hidden rounded-[2rem] border border-primary/20 bg-primary/10 p-4 text-left transition-all active:scale-[0.98]"
								>
									<div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
									<div className="relative z-10 flex items-center gap-4">
										<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
											<User size={20} />
										</div>
										<div className="min-w-0 flex-1">
											<p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
												Ya te conocemos
											</p>
											<p className="mt-1 truncate text-base font-black text-slate-800 dark:text-white">
												Reservar como {savedPlayer.name}
											</p>
											<p className="mt-0.5 truncate text-xs font-semibold text-slate-500 dark:text-slate-400">
												{savedPlayer.phone}
											</p>
										</div>
										<ArrowRight size={18} className="shrink-0 text-primary transition-transform group-active:translate-x-1" />
									</div>
								</button>
							)}

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
											Continuar con mi telefono
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

							<StickyActionBar tone="subtle">
								<p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 text-center mb-3">
									Si queres resolverlo mas rapido, podes reservar como invitado.
								</p>
								<button
									onClick={() => {
										setMode('guest')
										setClientData({ name: '', lastname: '', phone: '', email: '' })
										goToStep(1)
									}}
									className="w-full h-12 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-2xl font-bold text-sm text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/[0.1] active:scale-[0.98] transition-all"
								>
									Reservar sin cuenta
								</button>
							</StickyActionBar>
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

								<StickyActionBar>
									<button
										type="submit"
										disabled={
											!clientData.name || !clientData.lastname || !clientData.phone || isSubmitting
										}
										className="w-full h-14 bg-zinc-950 dark:bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-[0.1em] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
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
								</StickyActionBar>
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
												{formatArs(selectedSlot.price)}
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
										<div className="grid grid-cols-2 gap-3">
											<div className="space-y-1.5">
												<label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
													Nombre *
												</label>
												<input
													type="text"
													value={clientData.name}
													onChange={e => {
														setClientData(p => ({ ...p, name: e.target.value }))
														setGuestErrors(p => ({ ...p, name: undefined }))
													}}
													placeholder="Juan"
													className={cn(
														'w-full h-12 px-4 bg-white dark:bg-white/[0.04] border rounded-2xl text-sm font-bold text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all',
														guestErrors.name ? 'border-red-400 dark:border-red-400' : 'border-slate-200 dark:border-white/[0.07] focus:border-primary/50'
													)}
												/>
												{guestErrors.name && (
													<p className="text-[10px] font-bold text-red-400 flex items-center gap-1 mt-1">
														<AlertTriangle size={10} className="shrink-0" />
														{guestErrors.name}
													</p>
												)}
											</div>
											<div className="space-y-1.5">
												<label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
													Apellido *
												</label>
												<input
													type="text"
													value={clientData.lastname}
													onChange={e => {
														setClientData(p => ({ ...p, lastname: e.target.value }))
														setGuestErrors(p => ({ ...p, lastname: undefined }))
													}}
													placeholder="García"
													className={cn(
														'w-full h-12 px-4 bg-white dark:bg-white/[0.04] border rounded-2xl text-sm font-bold text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all',
														guestErrors.lastname ? 'border-red-400 dark:border-red-400' : 'border-slate-200 dark:border-white/[0.07] focus:border-primary/50'
													)}
												/>
												{guestErrors.lastname && (
													<p className="text-[10px] font-bold text-red-400 flex items-center gap-1 mt-1">
														<AlertTriangle size={10} className="shrink-0" />
														{guestErrors.lastname}
													</p>
												)}
											</div>
										</div>
										<div className="space-y-1.5">
											<label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
												Teléfono *
											</label>
											<div className="relative">
												<div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
													<Smartphone size={15} className="text-slate-400" />
												</div>
												<input
													type="tel"
													value={clientData.phone}
													onChange={e => {
														setClientData(p => ({ ...p, phone: e.target.value }))
														setGuestErrors(p => ({ ...p, phone: undefined }))
													}}
													placeholder="11 1234-5678"
													className={cn(
														'w-full h-12 pl-11 pr-4 bg-white dark:bg-white/[0.04] border rounded-2xl text-sm font-bold text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all',
														guestErrors.phone ? 'border-red-400 dark:border-red-400' : 'border-slate-200 dark:border-white/[0.07] focus:border-primary/50'
													)}
												/>
											</div>
											{guestErrors.phone && (
												<p className="text-[10px] font-bold text-red-400 flex items-center gap-1 mt-1">
													<AlertTriangle size={10} className="shrink-0" />
													{guestErrors.phone}
												</p>
											)}
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
									(mode === 'guest' && (!clientData.name.trim() || !clientData.lastname.trim() || !clientData.phone.trim()))
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
