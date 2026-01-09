'use client'

import React, { useEffect, useState } from 'react'
import { getCajaStats } from '@/actions/caja'
import { cn } from '@/lib/utils'

import CloseRegisterModal from './dashboard/CloseRegisterModal'

export default function CajaWidget() {
       const [stats, setStats] = useState<any>(null)
       const [loading, setLoading] = useState(true)
       const [isCloseModalOpen, setIsCloseModalOpen] = useState(false)

       const fetchStats = async () => {
              try {
                     const data = await getCajaStats()
                     setStats(data)
              } catch (error) {
                     console.error(error)
              } finally {
                     setLoading(false)
              }
       }

       // Interval fetch for MVP to keep it "fresh" without complex websocket
       useEffect(() => {
              fetchStats()
              const interval = setInterval(fetchStats, 5000)
              return () => clearInterval(interval)
       }, [])

       if (loading) return <div className="h-40 bg-white/5 rounded-3xl animate-pulse"></div>

       if (!stats) return null

       return (
              <>
                     <div
                            onClick={() => setIsCloseModalOpen(true)}
                            className="bg-bg-card p-6 rounded-3xl border border-white/5 shadow-xl transition-all hover:border-brand-green/20 group cursor-pointer relative overflow-hidden"
                     >
                            <h2 className="text-text-grey text-xs font-bold uppercase tracking-wider mb-4 flex justify-between items-center">
                                   Caja del Día
                                   <div className="flex items-center gap-2">
                                          <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-white/50 group-hover:bg-white/10 transition-colors">
                                                 {stats.status === 'OPEN' ? 'ABIERTA' : 'CERRADA'}
                                          </span>
                                          <span className={cn("inline-block w-2 h-2 rounded-full", stats.status === 'OPEN' ? 'bg-brand-green shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500')}></span>
                                   </div>
                            </h2>

                            <div className="flex justify-between items-baseline mb-3">
                                   <span className="text-4xl font-bold tracking-tight text-white">
                                          $ {stats.total.toLocaleString('es-AR')}
                                   </span>
                            </div>

                            <div className="flex justify-between text-xs text-text-grey mt-4 pt-4 border-t border-white/5">
                                   <div className="flex flex-col gap-1">
                                          <span>Efvo</span>
                                          <span className="text-white font-mono font-bold">$ {stats.incomeCash.toLocaleString('es-AR')}</span>
                                   </div>
                                   <div className="flex flex-col gap-1 items-end">
                                          <span>Digital</span>
                                          <span className="text-white font-mono font-bold">$ {stats.incomeTransfer.toLocaleString('es-AR')}</span>
                                   </div>
                            </div>

                            {stats.expenses > 0 && (
                                   <div className="mt-3 pt-2 text-xs text-red-400 font-medium text-right">
                                          - $ {stats.expenses.toLocaleString('es-AR')} (Gastos)
                                   </div>
                            )}

                            <p className="text-[10px] text-text-grey/50 mt-4 text-center group-hover:text-brand-green transition-colors">
                                   {stats.transactionCount} movs · Click para {stats.status === 'OPEN' ? 'Cerrar' : 'Ver Detalle'}
                            </p>
                     </div>

                     <CloseRegisterModal
                            isOpen={isCloseModalOpen}
                            onClose={() => setIsCloseModalOpen(false)}
                            initialStats={stats}
                            onSuccess={fetchStats}
                     />
              </>
       )
}
