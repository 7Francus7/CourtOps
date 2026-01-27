'use client'

import React, { useEffect, useState } from 'react'
import { getDailyFinancials } from '@/actions/finance'
import { getRevenueHeatmapData } from '@/actions/dashboard'
import { Wallet, AlertCircle, TrendingDown, TrendingUp, Calendar, ChevronDown, ChevronUp } from 'lucide-react'
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

export default function DashboardStats({ date, refreshKey }: { date: Date, refreshKey: number }) {
       const [stats, setStats] = useState<{
              income: { total: number, cash: number, digital: number },
              expenses: number,
              pending: number,
              expectedTotal: number
       } | null>(null)
       const [loading, setLoading] = useState(true)
       const [expanded, setExpanded] = useState(false)


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
              <div className="flex flex-col gap-2">
                     <div className="flex flex-col xl:flex-row gap-3 items-stretch xl:items-center bg-[#0C0F14] border border-[#27272a] p-1.5 rounded-2xl shadow-sm">

                            {/* CAJA WIDGET (Left aligned/prominent) */}
                            <div className="flex-none w-full xl:w-auto min-w-[200px]">
                                   <CajaWidget compact={true} />
                            </div>

                            <div className="h-px w-full xl:w-px xl:h-12 bg-white/5 mx-1" />

                            {/* STATS STRIP */}
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2 xl:gap-6 px-2">
                                   <div className="flex flex-col justify-center">
                                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                                 <Wallet size={12} className="text-emerald-500" /> Ingresos
                                          </span>
                                          <div className="flex items-baseline gap-2">
                                                 <span className="text-lg font-black text-white tracking-tight">${stats.income.total.toLocaleString()}</span>
                                                 <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 rounded">+{Math.round((stats.income.total / (stats.expectedTotal || 1)) * 100)}%</span>
                                          </div>
                                   </div>

                                   <div className="flex flex-col justify-center">
                                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                                 <AlertCircle size={12} className="text-amber-500" /> Por Cobrar
                                          </span>
                                          <span className="text-lg font-black text-white tracking-tight">${stats.pending.toLocaleString()}</span>
                                   </div>

                                   <div className="flex flex-col justify-center">
                                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                                 <TrendingDown size={12} className="text-rose-500" /> Gastos
                                          </span>
                                          <span className="text-lg font-black text-white tracking-tight">-${stats.expenses.toLocaleString()}</span>
                                   </div>

                                   <div className="flex flex-col justify-center">
                                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                                 <TrendingUp size={12} className="text-indigo-500" /> Neto
                                          </span>
                                          <span className="text-lg font-black text-white tracking-tight">${net.toLocaleString()}</span>
                                   </div>
                            </div>

                            <div className="h-px w-full xl:w-px xl:h-12 bg-white/5 mx-1" />

                            {/* EXPAND TOGGLE */}
                            <button
                                   onClick={() => setExpanded(!expanded)}
                                   className="flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider"
                            >
                                   {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                     </div>

                     {expanded && (
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
