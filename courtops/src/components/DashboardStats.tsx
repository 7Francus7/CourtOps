'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { getDailyFinancials } from '@/actions/finance'
import { getRevenueHeatmapData } from '@/actions/dashboard'
import { Wallet, AlertCircle, TrendingDown, TrendingUp, Calendar, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// --- COMPONENTS ---

const StatCard = ({
       label,
       value,
       subValue,
       icon: Icon,
       colorClass,
       bgClass,
       borderClass,
       delay = 0
}: {
       label: string,
       value: string,
       subValue?: React.ReactNode,
       icon: any,
       colorClass: string,
       bgClass: string,
       borderClass: string,
       delay?: number
}) => (
       <div
              className={cn(
                     "flex flex-col justify-between p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg relative overflow-hidden group bg-[#0C0F14]/80 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards",
                     borderClass
              )}
              style={{ animationDelay: `${delay}ms` }}
       >
              <div className="flex justify-between items-start z-10">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
                     <div className={cn("p-2.5 rounded-xl transition-colors duration-300", bgClass)}>
                            <Icon size={18} className={colorClass} />
                     </div>
              </div>
              <div className="z-10 mt-3">
                     <h3 className="text-2xl font-black tracking-tight text-white mb-1">{value}</h3>
                     {subValue && (
                            <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                                   {subValue}
                            </div>
                     )}
              </div>
              {/* Hover Effect Background */}
              <div className={cn(
                     "absolute -right-6 -bottom-6 opacity-0 group-hover:opacity-10 transition-opacity duration-500 rotate-12 scale-150",
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

       // Matrix 7 days x Hours 8-23 (16 hours)
       const hours = Array.from({ length: 16 }, (_, i) => i + 8)
       const days = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

       // Find max value for normalization
       const maxVal = Math.max(...data.map(d => d.value), 1)

       return (
              <div className="h-full flex flex-col p-4">
                     <div className="flex justify-between items-center mb-4">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                   <Calendar size={14} />
                                   Ocupación Histórica
                            </h4>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                   <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500/20"></span>Baja</span>
                                   <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Alta</span>
                            </div>
                     </div>

                     <div className="flex-1 grid grid-rows-7 gap-1">
                            {days.map((d, dayIdx) => (
                                   <div key={dayIdx} className="grid grid-cols-[20px_repeat(16,1fr)] gap-1 items-center">
                                          <span className="text-[9px] font-bold text-muted-foreground">{d}</span>
                                          {hours.map(h => {
                                                 const item = data.find(x => x.day === dayIdx && x.hour === h)
                                                 const val = item ? item.value : 0
                                                 const opacity = val / maxVal

                                                 return (
                                                        <div
                                                               key={h}
                                                               className="h-full rounded-sm transition-all hover:scale-125 hover:z-10 relative group/cell"
                                                               style={{
                                                                      backgroundColor: val > 0 ? `rgba(16, 185, 129, ${Math.max(opacity, 0.1)})` : 'rgba(255,255,255,0.03)',
                                                               }}
                                                        >
                                                               {val > 0 && (
                                                                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black/90 text-white text-[10px] px-2 py-1 rounded border border-white/10 whitespace-nowrap hidden group-hover/cell:block z-50">
                                                                             {dayIdx === 0 ? 'Domingo' : dayIdx === 1 ? 'Lunes' : dayIdx === 2 ? 'Martes' : dayIdx === 3 ? 'Miércoles' : dayIdx === 4 ? 'Jueves' : dayIdx === 5 ? 'Viernes' : 'Sábado'} {h}:00hs
                                                                             <div className="font-bold text-emerald-400">{val} reservas</div>
                                                                      </div>
                                                               )}
                                                        </div>
                                                 )
                                          })}
                                   </div>
                            ))}
                     </div>
                     <div className="grid grid-cols-[20px_repeat(16,1fr)] gap-1 mt-2">
                            <div />
                            {hours.map(h => (
                                   <span key={h} className="text-[8px] text-center text-muted-foreground/50">{h}</span>
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
                            <div key={i} className="h-32 rounded-2xl bg-white/[0.02] animate-pulse border border-white/5"></div>
                     ))}
              </div>
       )

       const net = stats.income.total - stats.expenses

       return (
              <div className="flex flex-col gap-4">
                     <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                   label="Ingresos Hoy"
                                   value={`$${stats.income.total.toLocaleString()}`}
                                   subValue={
                                          <div className="flex gap-2">
                                                 <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-md">Efvo: ${stats.income.cash.toLocaleString()}</span>
                                                 <span className="text-blue-400 font-bold bg-blue-500/10 px-1.5 py-0.5 rounded-md">Dig: ${stats.income.digital.toLocaleString()}</span>
                                          </div>
                                   }
                                   icon={Wallet}
                                   colorClass="text-emerald-500"
                                   bgClass="bg-emerald-500/10 group-hover:bg-emerald-500/20"
                                   borderClass="border-white/5 hover:border-emerald-500/30"
                                   delay={0}
                            />

                            <StatCard
                                   label="A Cobrar"
                                   value={`$${stats.pending.toLocaleString()}`}
                                   subValue={stats.pending > 0 ? (
                                          <span className="text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md">Pendientes de pago</span>
                                   ) : (
                                          <span className="text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-md">Todo al día</span>
                                   )}
                                   icon={AlertCircle}
                                   colorClass="text-amber-500"
                                   bgClass="bg-amber-500/10 group-hover:bg-amber-500/20"
                                   borderClass="border-white/5 hover:border-amber-500/30"
                                   delay={100}
                            />

                            <StatCard
                                   label="Gastos"
                                   value={`-$${stats.expenses.toLocaleString()}`}
                                   subValue={<span className="text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-md">Salidas registradas</span>}
                                   icon={TrendingDown}
                                   colorClass="text-rose-500"
                                   bgClass="bg-rose-500/10 group-hover:bg-rose-500/20"
                                   borderClass="border-white/5 hover:border-rose-500/30"
                                   delay={200}
                            />

                            <StatCard
                                   label="Neto Real"
                                   value={`$${net.toLocaleString()}`}
                                   subValue={<span className="text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-md">Rentabilidad diaria</span>}
                                   icon={TrendingUp}
                                   colorClass="text-indigo-500"
                                   bgClass="bg-indigo-500/10 group-hover:bg-indigo-500/20"
                                   borderClass="border-white/5 hover:border-indigo-500/30"
                                   delay={300}

                            />
                     </div>

                     {/* Advanced Stats Toggle */}
                     <div className="w-full">
                            <button
                                   onClick={() => setExpanded(!expanded)}
                                   className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                            >
                                   {expanded ? 'Menos Detalles' : 'Ver Métricas Avanzadas'}
                                   {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>

                            {expanded && (
                                   <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4">
                                          <div className="h-64 rounded-2xl bg-[#0C0F14]/80 backdrop-blur-sm border border-white/5 overflow-hidden">
                                                 <HeatmapWidget />
                                          </div>
                                          <div className="h-64 rounded-2xl bg-[#0C0F14]/80 backdrop-blur-sm border border-white/5 flex items-center justify-center text-muted-foreground text-sm">
                                                 <span className="opacity-50">Próximamente: Proyección de Ventas</span>
                                          </div>
                                   </div>
                            )}
                     </div>
              </div>
       )
}
