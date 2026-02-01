'use client'

import React, { useEffect, useState } from 'react'
import { getDailyFinancials } from '@/actions/finance'
import { cn } from '@/lib/utils'

export default function FinancialHeader({ date, refreshKey }: { date: Date, refreshKey: number }) {
       const [stats, setStats] = useState<{
              income: { total: number, cash: number, digital: number },
              expenses: number,
              pending: number,
              expectedTotal: number
       } | null>(null)
       const [loading, setLoading] = useState(true)

       async function fetchStats() {
              setLoading(true)
              const res = await getDailyFinancials(date.toISOString())
              if (res.success && res.stats) {
                     setStats(res.stats)
              }
              setLoading(false)
       }

       useEffect(() => {
              fetchStats()
       }, [date, refreshKey])

       if (!stats) return <div className="h-20 animate-pulse bg-white/5 rounded-2xl mb-4" />

       // Calculate percentage collected
       const collectedPercent = stats.expectedTotal > 0
              ? Math.round((stats.income.total / stats.expectedTotal) * 100)
              : 0

       return (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">

                     {/* 1. CAJA REAL (Cash + Digital) */}
                     <div className="bg-[#111418] border border-brand-green/20 rounded-xl p-4 flex flex-col relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                   <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="text-brand-green"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.15-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.62 1.87 1.26 0 1.9-.49 1.9-1.21 0-.98-1.52-1.37-2.84-1.86-1.6-.59-2.69-1.5-2.69-2.96 0-1.63 1.29-2.65 3.02-2.93V5h2.67v1.93c1.38.27 2.51 1.23 2.6 2.87h-1.96c-.09-.78-.73-1.42-2.07-1.42-1.21 0-1.8.53-1.8 1.15 0 .89 1.5 1.25 2.8 1.74 1.73.64 2.73 1.57 2.73 3.05 0 1.63-1.27 2.68-3.01 2.97z" /></svg>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-green mb-1">Caja Real Hoy</span>
                            <span className="text-2xl font-black text-white tracking-tight">
                                   ${stats.income.total.toLocaleString()}
                            </span>
                            <div className="text-[10px] text-white/40 mt-1">
                                   💵 ${stats.income.cash.toLocaleString()} · 💳 ${stats.income.digital.toLocaleString()}
                            </div>
                     </div>

                     {/* 2. PENDIENTE (To Collect) */}
                     <div className="bg-[#111418] border border-yellow-500/20 rounded-xl p-4 flex flex-col relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                   <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-500"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" /></svg>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500 mb-1">A Cobrar</span>
                            <span className="text-2xl font-black text-white tracking-tight">
                                   ${stats.pending.toLocaleString()}
                            </span>
                            <div className="text-[10px] text-white/40 mt-1">
                                   {stats.pending > 0 ? '⚠️ Deudores activos' : '✨ Todo cobrado'}
                            </div>
                     </div>

                     {/* 3. GASTOS (Expenses) */}
                     <div className="bg-[#111418] border border-red-500/20 rounded-xl p-4 flex flex-col relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                   <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="text-red-500"><path d="M7 11v2h10v-2H7zm5-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /></svg>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">Gastos / Salidas</span>
                            <span className="text-2xl font-black text-white tracking-tight">
                                   -${stats.expenses.toLocaleString()}
                            </span>
                            <div className="text-[10px] text-white/40 mt-1 uppercase">
                                   Salidas registradas
                            </div>
                     </div>

                     {/* 4. NETO (Income - Expenses) */}
                     <div className="bg-[#111418] border border-blue-500/20 rounded-xl p-4 flex flex-col relative overflow-hidden bg-gradient-to-br from-blue-500/5 to-transparent">
                            <div className="absolute top-0 right-0 p-3 opacity-10 transition-opacity">
                                   <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="text-blue-500"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" /></svg>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">Neto Real (Hoy)</span>
                            <span className="text-2xl font-black text-white tracking-tight">
                                   ${(stats.income.total - stats.expenses).toLocaleString()}
                            </span>
                            <div className="text-[10px] text-white/40 mt-1">
                                   Rentabilidad diaria
                            </div>
                     </div>
              </div>
       )
}
