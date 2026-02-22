'use client'

import React from 'react'
import { ChevronLeft, ChevronRight, Globe, Plus, Moon, Sun } from 'lucide-react'
import { addDays, subDays } from 'date-fns'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'

interface DashboardControlBarProps {
       selectedDate: Date
       setSelectedDate: (date: Date | ((prev: Date) => Date)) => void
       showAdvancedStats: boolean
       setShowAdvancedStats: (show: boolean) => void
       handleCopyLink: () => void
       setIsCreateModalOpen: (open: boolean) => void
}

export function DashboardControlBar({
       selectedDate,
       setSelectedDate,
       showAdvancedStats,
       setShowAdvancedStats,
       handleCopyLink,
       setIsCreateModalOpen
}: DashboardControlBarProps) {
       const { theme, setTheme } = useTheme()

       return (
              <div className="shrink-0 border-b border-border/50 flex flex-col lg:flex-row lg:items-center justify-between p-4 lg:px-6 lg:h-20 bg-background/50 backdrop-blur-md z-20 relative gap-3 lg:gap-0">

                     {/* LEFT: Date Nav & Title */}
                     <div className="flex items-center gap-4 lg:gap-6 w-full lg:w-auto justify-between lg:justify-start">
                            {/* Date Navigation Pill */}
                            <div className="flex items-center bg-muted/50 rounded-xl p-1 border border-border shadow-sm">
                                   <button
                                          onClick={() => setSelectedDate(prev => subDays(prev, 1))}
                                          className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                                          title="Día Anterior"
                                   >
                                          <ChevronLeft size={16} />
                                   </button>
                                   <button
                                          onClick={() => setSelectedDate(new Date())}
                                          className="px-3 py-1 text-[10px] font-black text-foreground/80 hover:text-foreground transition-colors uppercase tracking-widest"
                                          title="Ir a Hoy (Presiona 'T')"
                                   >
                                          Hoy
                                   </button>
                                   <button
                                          onClick={() => setSelectedDate(prev => addDays(prev, 1))}
                                          className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                                          title="Día Siguiente"
                                   >
                                          <ChevronRight size={16} />
                                   </button>
                            </div>

                            {/* Date Text */}
                            <div className="flex flex-col justify-center">
                                   <span className="text-lg lg:text-xl font-black text-foreground capitalize leading-none tracking-tight">
                                          {selectedDate.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric' })}
                                   </span>
                                   <span className="text-[9px] lg:text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1">
                                          {selectedDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                                   </span>
                            </div>
                     </div>

                     {/* RIGHT: Actions */}
                     <div className="flex items-center gap-2 lg:gap-4 overflow-x-auto pb-1 lg:pb-0 no-scrollbar w-full lg:w-auto justify-end">
                            <button
                                   onClick={() => setShowAdvancedStats(!showAdvancedStats)}
                                   className="hidden xl:block text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors border-b border-transparent hover:border-border pb-0.5 uppercase tracking-wider whitespace-nowrap"
                            >
                                   {showAdvancedStats ? 'Ocultar Métricas' : 'Ver Métricas'}
                            </button>

                            <button
                                   onClick={handleCopyLink}
                                   className="btn-secondary shadow-sm hover:shadow-md whitespace-nowrap px-3 py-2 text-[9px]"
                            >
                                   <Globe size={14} className="shrink-0" />
                                   <span className="inline sm:hidden">Link</span>
                            </button>

                            <button
                                   onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                   className="p-2.5 rounded-xl bg-background border border-border/50 text-muted-foreground hover:text-foreground transition-all hover:bg-muted active:scale-95 mx-1"
                                   title={theme === 'dark' ? "Cambiar a Modo Día" : "Cambiar a Modo Noche"}
                            >
                                   {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                            </button>

                            <button
                                   onClick={() => setIsCreateModalOpen(true)}
                                   className="btn-primary whitespace-nowrap px-4 py-2 lg:px-6 lg:py-2.5 text-[10px] lg:text-xs"
                            >
                                   <Plus size={16} strokeWidth={4} />
                                   <span className="hidden sm:inline">NUEVA RESERVA</span>
                                   <span className="inline sm:hidden">RESERVAR</span>
                            </button>
                     </div>
              </div>
       )
}
