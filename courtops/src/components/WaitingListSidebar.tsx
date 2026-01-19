'use client'

import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { addToWaitingList, getWaitingList, resolveWaitingList } from '@/actions/waitingList'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type WaitingItem = {
       id: number
       name: string
       phone: string
       startTime?: string // retrieved as Date actually
       endTime?: string
       notes?: string
       court?: { name: string }
       createdAt: string
}

export default function WaitingListSidebar({
       date,
       isOpen,
       onClose
}: {
       date: Date
       isOpen: boolean
       onClose: () => void
}) {
       const [list, setList] = useState<WaitingItem[]>([])
       const [isLoading, setIsLoading] = useState(false)
       const [formData, setFormData] = useState({ name: '', phone: '', startTime: '', notes: '' })
       const [isSubmitting, setIsSubmitting] = useState(false)

       async function fetchList() {
              setIsLoading(true)
              const res = await getWaitingList(date.toISOString())
              if (res.success) {
                     setList(res.list as any[])
              }
              setIsLoading(false)
       }

       useEffect(() => {
              if (isOpen) fetchList()
       }, [isOpen, date])

       async function handleSubmit(e: React.FormEvent) {
              e.preventDefault()
              setIsSubmitting(true)

              // Parse time if provided
              let startD = undefined
              if (formData.startTime) {
                     const [h, m] = formData.startTime.split(':').map(Number)
                     startD = new Date(date)
                     startD.setHours(h, m, 0, 0)
              }

              const res = await addToWaitingList({
                     date: date,
                     startTime: startD,
                     clientName: formData.name,
                     clientPhone: formData.phone,
                     notes: formData.notes
              })

              if (res.success) {
                     toast.success('Agregado a lista de espera')
                     setFormData({ name: '', phone: '', startTime: '', notes: '' })
                     fetchList()
              } else {
                     toast.error(res.error || 'Error')
              }
              setIsSubmitting(false)
       }

       async function handleRemove(id: number) {
              if (!confirm('¿Borrar de la lista?')) return
              await resolveWaitingList(id, 'DELETE')
              fetchList()
              toast.success('Eliminado')
       }

       return (
              <>
                     {/* Backdrop */}
                     {isOpen && <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />}

                     {/* Sidebar */}
                     <div className={cn(
                            "fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-bg-surface border-l border-white/10 shadow-2xl transition-transform duration-300 transform flex flex-col",
                            isOpen ? "translate-x-0" : "translate-x-full"
                     )}>
                            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-bg-dark">
                                   <div>
                                          <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                                 ⏳ Lista de Espera
                                          </h2>
                                          <p className="text-xs text-white/40 font-mono mt-1 uppercase tracking-wider">
                                                 {format(date, "EEEE d 'de' MMMM", { locale: es })}
                                          </p>
                                   </div>
                                   <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors" aria-label="Cerrar lista de espera">
                                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                   </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                                   {/* Add Form */}
                                   <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                          <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-4">Nueva Solicitud</h3>
                                          <form onSubmit={handleSubmit} className="space-y-3">
                                                 <input
                                                        required
                                                        placeholder="Nombre Cliente"
                                                        className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-white/20 focus:border-brand-blue outline-none"
                                                        value={formData.name}
                                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                 />
                                                 <div className="flex gap-3">
                                                        <input
                                                               required
                                                               placeholder="Teléfono"
                                                               className="flex-1 bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-white/20 focus:border-brand-blue outline-none"
                                                               value={formData.phone}
                                                               onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                        />
                                                        <input
                                                               type="time"
                                                               className="w-24 bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-white/20 focus:border-brand-blue outline-none"
                                                               value={formData.startTime}
                                                               onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                                        />
                                                 </div>
                                                 <textarea
                                                        placeholder="Notas (Prefiere Cancha 1, etc)"
                                                        className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-white/20 focus:border-brand-blue outline-none h-20 resize-none"
                                                        value={formData.notes}
                                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                                 />
                                                 <button
                                                        disabled={isSubmitting}
                                                        type="submit"
                                                        className="w-full bg-brand-blue text-white font-bold py-3 rounded-lg text-xs uppercase tracking-widest hover:bg-brand-blue/90 transition-colors disabled:opacity-50"
                                                 >
                                                        {isSubmitting ? 'Guardando...' : 'Agregar a Lista'}
                                                 </button>
                                          </form>
                                   </div>

                                   {/* List */}
                                   <div>
                                          <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-4 flex justify-between items-center">
                                                 En Espera <span className="bg-white/10 text-white px-2 py-0.5 rounded-full text-[10px]">{list.length}</span>
                                          </h3>

                                          {isLoading ? (
                                                 <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white/20" /></div>
                                          ) : list.length === 0 ? (
                                                 <div className="text-center py-8 text-white/20 text-sm italic">No hay nadie en espera hoy.</div>
                                          ) : (
                                                 <div className="space-y-3">
                                                        {list.map(item => (
                                                               <div key={item.id} className="bg-[#111418] border border-white/5 p-4 rounded-xl flex justify-between items-start group hover:border-white/10 transition-colors">
                                                                      <div>
                                                                             <div className="font-bold text-white text-sm">{item.name}</div>
                                                                             <div className="text-xs text-white/40 mt-0.5 font-mono">{item.phone}</div>
                                                                             {item.startTime && (
                                                                                    <div className="mt-2 inline-flex items-center gap-1.5 bg-brand-blue/10 text-brand-blue text-[10px] font-bold px-2 py-1 rounded">
                                                                                           ⏰ Pref: {format(new Date(item.startTime), 'HH:mm')} aprox
                                                                                    </div>
                                                                             )}
                                                                             {item.notes && <div className="mt-2 text-[10px] text-white/30 italic">"{item.notes}"</div>}
                                                                             <div className="mt-2 text-[9px] text-white/10">Solicitado: {format(new Date(item.createdAt), 'HH:mm')}</div>
                                                                      </div>
                                                                      <button
                                                                             onClick={() => handleRemove(item.id)}
                                                                             className="text-white/20 hover:text-red-400 transition-colors p-1"
                                                                             title="Eliminar"
                                                                             aria-label="Eliminar de lista de espera"
                                                                      >
                                                                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                                                                      </button>
                                                               </div>
                                                        ))}
                                                 </div>
                                          )}
                                   </div>
                            </div>
                     </div>
              </>
       )
}
