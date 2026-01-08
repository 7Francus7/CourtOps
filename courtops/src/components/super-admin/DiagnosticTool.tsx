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
              setRepairMsg(res.success ? res.message : `Error: ${res.error}`)
              await runCheck()
              setLoading(false)
       }

       return (
              <div className="mt-8 p-4 bg-zinc-950/50 border border-white/5 rounded-lg">
                     <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Base de Datos - Diagnóstico</h3>
                            <div className="flex gap-2">
                                   <button
                                          onClick={runCheck}
                                          disabled={loading}
                                          className="text-xs px-2 py-1 bg-white/5 hover:bg-white/10 text-white rounded transition-all"
                                   >
                                          {loading ? '...' : 'Test'}
                                   </button>
                                   <button
                                          onClick={handleRepair}
                                          disabled={loading}
                                          className="text-xs px-2 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded transition-all"
                                   >
                                          Reparar BookingItem
                                   </button>
                            </div>
                     </div>

                     {repairMsg && (
                            <div className="mb-4 text-[10px] p-2 bg-blue-500/10 text-blue-300 rounded border border-blue-500/20">
                                   {repairMsg}
                            </div>
                     )}

                     {result && (
                            <div className="space-y-2">
                                   {result.success ? (
                                          <div className="text-xs">
                                                 <p className="text-green-500 font-bold mb-2">✅ {result.message} ({result.provider})</p>
                                                 <p className="text-zinc-400">Tablas encontradas ({result.tables.length}):</p>
                                                 <div className="flex flex-wrap gap-1 mt-1">
                                                        {result.tables.length > 0 ? result.tables.map((t: string) => (
                                                               <span key={t} className="bg-white/5 px-1.5 py-0.5 rounded text-[10px] text-zinc-300">{t}</span>
                                                        )) : <span className="text-red-400">NINGUNA TABLA ENCONTRADA</span>}
                                                 </div>
                                          </div>
                                   ) : (
                                          <div className="text-xs">
                                                 <p className="text-red-500 font-bold mb-1">❌ Error de Conexión</p>
                                                 <pre className="bg-red-500/5 text-red-300 p-2 rounded whitespace-pre-wrap text-[10px]">
                                                        {result.error}
                                                 </pre>
                                          </div>
                                   )}
                            </div>
                     )}
              </div>
       )
}
