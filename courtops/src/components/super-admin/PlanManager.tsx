'use client'

import { useState } from 'react'
import { updatePlatformPlan } from '@/actions/super-admin'
import { useRouter } from 'next/navigation'
import { Settings2, Save } from 'lucide-react'

type Plan = {
	id: string
	name: string
	price: number
	features: any
}

export default function PlanManager({ plans }: { plans: Plan[] }) {
	const [prices, setPrices] = useState<Record<string, number>>(
		plans.reduce((acc, p) => ({ ...acc, [p.id]: p.price }), {})
	)
	const [loadingId, setLoadingId] = useState<string | null>(null)
	const router = useRouter()

	async function handleUpdate(id: string) {
		setLoadingId(id)
		const formData = new FormData()
		formData.append('id', id)
		formData.append('price', prices[id].toString())
		const res = await updatePlatformPlan(formData)
		if (res.success) router.refresh()
		else alert('Error: ' + res.error)
		setLoadingId(null)
	}

	return (
		<div className="bg-[#0f172a] border border-white/[0.06] rounded-2xl p-5 relative overflow-hidden">
			{/* Subtle glow */}
			<div className="absolute -top-16 -right-16 w-40 h-40 bg-emerald-500/[0.05] blur-[80px] rounded-full pointer-events-none" />

			<div className="flex items-center gap-3 mb-5 relative">
				<div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
					<Settings2 size={15} className="text-emerald-400" />
				</div>
				<div>
					<h3 className="text-sm font-black text-white leading-none">Gestor de Planes</h3>
					<p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-widest">Precios Globales</p>
				</div>
			</div>

			<div className="space-y-2 relative">
				{plans.map(plan => (
					<div
						key={plan.id}
						className="flex items-center justify-between bg-black/30 border border-white/[0.05] hover:border-white/10 p-3.5 rounded-xl transition-all group"
					>
						<div className="flex flex-col gap-0.5">
							<span className="text-white font-black text-xs uppercase tracking-wider">{plan.name}</span>
							<span className="text-[9px] text-slate-700 font-mono">{plan.id.slice(0, 8)}…</span>
						</div>

						<div className="flex items-center gap-2">
							<div className="relative">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs font-bold pointer-events-none">$</span>
								<input
									type="number"
									value={prices[plan.id]}
									onChange={(e) => setPrices({ ...prices, [plan.id]: parseInt(e.target.value) || 0 })}
									className="bg-black/40 border border-white/[0.08] rounded-xl pl-6 pr-3 py-2 text-sm text-white w-28 focus:outline-none focus:border-emerald-500/40 transition-colors font-black tracking-tight"
								/>
							</div>
							<button
								onClick={() => handleUpdate(plan.id)}
								disabled={loadingId === plan.id || prices[plan.id] === plans.find(p => p.id === plan.id)?.price}
								className="p-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl disabled:opacity-30 disabled:grayscale transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20 cursor-pointer"
								title="Guardar Precio"
							>
								<Save size={14} />
							</button>
						</div>
					</div>
				))}
			</div>

			<div className="mt-5 pt-4 border-t border-white/[0.04] flex items-center justify-between">
				<div className="flex items-center gap-2">
					<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(34,197,94,0.5)] animate-pulse" />
					<span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Live DB</span>
				</div>
				<button
					onClick={async () => {
						if (!confirm('¿Restablecer precios y características a los oficiales 2026?')) return
						const { seedOfficialPlans } = await import('@/actions/super-admin')
						const res = await seedOfficialPlans()
						if (res.success) alert(res.message)
						else alert('Error: ' + res.error)
						router.refresh()
					}}
					className="text-[9px] uppercase font-black text-slate-600 hover:text-emerald-400 transition-colors tracking-widest bg-white/[0.03] hover:bg-emerald-500/10 px-3 py-1.5 rounded-full cursor-pointer"
				>
					Restablecer Defaults
				</button>
			</div>
		</div>
	)
}
