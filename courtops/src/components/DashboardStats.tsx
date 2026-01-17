'use client'

import React, { useEffect, useState } from 'react'
import { getDailyFinancials } from '@/actions/finance'
import { Wallet, AlertCircle, TrendingDown, TrendingUp, Loader2 } from 'lucide-react'
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

       if (loading || !stats) return (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                     {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse border border-white/5"></div>
                     ))}
              </div>
       )

       const net = stats.income.total - stats.expenses

       const StatCard = ({
              label,
              value,
              subValue,
              icon: Icon,
              colorClass,
              bgClass,
              borderClass
       }: {
              label: string,
              value: string,
              subValue?: React.ReactNode,
              icon: any,
              colorClass: string,
              bgClass: string,
              borderClass: string
       }) => (
              <div className={cn(
                     "flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200 hover:shadow-lg relative overflow-hidden group bg-card-dark",
                     borderClass
              )}>
                     <div className="flex justify-between items-start z-10">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
                            <div className={cn("p-2 rounded-xl transition-colors", bgClass)}>
                                   <Icon size={18} className={colorClass} />
                            </div>
                     </div>
                     <div className="z-10 mt-2">
                            <h3 className="text-2xl font-bold tracking-tight text-white">{value}</h3>
                            {subValue && (
                                   <div className="mt-1 text-xs text-muted-foreground font-medium">
                                          {subValue}
                                   </div>
                            )}
                     </div>
                     {/* Hover Effect Background */}
                     <div className={cn(
                            "absolute md:-right-4 md:-bottom-4 -right-2 -bottom-2 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity duration-500",
                            colorClass
                     )}>
                            <Icon size={80} />
                     </div>
              </div>
       )

       return (
              <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
                     <StatCard
                            label="Ingresos Hoy"
                            value={`$${stats.income.total.toLocaleString()}`}
                            subValue={
                                   <div className="flex gap-2">
                                          <span className="text-emerald-400">Efvo: ${stats.income.cash.toLocaleString()}</span>
                                          <span className="text-blue-400">Dig: ${stats.income.digital.toLocaleString()}</span>
                                   </div>
                            }
                            icon={Wallet}
                            colorClass="text-emerald-500"
                            bgClass="bg-emerald-500/10 group-hover:bg-emerald-500/20"
                            borderClass="border-white/5 hover:border-emerald-500/30"
                     />

                     <StatCard
                            label="A Cobrar"
                            value={`$${stats.pending.toLocaleString()}`}
                            subValue={stats.pending > 0 ? 'Pagos pendientes' : 'Todo al día'}
                            icon={AlertCircle}
                            colorClass="text-amber-500"
                            bgClass="bg-amber-500/10 group-hover:bg-amber-500/20"
                            borderClass="border-white/5 hover:border-amber-500/30"
                     />

                     <StatCard
                            label="Gastos"
                            value={`-$${stats.expenses.toLocaleString()}`}
                            subValue="Salidas registradas"
                            icon={TrendingDown}
                            colorClass="text-rose-500"
                            bgClass="bg-rose-500/10 group-hover:bg-rose-500/20"
                            borderClass="border-white/5 hover:border-rose-500/30"
                     />

                     <StatCard
                            label="Neto Real"
                            value={`$${net.toLocaleString()}`}
                            subValue="Rentabilidad diaria"
                            icon={TrendingUp}
                            colorClass="text-indigo-500"
                            bgClass="bg-indigo-500/10 group-hover:bg-indigo-500/20"
                            borderClass="border-white/5 hover:border-indigo-500/30"
                     />
              </section>
       )
}
