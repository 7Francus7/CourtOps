'use client'

import { useEffect, useState, use } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getBookingByToken, cancelPublicBooking } from '@/actions/cancel-booking'
import { motion } from 'framer-motion'
import { Calendar, Clock, Trophy, AlertTriangle, CheckCircle, XCircle, Loader2, ShieldAlert } from 'lucide-react'

type Booking = Awaited<ReturnType<typeof getBookingByToken>>

export default function CancelBookingPage({ params }: { params: Promise<{ token: string }> }) {
	const { token } = use(params)
	const [booking, setBooking] = useState<Booking>(null)
	const [loading, setLoading] = useState(true)
	const [cancelling, setCancelling] = useState(false)
	const [result, setResult] = useState<{ isLate: boolean; cancelHours: number } | null>(null)
	const [error, setError] = useState('')
	const [confirmed, setConfirmed] = useState(false)

	useEffect(() => {
		getBookingByToken(token).then(b => {
			setBooking(b)
			setLoading(false)
		})
	}, [token])

	const handleCancel = async () => {
		setCancelling(true)
		const res = await cancelPublicBooking(token)
		setCancelling(false)
		if (res.success) {
			setResult({ isLate: res.isLate!, cancelHours: res.cancelHours! })
		} else {
			setError(res.error || 'Error al cancelar.')
		}
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-zinc-950 flex items-center justify-center">
				<Loader2 className="w-8 h-8 text-primary animate-spin" />
			</div>
		)
	}

	// Success state
	if (result) {
		return (
			<div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					className="w-full max-w-sm text-center space-y-4"
				>
					{result.isLate ? (
						<>
							<div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
								<ShieldAlert size={32} className="text-amber-400" />
							</div>
							<h2 className="text-xl font-black text-white">Turno Cancelado</h2>
							<p className="text-sm text-zinc-400 leading-relaxed">
								Cancelaste fuera del plazo de <span className="text-amber-400 font-bold">{result.cancelHours} horas</span> de anticipación.
								El turno quedará <span className="text-amber-400 font-bold">a tu cargo</span>. El club se pondrá en contacto.
							</p>
						</>
					) : (
						<>
							<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20">
								<CheckCircle size={32} className="text-primary" />
							</div>
							<h2 className="text-xl font-black text-white">Turno Cancelado</h2>
							<p className="text-sm text-zinc-400">Tu reserva fue cancelada sin cargo. La cancha quedó liberada.</p>
						</>
					)}
				</motion.div>
			</div>
		)
	}

	// Not found
	if (!booking) {
		return (
			<div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
				<div className="text-center space-y-3">
					<XCircle size={40} className="text-zinc-600 mx-auto" />
					<p className="text-zinc-400 font-bold">Reserva no encontrada o ya cancelada.</p>
				</div>
			</div>
		)
	}

	const cancelHours = booking.club.cancelHours ?? 6
	const deadline = new Date(booking.startTime.getTime() - cancelHours * 60 * 60 * 1000)
	const isLate = new Date() > deadline
	const playerName = booking.guestName || booking.client?.name || ''

	return (
		<div className="min-h-screen bg-zinc-950 text-slate-100 font-sans flex items-center justify-center p-4">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="w-full max-w-sm space-y-4"
			>
				{/* Header */}
				<div className="text-center mb-2">
					<p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">{booking.club.name}</p>
					<h1 className="text-2xl font-black text-white">Cancelar Reserva</h1>
				</div>

				{/* Booking card */}
				<div className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden">
					<div className="p-5 space-y-4">
						<div className="flex justify-between items-end">
							<div>
								<p className="text-[9px] text-zinc-500 uppercase font-bold tracking-[0.2em] mb-1">Fecha</p>
								<p className="font-black text-base text-white capitalize">
									{format(new Date(booking.startTime), 'EEEE d', { locale: es })}
								</p>
								<p className="text-[11px] text-zinc-500 capitalize">
									{format(new Date(booking.startTime), 'MMMM yyyy', { locale: es })}
								</p>
							</div>
							<div className="text-right">
								<p className="text-[9px] text-zinc-500 uppercase font-bold tracking-[0.2em] mb-1">Hora</p>
								<p className="font-black text-3xl text-primary leading-none tracking-tighter">
									{format(new Date(booking.startTime), 'HH:mm')}
									<span className="text-xs ml-1 text-zinc-500">HS</span>
								</p>
							</div>
						</div>
						<div className="h-px bg-zinc-800" />
						<div className="flex items-center justify-between px-3 py-2.5 bg-zinc-800/50 rounded-xl border border-zinc-700/40">
							<div className="flex items-center gap-2">
								<Trophy size={14} className="text-primary shrink-0" />
								<span className="text-sm font-black uppercase text-white tracking-wider">{booking.court.name}</span>
							</div>
							<span className="text-sm font-black text-primary">
								{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(booking.price)}
							</span>
						</div>
						{playerName && (
							<p className="text-[11px] text-zinc-500 text-center">Reserva de <span className="text-zinc-300 font-bold">{playerName}</span></p>
						)}
					</div>
				</div>

				{/* Late warning */}
				{isLate ? (
					<div className="flex gap-3 p-4 bg-amber-500/[0.08] rounded-2xl border border-amber-500/20">
						<AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
						<div className="space-y-1">
							<p className="text-sm font-black text-amber-400">Fuera del plazo de cancelación</p>
							<p className="text-xs text-amber-400/70 leading-relaxed">
								El plazo para cancelar sin cargo era hasta <span className="font-bold">{cancelHours} horas antes</span> del turno.
								Si cancelás ahora, <span className="font-bold">el turno quedará a tu cargo</span> y el club se comunicará para el cobro.
							</p>
						</div>
					</div>
				) : (
					<div className="flex gap-3 p-4 bg-primary/[0.06] rounded-2xl border border-primary/15">
						<CheckCircle size={18} className="text-primary shrink-0 mt-0.5" />
						<div className="space-y-1">
							<p className="text-sm font-black text-primary">Cancelación sin cargo</p>
							<p className="text-xs text-zinc-400 leading-relaxed">
								Estás dentro del plazo. Podés cancelar sin costo hasta{' '}
								<span className="font-bold text-zinc-300">{format(deadline, "HH:mm 'del' d/M", { locale: es })}</span>.
							</p>
						</div>
					</div>
				)}

				{error && (
					<p className="text-[11px] font-bold text-red-400 text-center flex items-center justify-center gap-1.5">
						<AlertTriangle size={12} /> {error}
					</p>
				)}

				{/* Confirm button */}
				{!confirmed ? (
					<button
						onClick={() => setConfirmed(true)}
						className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-[0.98] cursor-pointer ${
							isLate
								? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
								: 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
						}`}
					>
						{isLate ? 'Entiendo, cancelar de todas formas' : 'Cancelar mi reserva'}
					</button>
				) : (
					<div className="space-y-2">
						<p className="text-center text-xs text-zinc-400">¿Confirmás la cancelación?</p>
						<div className="grid grid-cols-2 gap-2">
							<button
								onClick={() => setConfirmed(false)}
								className="py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 transition-all cursor-pointer"
							>
								Volver
							</button>
							<button
								onClick={handleCancel}
								disabled={cancelling}
								className="py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest bg-red-500 text-white hover:bg-red-600 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
							>
								{cancelling ? <Loader2 size={14} className="animate-spin" /> : 'Confirmar'}
							</button>
						</div>
					</div>
				)}

				<p className="text-center text-[10px] text-zinc-700">Reserva #{booking.id}</p>
			</motion.div>
		</div>
	)
}
