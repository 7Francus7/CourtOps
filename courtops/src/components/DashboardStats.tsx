'use client'

import React, { useEffect, useState } from 'react'
import { getDailyFinancials } from '@/actions/finance'
import { Banknote, AlertCircle, MinusCircle, TrendingUp, Clock } from 'lucide-react'

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

       if (!stats) return (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                     {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-card-dark h-32 rounded-2xl animate-pulse border border-slate-200 dark:border-border-dark"></div>
                     ))}
              </div>
       )

       const net = stats.income.total - stats.expenses

       return (
              <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                     {/* 1. Caja Real Hoy */}
                     <div className="bg-white dark:bg-card-dark p-6 rounded-2xl border border-slate-200 dark:border-border-dark shadow-sm hover:border-secondary transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                   <span className="text-[10px] font-bold uppercase tracking-widest text-secondary glow-text-green">Caja Real Hoy</span>
                                   <div className="p-2 bg-secondary/10 rounded-lg text-secondary group-hover:bg-secondary group-hover:text-black transition-colors">
                                          <Banknote size={16} />
                                   </div>
                            </div>
                            <h3 className="text-3xl font-black text-slate-800 dark:text-white">${stats.income.total.toLocaleString()}</h3>
                            <div className="mt-2 flex items-center gap-3 text-[11px] font-medium">
                                   <span className="flex items-center gap-1 text-secondary"><span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Efvo ${stats.income.cash.toLocaleString()}</span>
                                   <span className="flex items-center gap-1 text-primary"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Dig ${stats.income.digital.toLocaleString()}</span>
                            </div>
                     </div>

                     {/* 2. A Cobrar */}
                     <div className="bg-white dark:bg-card-dark p-6 rounded-2xl border border-slate-200 dark:border-border-dark shadow-sm hover:border-accent transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                   <span className="text-[10px] font-bold uppercase tracking-widest text-accent">A Cobrar</span>
                                   <div className="p-2 bg-accent/10 rounded-lg text-accent group-hover:bg-accent group-hover:text-black transition-colors">
                                          <AlertCircle size={16} />
                                   </div>
                            </div>
                            <h3 className="text-3xl font-black text-slate-800 dark:text-white">${stats.pending.toLocaleString()}</h3>
                            <div className="mt-2 text-[11px] font-medium text-slate-400 flex items-center gap-1">
                                   <Clock size={14} /> {stats.pending > 0 ? 'Pagos pendientes' : 'Todo al día'}
                            </div>
                     </div>

                     {/* 3. Gastos */}
                     <div className="bg-white dark:bg-card-dark p-6 rounded-2xl border border-slate-200 dark:border-border-dark shadow-sm hover:border-danger transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                   <span className="text-[10px] font-bold uppercase tracking-widest text-danger">Gastos / Salidas</span>
                                   <div className="p-2 bg-danger/10 rounded-lg text-danger group-hover:bg-danger group-hover:text-white transition-colors">
                                          <MinusCircle size={16} />
                                   </div>
                            </div>
                            <h3 className="text-3xl font-black text-slate-800 dark:text-white">-${stats.expenses.toLocaleString()}</h3>
                            <div className="mt-2 text-[11px] font-medium text-slate-400">Salidas registradas</div>
                     </div>

                     {/* 4. Neto Real */}
                     <div className="bg-white dark:bg-card-dark p-6 rounded-2xl border border-slate-200 dark:border-border-dark shadow-sm hover:border-primary transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                   <span className="text-[10px] font-bold uppercase tracking-widest text-primary glow-text-blue">Neto Real (Hoy)</span>
                                   <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                          <TrendingUp size={16} />
                                   </div>
                            </div>
                            <h3 className="text-3xl font-black text-slate-800 dark:text-white">${net.toLocaleString()}</h3>
                            <div className="mt-2 text-[11px] font-medium text-slate-400">Rentabilidad diaria</div>
                     </div>
              </section>
       )
}
