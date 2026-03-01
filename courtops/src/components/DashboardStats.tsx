'use client'

import React, { useEffect, useState } from 'react'
import { Wallet, AlertCircle, TrendingUp, Calendar, ChevronDown, Lock, BarChart3 } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { SalesChart } from './dashboard/SalesChart'
import DebtsWidget from './dashboard/DebtsWidget'

// --- HEATMAP WIDGET ---

const HeatmapWidget = () => {
       const [data, setData] = useState<{ day: number, hour: number, value: number }[]>([])
       const [loading, setLoading] = useState(true)

       useEffect(() => {
              ; (async () => {
                     try {
                            const res = await fetch('/api/dashboard/heatmap')
                            if (!res.ok) throw new Error('Heatmap API failed')
                            const body = await res.json()
                            if (body.success && body.data) setData(body.data)
                     } catch (err) {
                            console.error('[HEATMAP] Error fetching', err)
                     } finally {
                            setLoading(false)
                     }
              })()
       }, [])

       if (loading) return <div className="h-full bg-muted/20 animate-pulse rounded-xl" />

       const hours = Array.from({ length: 16 }, (_, i) => i + 8)
       const days = ['D', 'L', 'M', 'M', 'J', 'V', 'S']
       const maxVal = Math.max(...data.map(d => d.value), 1)

       return (
              <div className="h-full flex flex-col p-6">
                     <div className="flex justify-between items-center mb-6">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                   <Calendar size={14} />
                                   Ocupación Histórica
                            </h4>
                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                   <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary/20"></span>Baja</span>
                                   <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary"></span>Alta</span>
                            </div>
                     </div>

                     <div className="flex-1 grid grid-rows-7 gap-1.5">
                            {days.map((d, dayIdx) => (
                                   <div key={dayIdx} className="grid grid-cols-[20px_repeat(16,1fr)] gap-1.5 items-center">
                                          <span className="text-[9px] font-bold text-muted-foreground">{d}</span>
                                          {hours.map(h => {
                                                 const item = data.find(x => x.day === dayIdx && x.hour === h)
                                                 const val = item ? item.value : 0
                                                 const opacity = val / maxVal

                                                 return (
                                                        <div
                                                               key={h}
                                                               className="h-full rounded-[2px] transition-all hover:scale-125 hover:z-10 relative group/cell"
                                                               style={{
                                                                      backgroundColor: val > 0 ? `var(--primary)` : 'var(--muted)',
                                                                      opacity: val > 0 ? Math.max(opacity, 0.2) : 0.1
                                                               }}
                                                        >
                                                               {val > 0 && (
                                                                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded border border-border whitespace-nowrap hidden group-hover/cell:block z-50 shadow-xl font-medium">
                                                                             {dayIdx === 0 ? 'Dom' : dayIdx === 1 ? 'Lun' : dayIdx === 2 ? 'Mar' : dayIdx === 3 ? 'Mié' : dayIdx === 4 ? 'Jue' : dayIdx === 5 ? 'Vie' : 'Sáb'} {h}:00hs
                                                                             <div className="font-bold text-primary">{val} reservas</div>
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
                                   <span key={h} className="text-[8px] text-center text-muted-foreground font-medium">{h}</span>
                            ))}
                     </div>
              </div>
       )
}

// --- MAIN COMPONENT ---

import { getMobileDashboardData } from '@/actions/dashboard_mobile'

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
       const [liveData, setLiveData] = useState<any>(null)
       const [loading, setLoading] = useState(true)
       const [internalExpanded, setInternalExpanded] = useState(false)

       const isExpanded = expanded !== undefined ? expanded : internalExpanded
       const handleToggle = onToggle || (() => setInternalExpanded(!internalExpanded))

       useEffect(() => {
              async function fetchData() {
                     setLoading(true)
                     try {
                            const [statsRes, liveRes] = await Promise.all([
                                   fetch('/api/dashboard/daily-financials', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({
                                                 date: date.toISOString(),
                                                 localDate: date.toLocaleDateString('en-CA')
                                          })
                                   }),
                                   getMobileDashboardData()
                            ])

                            if (statsRes.ok) {
                                   const body = await statsRes.json()
                                   if (body.success) setStats(body.stats)
                            }
                            if (liveRes) setLiveData(liveRes)
                     } catch (error) {
                            console.error('[DASHBOARD STATS CRITICAL]', error)
                     }
                     setLoading(false)
              }

              fetchData()
       }, [date, refreshKey])

       if (loading) return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                     {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-[160px] rounded-3xl bg-muted/20 animate-pulse border border-border/50"></div>
                     ))}
              </div>
       )

       if (!stats) return null

       const net = stats.income.total - stats.expenses

       return (
              <motion.div
                     initial="hidden"
                     animate="show"
                     variants={{
                            show: { transition: { staggerChildren: 0.1 } }
                     }}
                     className="flex flex-col gap-4 mb-4"
              >
                     {/* STATS STRIP */}
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

                            {/* CARD 1: CAJA DEL DÍA (Primary/Indigo) */}
                            <motion.div
                                   variants={{
                                          hidden: { opacity: 0, y: 20 },
                                          show: { opacity: 1, y: 0 }
                                   }}
                                   className="relative overflow-hidden group"
                            >
                                   <div className="bg-card/40 backdrop-blur-xl border border-border/40 p-6 rounded-[2.5rem] h-full transition-all duration-500 hover:border-indigo-500/30 hover:shadow-[0_20px_40px_rgba(79,70,229,0.1)] flex flex-col justify-between">
                                          <div className="flex justify-between items-start mb-4">
                                                 <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                               <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                                               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Caja del Día</p>
                                                        </div>
                                                        <h3 className="text-3xl font-black text-foreground tracking-tight">${stats.income.total.toLocaleString()}</h3>
                                                 </div>
                                                 <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                                        <Wallet size={18} strokeWidth={2.5} />
                                                 </div>
                                          </div>

                                          <div className="grid grid-cols-2 gap-3">
                                                 <div className="bg-background/40 backdrop-blur-md rounded-2xl p-3 border border-border/20 flex flex-col hover:bg-background/60 transition-colors">
                                                        <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest mb-1">Efectivo</span>
                                                        <span className="text-sm font-black text-foreground">${stats.income.cash.toLocaleString()}</span>
                                                 </div>
                                                 <div className="bg-background/40 backdrop-blur-md rounded-2xl p-3 border border-border/20 flex flex-col hover:bg-background/60 transition-colors">
                                                        <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest mb-1">Digital</span>
                                                        <span className="text-sm font-black text-foreground">${stats.income.digital.toLocaleString()}</span>
                                                 </div>
                                          </div>
                                   </div>
                            </motion.div>

                            {/* CARD 2: INGRESOS & LIVE (Emerald/Teal) */}
                            <motion.div
                                   variants={{
                                          hidden: { opacity: 0, y: 20 },
                                          show: { opacity: 1, y: 0 }
                                   }}
                                   className="relative overflow-hidden group"
                            >
                                   <div className="bg-card/40 backdrop-blur-xl border border-border/40 p-6 rounded-[2.5rem] h-full transition-all duration-500 hover:border-emerald-500/30 hover:shadow-[0_20px_40px_rgba(16,185,129,0.1)] flex flex-col">
                                          <div className="flex justify-between items-start mb-6">
                                                 <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Recaudación / Vivo</p>
                                                        </div>
                                                        <div className="flex items-baseline gap-2">
                                                               <h3 className="text-3xl font-black text-foreground tracking-tight">${(stats.expectedTotal - stats.pending).toLocaleString()}</h3>
                                                               {liveData && (
                                                                      <span className="text-[11px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                                             {Math.round((liveData.courts.filter((c: any) => c.status.includes('En Juego')).length / (liveData.courts.length || 1)) * 100)}% LIVE
                                                                      </span>
                                                               )}
                                                        </div>
                                                 </div>
                                                 <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 rounded-2xl text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300">
                                                        <TrendingUp size={18} strokeWidth={2.5} />
                                                 </div>
                                          </div>

                                          <div className="mt-auto">
                                                 <div className="bg-background/30 rounded-full h-2 w-full overflow-hidden p-0.5 border border-border/20">
                                                        <motion.div
                                                               initial={{ width: 0 }}
                                                               animate={{ width: `${Math.min(Math.round(((stats.expectedTotal - stats.pending) / (stats.expectedTotal || 1)) * 100), 100)}%` }}
                                                               transition={{ duration: 1, ease: "easeOut" }}
                                                               className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                                        />
                                                 </div>
                                                 <div className="flex items-center justify-between mt-3">
                                                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-wider">
                                                               Objetivo: ${(stats.expectedTotal).toLocaleString()}
                                                        </p>
                                                        {liveData && (
                                                               <div className="flex gap-1">
                                                                      {liveData.courts.map((c: any) => (
                                                                             <div key={c.id} className={cn("w-1.5 h-1.5 rounded-full", c.status.includes('En Juego') ? "bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.5)]" : "bg-muted-foreground/20")} title={c.name} />
                                                                      ))}
                                                               </div>
                                                        )}
                                                 </div>
                                          </div>
                                   </div>
                            </motion.div>

                            {/* CARD 3: POR COBRAR (Amber) */}
                            <motion.div
                                   variants={{
                                          hidden: { opacity: 0, y: 20 },
                                          show: { opacity: 1, y: 0 }
                                   }}
                                   className="relative overflow-hidden group"
                            >
                                   <div className="bg-card/40 backdrop-blur-xl border border-border/40 p-6 rounded-[2.5rem] h-full transition-all duration-500 hover:border-amber-500/30 hover:shadow-[0_20px_40px_rgba(245,158,11,0.1)] flex flex-col justify-between">
                                          <div className="flex justify-between items-start">
                                                 <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                               <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Pendiente hoy</p>
                                                        </div>
                                                        <h3 className="text-3xl font-black text-foreground tracking-tight">${stats.pending.toLocaleString()}</h3>
                                                 </div>
                                                 <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2.5 rounded-2xl text-white shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-all duration-300">
                                                        <AlertCircle size={18} strokeWidth={2.5} />
                                                 </div>
                                          </div>

                                          <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                                                 <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                                                 <p className="text-[10px] text-amber-700 dark:text-amber-400 font-black uppercase tracking-wider leading-tight">
                                                        Requiere Atención
                                                 </p>
                                          </div>
                                   </div>
                            </motion.div>

                            {/* CARD 4: BALANCE (Violet/Primary) */}
                            <motion.div
                                   variants={{
                                          hidden: { opacity: 0, y: 20 },
                                          show: { opacity: 1, y: 0 }
                                   }}
                                   className="relative overflow-hidden group"
                            >
                                   <div className="bg-card/40 backdrop-blur-xl border border-border/40 p-6 rounded-[2.5rem] h-full transition-all duration-500 hover:border-primary/30 hover:shadow-[0_20px_40px_rgba(var(--primary-rgb),0.1)] flex flex-col justify-between">
                                          <div className="flex justify-between items-start">
                                                 <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                               <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Balance Neto</p>
                                                        </div>
                                                        <h3 className="text-3xl font-black text-foreground tracking-tight">${net.toLocaleString()}</h3>
                                                 </div>
                                                 <div className="bg-gradient-to-br from-primary to-violet-600 p-2.5 rounded-2xl text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-all duration-300">
                                                        <BarChart3 size={18} strokeWidth={2.5} />
                                                 </div>
                                          </div>

                                          <button
                                                 onClick={handleToggle}
                                                 className="mt-4 w-full flex items-center justify-between gap-2 px-4 py-2 bg-background/50 hover:bg-background text-[10px] font-black uppercase tracking-[0.2em] text-foreground rounded-2xl border border-border shadow-sm transition-all hover:scale-[1.02] active:scale-95 group/btn"
                                          >
                                                 <span>{isExpanded ? 'Ocultar' : 'Detalles'}</span>
                                                 <ChevronDown size={14} className={cn("transition-transform duration-500 text-primary", isExpanded && "rotate-180")} />
                                          </button>
                                   </div>
                            </motion.div>

                     </div>

                     {
                            isExpanded && (
                                   <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                          <div className="h-72 rounded-3xl bg-card border border-border overflow-hidden shadow-lg p-4">
                                                 <SalesChart />
                                          </div>
                                          <div className="h-72 rounded-3xl bg-card border border-border overflow-hidden shadow-lg">
                                                 <HeatmapWidget />
                                          </div>
                                          <div className="h-72 md:col-span-2 xl:col-span-1">
                                                 <DebtsWidget />
                                          </div>
                                   </div>
                            )
                     }
              </motion.div >
       )
}
