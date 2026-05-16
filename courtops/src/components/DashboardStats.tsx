'use client'

import React, { useEffect, useState } from 'react'
import { AlertCircle, Calendar, ChevronDown, Info, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'
const SalesChart = dynamic(
       () => import('./dashboard/SalesChart').then(m => ({ default: m.SalesChart })),
       { ssr: false, loading: () => <div className="h-24 animate-pulse bg-secondary rounded-2xl" /> }
)
import DebtsWidget from './dashboard/DebtsWidget'

import { useRouter } from 'next/navigation'

function KpiTooltip({ text }: { text: string }) {
       return (
              <div className="relative group/tip inline-flex items-center ml-1">
                     <Info size={10} className="text-muted-foreground/25 hover:text-muted-foreground/60 cursor-help transition-colors" />
                     <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 bg-popover text-popover-foreground text-[10px] px-3 py-2 rounded-xl border border-border shadow-xl invisible group-hover/tip:visible opacity-0 group-hover/tip:opacity-100 transition-all z-50 leading-relaxed font-medium pointer-events-none">
                            {text}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-border" />
                     </div>
              </div>
       )
}

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
              <div className="h-full flex flex-col p-5">
                     <div className="flex justify-between items-center mb-4">
                            <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground/70 flex items-center gap-1.5">
                                   <Calendar size={13} />
                                   Ocupación Histórica
                            </h4>
                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground/60">
                                   <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary/25"></span>Baja</span>
                                   <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span>Alta</span>
                            </div>
                     </div>

                     {/* scroll indicator */}
                     <div className="flex-1 relative overflow-hidden">
                            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-card to-transparent z-10 pointer-events-none" />
                            <div className="h-full overflow-x-auto no-scrollbar">
                                   <div className="min-w-[400px] grid grid-rows-7 gap-1.5 h-full">
                                          {days.map((d, dayIdx) => (
                                                 <div key={dayIdx} className="grid grid-cols-[18px_repeat(16,1fr)] gap-1.5 items-center">
                                                        <span className="text-[10px] font-bold text-muted-foreground/50">{d}</span>
                                                        {hours.map(h => {
                                                               const item = data.find(x => x.day === dayIdx && x.hour === h)
                                                               const val = item ? item.value : 0
                                                               const opacity = val / maxVal

                                                               return (
                                                                      <div
                                                                             key={h}
                                                                             className="h-full rounded-sm transition-transform duration-100 hover:scale-110 hover:z-10 relative group/cell cursor-default"
                                                                             style={{
                                                                                    backgroundColor: val > 0 ? `hsl(var(--primary))` : 'hsl(var(--muted))',
                                                                                    opacity: val > 0 ? Math.max(opacity, 0.18) : 0.08
                                                                             }}
                                                                      >
                                                                             {val > 0 && (
                                                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-popover text-popover-foreground text-[11px] px-2.5 py-1.5 rounded-lg border border-border whitespace-nowrap hidden group-hover/cell:block z-50 shadow-xl font-medium leading-snug">
                                                                                           <p className="text-muted-foreground/70">{dayIdx === 0 ? 'Dom' : dayIdx === 1 ? 'Lun' : dayIdx === 2 ? 'Mar' : dayIdx === 3 ? 'Mié' : dayIdx === 4 ? 'Jue' : dayIdx === 5 ? 'Vie' : 'Sáb'} {h}:00hs</p>
                                                                                           <p className="font-bold text-primary">{val} reservas</p>
                                                                                    </div>
                                                                             )}
                                                                      </div>
                                                               )
                                                        })}
                                                 </div>
                                          ))}
                                   </div>
                            </div>
                     </div>
                     <div className="overflow-x-auto no-scrollbar">
                            <div className="min-w-[400px] grid grid-cols-[18px_repeat(16,1fr)] gap-1.5 mt-2">
                            <div />
                            {hours.map(h => (
                                   <span key={h} className="text-[9px] text-center text-muted-foreground/40 font-medium">{h}</span>
                            ))}
                            </div>
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
       const router = useRouter()
       const [stats, setStats] = useState<{
              income: { total: number, cash: number, digital: number },
              expenses: number,
              pending: number,
              expectedTotal: number
       } | null>(null)
       const [liveData, setLiveData] = useState<{ courts: { id: number; name: string; status: string }[] } | null>(null)
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
                            <div key={i} className="h-[148px] rounded-[1.75rem] bg-card/40 border border-border/40 overflow-hidden relative">
                                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted/20 to-transparent -translate-x-full animate-[shimmer_1.8s_ease-in-out_infinite]" />
                                   <div className="p-5 space-y-3">
                                          <div className="flex items-center gap-2">
                                                 <div className="w-1.5 h-1.5 rounded-full bg-muted/50" />
                                                 <div className="h-2.5 w-24 rounded-full bg-muted/40" />
                                          </div>
                                          <div className="h-8 w-28 rounded-xl bg-muted/40" />
                                          <div className="grid grid-cols-2 gap-2 mt-2">
                                                 <div className="h-14 rounded-xl bg-muted/30" />
                                                 <div className="h-14 rounded-xl bg-muted/30" />
                                          </div>
                                   </div>
                            </div>
                     ))}
              </div>
       )

       if (!stats) return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                     <div className="col-span-full bg-card/40 backdrop-blur-xl border border-border/40 p-5 rounded-[1.75rem] flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                                   <AlertCircle size={16} className="text-muted-foreground/60" />
                            </div>
                            <div>
                                   <p className="text-sm font-medium text-foreground">Error al cargar estadísticas</p>
                                   <p className="text-xs text-muted-foreground mt-0.5">Actualizá la página para reintentar</p>
                            </div>
                     </div>
              </div>
       )

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
                                   variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } }}
                                   className="relative overflow-hidden group"
                            >
                                   <div className="card-stat h-full">
                                          <div>
                                                 <div className="flex items-center gap-2 mb-1.5">
                                                        <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                                                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground/60">Caja del Día</p>
                                                        <KpiTooltip text="Total de ingresos registrados hoy en caja. Se desglosa en efectivo y pagos digitales." />
                                                 </div>
                                                 <h3 className="text-[1.75rem] font-black text-foreground tracking-tight leading-none">${stats.income.total.toLocaleString()}</h3>
                                          </div>

                                          <div className="grid grid-cols-2 gap-2 mt-3">
                                                 <div className="bg-background/50 rounded-xl p-3 border border-border/20 flex flex-col gap-1 hover:bg-background/70 transition-colors duration-150">
                                                        <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">Efectivo</span>
                                                        <span className="text-[13px] font-black text-foreground">${stats.income.cash.toLocaleString()}</span>
                                                 </div>
                                                 <div className="bg-background/50 rounded-xl p-3 border border-border/20 flex flex-col gap-1 hover:bg-background/70 transition-colors duration-150">
                                                        <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">Digital</span>
                                                        <span className="text-[13px] font-black text-foreground">${stats.income.digital.toLocaleString()}</span>
                                                 </div>
                                          </div>
                                   </div>
                            </motion.div>

                            {/* CARD 2: INGRESOS & LIVE (Emerald/Teal) */}
                            <motion.div
                                   variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.25, delay: 0.05 } } }}
                                   className="relative overflow-hidden group"
                            >
                                   <div className="card-stat h-full">
                                          <div>
                                                 <div className="flex items-center gap-2 mb-1.5">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground/60">Recaudación / Vivo</p>
                                                        <KpiTooltip text="Monto ya cobrado vs el total esperado del día. El % LIVE muestra qué porcentaje de canchas están en uso ahora mismo." />
                                                 </div>
                                                 <div className="flex items-baseline gap-2">
                                                        <h3 className="text-[1.75rem] font-black text-foreground tracking-tight leading-none">${(stats.expectedTotal - stats.pending).toLocaleString()}</h3>
                                                        {liveData && (
                                                               <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                                      {Math.round((liveData.courts.filter((c: { id: number; name: string; status: string }) => c.status.includes('En Juego')).length / (liveData.courts.length || 1)) * 100)}% LIVE
                                                               </span>
                                                        )}
                                                 </div>
                                          </div>

                                          <div className="mt-3">
                                                 <div className="bg-background/40 rounded-full h-1.5 w-full overflow-hidden border border-border/15">
                                                        <motion.div
                                                               initial={{ width: 0 }}
                                                               animate={{ width: `${Math.min(Math.round(((stats.expectedTotal - stats.pending) / (stats.expectedTotal || 1)) * 100), 100)}%` }}
                                                               transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                                                               className="h-full bg-emerald-500 rounded-full"
                                                        />
                                                 </div>
                                                 <div className="flex items-center justify-between mt-2.5">
                                                        <p className="text-[10px] text-muted-foreground/70 font-semibold">
                                                               Obj: ${(stats.expectedTotal).toLocaleString()}
                                                        </p>
                                                        {liveData && (
                                                               <div className="flex gap-1">
                                                                      {liveData.courts.map((c: { id: number; name: string; status: string }) => (
                                                                             <div key={c.id} className={cn("w-1.5 h-1.5 rounded-full transition-colors", c.status.includes('En Juego') ? "bg-emerald-500" : "bg-muted-foreground/20")} title={c.name} />
                                                                      ))}
                                                               </div>
                                                        )}
                                                 </div>
                                          </div>
                                   </div>
                            </motion.div>

                            {/* CARD 3: POR COBRAR (Amber) */}
                            <motion.div
                                   variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.25, delay: 0.1 } } }}
                                   className="relative overflow-hidden group"
                            >
                                   <div className="card-stat h-full">
                                          <div>
                                                 <div className="flex items-center gap-2 mb-1.5">
                                                        <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                                                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground/60">Pendiente hoy</p>
                                                        <KpiTooltip text="Monto total de reservas de hoy que aún no tienen pago completo (señas parciales o sin cobrar). Ir a Reservas para gestionarlos." />
                                                 </div>
                                                 <h3 className="text-[1.75rem] font-black text-foreground tracking-tight leading-none">${stats.pending.toLocaleString()}</h3>
                                          </div>

                                          {stats.pending > 0 ? (
                                                 <button
                                                        onClick={() => router.push('/reservas')}
                                                        className="mt-3 w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-amber-500/6 hover:bg-amber-500/10 rounded-xl border border-amber-500/15 hover:border-amber-500/25 transition-all duration-150 group/att cursor-pointer"
                                                 >
                                                        <div className="flex items-center gap-2">
                                                               <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                                               <div className="text-left">
                                                                      <p className="text-[11px] text-amber-700 dark:text-amber-400 font-bold leading-tight">Requiere atención</p>
                                                                      <p className="text-[10px] text-amber-600/60 dark:text-amber-500/50 font-medium mt-0.5">Tocar para gestionar</p>
                                                               </div>
                                                        </div>
                                                        <ArrowRight size={12} className="text-amber-500/40 group-hover/att:text-amber-500 group-hover/att:translate-x-0.5 transition-all shrink-0" />
                                                 </button>
                                          ) : (
                                                 <div className="mt-3 flex items-center gap-2 px-3 py-2.5 bg-emerald-500/6 rounded-xl border border-emerald-500/15">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                                                               Todo al día
                                                        </p>
                                                 </div>
                                          )}
                                   </div>
                            </motion.div>

                            {/* CARD 4: BALANCE (Violet/Primary) */}
                            <motion.div
                                   variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.25, delay: 0.15 } } }}
                                   className="relative overflow-hidden group"
                            >
                                   <div className="card-stat h-full">
                                          <div>
                                                 <div className="flex items-center gap-2 mb-1.5">
                                                        <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                                                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground/60">Balance Neto</p>
                                                        <KpiTooltip text="Ingresos totales menos egresos registrados en el día. Presioná 'Detalles' para ver el gráfico de ventas y deudas." />
                                                 </div>
                                                 <h3 className={cn(
                                                        "text-[1.75rem] font-black tracking-tight leading-none",
                                                        net >= 0 ? "text-foreground" : "text-red-500"
                                                 )}>${net.toLocaleString()}</h3>
                                          </div>

                                          <button
                                                 onClick={handleToggle}
                                                 className="mt-3 w-full flex items-center justify-between gap-2 px-3.5 py-2.5 bg-primary/6 hover:bg-primary/10 text-[11px] font-bold text-primary rounded-xl border border-primary/15 hover:border-primary/25 transition-all duration-150 active:scale-95 group/btn"
                                          >
                                                 <span>{isExpanded ? 'Ocultar detalles' : 'Ver detalles'}</span>
                                                 <ChevronDown size={13} className={cn("transition-transform duration-300", isExpanded && "rotate-180")} />
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
