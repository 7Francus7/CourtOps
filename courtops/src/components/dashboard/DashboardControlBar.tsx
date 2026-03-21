'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Globe, Plus, Moon, Sun, HelpCircle, Keyboard } from 'lucide-react'
import { addDays, subDays, isToday } from 'date-fns'
import { cn } from '@/lib/utils'
import { nowInArg } from '@/lib/date-utils'
import { useTheme } from 'next-themes'

interface DashboardControlBarProps {
       selectedDate: Date
       setSelectedDate: (date: Date | ((prev: Date) => Date)) => void
       showAdvancedStats: boolean
       setShowAdvancedStats: (show: boolean) => void
       handleCopyLink: () => void
       setIsCreateModalOpen: (open: boolean) => void
       onOpenHelp: () => void
}

export function DashboardControlBar({
       selectedDate,
       setSelectedDate,
       showAdvancedStats,
       setShowAdvancedStats,
       handleCopyLink,
       setIsCreateModalOpen,
       onOpenHelp
}: DashboardControlBarProps) {
       const { theme, setTheme } = useTheme()
       const [showShortcuts, setShowShortcuts] = useState(false)
       const shortcutsRef = useRef<HTMLDivElement>(null)

       useEffect(() => {
              if (!showShortcuts) return
              function handleClick(e: MouseEvent) {
                     if (shortcutsRef.current && !shortcutsRef.current.contains(e.target as Node)) {
                            setShowShortcuts(false)
                     }
              }
              document.addEventListener('mousedown', handleClick)
              return () => document.removeEventListener('mousedown', handleClick)
       }, [showShortcuts])

       return (
              <div className="shrink-0 border-b border-border/20 flex flex-col lg:flex-row lg:items-center justify-between p-4 lg:px-8 lg:h-24 bg-background/30 backdrop-blur-xl z-20 relative gap-4 lg:gap-0">

                     {/* LEFT: Date Nav & Title */}
                     <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-start">
                            {/* Date Navigation Pill */}
                            <div className="flex items-center bg-secondary/30 rounded-2xl p-1.5 border border-border/40 shadow-inner">
                                   <button
                                          onClick={() => setSelectedDate(prev => subDays(prev, 1))}
                                          className="p-2 hover:bg-background/80 rounded-xl text-muted-foreground hover:text-primary transition-all active:scale-90"
                                          title="Día Anterior"
                                   >
                                          <ChevronLeft size={18} strokeWidth={2.5} />
                                   </button>
                                   <button
                                          onClick={() => setSelectedDate(nowInArg())}
                                          className="px-5 py-2 text-[10px] font-black text-foreground/70 hover:text-primary transition-colors uppercase tracking-[0.2em]"
                                          title="Ir a Hoy (Presiona 'T')"
                                   >
                                          Hoy
                                   </button>
                                   <button
                                          onClick={() => setSelectedDate(prev => addDays(prev, 1))}
                                          className="p-2 hover:bg-background/80 rounded-xl text-muted-foreground hover:text-primary transition-all active:scale-90"
                                          title="Día Siguiente"
                                   >
                                          <ChevronRight size={18} strokeWidth={2.5} />
                                   </button>
                            </div>

                            {/* Date Text */}
                            <div className="flex flex-col justify-center">
                                   <h2 className="text-xl lg:text-2xl font-black text-foreground capitalize tracking-tight leading-tight">
                                          {selectedDate.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric' })}
                                   </h2>
                                   <div className="flex items-center gap-2 mt-0.5">
                                          <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">
                                                 {selectedDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                                          </span>
                                          {isToday(selectedDate) && (
                                                 <>
                                                        <div className="w-1 h-1 rounded-full bg-primary/30" />
                                                        <span className="text-[10px] font-black text-primary/60 uppercase tracking-[0.1em]">En Vivo</span>
                                                 </>
                                          )}
                                   </div>
                            </div>
                     </div>

                     {/* RIGHT: Actions */}
                     <div className="flex items-center gap-2 lg:gap-5 overflow-x-auto pb-1 lg:pb-0 no-scrollbar w-full lg:w-auto justify-end">
                            <div className="flex items-center bg-secondary/20 rounded-2xl p-1 border border-border/30">
                                   <button
                                          onClick={() => setTheme('light')}
                                          className={cn(
                                                 "p-2 rounded-xl transition-all",
                                                 theme === 'light' ? "bg-background text-amber-500 shadow-sm" : "text-muted-foreground/40 hover:text-muted-foreground"
                                          )}
                                   >
                                          <Sun size={16} strokeWidth={2.5} />
                                   </button>
                                   <button
                                          onClick={() => setTheme('dark')}
                                          className={cn(
                                                 "p-2 rounded-xl transition-all",
                                                 theme === 'dark' ? "bg-background text-indigo-400 shadow-sm" : "text-muted-foreground/40 hover:text-muted-foreground"
                                          )}
                                   >
                                          <Moon size={16} strokeWidth={2.5} />
                                   </button>
                            </div>

                            <div className="h-8 w-[1px] bg-border/40 mx-1 hidden lg:block" />

                            <button
                                   onClick={handleCopyLink}
                                   className="p-3 rounded-2xl bg-secondary/30 border border-border/40 text-muted-foreground hover:text-primary transition-all hover:scale-105 active:scale-95"
                                   title="Copiar link de reserva pública"
                            >
                                   <Globe size={18} />
                            </button>

                            {/* Keyboard shortcuts panel */}
                            <div ref={shortcutsRef} className="relative hidden lg:flex items-center">
                                   <button
                                          onClick={() => setShowShortcuts(prev => !prev)}
                                          className={cn(
                                                 "p-3 rounded-2xl border transition-all hover:scale-105 active:scale-95",
                                                 showShortcuts
                                                        ? "bg-primary/10 border-primary/30 text-primary"
                                                        : "bg-secondary/30 border-border/40 text-muted-foreground hover:text-primary"
                                          )}
                                          title="Atajos de teclado"
                                   >
                                          <Keyboard size={18} />
                                   </button>
                                   {showShortcuts && (
                                          <div className="absolute bottom-full right-0 mb-3 bg-popover border border-border rounded-2xl shadow-2xl p-4 z-50 min-w-[210px] animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-150">
                                                 <p className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest mb-3">Atajos de teclado</p>
                                                 {[
                                                        { key: 'N', label: 'Nueva reserva' },
                                                        { key: 'T', label: 'Ir a hoy' },
                                                        { key: 'C', label: 'Vista calendario' },
                                                        { key: 'R', label: 'Reportes' },
                                                        { key: 'K', label: 'Kiosco' },
                                                        { key: 'H', label: 'Ayuda' },
                                                        { key: 'L', label: 'Copiar link' },
                                                 ].map(({ key, label }) => (
                                                        <div key={key} className="flex items-center justify-between gap-4 py-1.5 border-b border-border/30 last:border-0">
                                                               <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
                                                               <kbd className="text-[10px] font-black bg-muted border border-border rounded-lg px-2 py-0.5 text-foreground/70 font-mono">{key}</kbd>
                                                        </div>
                                                 ))}
                                          </div>
                                   )}
                            </div>

                            <button
                                   onClick={onOpenHelp}
                                   className="p-3 rounded-2xl bg-secondary/30 border border-border/40 text-muted-foreground hover:text-primary transition-all hover:scale-105 active:scale-95"
                                   title="Centro de Ayuda (H)"
                            >
                                   <HelpCircle size={18} />
                            </button>

                            <button
                                   onClick={() => setIsCreateModalOpen(true)}
                                   className="relative group overflow-hidden bg-foreground text-background px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.03] active:scale-[0.97] shadow-xl shadow-foreground/10 flex items-center gap-3"
                            >
                                   <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                   <Plus size={18} strokeWidth={4} />
                                   <span className="hidden sm:inline">Nueva Reserva</span>
                                   <span className="inline sm:hidden">Nueva</span>
                            </button>
                     </div>
              </div>
       )
}
