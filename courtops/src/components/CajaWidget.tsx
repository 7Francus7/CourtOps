
import React, { useState } from 'react'
import { getCajaStats } from '@/actions/cash-register'
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
              refetchInterval: 30000,
              refetchOnWindowFocus: true
       })

       if (isLoading) return <div className="h-full bg-muted/50 dark:bg-white/[0.02] animate-pulse rounded-3xl" />

       if (!stats) return (
              <div className={cn(
                     "h-full flex flex-col justify-between relative group transition-all",
                     compact ? "p-0 border-none bg-transparent" : "p-5 rounded-3xl border border-border bg-card"
              )}>
                     <div className="flex justify-between items-start mb-4 relative z-10">
                            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Caja del día</span>
                            <div className="bg-muted px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border border-border text-muted-foreground">
                                   Offline
                            </div>
                     </div>
                     <div className="relative z-10">
                            <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Estado</div>
                            <h3 className="text-xl font-bold text-muted-foreground mb-2">Sin datos</h3>
                     </div>
              </div>
       )

       return (
              <>
                     <div className={cn(
                            "h-full flex flex-col justify-between relative group transition-all",
                            compact ? "p-0 border-none bg-transparent" : "p-5 rounded-3xl border border-border bg-card hover:border-muted-foreground/30"
                     )}>
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                   <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Caja del día</span>
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
                                   <div className="flex justify-between items-end mb-1">
                                          <div className="text-[10px] text-muted-foreground uppercase font-bold">Total del día</div>
                                          <div className="text-[9px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 rounded">Neto</div>
                                   </div>
                                   <h3 className="text-3xl font-black tracking-tight text-foreground mb-3">
                                          $ {(stats.totalGeneral || stats.total).toLocaleString('es-AR')}
                                   </h3>
                                   <div className="space-y-1.5">
                                          <div className="flex justify-between items-center text-[11px]">
                                                 <span className="text-muted-foreground flex items-center gap-1">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                                                        Efectivo
                                                 </span>
                                                 <span className="text-foreground font-bold">$ {stats.incomeCash.toLocaleString('es-AR')}</span>
                                          </div>
                                          <div className="flex justify-between items-center text-[11px]">
                                                 <span className="text-muted-foreground flex items-center gap-1">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                                                        Transferencia
                                                 </span>
                                                 <span className="text-foreground font-bold">$ {stats.incomeTransfer.toLocaleString('es-AR')}</span>
                                          </div>
                                          {stats.incomeMP > 0 && (
                                                 <div className="flex justify-between items-center text-[11px]">
                                                        <span className="text-muted-foreground flex items-center gap-1">
                                                               <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
                                                               MercadoPago
                                                        </span>
                                                        <span className="text-foreground font-bold">$ {stats.incomeMP.toLocaleString('es-AR')}</span>
                                                 </div>
                                          )}
                                          <div className="flex justify-between items-center text-[11px] pt-1 border-t border-border">
                                                 <span className="text-muted-foreground font-bold">Saldo en caja</span>
                                                 <span className="text-emerald-400 font-black">$ {stats.total.toLocaleString('es-AR')}</span>
                                          </div>
                                   </div>
                            </div>


                            {/* Action Button Overlay */}
                            <button
                                   onClick={() => setIsCloseModalOpen(true)}
                                   className="absolute bottom-4 right-4 z-20 w-8 h-8 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center text-secondary-foreground transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                            >
                                   <ArrowRight size={14} />
                            </button>
                     </div>

                     <div className="absolute bottom-4 left-4 z-20">
                            <button
                                   onClick={() => setIsMovementModalOpen(true)}
                                   className="w-8 h-8 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
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
