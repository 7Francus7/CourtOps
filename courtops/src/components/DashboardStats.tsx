'use client'

import React, { useEffect, useState } from 'react'
import { getDailyFinancials } from '@/actions/finance'
import { getRevenueHeatmapData } from '@/actions/dashboard'
import { Wallet, AlertCircle, TrendingDown, TrendingUp, Calendar, ChevronDown, ChevronUp, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import CajaWidget from './CajaWidget'
import { SalesChart } from './dashboard/SalesChart'

// --- COMPONENTS ---

const StatCard = ({
       label,
       value,
       subValue,
       icon: Icon,
       colorClass,
       bgClass,
       borderClass,
       delay = 0,
       children
}: {
       label: string,
       value: string,
       subValue?: React.ReactNode,
       icon: any,
       colorClass: string,
       bgClass: string,
       borderClass: string,
       delay?: number,
       children?: React.ReactNode
}) => (
       <div
              className={cn(
                     "flex flex-col justify-between p-5 rounded-3xl border transition-all duration-300 hover:shadow-xl relative overflow-hidden group bg-[#0C0F14] animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards h-full min-h-[160px]",
                     borderClass
              )}
              style={{ animationDelay: `${delay}ms` }}
       >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

              <div className="flex justify-between items-start z-10 mb-4">
                     <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
                     <div className={cn("p-2.5 rounded-xl transition-all duration-300 shadow-lg", bgClass)}>
                            <Icon size={18} className={colorClass} />
                     </div>
              </div>

              <div className="z-10 mt-auto">
                     <h3 className="text-3xl font-black tracking-tight text-white mb-2 font-mono">{value}</h3>
                     {subValue && (
                            <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5 leading-relaxed">
                                   {subValue}
                            </div>
                     )}
                     {children}
              </div>

              {/* Background Glow */}
              <div className={cn(
                     "absolute -right-10 -bottom-10 opacity-0 group-hover:opacity-10 transition-opacity duration-500 rotate-12 scale-[2]",
                     colorClass
              )}>
                     <Icon size={100} />
              </div>
       </div>
)

const HeatmapWidget = () => {
       const [data, setData] = useState<{ day: number, hour: number, value: number }[]>([])
       const [loading, setLoading] = useState(true)

       useEffect(() => {
              getRevenueHeatmapData().then(res => {
                     if (res.success && res.data) setData(res.data)
                     setLoading(false)
              })
       }, [])

       if (loading) return <div className="h-full bg-white/[0.02] animate-pulse rounded-xl" />

       const hours = Array.from({ length: 16 }, (_, i) => i + 8)
       const days = ['D', 'L', 'M', 'M', 'J', 'V', 'S']
       const maxVal = Math.max(...data.map(d => d.value), 1)

       return (
              <div className="h-full flex flex-col p-6">
                     <div className="flex justify-between items-center mb-6">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                   <Calendar size={14} />
                                   Ocupación Histórica
                            </h4>
                            <div className="flex items-center gap-3 text-[10px] text-slate-500">
                                   <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500/20"></span>Baja</span>
                                   <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Alta</span>
                            </div>
                     </div>

                     <div className="flex-1 grid grid-rows-7 gap-1.5">
                            {days.map((d, dayIdx) => (
                                   <div key={dayIdx} className="grid grid-cols-[20px_repeat(16,1fr)] gap-1.5 items-center">
                                          <span className="text-[9px] font-bold text-slate-600">{d}</span>
                                          {hours.map(h => {
                                                 const item = data.find(x => x.day === dayIdx && x.hour === h)
                                                 const val = item ? item.value : 0
                                                 const opacity = val / maxVal

                                                 return (
                                                        <div
                                                               key={h}
                                                               className="h-full rounded-[2px] transition-all hover:scale-125 hover:z-10 relative group/cell"
                                                               style={{
                                                                      backgroundColor: val > 0 ? `rgba(16, 185, 129, ${Math.max(opacity, 0.15)})` : 'rgba(255,255,255,0.03)',
                                                               }}
                                                        >
                                                               {val > 0 && (
                                                                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black/90 text-white text-[10px] px-2 py-1 rounded border border-white/10 whitespace-nowrap hidden group-hover/cell:block z-50 shadow-xl">
                                                                             {dayIdx === 0 ? 'Dom' : dayIdx === 1 ? 'Lun' : dayIdx === 2 ? 'Mar' : dayIdx === 3 ? 'Mié' : dayIdx === 4 ? 'Jue' : dayIdx === 5 ? 'Vie' : 'Sáb'} {h}:00hs
                                                                             <div className="font-bold text-emerald-400">{val} reservas</div>
                                                                      </div>
                                                               )}
                                                        </div>
                                                 )
                                          })}
                                   </div>
                            ))}
                     </div>
                     <div className="grid grid-cols-[20px_repeat(16,1fr)] gap-1.5 mt-2">
                            <div />
                            {hours.map(h => (
                                   <span key={h} className="text-[8px] text-center text-slate-700 font-medium">{h}</span>
                            ))}
                     </div>
              </div>
       )
}

export default function DashboardStats({
       date,
       refreshKey,
       expanded,
       onToggle
}: {
       date: Date,
       refreshKey: number,
       expanded?: boolean,
       onToggle?: () => void
}) {
       const [stats, setStats] = useState<{
              income: { total: number, cash: number, digital: number },
              expenses: number,
              pending: number,
              expectedTotal: number
       } | null>(null)
       const [loading, setLoading] = useState(true)
       const [internalExpanded, setInternalExpanded] = useState(false)

       const isExpanded = expanded !== undefined ? expanded : internalExpanded
       const handleToggle = onToggle || (() => setInternalExpanded(!internalExpanded))


       useEffect(() => {
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

              fetchStats()
       }, [date, refreshKey])

       if (loading || !stats) return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                     {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-40 rounded-3xl bg-white/[0.02] animate-pulse border border-white/5"></div>
                     ))}
              </div>
       )

       const net = stats.income.total - stats.expenses

       return (
              <div className="flex flex-col gap-4 mb-4">
                     {/* STATS STRIP - Responsive Grid with Gap Borders */}
                     {/* STATS STRIP - Responsive Grid with Gap Borders */}
                     <div className="relative mb-6 group/stats">
                            {/* Grid Configuration: 2x2 on Tablet, 4x1 on Desktop - Friendlier Layout */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-px bg-[#27272a] border border-[#27272a] rounded-3xl overflow-hidden shadow-2xl">

                                   {/* CAJA DEL DÍA */}
                                   <div className="bg-[#0C0F14] p-6 flex flex-col justify-center relative hover:bg-[#111419] transition-colors min-h-[160px]">
                                          <div className="flex items-center justify-between mb-4">
                                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Caja del Día</span>
                                                 <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                                                        <Lock size={16} className="text-emerald-500" />
                                                 </div>
                                          </div>
                                          <div className="flex items-baseline gap-2 mb-4">
                                                 <span className="text-3xl font-black text-white font-mono tracking-tighter">${stats.income.total.toLocaleString()}</span>
                                          </div>
                                          <div className="flex flex-col gap-1.5 w-full">
                                                 <div className="flex justify-between items-center bg-white/[0.02] px-3 py-2 rounded-lg">
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Efectivo</span>
                                                        <span className="text-slate-300 font-mono text-xs font-bold">${stats.income.cash.toLocaleString()}</span>
                                                 </div>
                                                 <div className="flex justify-between items-center bg-white/[0.02] px-3 py-2 rounded-lg">
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Digital</span>
                                                        <span className="text-slate-300 font-mono text-xs font-bold">${stats.income.digital.toLocaleString()}</span>
                                                 </div>
                                          </div>
                                   </div>

                                   {/* INGRESOS HOY */}
                                   <div className="bg-[#0C0F14] p-6 flex flex-col justify-center relative hover:bg-[#111419] transition-colors min-h-[160px]">
                                          <div className="flex items-center justify-between mb-4">
                                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ingresos Hoy</span>
                                                 <div className="bg-[#0C0F14] border border-[#27272a] p-2 rounded-lg text-emerald-500 shadow-sm">
                                                        <Wallet size={16} />
                                                 </div>
                                          </div>
                                          <div className="flex items-center gap-2 mb-2">
                                                 <span className="text-3xl font-black text-white font-mono tracking-tighter">${stats.income.total.toLocaleString()}</span>
                                                 <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                                                        +{Math.round((stats.income.total / (stats.expectedTotal || 1)) * 100)}%
                                                 </span>
                                          </div>
                                          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold mt-2">
                                                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                 Del objetivo diario
                                          </div>
                                   </div>

                                   {/* POR COBRAR */}
                                   <div className="bg-[#0C0F14] p-6 flex flex-col justify-center relative hover:bg-[#111419] transition-colors min-h-[160px]">
                                          <div className="flex items-center justify-between mb-4">
                                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Por Cobrar</span>
                                                 <div className="bg-[#0C0F14] border border-[#27272a] p-2 rounded-lg text-amber-500 shadow-sm">
                                                        <AlertCircle size={16} />
                                                 </div>
                                          </div>
                                          <div className="flex items-baseline gap-2 mb-2">
                                                 <span className="text-3xl font-black text-white font-mono tracking-tighter">${stats.pending.toLocaleString()}</span>
                                          </div>
                                          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold mt-2 border-l-2 border-amber-500/50 pl-2">
                                                 Pendientes del día
                                          </div>
                                   </div>

                                   {/* BALANCE NETO */}
                                   <div className="bg-[#0C0F14] p-6 flex flex-col justify-center relative hover:bg-[#111419] transition-colors min-h-[160px]">
                                          <div className="flex items-center justify-between mb-4">
                                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Balance Neto</span>
                                                 <div className="bg-[#0C0F14] border border-[#27272a] p-2 rounded-lg text-indigo-500 shadow-sm">
                                                        <TrendingUp size={16} />
                                                 </div>
                                          </div>
                                          <div className="flex items-baseline gap-2 mb-2">
                                                 <span className="text-3xl font-black text-white font-mono tracking-tighter">${net.toLocaleString()}</span>
                                          </div>
                                          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold mt-2">
                                                 Ingresos - Gastos
                                          </div>

                                          {/* Toggle Button Inside Last Card */}
                                          <button
                                                 onClick={handleToggle}
                                                 className="absolute bottom-4 right-4 p-2 text-slate-600 hover:text-white hover:bg-white/5 rounded-lg transition-all active:scale-95"
                                          >
                                                 <ChevronDown size={18} className={cn("transition-transform duration-300", isExpanded && "rotate-180")} />
                                          </button>
                                   </div>
                            </div>
                     </div>

                     {isExpanded && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                   <div className="h-64 rounded-2xl bg-[#0C0F14] border border-[#27272a] overflow-hidden shadow-xl p-4">
                                          <SalesChart />
                                   </div>
                                   <div className="h-64 rounded-2xl bg-[#0C0F14] border border-[#27272a] overflow-hidden shadow-xl">
                                          <HeatmapWidget />
                                   </div>
                            </div>
                     )}
              </div>
       )
}
