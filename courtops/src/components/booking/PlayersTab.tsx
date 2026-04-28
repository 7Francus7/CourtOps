'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Plus, Minus, CheckCircle, RefreshCw, X, Wallet, Loader2, User, Pencil, CreditCard, Banknote, Smartphone } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { chargePlayer } from '@/actions/manageBooking'
import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'

interface PlayersTabProps {
	bookingId: number
	totalAmount: number
	baseBookingPrice: number
	kioskItems: any[]
	players: any[]
	setPlayers: (players: any[]) => void
	onSave: () => void
	onRecalculate?: () => void
	loading: boolean
}

const PLAYER_COLORS = [
	{ bg: 'bg-violet-100 dark:bg-violet-500/15', text: 'text-violet-700 dark:text-violet-400', ring: 'ring-violet-200 dark:ring-violet-500/20' },
	{ bg: 'bg-sky-100 dark:bg-sky-500/15', text: 'text-sky-700 dark:text-sky-400', ring: 'ring-sky-200 dark:ring-sky-500/20' },
	{ bg: 'bg-amber-100 dark:bg-amber-500/15', text: 'text-amber-700 dark:text-amber-400', ring: 'ring-amber-200 dark:ring-amber-500/20' },
	{ bg: 'bg-rose-100 dark:bg-rose-500/15', text: 'text-rose-700 dark:text-rose-400', ring: 'ring-rose-200 dark:ring-rose-500/20' },
	{ bg: 'bg-teal-100 dark:bg-teal-500/15', text: 'text-teal-700 dark:text-teal-400', ring: 'ring-teal-200 dark:ring-teal-500/20' },
	{ bg: 'bg-orange-100 dark:bg-orange-500/15', text: 'text-orange-700 dark:text-orange-400', ring: 'ring-orange-200 dark:ring-orange-500/20' },
	{ bg: 'bg-indigo-100 dark:bg-indigo-500/15', text: 'text-indigo-700 dark:text-indigo-400', ring: 'ring-indigo-200 dark:ring-indigo-500/20' },
	{ bg: 'bg-pink-100 dark:bg-pink-500/15', text: 'text-pink-700 dark:text-pink-400', ring: 'ring-pink-200 dark:ring-pink-500/20' },
]

const PAYMENT_METHODS = [
	{ method: 'CASH', label: 'Efectivo', icon: Banknote, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20', border: 'border-emerald-200/60 dark:border-emerald-500/15' },
	{ method: 'TRANSFER', label: 'Transferencia', icon: Wallet, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20', border: 'border-blue-200/60 dark:border-blue-500/15' },
	{ method: 'MP', label: 'MercadoPago', icon: Smartphone, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20', border: 'border-sky-200/60 dark:border-sky-500/15' },
]

function AmountInput({ value, onChange, onBlur, disabled }: { value: number, onChange: (v: number) => void, onBlur: () => void, disabled: boolean }) {
	const [editing, setEditing] = useState(false)
	const [raw, setRaw] = useState(String(value))
	const inputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (!editing) setRaw(String(value))
	}, [value, editing])

	if (disabled) {
		return (
			<span className="text-[11px] font-semibold text-emerald-500 dark:text-emerald-400">
				${value.toLocaleString()}
			</span>
		)
	}

	if (editing) {
		return (
			<input
				ref={inputRef}
				type="number"
				value={raw}
				onChange={e => setRaw(e.target.value)}
				onBlur={() => {
					setEditing(false)
					const parsed = parseFloat(raw)
					if (!isNaN(parsed) && parsed >= 0) onChange(parsed)
					else setRaw(String(value))
					onBlur()
				}}
				onKeyDown={e => {
					if (e.key === 'Enter') inputRef.current?.blur()
					if (e.key === 'Escape') { setEditing(false); setRaw(String(value)) }
				}}
				autoFocus
				className="w-20 text-[12px] font-semibold text-slate-800 dark:text-white bg-slate-100 dark:bg-white/10 rounded px-1.5 py-0.5 border border-primary/30 outline-none focus:ring-1 focus:ring-primary/30"
			/>
		)
	}

	return (
		<button
			onClick={() => { setEditing(true); setRaw(String(value)) }}
			className="flex items-center gap-1 group/amt"
			title="Editar monto"
		>
			<span className={cn(
				'text-[11px] font-semibold',
				value > 0 ? 'text-slate-600 dark:text-zinc-400' : 'text-slate-300 dark:text-zinc-700'
			)}>
				{value > 0 ? `$${value.toLocaleString()}` : '—'}
			</span>
			<Pencil size={9} className="text-slate-300 dark:text-zinc-700 opacity-0 group-hover/amt:opacity-100 transition-opacity" />
		</button>
	)
}

export function PlayersTab({ bookingId, totalAmount, baseBookingPrice, kioskItems, players, setPlayers, onSave, onRecalculate, loading }: PlayersTabProps) {
	const { t } = useLanguage()
	const [isCharging, setIsCharging] = useState(false)
	const [showPaymentModal, setShowPaymentModal] = useState<{ id: string, name: string, amount: number } | null>(null)
	const [focusNewPlayer, setFocusNewPlayer] = useState(false)
	const newPlayerRef = useRef<HTMLInputElement>(null)

	const paidCount = players.filter(p => p.isPaid).length
	const totalAssigned = players.reduce((acc: number, p: any) => acc + (p.amount || 0), 0)
	const totalPaid = players.filter(p => p.isPaid).reduce((acc: number, p: any) => acc + (p.amount || 0), 0)
	const allPaid = players.length > 0 && paidCount === players.length
	const noneAssigned = totalAssigned === 0

	useEffect(() => {
		if (focusNewPlayer && newPlayerRef.current) {
			newPlayerRef.current.focus()
			newPlayerRef.current.select()
			setFocusNewPlayer(false)
		}
	}, [focusNewPlayer, players.length])

	const handleAddPlayer = () => {
		if (players.length >= 8) return
		const newPlayer = {
			id: crypto.randomUUID(),
			name: `Jugador ${players.length + 1}`,
			isPaid: false,
			amount: 0
		}
		setPlayers([...players, newPlayer])
		setFocusNewPlayer(true)
	}

	const handleRemovePlayer = (index: number) => {
		if (players[index]?.isPaid) return
		const updated = players.filter((_, i) => i !== index)
		setPlayers(updated)
		setTimeout(() => onSave(), 50)
	}

	const handleAmountChange = (index: number, newAmount: number) => {
		const updated = [...players]
		updated[index] = { ...updated[index], amount: newAmount }
		setPlayers(updated)
	}

	return (
		<div className="max-w-2xl mx-auto space-y-4">

			{/* Header */}
			<div className="bg-white dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.05] rounded-2xl p-4">
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center gap-2.5">
						<div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center">
							<User size={15} className="text-violet-600 dark:text-violet-400" />
						</div>
						<div>
							<p className="text-[13px] font-semibold text-slate-800 dark:text-white leading-none">División de Gastos</p>
							<p className="text-[10px] text-slate-400 dark:text-zinc-600 mt-0.5">
								{paidCount > 0 ? `${paidCount} de ${players.length} pagaron` : `${players.length} jugadores`}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-1.5">
						<button
							onClick={onRecalculate}
							className="h-8 px-3 rounded-xl bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-200/60 dark:border-violet-500/15 flex items-center gap-1.5 text-[11px] font-semibold hover:bg-violet-100 dark:hover:bg-violet-500/20 active:scale-95 transition-all"
						>
							<RefreshCw size={11} />
							Dividir
						</button>
						<button
							onClick={() => handleRemovePlayer(players.length - 1)}
							disabled={players.length <= 1 || players[players.length - 1]?.isPaid}
							className="w-8 h-8 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] flex items-center justify-center text-slate-400 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
						>
							<Minus size={13} />
						</button>
						<button
							onClick={handleAddPlayer}
							disabled={players.length >= 8}
							className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center hover:brightness-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
						>
							<Plus size={13} />
						</button>
					</div>
				</div>

				{/* Progress bar */}
				{totalAssigned > 0 && (
					<div className="space-y-1.5">
						<div className="flex items-center justify-between">
							<span className="text-[10px] font-medium text-slate-400 dark:text-zinc-600">
								Cobrado: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">${totalPaid.toLocaleString()}</span>
								{' / '}
								<span className="text-slate-600 dark:text-zinc-400">${totalAssigned.toLocaleString()}</span>
							</span>
							{allPaid && (
								<span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
									<CheckCircle size={10} />
									Todo cobrado
								</span>
							)}
						</div>
						<div className="w-full h-1.5 bg-slate-100 dark:bg-white/[0.04] rounded-full overflow-hidden">
							<motion.div
								className="h-full bg-emerald-500 rounded-full"
								initial={{ width: 0 }}
								animate={{ width: totalAssigned > 0 ? `${(totalPaid / totalAssigned) * 100}%` : '0%' }}
								transition={{ duration: 0.5, ease: 'easeOut' }}
							/>
						</div>
					</div>
				)}

				{/* Hint when nothing assigned */}
				{noneAssigned && (
					<div className="flex items-center gap-2 mt-1 p-2.5 bg-violet-50 dark:bg-violet-500/[0.06] rounded-xl border border-violet-100 dark:border-violet-500/10">
						<RefreshCw size={12} className="text-violet-500 shrink-0" />
						<p className="text-[11px] text-violet-600 dark:text-violet-400 font-medium">
							Presioná <strong>Dividir</strong> para repartir el total entre los jugadores, o editá cada monto manualmente.
						</p>
					</div>
				)}
			</div>

			{/* Player Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
				<AnimatePresence mode="popLayout">
					{players.map((player, index) => {
						const color = PLAYER_COLORS[index % PLAYER_COLORS.length]
						const isFirstPlayer = index === 0
						return (
							<motion.div
								layout
								key={player.id || `player-${index}`}
								initial={{ opacity: 0, scale: 0.94, y: 6 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.94, y: -4 }}
								transition={{ duration: 0.18 }}
								className={cn(
									'group relative bg-white dark:bg-white/[0.025] border rounded-2xl p-3.5 flex items-center gap-3 transition-all',
									player.isPaid
										? 'border-emerald-200/70 dark:border-emerald-500/15'
										: 'border-slate-200/60 dark:border-white/[0.05] hover:border-slate-300/80 dark:hover:border-white/[0.09]'
								)}
							>
								{/* Remove button */}
								{!player.isPaid && players.length > 1 && (
									<button
										onClick={() => handleRemovePlayer(index)}
										className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/[0.08] text-slate-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-500/30 opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-sm transition-all z-10"
									>
										<X size={10} strokeWidth={2.5} />
									</button>
								)}

								{/* Avatar */}
								<div className={cn(
									'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-[13px] font-black ring-1',
									player.isPaid
										? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-500/20'
										: `${color.bg} ${color.text} ${color.ring}`
								)}>
									{player.isPaid
										? <CheckCircle size={18} />
										: <span>{index + 1}</span>
									}
								</div>

								{/* Info */}
								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-1.5">
										<input
											ref={index === players.length - 1 && focusNewPlayer ? newPlayerRef : undefined}
											type="text"
											value={player.name}
											onChange={e => {
												const updated = [...players]
												updated[index] = { ...updated[index], name: e.target.value }
												setPlayers(updated)
											}}
											onBlur={() => onSave()}
											className={cn(
												'text-[13px] font-semibold bg-transparent border-none outline-none w-full p-0 focus:ring-0 truncate leading-none',
												player.isPaid ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-800 dark:text-white'
											)}
											placeholder="Nombre del jugador"
											disabled={player.isPaid}
										/>
										{isFirstPlayer && (
											<span className="shrink-0 text-[8px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 leading-none">
												Titular
											</span>
										)}
									</div>
									<div className="mt-1">
										<AmountInput
											value={player.amount || 0}
											onChange={v => handleAmountChange(index, v)}
											onBlur={onSave}
											disabled={player.isPaid}
										/>
									</div>
								</div>

								{/* Action */}
								<div className="shrink-0">
									{player.isPaid ? (
										<div className="flex flex-col items-end gap-0.5">
											<span className="text-[9px] font-black uppercase tracking-wide text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-2 py-1 rounded-lg leading-none">
												Pagado
											</span>
										</div>
									) : (
										<button
											onClick={() => setShowPaymentModal({ id: player.id, name: player.name, amount: player.amount || 0 })}
											disabled={!player.amount || player.amount <= 0}
											className={cn(
												'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all active:scale-95',
												player.amount > 0
													? 'bg-primary/10 hover:bg-primary/20 text-primary'
													: 'bg-slate-100 dark:bg-white/[0.03] text-slate-300 dark:text-zinc-700 cursor-not-allowed'
											)}
										>
											<CreditCard size={13} />
											<span>Cobrar</span>
										</button>
									)}
								</div>
							</motion.div>
						)
					})}
				</AnimatePresence>
			</div>

			{/* Bottom summary */}
			{totalAssigned > 0 && (
				<div className="flex items-center justify-between bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] rounded-xl px-4 py-3">
					<div className="flex items-center gap-4">
						<div>
							<p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-600 mb-0.5">Asignado</p>
							<p className="text-sm font-bold text-slate-800 dark:text-white">${totalAssigned.toLocaleString()}</p>
						</div>
						<div>
							<p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-600 mb-0.5">Cobrado</p>
							<p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">${totalPaid.toLocaleString()}</p>
						</div>
						<div>
							<p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-600 mb-0.5">Resta</p>
							<p className="text-sm font-bold text-amber-600 dark:text-amber-400">${(totalAssigned - totalPaid).toLocaleString()}</p>
						</div>
					</div>
					<span className="text-[10px] font-medium text-slate-400 dark:text-zinc-600">
						{paidCount}/{players.length} pagaron
					</span>
				</div>
			)}

			{/* Payment Modal */}
			<AnimatePresence>
				{showPaymentModal && (
					<div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
						<motion.div
							initial={{ scale: 0.96, opacity: 0, y: 16 }}
							animate={{ scale: 1, opacity: 1, y: 0 }}
							exit={{ scale: 0.96, opacity: 0, y: 16 }}
							transition={{ duration: 0.18 }}
							className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 shadow-2xl"
						>
							{/* Modal header */}
							<div className="flex items-center justify-between mb-5">
								<div>
									<p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">Cobrar a</p>
									<h4 className="text-base font-bold text-slate-800 dark:text-white leading-tight">{showPaymentModal.name}</h4>
								</div>
								<button
									onClick={() => setShowPaymentModal(null)}
									className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/[0.05] text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors flex items-center justify-center"
								>
									<X size={14} />
								</button>
							</div>

							{/* Amount display */}
							<div className="text-center py-5 mb-5 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-100 dark:border-white/[0.04]">
								<p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-600 mb-1">Total a cobrar</p>
								<p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
									${showPaymentModal.amount.toLocaleString()}
								</p>
							</div>

							{/* Payment methods */}
							<div className="space-y-2">
								{PAYMENT_METHODS.map(({ method, label, icon: Icon, color, bg, border }) => (
									<button
										key={method}
										onClick={async () => {
											setIsCharging(true)
											const res = await chargePlayer(bookingId, showPaymentModal.name, showPaymentModal.amount, method)
											setIsCharging(false)
											if (res.success) {
												toast.success(`Pago de ${showPaymentModal.name} registrado`)
												setShowPaymentModal(null)
												onSave()
											} else {
												toast.error('Error al registrar pago')
											}
										}}
										disabled={isCharging}
										className={cn(
											'w-full py-3.5 border rounded-2xl text-[12px] font-bold flex items-center justify-center gap-2.5 active:scale-[0.98] disabled:opacity-50 transition-all',
											bg, border, color
										)}
									>
										{isCharging ? <Loader2 size={15} className="animate-spin" /> : <Icon size={15} />}
										{label}
									</button>
								))}
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</div>
	)
}
