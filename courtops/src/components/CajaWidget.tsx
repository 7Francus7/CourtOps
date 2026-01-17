
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
                            className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-border-dark p-6 overflow-hidden relative shadow-sm cursor-pointer hover:border-secondary transition-all group"
                     >
                            <div className="flex justify-between items-start mb-6">
                                   <div>
                                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Caja del día</p>
                                          <h4 className="text-3xl font-black text-slate-800 dark:text-white mt-1">$ {stats.total.toLocaleString('es-AR')}</h4>
                                   </div>
                                   <span className={cn(
                                          "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border",
                                          stats.status === 'OPEN'
                                                 ? "bg-secondary/10 text-secondary border-secondary/20 glow-text-green"
                                                 : "bg-danger/10 text-danger border-danger/20"
                                   )}>
                                          <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", stats.status === 'OPEN' ? "bg-secondary" : "bg-danger")}></span>
                                          {stats.status === 'OPEN' ? 'Abierta' : 'Cerrada'}
                                   </span>
                            </div>

                            <div className="space-y-3">
                                   <div className="flex justify-between text-[11px]">
                                          <span className="text-slate-400 font-medium">Efvo</span>
                                          <span className="font-bold text-slate-700 dark:text-white">$ {stats.incomeCash.toLocaleString('es-AR')}</span>
                                   </div>
                                   <div className="flex justify-between text-[11px]">
                                          <span className="text-slate-400 font-medium">Digital</span>
                                          <span className="font-bold text-slate-700 dark:text-white">$ {stats.incomeTransfer.toLocaleString('es-AR')}</span>
                                   </div>
                                   {stats.expenses > 0 && (
                                          <div className="flex justify-between text-[11px] text-danger">
                                                 <span className="font-medium">Gastos</span>
                                                 <span className="font-bold">- $ {stats.expenses.toLocaleString('es-AR')}</span>
                                          </div>
                                   )}
                            </div>

                            <p className="mt-4 text-[9px] text-center text-slate-500 font-medium group-hover:text-primary transition-colors">
                                   {stats.transactionCount} movs · Click para {stats.status === 'OPEN' ? 'Cerrar' : 'Ver Detalle'}
                            </p>
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
