
import React, { useState } from 'react'
import { getCajaStats } from '@/actions/caja'
import { cn } from '@/lib/utils'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Lock, Unlock, ArrowRight, Plus } from 'lucide-react'
import CloseRegisterModal from './dashboard/CloseRegisterModal'
import MovementModal from './dashboard/MovementModal'

export default function CajaWidget({ compact = false }: { compact?: boolean }) {
       const queryClient = useQueryClient()
       const [isCloseModalOpen, setIsCloseModalOpen] = useState(false)
       const [isMovementModalOpen, setIsMovementModalOpen] = useState(false)

       const { data: stats, isLoading } = useQuery({
              queryKey: ['cajaStats'],
              queryFn: () => getCajaStats(),
              refetchInterval: 5000,
              refetchOnWindowFocus: true
       })

       if (isLoading) return <div className="h-full bg-white/[0.02] animate-pulse rounded-3xl" />

       if (!stats) return null

       return (
              <>
                     <div className={cn(
                            "h-full flex flex-col justify-between relative group transition-all",
                            compact ? "p-0 border-none bg-transparent" : "p-5 rounded-3xl border border-[#27272a] bg-[#0C0F14] hover:border-[#3f3f46]"
                     )}>
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                   <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Caja del día</span>
                                   <div className={cn(
                                          "px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1.5",
                                          stats.status === 'OPEN'
                                                 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                 : "bg-red-500/10 text-red-400 border-red-500/20"
                                   )}>
                                          {stats.status === 'OPEN' ? <Unlock size={10} /> : <Lock size={10} />}
                                          {stats.status === 'OPEN' ? 'Abierta' : 'Cerrada'}
                                   </div>
                            </div>

                            {/* Main Value */}
                            <div className="relative z-10">
                                   <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Saldo en caja</div>
                                   <h3 className="text-3xl font-black tracking-tight text-white mb-2">
                                          $ {stats.total.toLocaleString('es-AR')}
                                   </h3>
                                   <div className="space-y-1">
                                          <div className="flex justify-between items-center text-xs">
                                                 <span className="text-slate-500">Efectivo</span>
                                                 <span className="text-white">$ {stats.incomeCash.toLocaleString('es-AR')}</span>
                                          </div>
                                          <div className="flex justify-between items-center text-xs">
                                                 <span className="text-slate-500">Digital</span>
                                                 <span className="text-white">$ {stats.incomeTransfer.toLocaleString('es-AR')}</span>
                                          </div>
                                   </div>
                            </div>

                            {/* Action Button Overlay */}
                            <button
                                   onClick={() => setIsCloseModalOpen(true)}
                                   className="absolute bottom-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                            >
                                   <ArrowRight size={14} />
                            </button>
                     </div>

                     <div className="absolute bottom-4 left-4 z-20">
                            <button
                                   onClick={() => setIsMovementModalOpen(true)}
                                   className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                                   title="Registrar Movimiento"
                            >
                                   <Plus size={14} />
                            </button>
                     </div>

                     <CloseRegisterModal
                            isOpen={isCloseModalOpen}
                            onClose={() => setIsCloseModalOpen(false)}
                            initialStats={stats}
                            onSuccess={() => queryClient.invalidateQueries({ queryKey: ['cajaStats'] })}
                     />

                     <MovementModal
                            isOpen={isMovementModalOpen}
                            onClose={() => setIsMovementModalOpen(false)}
                            onSuccess={() => queryClient.invalidateQueries({ queryKey: ['cajaStats'] })}
                     />
              </>
       )
}
