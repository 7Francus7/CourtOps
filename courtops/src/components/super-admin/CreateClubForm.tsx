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
                            <label className="block text-xs font-bold text-white/60 mb-1 uppercase">Plan de Servicio (SaaS)</label>
                            <select
                                   name="platformPlanId"
                                   className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-brand-blue outline-none"
                            >
                                   <option value="">-- Seleccionar Plan --</option>
                                   {plans.map(plan => (
                                          <option key={plan.id} value={plan.id}>
                                                 {plan.name} (${plan.price}/mes {plan.setupFee ? `+ $${plan.setupFee} inicio` : ''})
                                          </option>
                                   ))}
                            </select>
                            <p className="text-[10px] text-zinc-500 mt-1">
                                   Selecciona un plan de la base de datos para asignar límites iniciales.
                            </p>
                     </div>

                     <div className="h-px bg-white/10 my-4"></div>

                     {/* Admin User Info */}
                     <div className="space-y-3">
                            <p className="text-xs text-brand-green uppercase font-bold tracking-widest mb-2">Datos del Dueño / Admin</p>
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
                            className="w-full mt-4 bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                     >
                            {loading ? 'Inicializando Sistema...' : '🚀 Crear SaaS Tenant'}
                     </button>
              </form >
       )
}
