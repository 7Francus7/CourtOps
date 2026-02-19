'use client'

import { createNewClub } from '@/actions/super-admin'
import { useRef, useState } from 'react'

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
                            <label className="block text-xs font-bold text-white/60 mb-1 uppercase">Nombre del Club</label>
                            <input
                                   name="clubName"
                                   type="text"
                                   required
                                   placeholder="Ej: Padel Center Córdoba"
                                   className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-brand-blue outline-none"
                            />
                     </div>


                     {/* Plan Selection */}
                     <div>
                            <div className="flex items-center justify-between mb-2">
                                   <label className="text-xs font-bold text-white/60 uppercase">Plan de Servicio (SaaS)</label>

                                   {/* Billing Cycle Toggle */}
                                   <div className="flex bg-black/40 p-1 rounded-lg border border-white/10">
                                          <button
                                                 type="button"
                                                 onClick={() => setBillingCycle('monthly')}
                                                 className={`text-[10px] uppercase font-bold px-3 py-1 rounded transition-all ${billingCycle === 'monthly'
                                                               ? 'bg-zinc-700 text-white shadow-sm'
                                                               : 'text-zinc-500 hover:text-zinc-300'
                                                        }`}
                                          >
                                                 Mensual
                                          </button>
                                          <button
                                                 type="button"
                                                 onClick={() => setBillingCycle('yearly')}
                                                 className={`text-[10px] uppercase font-bold px-3 py-1 rounded transition-all flex items-center gap-1 ${billingCycle === 'yearly'
                                                               ? 'bg-emerald-600/20 text-emerald-400 shadow-sm ring-1 ring-emerald-500/50'
                                                               : 'text-zinc-500 hover:text-zinc-300'
                                                        }`}
                                          >
                                                 Anual <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1 rounded ml-1">-20%</span>
                                          </button>
                                   </div>
                            </div>

                            <select
                                   name="platformPlanId"
                                   className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-brand-blue outline-none"
                            >
                                   <option value="">-- Seleccionar Plan --</option>
                                   {plans.map(plan => {
                                          const basePrice = plan.price
                                          const isYearly = billingCycle === 'yearly'
                                          const finalPrice = isYearly ? basePrice * 0.8 : basePrice

                                          return (
                                                 <option key={plan.id} value={plan.id}>
                                                        {plan.name} ({new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(finalPrice)}/mes {isYearly ? 'x 12' : ''})
                                                        {isYearly ? ' - Ahorro 20%' : ''}
                                                 </option>
                                          )
                                   })}
                            </select>
                            <p className="text-[10px] text-zinc-500 mt-1 flex justify-between items-center">
                                   <span>Selecciona un plan para asignar límites.</span>
                                   {billingCycle === 'yearly' && <span className="text-emerald-500 font-bold">Ahorro anual aplicado</span>}
                            </p>

                            {/* Hidden Input to pass billing preference if backend supported it */}
                            <input type="hidden" name="billingCycle" value={billingCycle} />
                     </div>

                     <div className="h-px bg-white/10 my-4"></div>

                     {/* Admin User Info */}
                     <div className="space-y-3">
                            <p className="text-xs text-amber-500 uppercase font-black tracking-widest mb-2">Datos del Dueño / Admin</p>
                            <div>
                                   <label className="block text-xs font-bold text-white/60 mb-1">Nombre Encargado</label>
                                   <input
                                          name="adminName"
                                          type="text"
                                          required
                                          placeholder="Ej: Martín Dueño"
                                          className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-brand-blue outline-none"
                                   />
                            </div>
                            <div>
                                   <label className="block text-xs font-bold text-white/60 mb-1">Email (Usuario)</label>
                                   <input
                                          name="adminEmail"
                                          type="email"
                                          required
                                          placeholder="admin@nuevoclub.com"
                                          className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-brand-blue outline-none"
                                   />
                            </div>
                            <div>
                                   <label className="block text-xs font-bold text-white/60 mb-1">Contraseña Inicial</label>
                                   <input
                                          name="adminPassword"
                                          type="text"
                                          required
                                          defaultValue="123456"
                                          className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-brand-blue outline-none font-bold"
                                   />
                            </div>
                     </div>

                     {
                            message && (
                                   <div className={`p-3 rounded-lg text-sm font-bold ${message.type === 'success' ? 'bg-brand-green/20 text-brand-green' : 'bg-red-500/20 text-red-500'}`}>
                                          {message.text}
                                   </div>
                            )
                     }

                     <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-black font-black uppercase text-xs tracking-widest py-3 rounded-lg transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] active:scale-95"
                     >
                            {loading ? 'Inicializando Sistema...' : '🚀 Desplegar Nuevo Tenant'}
                     </button>
              </form >
       )
}
