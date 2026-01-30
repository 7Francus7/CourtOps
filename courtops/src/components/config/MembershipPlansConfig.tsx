'use client'

import React, { useState } from 'react'
import { createMembershipPlan, updateMembershipPlan, deleteMembershipPlan } from '@/actions/memberships'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Trash2, Edit } from 'lucide-react'

type Props = {
       plans: any[]
}

export default function MembershipPlansConfig({ plans }: Props) {
       const router = useRouter()
       const [isModalOpen, setIsModalOpen] = useState(false)
       const [isLoading, setIsLoading] = useState(false)
       const [editingPlan, setEditingPlan] = useState<any | null>(null)

       const [formData, setFormData] = useState({
              name: '',
              price: '',
              discountPercent: '',
              durationDays: '30',
              description: ''
       })

       function openModal(plan: any = null) {
              if (plan) {
                     setEditingPlan(plan)
                     setFormData({
                            name: plan.name,
                            price: String(plan.price),
                            discountPercent: String(plan.discountPercent || 0),
                            durationDays: String(plan.durationDays || 30),
                            description: plan.description || ''
                     })
              } else {
                     setEditingPlan(null)
                     setFormData({
                            name: '',
                            price: '',
                            discountPercent: '',
                            durationDays: '30',
                            description: ''
                     })
              }
              setIsModalOpen(true)
       }

       async function handleSubmit(e: React.FormEvent) {
              e.preventDefault()
              setIsLoading(true)

              const payload = {
                     name: formData.name,
                     price: Number(formData.price),
                     discountPercent: Number(formData.discountPercent),
                     durationDays: Number(formData.durationDays),
                     description: formData.description
              }

              let res
              if (editingPlan) {
                     res = await updateMembershipPlan(editingPlan.id, payload)
              } else {
                     res = await createMembershipPlan(payload)
              }

              setIsLoading(false)

              if (res.success) {
                     setIsModalOpen(false)
                     router.refresh()
              } else {
                     alert("Error: " + res.error)
              }
       }

       async function handleDelete(id: string) {
              if (!confirm("¿Seguro que quieres eliminar este plan?")) return
              const res = await deleteMembershipPlan(id)
              if (res.success) {
                     router.refresh()
              } else {
                     alert("Error: " + res.error)
              }
       }

       return (
              <div className="space-y-6">
                     <div className="flex justify-between items-center bg-card p-8 rounded-3xl border border-border shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                            <div>
                                   <h3 className="text-lg font-black text-foreground uppercase tracking-tight">Planes de Membresía</h3>
                                   <p className="text-xs text-muted-foreground font-medium">Configura los planes y descuentos para socios.</p>
                            </div>
                            <button onClick={() => openModal()} className="btn-primary">+ Nuevo Plan</button>
                     </div>

                     <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {plans.map((plan: any) => (
                                   <div key={plan.id} className="relative group bg-card border border-border p-8 rounded-3xl hover:border-emerald-500/30 transition-all shadow-xl">
                                          <div className="flex justify-between items-start mb-6">
                                                 <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-2xl border border-emerald-500/20">
                                                        💎
                                                 </div>
                                                 {plan.discountPercent > 0 && (
                                                        <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-3 py-1.5 rounded-xl border border-emerald-500/20 uppercase tracking-widest">
                                                               -{plan.discountPercent}% OFF
                                                        </span>
                                                 )}
                                          </div>

                                          <h4 className="text-xl font-black text-foreground uppercase tracking-tight mb-1">{plan.name}</h4>
                                          <div className="text-3xl font-black text-emerald-500 mb-6 tracking-tighter">
                                                 ${plan.price}
                                                 <span className="text-[10px] font-bold text-muted-foreground ml-2 uppercase tracking-widest">/ {plan.durationDays} días</span>
                                          </div>

                                          <div className="space-y-3 pt-6 border-t border-border">
                                                 <div className="flex justify-between items-center">
                                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Beneficio</span>
                                                        <span className="text-[10px] text-foreground font-black uppercase tracking-widest bg-muted px-2 py-1 rounded-md">
                                                               {plan.discountPercent > 0 ? `${plan.discountPercent}% Descuento` : 'Sin cargos extra'}
                                                        </span>
                                                 </div>
                                          </div>

                                          {/* Actions */}
                                          <div className="flex justify-end gap-2 mt-4 ">
                                                 <button onClick={() => openModal(plan)} className="p-2 bg-muted hover:bg-muted/80 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                                                        <Edit size={14} />
                                                 </button>
                                                 <button onClick={() => handleDelete(plan.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-500 hover:text-red-400 transition-colors">
                                                        <Trash2 size={14} />
                                                 </button>
                                          </div>
                                   </div>
                            ))}

                            {plans.length === 0 && (
                                   <div className="col-span-full py-16 text-center border-2 border-dashed border-border rounded-3xl bg-muted/30">
                                          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">No hay planes configurados aún.</p>
                                   </div>
                            )}
                     </div>

                     {/* Modal */}
                     {isModalOpen && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                                   <div className="bg-card border border-border w-full max-lg rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-300">
                                          <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                                                 <h3 className="text-sm font-black text-foreground uppercase tracking-[0.1em]">{editingPlan ? 'Editar Plan' : 'Nuevo Plan'}</h3>
                                                 <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-all p-2 hover:bg-muted/50 rounded-lg active:scale-90">
                                                        <span className="text-xl">✕</span>
                                                 </button>
                                          </div>
                                          <form onSubmit={handleSubmit} className="p-10 space-y-6">
                                                 <div className="space-y-2">
                                                        <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest block ml-1">Nombre del Plan</label>
                                                        <input
                                                               className="input-theme"
                                                               placeholder="Ej: Socio Oro"
                                                               value={formData.name}
                                                               onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                               required
                                                        />
                                                 </div>

                                                 <div className="grid grid-cols-2 gap-6">
                                                        <div className="space-y-2">
                                                               <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest block ml-1">Precio</label>
                                                               <input
                                                                      type="number"
                                                                      className="input-theme font-mono"
                                                                      placeholder="0"
                                                                      value={formData.price}
                                                                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                                                                      required
                                                               />
                                                        </div>
                                                        <div className="space-y-2">
                                                               <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest block ml-1">Duración (Días)</label>
                                                               <input
                                                                      type="number"
                                                                      className="input-theme font-mono"
                                                                      placeholder="30"
                                                                      value={formData.durationDays}
                                                                      onChange={e => setFormData({ ...formData, durationDays: e.target.value })}
                                                                      required
                                                               />
                                                        </div>
                                                 </div>

                                                 <div className="space-y-2">
                                                        <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest block ml-1">% Descuento en Turnos</label>
                                                        <input
                                                               type="number"
                                                               max="100"
                                                               min="0"
                                                               className="input-theme font-mono text-emerald-500"
                                                               placeholder="Ej: 20"
                                                               value={formData.discountPercent}
                                                               onChange={e => setFormData({ ...formData, discountPercent: e.target.value })}
                                                        />
                                                        <p className="text-[10px] text-muted-foreground font-medium">Este descuento se aplicará automáticamente al reservar.</p>
                                                 </div>

                                                 <div className="pt-8 flex justify-end gap-4">
                                                        <button
                                                               type="button"
                                                               onClick={() => setIsModalOpen(false)}
                                                               className="px-6 py-3 rounded-xl font-black text-[10px] text-muted-foreground uppercase tracking-widest hover:bg-muted transition-all"
                                                        >
                                                               CANCELAR
                                                        </button>
                                                        <button
                                                               type="submit"
                                                               disabled={isLoading}
                                                               className="btn-primary px-8"
                                                        >
                                                               {isLoading ? 'GUARDANDO...' : (editingPlan ? 'ACTUALIZAR' : 'CREAR PLAN')}
                                                        </button>
                                                 </div>
                                          </form>
                                   </div>
                            </div>
                     )}
              </div>
       )
}
