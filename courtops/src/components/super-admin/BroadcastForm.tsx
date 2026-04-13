'use client'

import { createSystemNotification, deactivateSystemNotification } from '@/actions/super-admin'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, CheckCircle, AlertTriangle, XCircle, Info, Megaphone } from 'lucide-react'

const inputClass =
	'w-full bg-black/40 border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-slate-700 focus:border-amber-500/30 focus:ring-0 outline-none transition-colors'

const labelClass = 'text-[10px] font-black text-slate-500 uppercase tracking-widest'

export default function BroadcastForm({ notifications }: { notifications: any[] }) {
	const [loading, setLoading] = useState(false)
	const router = useRouter()

	async function handleSubmit(formData: FormData) {
		setLoading(true)
		const res = await createSystemNotification(formData)
		setLoading(false)
		if (res.success) {
			router.refresh()
		} else {
			alert('Error: ' + res.error)
		}
	}

	async function handleDeactivate(id: string) {
		if (!confirm('¿Desactivar esta notificación?')) return
		const res = await deactivateSystemNotification(id)
		if (res.success) router.refresh()
		else alert('Error: ' + res.error)
	}

	const activeNotifications = notifications?.filter(n => n.isActive) || []

	return (
		<div className="space-y-4">

			{/* Compose Form */}
			<div className="bg-[#0f172a] border border-white/[0.06] rounded-2xl p-5 space-y-4">
				<div className="flex items-center gap-3">
					<div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
						<Megaphone size={15} className="text-amber-400" />
					</div>
					<div>
						<h3 className="text-sm font-black text-white leading-none">Broadcasting</h3>
						<p className="text-[10px] text-slate-500 mt-0.5">Alertas globales a clubes</p>
					</div>
				</div>

				<form action={handleSubmit} className="space-y-3">
					<div>
						<label className={labelClass}>Título</label>
						<input
							name="title"
							required
							className={`${inputClass} mt-1.5`}
							placeholder="Ej: Mantenimiento Programado"
						/>
					</div>

					<div>
						<label className={labelClass}>Mensaje</label>
						<textarea
							name="message"
							required
							rows={2}
							className={`${inputClass} mt-1.5 resize-none`}
							placeholder="El sistema estará inactivo de 3AM a 4AM..."
						/>
					</div>

					<div className="grid grid-cols-2 gap-2.5">
						<div>
							<label className={labelClass}>Tipo</label>
							<select
								name="type"
								className={`${inputClass} mt-1.5 appearance-none`}
							>
								<option value="INFO" className="bg-slate-900">Info (Azul)</option>
								<option value="WARNING" className="bg-slate-900">Alerta (Amarillo)</option>
								<option value="ERROR" className="bg-slate-900">Error (Rojo)</option>
								<option value="SUCCESS" className="bg-slate-900">Éxito (Verde)</option>
							</select>
						</div>
						<div>
							<label className={labelClass}>Destino</label>
							<select
								name="target"
								className={`${inputClass} mt-1.5 appearance-none`}
							>
								<option value="ALL" className="bg-slate-900">Todos los usuarios</option>
								<option value="ADMINS" className="bg-slate-900">Solo Admins</option>
							</select>
						</div>
					</div>

					<button
						disabled={loading}
						type="submit"
						className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-black uppercase text-[10px] tracking-widest py-3 rounded-xl transition-all shadow-lg shadow-amber-500/15 active:scale-[0.98] cursor-pointer"
					>
						{loading ? 'Enviando...' : 'Transmitir Alerta Global'}
					</button>
				</form>
			</div>

			{/* Active Notifications */}
			{activeNotifications.length > 0 && (
				<div className="bg-[#0f172a] border border-white/[0.06] rounded-2xl p-5">
					<h3 className="text-[10px] font-black text-emerald-400 mb-4 uppercase tracking-widest flex items-center gap-2">
						<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
						Notificaciones Activas
					</h3>
					<div className="space-y-2.5">
						{activeNotifications.map(n => (
							<div
								key={n.id}
								className="bg-black/30 border border-white/[0.05] rounded-xl p-3.5 flex justify-between items-start gap-3"
							>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 mb-1">
										{n.type === 'INFO' && <Info size={13} className="text-blue-400 shrink-0" />}
										{n.type === 'WARNING' && <AlertTriangle size={13} className="text-amber-400 shrink-0" />}
										{n.type === 'ERROR' && <XCircle size={13} className="text-red-400 shrink-0" />}
										{n.type === 'SUCCESS' && <CheckCircle size={13} className="text-emerald-400 shrink-0" />}
										<span className="font-bold text-white text-xs truncate">{n.title}</span>
										<span className="text-[9px] text-slate-500 bg-white/5 px-1.5 py-0.5 rounded uppercase font-black shrink-0">
											{n.target}
										</span>
									</div>
									<p className="text-slate-500 text-xs font-medium leading-relaxed">{n.message}</p>
								</div>
								<button
									onClick={() => handleDeactivate(n.id)}
									className="text-slate-700 hover:text-red-400 transition-colors p-1 cursor-pointer shrink-0"
									title="Desactivar"
								>
									<Trash2 size={14} />
								</button>
							</div>
						))}
					</div>
				</div>
			)}

		</div>
	)
}
