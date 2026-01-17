
import React, { useState } from 'react'
import { getCajaStats } from '@/actions/caja'
import { cn } from '@/lib/utils'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import CloseRegisterModal from './dashboard/CloseRegisterModal'

export default function CajaWidget() {
       const queryClient = useQueryClient()
       const [isCloseModalOpen, setIsCloseModalOpen] = useState(false)

       const { data: stats, isLoading } = useQuery({
              queryKey: ['cajaStats'],
              queryFn: () => getCajaStats(),
              refetchInterval: 5000,
              refetchOnWindowFocus: true
       })

       if (isLoading) return <div className="h-40 bg-white/5 rounded-3xl animate-pulse"></div>

       if (!stats) return null

       return (
              <>
                     <div
                            onClick={() => setIsCloseModalOpen(true)}
                            className="bg-card-dark rounded-2xl border border-white/5 p-4 cursor-pointer hover:bg-white/5 transition-all group shadow-sm"
                     >
                            <div className="flex justify-between items-start mb-4">
                                   <div>
                                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Caja del día</p>
                                          <h4 className="text-2xl font-bold text-white mt-1">$ {stats.total.toLocaleString('es-AR')}</h4>
                                   </div>
                                   <span className={cn(
                                          "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                          stats.status === 'OPEN'
                                                 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                 : "bg-red-500/10 text-red-500 border-red-500/20"
                                   )}>
                                          <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", stats.status === 'OPEN' ? "bg-emerald-500" : "bg-red-500")}></span>
                                          {stats.status === 'OPEN' ? 'Abierta' : 'Cerrada'}
                                   </span>
                            </div>

                            <div className="space-y-2 mb-3">
                                   <div className="flex justify-between text-xs">
                                          <span className="text-muted-foreground">Efectivo</span>
                                          <span className="font-semibold text-white">$ {stats.incomeCash.toLocaleString('es-AR')}</span>
                                   </div>
                                   <div className="flex justify-between text-xs">
                                          <span className="text-muted-foreground">Digital</span>
                                          <span className="font-semibold text-white">$ {stats.incomeTransfer.toLocaleString('es-AR')}</span>
                                   </div>
                                   {stats.expenses > 0 && (
                                          <div className="flex justify-between text-xs text-rose-400">
                                                 <span className="font-medium">Gastos</span>
                                                 <span className="font-semibold">- $ {stats.expenses.toLocaleString('es-AR')}</span>
                                          </div>
                                   )}
                            </div>

                            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-muted-foreground">
                                   <span>{stats.transactionCount} movs</span>
                                   <span className="group-hover:text-emerald-400 transition-colors">
                                          {stats.status === 'OPEN' ? 'Click para Cerrar' : 'Ver Detalle'}
                                   </span>
                            </div>
                     </div>

                     <CloseRegisterModal
                            isOpen={isCloseModalOpen}
                            onClose={() => setIsCloseModalOpen(false)}
                            initialStats={stats}
                            onSuccess={() => queryClient.invalidateQueries({ queryKey: ['cajaStats'] })}
                     />
              </>
       )
}
