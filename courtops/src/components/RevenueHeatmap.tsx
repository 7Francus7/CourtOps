"use client"

import { useEffect, useState } from "react"
import { getRevenueHeatmapData } from "@/actions/dashboard"
import { cn } from "@/lib/utils"

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const HOURS = Array.from({ length: 16 }, (_, i) => i + 8) // 8 to 23

export default function RevenueHeatmap({ demoData }: { demoData?: any[] }) {
       const [data, setData] = useState<any[]>(demoData || [])
       const [loading, setLoading] = useState(!demoData)

       useEffect(() => {
              if (demoData) {
                     setData(demoData)
                     setLoading(false)
                     return
              }

              getRevenueHeatmapData().then(res => {
                     if (res.success) {
                            setData(res.data)
                     }
                     setLoading(false)
              })
       }, [])

       const getIntensityClass = (value: number) => {
              if (value === 0) return 'bg-muted'
              if (value < 5) return 'bg-emerald-500/20'
              if (value < 10) return 'bg-emerald-500/40'
              if (value < 20) return 'bg-emerald-500/60'
              return 'bg-emerald-500'
       }

       if (loading) return <div className="h-48 animate-pulse bg-muted rounded-xl" />

       return (
              <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-md">
                     <div className="flex items-center justify-between mb-6">
                            <div>
                                   <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                          🔥 Mapa de Calor
                                          <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">Strategic</span>
                                   </h3>
                                   <p className="text-xs text-muted-foreground">Ocupación histórica (últimos 90 días)</p>
                            </div>
                            <div className="flex gap-2 text-[10px] text-muted-foreground">
                                   <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-muted"></div> Bajo</span>
                                   <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-emerald-500"></div> Alto</span>
                            </div>
                     </div>

                     <div className="overflow-x-auto pb-2">
                            <div className="min-w-[500px]">
                                   <div className="grid grid-cols-[30px_repeat(16,1fr)] gap-1">
                                          {/* Header Row (Hours) */}
                                          <div className="text-[10px] text-muted-foreground font-bold"></div>
                                          {HOURS.map(h => (
                                                 <div key={h} className="text-[9px] text-center text-muted-foreground">{h}h</div>
                                          ))}

                                          {/* Rows (Days) */}
                                          {DAYS.map((dayName, dayIndex) => (
                                                 <>
                                                        <div key={`label-${dayIndex}`} className="text-[9px] font-bold text-muted-foreground flex items-center">{dayName}</div>
                                                        {HOURS.map(h => {
                                                               const cell = data.find(d => d.day === dayIndex && d.hour === h)
                                                               const val = cell?.value || 0
                                                               return (
                                                                      <div
                                                                             key={`${dayIndex}-${h}`}
                                                                             className={cn("h-6 rounded-sm transition-all hover:scale-125 hover:z-10 cursor-help relative group", getIntensityClass(val))}
                                                                      >
                                                                             {/* Tooltip */}
                                                                             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-popover text-popover-foreground text-[9px] px-2 py-1 rounded whitespace-nowrap z-50 pointer-events-none border border-border shadow-md">
                                                                                    {dayName} {h}:00 - {val} reservas
                                                                             </div>
                                                                      </div>
                                                               )
                                                        })}
                                                 </>
                                          ))}
                                   </div>
                            </div>
                     </div>
              </div>
       )
}
