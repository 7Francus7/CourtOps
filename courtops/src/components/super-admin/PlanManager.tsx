
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
              if (res.success) {
                     router.refresh()
              } else {
                     alert('Error: ' + res.error)
              }
              setLoadingId(null)
       }

       return (
              <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-xl overflow-hidden relative">
                     {/* Background Glow */}
                     <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-[100px] pointer-events-none" />

                     <div className="flex items-center justify-between mb-8">
                            <div>
                                   <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                                 <Settings2 size={18} />
                                          </div>
                                          Gestor de Planes
                                   </h3>
                                   <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-2 uppercase tracking-[0.2em] font-black">Configuración de Precios Globales</p>
                            </div>
                     </div>

                     <div className="space-y-3">
                            {plans.map(plan => (
                                   <div key={plan.id} className="flex items-center justify-between bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5 p-4 rounded-2xl group hover:border-emerald-500/30 transition-all">
                                          <div className="flex flex-col">
                                                 <span className="text-slate-900 dark:text-white font-black uppercase text-xs tracking-wider">{plan.name}</span>
                                                 <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-mono mt-0.5">{plan.id.slice(0, 8)}...</span>
                                          </div>

                                          <div className="flex items-center gap-3">
                                                 <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 text-sm font-bold">$</span>
                                                        <input
                                                               type="number"
                                                               value={prices[plan.id]}
                                                               onChange={(e) => setPrices({ ...prices, [plan.id]: parseInt(e.target.value) || 0 })}
                                                               className="bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl pl-6 pr-3 py-2 text-sm text-slate-900 dark:text-white w-28 focus:outline-none focus:border-emerald-500/50 transition-colors font-black tracking-tight"
                                                        />
                                                 </div>
                                                 <button
                                                        onClick={() => handleUpdate(plan.id)}
                                                        disabled={loadingId === plan.id || prices[plan.id] === plans.find(p => p.id === plan.id)?.price}
                                                        className="p-2.5 bg-emerald-500 text-white rounded-xl disabled:opacity-30 disabled:grayscale transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20"
                                                        title="Guardar Precio"
                                                 >
                                                        <Save size={16} />
                                                 </button>
                                          </div>
                                   </div>
                            ))}
                     </div>

                     <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                   <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">Live Database Link</span>
                            </div>
                            <button
                                   onClick={async () => {
                                          if (!confirm('¿Restablecer precios y características a los oficiales 2026?')) return
                                          const { seedOfficialPlans } = await import('@/actions/super-admin')
                                          const res = await seedOfficialPlans()
                                          if (res.success) alert(res.message)
                                          else alert("Error: " + res.error)
                                          router.refresh()
                                   }}
                                   className="text-[10px] uppercase font-black text-slate-400 hover:text-emerald-500 transition-colors tracking-widest bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-full"
                            >
                                   Restablecer Defaults
                            </button>
                     </div>
              </div>
       )
}
