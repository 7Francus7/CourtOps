
'use client'

import { useState } from 'react'
import { diagnosticDatabase, repairDatabase } from '@/actions/diagnostic'

export default function DiagnosticTool() {
       const [result, setResult] = useState<any>(null)
       const [loading, setLoading] = useState(false)
       const [repairMsg, setRepairMsg] = useState("")

       async function runCheck() {
              setLoading(true)
              const res = await diagnosticDatabase()
              setResult(res)
              setLoading(false)
       }

       async function handleRepair() {
              if (!confirm("Esto intentará crear la tabla BookingItem manualmente. ¿Continuar?")) return
              setLoading(true)
              const res = await repairDatabase()
              setRepairMsg(res.success ? (res.message || "Reparación exitosa") : `Error: ${res.error}`)
              await runCheck()
              setLoading(false)
       }

       return (
              <div className="mt-8 p-6 bg-slate-50 dark:bg-zinc-950/50 border border-slate-200 dark:border-white/5 rounded-2xl shadow-inner">
                     <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em]">Base de Datos - Diagnóstico</h3>
                            <div className="flex gap-2">
                                   <button
                                          onClick={runCheck}
                                          disabled={loading}
                                          className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-white rounded-lg border border-slate-200 dark:border-transparent transition-all shadow-sm"
                                   >
                                          {loading ? '...' : 'Test'}
                                   </button>
                                   <button
                                          onClick={handleRepair}
                                          disabled={loading}
                                          className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-300 rounded-lg border border-red-500/10 transition-all"
                                   >
                                          Reparar
                                   </button>
                            </div>
                     </div>

                     {repairMsg && (
                            <div className="mb-4 text-[10px] p-3 bg-blue-500/5 text-blue-600 dark:text-blue-300 rounded-xl border border-blue-500/10 font-bold">
                                   {repairMsg}
                            </div>
                     )}

                     {result && (
                            <div className="space-y-3">
                                   {result.success ? (
                                          <div className="text-xs">
                                                 <p className="text-emerald-600 dark:text-emerald-500 font-black mb-2 flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                        {result.message} ({result.provider})
                                                 </p>
                                                 <p className="text-slate-400 dark:text-zinc-500 font-bold uppercase text-[9px] tracking-widest mb-1">Tablas encontradas ({result.tables.length}):</p>
                                                 <div className="flex flex-wrap gap-1.5">
                                                        {result.tables.length > 0 ? result.tables.map((t: string) => (
                                                               <span key={t} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 px-2 py-0.5 rounded-md text-[9px] font-mono text-slate-600 dark:text-zinc-400">{t}</span>
                                                        )) : <span className="text-red-500 font-black uppercase">NINGUNA TABLA ENCONTRADA</span>}
                                                 </div>
                                          </div>
                                   ) : (
                                          <div className="text-xs">
                                                 <p className="text-red-500 font-black mb-1">❌ Error de Conexión</p>
                                                 <pre className="bg-red-500/5 text-red-600 dark:text-red-300 p-3 rounded-xl border border-red-500/10 whitespace-pre-wrap text-[10px] font-mono">
                                                        {result.error}
                                                 </pre>
                                          </div>
                                   )}
                            </div>
                     )}
              </div>
       )
}
