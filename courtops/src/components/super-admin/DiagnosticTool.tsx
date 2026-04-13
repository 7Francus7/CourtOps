'use client'

import { useState } from 'react'
import { diagnosticDatabase, repairDatabase } from '@/actions/diagnostic'
import { CheckCircle2, XCircle, Wrench, FlaskConical } from 'lucide-react'

export default function DiagnosticTool() {
	const [result, setResult] = useState<any>(null)
	const [loading, setLoading] = useState(false)
	const [repairMsg, setRepairMsg] = useState('')

	async function runCheck() {
		setLoading(true)
		const res = await diagnosticDatabase()
		setResult(res)
		setLoading(false)
	}

	async function handleRepair() {
		if (!confirm('Esto intentará crear la tabla BookingItem manualmente. ¿Continuar?')) return
		setLoading(true)
		const res = await repairDatabase()
		setRepairMsg(res.success ? (res.message || 'Reparación exitosa') : `Error: ${res.error}`)
		await runCheck()
		setLoading(false)
	}

	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2.5">
					<div className="w-7 h-7 rounded-lg bg-slate-500/10 flex items-center justify-center">
						<FlaskConical size={13} className="text-slate-400" />
					</div>
					<h3 className="text-xs font-black text-white uppercase tracking-widest">
						Diagnóstico DB
					</h3>
				</div>
				<div className="flex gap-1.5">
					<button
						onClick={runCheck}
						disabled={loading}
						className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl border border-white/[0.06] transition-all cursor-pointer disabled:opacity-40"
					>
						{loading ? '...' : 'Test'}
					</button>
					<button
						onClick={handleRepair}
						disabled={loading}
						className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/10 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40"
					>
						<Wrench size={10} />
						Reparar
					</button>
				</div>
			</div>

			{repairMsg && (
				<div className="mb-3 text-[10px] p-3 bg-blue-500/5 text-blue-400 rounded-xl border border-blue-500/10 font-bold">
					{repairMsg}
				</div>
			)}

			{result && (
				<div className="space-y-2">
					{result.success ? (
						<div className="text-xs">
							<p className="text-emerald-400 font-black mb-2 flex items-center gap-2">
								<CheckCircle2 size={13} />
								{result.message} ({result.provider})
							</p>
							<p className="text-slate-600 font-bold uppercase text-[9px] tracking-widest mb-1.5">
								Tablas ({result.tables.length}):
							</p>
							<div className="flex flex-wrap gap-1.5">
								{result.tables.length > 0 ? (
									result.tables.map((t: string) => (
										<span
											key={t}
											className="bg-white/[0.03] border border-white/[0.05] px-2 py-0.5 rounded-lg text-[9px] font-mono text-slate-500"
										>
											{t}
										</span>
									))
								) : (
									<span className="text-red-400 font-black uppercase text-[10px]">Ninguna tabla encontrada</span>
								)}
							</div>
						</div>
					) : (
						<div className="text-xs">
							<p className="text-red-400 font-black mb-2 flex items-center gap-1.5">
								<XCircle size={13} />
								Error de Conexión
							</p>
							<pre className="bg-red-500/5 text-red-400 p-3 rounded-xl border border-red-500/10 whitespace-pre-wrap text-[10px] font-mono">
								{result.error}
							</pre>
						</div>
					)}
				</div>
			)}
		</div>
	)
}
