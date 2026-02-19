'use client'

import { createNewClub } from '@/actions/super-admin'
import { useRef, useState } from 'react'
import { Sparkles } from 'lucide-react'

type Plan = {
       id: string
       name: string
       price: number
       setupFee?: number
}

export default function CreateClubForm({ plans }: { plans: Plan[] }) {
       const formRef = useRef<HTMLFormElement>(null)
       const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
       const [loading, setLoading] = useState(false)
       const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

       async function handleSubmit(formData: FormData) {
              setLoading(true)
              setMessage(null)

              const res = await createNewClub(formData)

              setLoading(false)
              if (res.success) {
                     setMessage({ type: 'success', text: res.message || 'Club creado' })
                     formRef.current?.reset()
              } else {
                     setMessage({ type: 'error', text: res.error as string })
              }
       }

       return (
              <form ref={formRef} action={handleSubmit} className="space-y-4">

                     {/* Club Info */}
                     <div>
                            <label className="block text-xs font-black text-slate-500 dark:text-white/60 mb-2 uppercase tracking-widest">Nombre del Club</label>
                            <input
                                   name="clubName"
                                   type="text"
                                   required
                                   placeholder="Ej: Padel Center Córdoba"
                                   className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                            />
                     </div>


                     {/* Plan Selection */}
                     <div>
                            <div className="flex items-center justify-between mb-3">
                                   <label className="text-xs font-black text-slate-500 dark:text-white/60 uppercase tracking-widest">Plan de Servicio</label>

                                   {/* Billing Cycle Toggle */}
                                   <div className="flex bg-slate-100 dark:bg-black/40 p-1 rounded-xl border border-slate-200 dark:border-white/10">
                                          <button
                                                 type="button"
                                                 onClick={() => setBillingCycle('monthly')}
                                                 className={`text-[10px] uppercase font-black px-3 py-1.5 rounded-lg transition-all ${billingCycle === 'monthly'
                                                        ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm'
                                                        : 'text-slate-400 dark:text-zinc-500 hover:text-slate-600'
                                                        }`}
                                          >
                                                 Mensual
                                          </button>
                                          <button
                                                 type="button"
                                                 onClick={() => setBillingCycle('yearly')}
                                                 className={`text-[10px] uppercase font-black px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${billingCycle === 'yearly'
                                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                        : 'text-slate-400 dark:text-zinc-500 hover:text-slate-600'
                                                        }`}
                                          >
                                                 Anual <span className="text-[10px] bg-white/20 px-1 rounded ml-1">-20%</span>
                                          </button>
                                   </div>
                            </div>

                            <select
                                   name="platformPlanId"
                                   className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-all font-bold text-sm appearance-none"
                            >
                                   <option value="">-- Seleccionar Plan --</option>
                                   {plans.map(plan => {
                                          const basePrice = plan.price
                                          const isYearly = billingCycle === 'yearly'
                                          const finalPrice = isYearly ? basePrice * 0.8 : basePrice

                                          return (
                                                 <option key={plan.id} value={plan.id} className="text-black">
                                                        {plan.name} ({new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(finalPrice)} {isYearly ? 'x mes' : '/mes'})
                                                 </option>
                                          )
                                   })}
                            </select>
                            <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-2 flex justify-between items-center font-bold px-1">
                                   <span>Límites automáticos según plan</span>
                                   {billingCycle === 'yearly' && <span className="text-emerald-500 flex items-center gap-1"><Sparkles size={10} /> Ahorro anual aplicado</span>}
                            </p>

                            {/* Hidden Input to pass billing preference if backend supported it */}
                            <input type="hidden" name="billingCycle" value={billingCycle} />
                     </div>

                     <div className="h-px bg-slate-100 dark:bg-white/5 my-6"></div>

                     {/* Admin User Info */}
                     <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                   <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                   <p className="text-xs text-purple-600 dark:text-purple-400 uppercase font-black tracking-widest">Credenciales del Dueño</p>
                            </div>
                            <div>
                                   <label className="block text-[10px] font-black text-slate-400 dark:text-white/40 mb-1 uppercase">Nombre Completo</label>
                                   <input
                                          name="adminName"
                                          type="text"
                                          required
                                          placeholder="Ej: Martín Dueño"
                                          className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white focus:border-purple-500 outline-none transition-all text-sm"
                                   />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                   <div>
                                          <label className="block text-[10px] font-black text-slate-400 dark:text-white/40 mb-1 uppercase">Email Acceso</label>
                                          <input
                                                 name="adminEmail"
                                                 type="email"
                                                 required
                                                 placeholder="admin@nuevoclub.com"
                                                 className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white focus:border-purple-500 outline-none transition-all text-xs"
                                          />
                                   </div>
                                   <div>
                                          <label className="block text-[10px] font-black text-slate-400 dark:text-white/40 mb-1 uppercase">Password</label>
                                          <input
                                                 name="adminPassword"
                                                 type="text"
                                                 required
                                                 defaultValue="123456"
                                                 className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white focus:border-purple-500 outline-none transition-all font-mono text-xs"
                                          />
                                   </div>
                            </div>
                     </div>

                     {
                            message && (
                                   <div className={`p-4 rounded-xl text-xs font-black uppercase tracking-widest text-center mt-4 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                          {message.text}
                                   </div>
                            )
                     }

                     <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black uppercase text-xs tracking-[0.2em] py-4 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-2"
                     >
                            {loading ? (
                                   <>
                                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                          Desplegando...
                                   </>
                            ) : (
                                   <>
                                          🚀 Desplegar Nuevo Tenant
                                   </>
                            )}
                     </button>
              </form >
       )
}
