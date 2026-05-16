'use client'

import { ArrowRight, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { PaymentStatusBadge, type PaymentStatus } from "@/components/ui/BookingStatusBadge"

interface TimelineBooking {
	id: number
	time: string
	courtName: string
	title: string
	status: string
	paymentStatus: PaymentStatus
	price: number
	balance: number
}

const getCourtColor = (name: string) => {
	const lower = name.toLowerCase()
	if (lower.includes('1') || lower.includes('uno')) return 'text-blue-500 bg-blue-500/10 border-blue-500/10'
	if (lower.includes('2') || lower.includes('dos')) return 'text-purple-500 bg-purple-500/10 border-purple-500/10'
	if (lower.includes('3') || lower.includes('tres')) return 'text-pink-500 bg-pink-500/10 border-pink-500/10'
	if (lower.includes('4') || lower.includes('cuatro')) return 'text-orange-500 bg-orange-500/10 border-orange-500/10'
	if (lower.includes('futbol') || lower.includes('fútbol')) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/10'
	return 'text-slate-500 bg-slate-500/10 border-slate-500/10'
}

const PAYMENT_BAR_COLOR: Record<PaymentStatus, string> = {
	PAID: 'bg-emerald-500',
	PARTIAL: 'bg-amber-500',
	UNPAID: 'bg-red-500',
	PENDING_VALIDATION: 'bg-blue-500',
}

export function MobileBookingTimeline({ bookings, onOpenBooking }: { bookings: TimelineBooking[], onOpenBooking: (_id: number) => void }) {
	if (!bookings || bookings.length === 0) {
		return (
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				className="flex flex-col items-center justify-center py-20 text-muted-foreground/30 bg-card rounded-[2.5rem] border-2 border-dashed border-border/50 mx-1"
			>
				<div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
					<Clock className="w-8 h-8 opacity-20" />
				</div>
				<p className="text-sm font-black uppercase tracking-[0.2em]">Todo tranquilo</p>
				<p className="text-[10px] uppercase font-bold mt-1">Sin turnos próximos para mostrar</p>
			</motion.div>
		)
	}

	return (
		<div className="relative pl-6 space-y-6">
			{/* Timeline Line */}
			<div className="absolute top-4 bottom-4 left-[27px] w-px bg-gradient-to-b from-primary via-border to-transparent" />

			{bookings.map((booking, index) => {
				const isNext = index === 0
				const barColor = PAYMENT_BAR_COLOR[booking.paymentStatus] ?? 'bg-red-500'

				return (
					<motion.div
						key={booking.id}
						initial={{ opacity: 0, x: -10 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: index * 0.1 }}
						onClick={() => onOpenBooking(booking.id)}
						className="relative flex items-start gap-6 group cursor-pointer active:scale-[0.97] transition-all duration-300"
					>
						{/* Dot */}
						<div className={cn(
							"relative z-10 flex items-center justify-center w-4 h-4 mt-5 rounded-full border ring-8 ring-background transition-all duration-500",
							isNext
								? "bg-primary border-primary scale-110"
								: "bg-muted border-border group-hover:bg-primary/50 group-hover:border-primary/50"
						)}>
							{isNext && <div className="absolute inset-0 bg-primary rounded-full opacity-50" />}
						</div>

						{/* Card */}
						<div className={cn(
							"flex-1 rounded-[2rem] p-5 border shadow-xl transition-all duration-300 relative overflow-hidden",
							isNext
								? "bg-card border-primary/20 ring-1 ring-primary/10 shadow-primary/5"
								: "bg-card border-border/40 hover:border-primary/20 shadow-black/5"
						)}>
							{/* Status bar */}
							<div className={cn("absolute left-0 top-0 bottom-0 w-1.5 transition-all", barColor)} />

							<div className="flex justify-between items-start mb-4">
								<div className="flex flex-col gap-1">
									<span className={cn(
										"text-2xl font-black tracking-tighter leading-none",
										isNext ? "text-primary" : "text-foreground"
									)}>
										{booking.time}
									</span>
									<div className="flex items-center gap-2">
										<span className={cn(
											"text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
											getCourtColor(booking.courtName)
										)}>
											{booking.courtName}
										</span>
									</div>
								</div>
								<PaymentStatusBadge status={booking.paymentStatus} size="sm" />
							</div>

							<div className="flex flex-col gap-4">
								<h4 className="text-xl font-black tracking-tight text-foreground truncate max-w-[200px] leading-tight group-hover:text-primary transition-colors">
									{booking.title}
								</h4>

								<div className="flex items-center justify-between gap-4 p-2.5 rounded-2xl bg-muted/30 border border-border/30">
									<div className="flex flex-col">
										<span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground leading-none mb-1">Total Turno</span>
										<span className="text-sm font-black text-foreground">${booking.price.toLocaleString()}</span>
									</div>
									{booking.balance > 0 && (
										<div className="flex flex-col items-end">
											<span className="text-[8px] font-black uppercase tracking-[0.2em] text-red-500 leading-none mb-1">Balance</span>
											<span className="text-sm font-black text-red-500">-${booking.balance.toLocaleString()}</span>
										</div>
									)}
									<div className={cn(
										"w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-90",
										isNext ? "bg-primary text-white shadow-primary/20" : "bg-card text-muted-foreground shadow-black/5"
									)}>
										<ArrowRight size={18} strokeWidth={3} />
									</div>
								</div>
							</div>
						</div>
					</motion.div>
				)
			})}
		</div>
	)
}
