'use client'

import { createNewClub } from '@/actions/super-admin'
import { useRef, useState } from 'react'
import { Rocket, Sparkles } from 'lucide-react'

type Plan = {
	id: string
	name: string
	price: number
	setupFee?: number
}

const inputClass =
	'w-full bg-black/40 border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-slate-700 focus:border-emerald-500/40 focus:ring-0 outline-none transition-colors'

const labelClass = 'block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-widest'

export default function CreateClubForm({ plans }: { plans: Plan[] }) {
	const formRef = useRef<HTMLFormElement>(null)
	const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
	const [loading, setLoading] = useState(false)
	const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

	async function handleSubmit(formData: FormData) {
		setLoading(true)
		setMessage(null)
		const res = await createNewClub(formData)
		setLoading(false)
		if (res.success) {
			setMessage({ type: 'success', text: res.message || 'Club creado exitosamente' })
			formRef.current?.reset()
		} else {
			setMessage({ type: 'error', text: res.error as string })
		}
	}

	return (
		<form ref={formRef} action={handleSubmit} className="space-y-4">

			{/* Club Name */}
			<div>
				<label className={labelClass}>Nombre del Club</label>
				<input
					name="clubName"
					type="text"
					required
					placeholder="Ej: Padel Center Córdoba"
					className={inputClass}
				/>
			</div>

			{/* Plan Selection */}
			<div>
				<div className="flex items-center justify-between mb-2">
					<label className={labelClass} style={{ marginBottom: 0 }}>Plan de Servicio</label>
					{/* Billing Toggle */}
					<div className="flex bg-black/40 p-0.5 rounded-xl border border-white/[0.06]">
						<button
							type="button"
							onClick={() => setBillingCycle('monthly')}
							className={`text-[9px] uppercase font-black px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
								billingCycle === 'monthly'
									? 'bg-white/10 text-white shadow-sm'
									: 'text-slate-600 hover:text-slate-400'
							}`}
						>
							Mensual
						</button>
						<button
							type="button"
							onClick={() => setBillingCycle('yearly')}
							className={`text-[9px] uppercase font-black px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
								billingCycle === 'yearly'
									? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
									: 'text-slate-600 hover:text-slate-400'
							}`}
						>
							Anual <span className="bg-white/20 px-1 rounded text-[8px]">-20%</span>
						</button>
					</div>
				</div>

				<select
					name="platformPlanId"
					className={`${inputClass} appearance-none`}
				>
					<option value="" className="bg-slate-900">-- Seleccionar Plan --</option>
					{plans.map(plan => {
						const base = plan.price
						const isYearly = billingCycle === 'yearly'
						const final = isYearly ? base * 0.8 : base
						return (
							<option key={plan.id} value={plan.id} className="bg-slate-900 text-white">
								{plan.name} ({new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(final)}{isYearly ? ' x mes' : '/mes'})
							</option>
						)
					})}
				</select>

				<p className="text-[10px] text-slate-700 mt-1.5 flex justify-between items-center font-bold px-0.5">
					<span>Límites automáticos según plan</span>
					{billingCycle === 'yearly' && (
						<span className="text-emerald-500 flex items-center gap-1">
							<Sparkles size={9} /> Ahorro aplicado
						</span>
					)}
				</p>
				<input type="hidden" name="billingCycle" value={billingCycle} />
			</div>

			<div className="h-px bg-white/[0.04] my-1" />

			{/* Owner Credentials */}
			<div className="space-y-3">
				<div className="flex items-center gap-2">
					<div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
					<p className="text-[10px] text-purple-400 uppercase font-black tracking-widest">
						Credenciales del Dueño
					</p>
				</div>

				<div>
					<label className={labelClass}>Nombre Completo</label>
					<input
						name="adminName"
						type="text"
						required
						placeholder="Ej: Martín Dueño"
						className={inputClass}
					/>
				</div>

				<div className="grid grid-cols-2 gap-2.5">
					<div>
						<label className={labelClass}>Email Acceso</label>
						<input
							name="adminEmail"
							type="email"
							required
							placeholder="admin@club.com"
							className={inputClass}
						/>
					</div>
					<div>
						<label className={labelClass}>Password</label>
						<input
							name="adminPassword"
							type="text"
							required
							defaultValue="123456"
							className={`${inputClass} font-mono`}
						/>
					</div>
				</div>
			</div>

			{/* Feedback Message */}
			{message && (
				<div
					className={`p-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-center border ${
						message.type === 'success'
							? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
							: 'bg-red-500/10 text-red-400 border-red-500/20'
					}`}
				>
					{message.text}
				</div>
			)}

			{/* Submit */}
			<button
				type="submit"
				disabled={loading}
				className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black uppercase text-[11px] tracking-[0.15em] py-3.5 rounded-2xl transition-all shadow-xl shadow-emerald-500/15 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
			>
				{loading ? (
					<>
						<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
						Desplegando...
					</>
				) : (
					<>
						<Rocket size={14} />
						Desplegar Nuevo Tenant
					</>
				)}
			</button>

		</form>
	)
}
