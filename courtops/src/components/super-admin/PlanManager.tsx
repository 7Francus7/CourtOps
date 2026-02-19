
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
              <div className="bg-zinc-900 border border-amber-500/20 rounded-xl p-6 shadow-2xl overflow-hidden relative">
                     {/* Background Glow */}
                     <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 blur-[100px] pointer-events-none" />

                     <div className="flex items-center justify-between mb-6">
                            <div>
                                   <h3 className="text-xl font-bold text-amber-500 flex items-center gap-2">
                                          <Settings2 className="w-5 h-5" />
                                          Gestor de Planes
                                   </h3>
                                   <p className="text-xs text-zinc-500 mt-1 uppercase tracking-tighter font-bold">Configuración de Precios Globales</p>
                            </div>
                     </div>

                     <div className="space-y-4">
                            {plans.map(plan => (
                                   <div key={plan.id} className="flex items-center justify-between bg-black/40 border border-white/5 p-4 rounded-lg group hover:border-amber-500/30 transition-all">
                                          <div className="flex flex-col">
                                                 <span className="text-white font-black uppercase text-sm">{plan.name}</span>
                                                 <span className="text-[10px] text-zinc-500 font-mono">{plan.id}</span>
                                          </div>

                                          <div className="flex items-center gap-3">
                                                 <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
                                                        <input
                                                               type="number"
                                                               value={prices[plan.id]}
                                                               onChange={(e) => setPrices({ ...prices, [plan.id]: parseInt(e.target.value) || 0 })}
                                                               className="bg-black border border-white/10 rounded-lg pl-6 pr-3 py-2 text-sm text-white w-32 focus:outline-none focus:border-amber-500/50 transition-colors font-bold"
                                                        />
                                                 </div>
                                                 <button
                                                        onClick={() => handleUpdate(plan.id)}
                                                        disabled={loadingId === plan.id || prices[plan.id] === plans.find(p => p.id === plan.id)?.price}
                                                        className="p-2.5 bg-amber-500 text-black rounded-lg disabled:opacity-30 disabled:grayscale transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                                                        title="Guardar Precio"
                                                 >
                                                        <Save size={18} />
                                                 </button>
                                          </div>
                                   </div>
                            ))}
                     </div>

                     <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-zinc-600">
                            <div className="flex items-center gap-3">
                                   <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                                   <span className="text-[10px] font-bold uppercase tracking-widest">Sincronizado con base de datos</span>
                            </div>
                            <button
                                   onClick={async () => {
                                          if (!confirm('¿Restablecer precios y características a los oficiales 2024?')) return
                                          const { seedOfficialPlans } = await import('@/actions/super-admin')
                                          const res = await seedOfficialPlans()
                                          if (res.success) alert(res.message)
                                          else alert("Error: " + res.error)
                                          router.refresh()
                                   }}
                                   className="text-[10px] uppercase font-bold text-amber-500/50 hover:text-amber-500 transition-colors"
                            >
                                   Restablecer Defaults
                            </button>
                     </div>
              </div>
       )
}
