'use client'

import React, { useEffect, useState } from 'react'
import { AlertTriangle, User, ChevronRight, MessageCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Debtor {
       name: string
       phone: string
       total: number
       count: number
}

interface DebtData {
       totalAmount: number
       totalCount: number
       topDebtors: Debtor[]
       recentDebts: {
              id: number
              name: string
              phone: string
              amount: number
              date: string
              court: string
       }[]
}

export default function DebtsWidget() {
       const [data, setData] = useState<DebtData | null>(null)
       const [loading, setLoading] = useState(true)

       useEffect(() => {
              ; (async () => {
                     try {
                            const res = await fetch('/api/dashboard/debts')
                            if (!res.ok) throw new Error('Failed to fetch debts')
                            const body = await res.json()
                            if (body.success && body.data) setData(body.data)
                     } catch (err) {
                            console.error('[DEBTS WIDGET]', err)
                     } finally {
                            setLoading(false)
                     }
              })()
       }, [])

       if (loading) {
              return (
                     <div className="h-full bg-gradient-to-br from-red-500/5 via-card to-card rounded-3xl border border-red-500/10 p-6 flex items-center justify-center">
                            <Loader2 className="animate-spin text-red-400" size={24} />
                     </div>
              )
       }

       if (!data || data.totalCount === 0) {
              return (
                     <div className="h-full bg-gradient-to-br from-emerald-500/5 via-card to-card rounded-3xl border border-emerald-500/10 p-6 flex flex-col items-center justify-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                                   <span className="text-2xl">✅</span>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Sin deudas pendientes</p>
                            <p className="text-xs text-muted-foreground font-medium">¡Todas las canchas están al día!</p>
                     </div>
              )
       }

       return (
              <div className="relative overflow-hidden bg-gradient-to-br from-red-500/10 via-card to-card p-6 flex flex-col rounded-3xl border border-red-500/10 shadow-lg group hover:shadow-red-500/10 transition-all duration-500">
                     {/* Header */}
                     <div className="flex justify-between items-start mb-4">
                            <div>
                                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 mb-1 flex items-center gap-1.5">
                                          <AlertTriangle size={12} className="text-red-500" />
                                          Deudas Pendientes
                                   </p>
                                   <h3 className="text-3xl font-black text-foreground tracking-tighter">
                                          ${data.totalAmount.toLocaleString()}
                                   </h3>
                            </div>
                            <div className="bg-red-500/10 p-2.5 rounded-xl text-red-500 group-hover:scale-110 transition-transform duration-300">
                                   <AlertTriangle size={20} />
                            </div>
                     </div>

                     <p className="text-[10px] text-muted-foreground font-bold mb-4">
                            {data.totalCount} reserva{data.totalCount !== 1 ? 's' : ''} sin pagar
                     </p>

                     {/* Top Debtors */}
                     <div className="flex-1 space-y-2">
                            {data.topDebtors.map((debtor, idx) => (
                                   <div
                                          key={idx}
                                          className="flex items-center justify-between p-2.5 bg-background/50 backdrop-blur-sm rounded-xl border border-border/50 hover:border-red-500/20 transition-all group/item"
                                   >
                                          <div className="flex items-center gap-3 min-w-0">
                                                 <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 text-xs font-black shrink-0">
                                                        {debtor.name[0]?.toUpperCase() || '?'}
                                                 </div>
                                                 <div className="min-w-0">
                                                        <p className="text-xs font-bold text-foreground truncate">{debtor.name}</p>
                                                        <p className="text-[10px] text-muted-foreground font-medium">{debtor.count} turno{debtor.count !== 1 ? 's' : ''}</p>
                                                 </div>
                                          </div>
                                          <div className="flex items-center gap-2 shrink-0">
                                                 <span className="text-sm font-black text-red-500">${debtor.total.toLocaleString()}</span>
                                                 {debtor.phone && (
                                                        <a
                                                               href={`https://wa.me/${debtor.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${debtor.name.split(' ')[0]}, te contactamos por una deuda pendiente de $${debtor.total.toLocaleString()} en turnos. ¿Podemos coordinar el pago?`)}`}
                                                               target="_blank"
                                                               rel="noopener noreferrer"
                                                               className="w-7 h-7 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 flex items-center justify-center text-[#25D366] opacity-0 group-hover/item:opacity-100 transition-all"
                                                               title="Reclamar por WhatsApp"
                                                        >
                                                               <MessageCircle size={14} />
                                                        </a>
                                                 )}
                                          </div>
                                   </div>
                            ))}
                     </div>
              </div>
       )
}
