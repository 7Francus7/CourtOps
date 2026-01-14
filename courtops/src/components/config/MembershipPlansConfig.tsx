'use client'

import React, { useState } from 'react'
import { createMembershipPlan } from '@/actions/memberships'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

type Props = {
       plans: any[]
}

export default function MembershipPlansConfig({ plans }: Props) {
       const router = useRouter()
       const [isModalOpen, setIsModalOpen] = useState(false)
       const [isLoading, setIsLoading] = useState(false)

       const [formData, setFormData] = useState({
              name: '',
              price: '',
              discountPercent: '',
              durationDays: '30',
              description: ''
       })

       async function handleCreate(e: React.FormEvent) {
              e.preventDefault()
              setIsLoading(true)

              const res = await createMembershipPlan({
                     name: formData.name,
                     price: Number(formData.price),
                     discountPercent: Number(formData.discountPercent),
                     durationDays: Number(formData.durationDays),
                     description: formData.description
              })

              setIsLoading(false)

              if (res.success) {
                     setIsModalOpen(false)
                     setFormData({ name: '', price: '', discountPercent: '', durationDays: '30', description: '' })
                     router.refresh()
              } else {
                     alert("Error: " + res.error)
              }
       }

       return (
              <div className="space-y-6">
                     <div className="flex justify-between items-center bg-bg-card p-6 rounded-2xl border border-white/5">
                            <div>
                                   <h3 className="text-sm font-bold text-white mb-1">Planes de Membresía</h3>
                                   <p className="text-xs text-text-grey">Configura los planes y descuentos para socios.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(true)} className="btn-primary text-sm px-4 py-2">+ Nuevo Plan</button>
                     </div>

                     <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {plans.map((plan: any) => (
                                   <div key={plan.id} className="relative group bg-bg-card border border-white/5 p-6 rounded-2xl hover:border-brand-blue/30 transition-all">
                                          <div className="flex justify-between items-start mb-4">
                                                 <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue text-lg">
                                                        💎
                                                 </div>
                                                 {plan.discountPercent > 0 && (
                                                        <span className="bg-green-500/10 text-green-500 text-[10px] font-black px-2 py-1 rounded-full border border-green-500/20">
                                                               -{plan.discountPercent}% OFF
                                                        </span>
                                                 )}
                                          </div>

                                          <h4 className="text-lg font-black text-white mb-1">{plan.name}</h4>
                                          <div className="text-2xl font-black text-brand-blue mb-4">
                                                 ${plan.price}
                                                 <span className="text-sm font-medium text-slate-500 ml-1">/ {plan.durationDays} días</span>
                                          </div>

                                          <div className="space-y-2 pt-4 border-t border-white/5">
                                                 <div className="flex justify-between text-xs">
                                                        <span className="text-slate-500">Beneficio</span>
                                                        <span className="text-white font-bold">
                                                               {plan.discountPercent > 0 ? `${plan.discountPercent}% Descuento en Turnos` : 'Sin descuentos extra'}
                                                        </span>
                                                 </div>
                                          </div>
                                   </div>
                            ))}

                            {plans.length === 0 && (
                                   <div className="col-span-full py-12 text-center border-2 border-dashed border-white/5 rounded-2xl">
                                          <p className="text-slate-500 text-sm">No hay planes configurados aún.</p>
                                   </div>
                            )}
                     </div>

                     {/* Modal */}
                     {isModalOpen && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                                   <div className="bg-[#111418] border border-white/10 w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                                          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                                                 <h3 className="text-xl font-black text-white uppercase tracking-tighter">Nuevo Plan</h3>
                                                 <button onClick={() => setIsModalOpen(false)} className="text-white/20 hover:text-white transition-colors text-2xl">✕</button>
                                          </div>
                                          <form onSubmit={handleCreate} className="p-8 space-y-4">
                                                 <div className="space-y-2">
                                                        <label className="text-[10px] text-white/40 uppercase font-black tracking-widest block ml-1">Nombre del Plan</label>
                                                        <input
                                                               className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-bold outline-none focus:border-brand-blue"
                                                               placeholder="Ej: Socio Oro"
                                                               value={formData.name}
                                                               onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                               required
                                                        />
                                                 </div>

                                                 <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                               <label className="text-[10px] text-white/40 uppercase font-black tracking-widest block ml-1">Precio</label>
                                                               <input
                                                                      type="number"
                                                                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-bold outline-none focus:border-brand-blue"
                                                                      placeholder="0"
                                                                      value={formData.price}
                                                                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                                                                      required
                                                               />
                                                        </div>
                                                        <div className="space-y-2">
                                                               <label className="text-[10px] text-white/40 uppercase font-black tracking-widest block ml-1">Duración (Días)</label>
                                                               <input
                                                                      type="number"
                                                                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-bold outline-none focus:border-brand-blue"
                                                                      placeholder="30"
                                                                      value={formData.durationDays}
                                                                      onChange={e => setFormData({ ...formData, durationDays: e.target.value })}
                                                                      required
                                                               />
                                                        </div>
                                                 </div>

                                                 <div className="space-y-2">
                                                        <label className="text-[10px] text-white/40 uppercase font-black tracking-widest block ml-1">% Descuento en Turnos</label>
                                                        <input
                                                               type="number"
                                                               max="100"
                                                               min="0"
                                                               className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-bold outline-none focus:border-brand-blue"
                                                               placeholder="Ej: 20"
                                                               value={formData.discountPercent}
                                                               onChange={e => setFormData({ ...formData, discountPercent: e.target.value })}
                                                        />
                                                        <p className="text-[10px] text-slate-500">Si se configura un % de descuento, este aplicará sobre el precio base de las canchas.</p>
                                                 </div>

                                                 <div className="pt-4 flex justify-end gap-3">
                                                        <button
                                                               type="button"
                                                               onClick={() => setIsModalOpen(false)}
                                                               className="px-4 py-3 rounded-xl font-bold text-xs text-white/50 hover:bg-white/5 transition-all"
                                                        >
                                                               CANCELAR
                                                        </button>
                                                        <button
                                                               type="submit"
                                                               disabled={isLoading}
                                                               className="px-6 py-3 bg-brand-blue hover:bg-blue-600 rounded-xl text-white font-black text-xs tracking-widest uppercase transition-all shadow-lg shadow-blue-500/20"
                                                        >
                                                               {isLoading ? 'CREANDO...' : 'CREAR PLAN'}
                                                        </button>
                                                 </div>
                                          </form>
                                   </div>
                            </div>
                     )}
              </div>
       )
}
