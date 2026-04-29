'use client'

import React from 'react'
import { ChevronLeft, ChevronRight, Globe, Plus, HelpCircle, QrCode } from 'lucide-react'
import { addDays, subDays, isToday } from 'date-fns'
import { nowInArg } from '@/lib/date-utils'

interface DashboardControlBarProps {
       selectedDate: Date
       setSelectedDate: (_: Date | ((_: Date) => Date)) => void
       handleCopyLink: () => void
       onOpenGrowthKit: () => void
       setIsCreateModalOpen: (_: boolean) => void
       onOpenHelp: () => void
}

export function DashboardControlBar({
       selectedDate,
       setSelectedDate,
       handleCopyLink,
       onOpenGrowthKit,
       setIsCreateModalOpen,
       onOpenHelp
}: DashboardControlBarProps) {
       return (
              <div className="shrink-0 border-b border-border/20 flex flex-col md:flex-row md:items-center justify-between p-3 md:px-8 md:h-20 lg:h-24 bg-background/30 backdrop-blur-xl z-20 relative gap-3 md:gap-0">

                     {/* LEFT: Date Nav & Title */}
                     <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
                            {/* Date Navigation Pill */}
                            <div className="flex items-center bg-secondary/30 rounded-xl md:rounded-2xl p-1 md:p-1.5 border border-border/40 shadow-inner">
                                   <button
                                          onClick={() => setSelectedDate(prev => subDays(prev, 1))}
                                          className="p-2 hover:bg-background/80 rounded-lg md:rounded-xl text-muted-foreground hover:text-primary transition-all active:scale-90"
                                          title="Día Anterior"
                                   >
                                          <ChevronLeft size={16} strokeWidth={2.5} />
                                   </button>
                                   <button
                                          onClick={() => setSelectedDate(nowInArg())}
                                          className="px-3 md:px-5 py-1.5 md:py-2 text-[10px] font-black text-foreground/70 hover:text-primary transition-colors uppercase tracking-[0.2em]"
                                          title="Ir a Hoy (Presiona 'T')"
                                   >
                                          Hoy
                                   </button>
                                   <button
                                          onClick={() => setSelectedDate(prev => addDays(prev, 1))}
                                          className="p-2 hover:bg-background/80 rounded-lg md:rounded-xl text-muted-foreground hover:text-primary transition-all active:scale-90"
                                          title="Día Siguiente"
                                   >
                                          <ChevronRight size={16} strokeWidth={2.5} />
                                   </button>
                            </div>

                            {/* Date Text */}
                            <div className="flex flex-col justify-center min-w-0">
                                   <h2 className="text-base md:text-xl lg:text-2xl font-black text-foreground capitalize tracking-tight leading-tight truncate">
                                          {selectedDate.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric' })}
                                   </h2>
                                   <div className="flex items-center gap-2 mt-0.5">
                                          <span className="text-[9px] md:text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] truncate">
                                                 {selectedDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                                          </span>
                                          {isToday(selectedDate) && (
                                                 <>
                                                        <div className="w-1 h-1 rounded-full bg-primary/30 shrink-0" />
                                                        <span className="text-[9px] md:text-[10px] font-black text-primary/60 uppercase tracking-[0.1em] shrink-0">En Vivo</span>
                                                 </>
                                          )}
                                   </div>
                            </div>

                            {/* Mobile: Nueva Reserva inline */}
                            <button
                                   onClick={() => setIsCreateModalOpen(true)}
                                   className="md:hidden relative group overflow-hidden bg-foreground text-background px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-[0.15em] transition-all active:scale-[0.97] shadow-xl shadow-foreground/10 flex items-center gap-2 shrink-0"
                            >
                                   <Plus size={15} strokeWidth={4} />
                                   <span>Nueva</span>
                            </button>
                     </div>

                     {/* RIGHT: Actions — hidden on mobile (shown inline above) */}
                     <div className="hidden md:flex items-center gap-2 lg:gap-5 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
                            <button
                                   onClick={handleCopyLink}
                                   className="relative group overflow-hidden flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 hover:border-primary/40 transition-all hover:scale-[1.03] active:scale-[0.97]"
                                   title="Copiar link de reserva pública (L)"
                            >
                                   <Globe size={16} strokeWidth={2.5} />
                                   <span className="hidden sm:inline text-[11px] font-black uppercase tracking-[0.15em]">Link Público</span>
                            </button>

                            <button
                                   onClick={onOpenGrowthKit}
                                   className="relative group overflow-hidden flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-background border border-border/40 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all hover:scale-[1.03] active:scale-[0.97]"
                                   title="QR y canales de reserva publica"
                            >
                                   <QrCode size={16} strokeWidth={2.5} />
                                   <span className="text-[11px] font-black uppercase tracking-[0.15em]">QR / Canales</span>
                            </button>

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
                                   <span>Nueva Reserva</span>
                            </button>
                     </div>
              </div>
       )
}
