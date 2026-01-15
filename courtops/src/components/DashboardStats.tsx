'use client'

import React, { useEffect, useState } from 'react'
import { getDailyFinancials } from '@/actions/finance'
import { cn } from '@/lib/utils'

export default function DashboardStats({ date, refreshKey }: { date: Date, refreshKey: number }) {
       const [stats, setStats] = useState<{
              income: { total: number, cash: number, digital: number },
              expenses: number,
              pending: number,
              expectedTotal: number
       } | null>(null)
       const [loading, setLoading] = useState(true)

       async function fetchStats() {
              setLoading(true)
              try {
                     const res = await getDailyFinancials(date)
                     if (res.success && res.stats) {
                            setStats(res.stats)
                     }
              } catch (error) {
                     console.error(error)
              }
              setLoading(false)
       }

       useEffect(() => {
              fetchStats()
       }, [date, refreshKey])

       if (!stats) return <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"><div className="h-32 glass rounded-2xl animate-pulse col-span-4"></div></div>

       const net = stats.income.total - stats.expenses

       return (
              <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
                     {/* 1. Caja Real Hoy */}
                     <div className="glass p-5 rounded-2xl flex items-center justify-between transition-transform hover:scale-[1.02] cursor-default group">
                            <div>
                                   <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Caja Real Hoy</p>
                                   <h3 className="text-3xl font-bold text-white">${stats.income.total.toLocaleString()}</h3>
                                   <div className="flex items-center gap-2 mt-2">
                                          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                                                 <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Efvo ${stats.income.cash.toLocaleString()}
                                          </span>
                                          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                                                 <span className="w-2 h-2 rounded-full bg-blue-500"></span> Dig ${stats.income.digital.toLocaleString()}
                                          </span>
                                   </div>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                   <span className="material-icons-round text-emerald-500 text-2xl">payments</span>
                            </div>
                     </div>

                     {/* 2. A Cobrar */}
                     <div className="glass p-5 rounded-2xl flex items-center justify-between transition-transform hover:scale-[1.02] cursor-default group">
                            <div>
                                   <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1">A Cobrar</p>
                                   <h3 className="text-3xl font-bold text-white">${stats.pending.toLocaleString()}</h3>
                                   <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1 italic">
                                          <span className="material-icons-round text-[14px]">schedule</span> {stats.pending > 0 ? 'Pagos pendientes' : 'Todo al día'}
                                   </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-orange-400/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                   <span className="material-icons-round text-orange-400 text-2xl">pending_actions</span>
                            </div>
                     </div>

                     {/* 3. Gastos */}
                     <div className="glass p-5 rounded-2xl flex items-center justify-between transition-transform hover:scale-[1.02] cursor-default group">
                            <div>
                                   <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Gastos / Salidas</p>
                                   <h3 className="text-3xl font-bold text-red-400">-${stats.expenses.toLocaleString()}</h3>
                                   <p className="text-[11px] text-slate-400 mt-2">Salidas registradas</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-red-400/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                   <span className="material-icons-round text-red-400 text-2xl">remove_circle_outline</span>
                            </div>
                     </div>

                     {/* 4. Neto Real */}
                     <div className="glass p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-[var(--color-accent-blue)] transition-transform hover:scale-[1.02] cursor-default group">
                            <div>
                                   <p className="text-[10px] font-bold text-[var(--color-accent-blue)] uppercase tracking-widest mb-1">Neto Real (Hoy)</p>
                                   <h3 className="text-3xl font-bold text-white">${net.toLocaleString()}</h3>
                                   <p className="text-[11px] text-slate-400 mt-2">Rentabilidad diaria</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-blue)]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                   <span className="material-icons-round text-[var(--color-accent-blue)] text-2xl">trending_up</span>
                            </div>
                     </div>
              </section>
       )
}
