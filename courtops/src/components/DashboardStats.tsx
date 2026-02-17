'use client'

import React, { useEffect, useState } from 'react'
import { Wallet, AlertCircle, TrendingUp, Calendar, ChevronDown, Lock } from 'lucide-react'
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
                            const res = await fetch('/api/dashboard/daily-financials', {
                                   method: 'POST',
                                   headers: { 'Content-Type': 'application/json' },
                                   body: JSON.stringify({ date: date.toISOString() })
                            })
                            if (!res.ok) throw new Error('Daily financials API failed')
                            const body = await res.json()
                            if (body && body.success && body.stats) {
                                   setStats(body.stats)
                            } else {
                                   console.error('[DASHBOARD STATS] Failed:', body)
                            }
                     } catch (error) {
                            console.error('[DASHBOARD STATS CRITICAL]', error)
                     }
                     setLoading(false)
              }

              fetchStats()
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
              <div className="flex flex-col gap-4 mb-4">
                     {/* STATS STRIP */}
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                            {/* CARD 1: CAJA DEL DÍA (Primary/Emerald) */}
                            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500/10 via-card to-card p-6 flex flex-col justify-between rounded-3xl border border-indigo-500/10 shadow-lg group hover:shadow-indigo-500/20 transition-all duration-500">
                                   <div className="flex justify-between items-start">
                                          <div>
                                                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 mb-1">Caja del Día</p>
                                                 <h3 className="text-3xl font-black text-foreground tracking-tighter">${stats.income.total.toLocaleString()}</h3>
                                          </div>
                                          <div className="bg-indigo-500/10 p-2.5 rounded-xl text-indigo-500 group-hover:scale-110 transition-transform duration-300">
                                                 <Wallet size={20} />
                                          </div>
                                   </div>

                                   <div className="grid grid-cols-2 gap-2 mt-4">
                                          <div className="bg-background/50 backdrop-blur-sm rounded-lg p-2 border border-border/50 flex flex-col">
                                                 <span className="text-[9px] font-bold text-muted-foreground uppercase">Efectivo</span>
                                                 <span className="text-sm font-bold text-foreground">${stats.income.cash.toLocaleString()}</span>
                                          </div>
                                          <div className="bg-background/50 backdrop-blur-sm rounded-lg p-2 border border-border/50 flex flex-col">
                                                 <span className="text-[9px] font-bold text-muted-foreground uppercase">Digital</span>
                                                 <span className="text-sm font-bold text-foreground">${stats.income.digital.toLocaleString()}</span>
                                          </div>
                                   </div>
                            </div>

                            {/* CARD 2: INGRESOS (Blue) */}
                            <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-card to-card p-6 flex flex-col justify-between rounded-3xl border border-blue-500/10 shadow-lg group hover:shadow-blue-500/20 transition-all duration-500">
                                   <div className="flex justify-between items-start">
                                          <div>
                                                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 mb-1">Ingresos Hoy</p>
                                                 <div className="flex items-center gap-2">
                                                        <h3 className="text-3xl font-black text-foreground tracking-tighter">${stats.income.total.toLocaleString()}</h3>
                                                        <span className="text-[10px] font-black text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                                                               +{Math.round((stats.income.total / (stats.expectedTotal || 1)) * 100)}%
                                                        </span>
                                                 </div>
                                          </div>
                                          <div className="bg-blue-500/10 p-2.5 rounded-xl text-blue-500 group-hover:scale-110 transition-transform duration-300">
                                                 <TrendingUp size={20} />
                                          </div>
                                   </div>

                                   <div className="mt-auto pt-4">
                                          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                                 <div
                                                        className="h-full bg-blue-500 rounded-full"
                                                        style={{ width: `${Math.min(Math.round((stats.income.total / (stats.expectedTotal || 1)) * 100), 100)}%` }}
                                                 />
                                          </div>
                                          <p className="text-[10px] text-muted-foreground font-bold mt-2 flex items-center gap-1.5">
                                                 <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                                 Progreso del objetivo diario
                                          </p>
                                   </div>
                            </div>

                            {/* CARD 3: POR COBRAR (Orange) */}
                            <div className="relative overflow-hidden bg-gradient-to-br from-orange-500/10 via-card to-card p-6 flex flex-col justify-between rounded-3xl border border-orange-500/10 shadow-lg group hover:shadow-orange-500/20 transition-all duration-500">
                                   <div className="flex justify-between items-start">
                                          <div>
                                                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 mb-1">Por Cobrar</p>
                                                 <h3 className="text-3xl font-black text-foreground tracking-tighter">${stats.pending.toLocaleString()}</h3>
                                          </div>
                                          <div className="bg-orange-500/10 p-2.5 rounded-xl text-orange-500 group-hover:scale-110 transition-transform duration-300">
                                                 <AlertCircle size={20} />
                                          </div>
                                   </div>

                                   <div className="mt-auto pt-4 flex items-center gap-2">
                                          <div className="px-3 py-1.5 bg-orange-500/10 rounded-lg border border-orange-500/20 text-orange-600 text-xs font-bold w-fit">
                                                 Pendientes
                                          </div>
                                          <p className="text-[10px] text-muted-foreground font-medium">
                                                 Reservas sin señar hoy
                                          </p>
                                   </div>
                            </div>

                            {/* CARD 4: BALANCE (Purple/Primary) */}
                            <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-card to-card p-6 flex flex-col justify-between rounded-3xl border border-primary/10 shadow-lg group hover:shadow-primary/20 transition-all duration-500">
                                   <div className="flex justify-between items-start">
                                          <div>
                                                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 mb-1">Balance Neto</p>
                                                 <h3 className="text-3xl font-black text-foreground tracking-tighter">${net.toLocaleString()}</h3>
                                          </div>
                                          <div className="bg-primary/10 p-2.5 rounded-xl text-primary group-hover:scale-110 transition-transform duration-300">
                                                 <Lock size={20} />
                                          </div>
                                   </div>

                                   <div className="mt-auto flex justify-end">
                                          <button
                                                 onClick={handleToggle}
                                                 className="flex items-center gap-2 px-4 py-2 bg-background hover:bg-muted text-xs font-bold text-foreground rounded-xl border border-border shadow-sm transition-all hover:scale-105 active:scale-95 group/btn"
                                          >
                                                 {isExpanded ? 'Ocultar Gráficos' : 'Ver Métricas'}
                                                 <ChevronDown size={14} className={cn("transition-transform duration-300 text-primary", isExpanded && "rotate-180")} />
                                          </button>
                                   </div>
                            </div>

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
              </div >
       )
}
