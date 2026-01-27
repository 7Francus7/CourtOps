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
                     <div className="flex justify-between items-center bg-[#0C0F14] p-8 rounded-3xl border border-[#27272a] shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#10B981]/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                            <div>
                                   <h3 className="text-lg font-black text-white uppercase tracking-tight">Planes de Membresía</h3>
                                   <p className="text-xs text-slate-500 font-medium">Configura los planes y descuentos para socios.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(true)} className="btn-primary">+ Nuevo Plan</button>
                     </div>

                     <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {plans.map((plan: any) => (
                                   <div key={plan.id} className="relative group bg-[#0C0F14] border border-[#27272a] p-8 rounded-3xl hover:border-[#10B981]/30 transition-all shadow-xl">
                                          <div className="flex justify-between items-start mb-6">
                                                 <div className="w-12 h-12 rounded-2xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981] text-2xl border border-[#10B981]/20">
                                                        💎
                                                 </div>
                                                 {plan.discountPercent > 0 && (
                                                        <span className="bg-[#10B981]/10 text-[#10B981] text-[10px] font-black px-3 py-1.5 rounded-xl border border-[#10B981]/20 uppercase tracking-widest">
                                                               -{plan.discountPercent}% OFF
                                                        </span>
                                                 )}
                                          </div>

                                          <h4 className="text-xl font-black text-white uppercase tracking-tight mb-1">{plan.name}</h4>
                                          <div className="text-3xl font-black text-[#10B981] mb-6 tracking-tighter">
                                                 ${plan.price}
                                                 <span className="text-[10px] font-bold text-slate-500 ml-2 uppercase tracking-widest">/ {plan.durationDays} días</span>
                                          </div>

                                          <div className="space-y-3 pt-6 border-t border-white/5">
                                                 <div className="flex justify-between items-center">
                                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Beneficio</span>
                                                        <span className="text-[10px] text-white font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">
                                                               {plan.discountPercent > 0 ? `${plan.discountPercent}% Descuento` : 'Sin cargos extra'}
                                                        </span>
                                                 </div>
                                          </div>
                                   </div>
                            ))}

                            {plans.length === 0 && (
                                   <div className="col-span-full py-16 text-center border-2 border-dashed border-[#27272a] rounded-3xl bg-white/[0.01]">
                                          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">No hay planes configurados aún.</p>
                                   </div>
                            )}
                     </div>

                     {/* Modal */}
                     {isModalOpen && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
                                   <div className="bg-[#0C0F14] border border-[#27272a] w-full max-w-lg rounded-3xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-300">
                                          <div className="p-6 border-b border-[#27272a] flex justify-between items-center bg-white/[0.02]">
                                                 <h3 className="text-sm font-black text-white uppercase tracking-[0.1em]">Nuevo Plan</h3>
                                                 <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-all p-2 hover:bg-white/5 rounded-lg active:scale-90">
                                                        <span className="text-xl">✕</span>
                                                 </button>
                                          </div>
                                          <form onSubmit={handleCreate} className="p-10 space-y-6">
                                                 <div className="space-y-2">
                                                        <label className="text-[10px] text-white/40 uppercase font-black tracking-widest block ml-1">Nombre del Plan</label>
                                                        <input
                                                               className="input-dark"
                                                               placeholder="Ej: Socio Oro"
                                                               value={formData.name}
                                                               onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                               required
                                                        />
                                                 </div>

                                                 <div className="grid grid-cols-2 gap-6">
                                                        <div className="space-y-2">
                                                               <label className="text-[10px] text-white/40 uppercase font-black tracking-widest block ml-1">Precio</label>
                                                               <input
                                                                      type="number"
                                                                      className="input-dark font-mono"
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
                                                                      className="input-dark font-mono"
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
                                                               className="input-dark font-mono text-[#10B981]"
                                                               placeholder="Ej: 20"
                                                               value={formData.discountPercent}
                                                               onChange={e => setFormData({ ...formData, discountPercent: e.target.value })}
                                                        />
                                                        <p className="text-[10px] text-slate-500 font-medium">Este descuento se aplicará automáticamente al reservar.</p>
                                                 </div>

                                                 <div className="pt-8 flex justify-end gap-4">
                                                        <button
                                                               type="button"
                                                               onClick={() => setIsModalOpen(false)}
                                                               className="px-6 py-3 rounded-xl font-black text-[10px] text-slate-500 uppercase tracking-widest hover:bg-white/5 transition-all"
                                                        >
                                                               CANCELAR
                                                        </button>
                                                        <button
                                                               type="submit"
                                                               disabled={isLoading}
                                                               className="btn-primary px-8"
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
