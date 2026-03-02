'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, DollarSign, Users, ChevronRight, BarChart3, Receipt, MousePointer2, Plus, Smartphone, Clock, Check, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePerformance } from '@/contexts/PerformanceContext'

export default function LandingMockup() {
       const [cursorState, setCursorState] = useState({ x: '25%', y: '40%', label: 'Explorando...' })
       const [activeSlot, setActiveSlot] = useState<number | null>(null)
       const { isLowEnd } = usePerformance()

       useEffect(() => {
              if (isLowEnd) return // Disable auto-cursor on low-end to save layout cycles

              const sequence = [
                     { x: '15%', y: '35%', label: 'Gestión de Turnos', delay: 2000 },
                     { x: '42%', y: '50%', label: 'Cancha 2 - Reservado', delay: 1500, highlight: 1 },
                     { x: '88%', y: '12%', label: 'Nuevo Registro', delay: 1000, click: true },
                     { x: '35%', y: '78%', label: 'Ver Kiosco Hub', delay: 2000, highlight: 2 },
              ]

              let step = 0
              const runStep = () => {
                     const s = sequence[step]
                     setCursorState({ x: s.x, y: s.y, label: s.label })
                     if (s.highlight !== undefined) setActiveSlot(s.highlight)
                     else setActiveSlot(null)

                     step = (step + 1) % sequence.length
                     const timer = setTimeout(runStep, s.delay)
                     return () => clearTimeout(timer)
              }

              const timeout = setTimeout(runStep, 1000)
              return () => clearTimeout(timeout)
       }, [isLowEnd])

       return (
              <section className="relative py-32 px-4 overflow-hidden bg-white dark:bg-[#050505] transition-colors duration-1000 border-t border-slate-100 dark:border-white/5">
                     <motion.div
                            initial={isLowEnd ? { opacity: 0 } : { opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                            className="max-w-7xl mx-auto relative px-4 md:px-12"
                     >
                            {/* Refined Pro Glow */}
                            {!isLowEnd && (
                                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-emerald-500/5 blur-[180px] pointer-events-none" />
                            )}

                            <div className="relative grid grid-cols-12 gap-12 items-center">

                                   {/* --- DESKTOP MOCKUP --- */}
                                   <div className="col-span-12 lg:col-span-8 relative">
                                          <div className={cn(
                                                 "relative rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#080808]/80 shadow-2xl overflow-hidden h-[400px] md:h-[600px] flex flex-col transition-all duration-1000",
                                                 isLowEnd ? "" : "backdrop-blur-xl"
                                          )}>

                                                 {/* Header Bar */}
                                                 <div className="h-12 md:h-14 px-4 md:px-6 flex items-center justify-between border-b border-slate-100 dark:border-white/5 bg-white/[0.02]">
                                                        <div className="flex items-center gap-4">
                                                               <div className="flex gap-1.5 opacity-20">
                                                                      <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-slate-400" />
                                                                      <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-slate-400" />
                                                                      <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-slate-400" />
                                                               </div>
                                                        </div>
                                                        <div className="flex gap-4">
                                                               <div className="w-16 md:w-24 h-4 md:h-5 bg-slate-200 dark:bg-white/5 rounded-full" />
                                                               <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20" />
                                                        </div>
                                                 </div>

                                                 <div className="flex-1 flex overflow-hidden">
                                                        {/* Sidebar - Hidden on mobile */}
                                                        <div className="hidden md:flex w-56 border-r border-slate-100 dark:border-white/5 p-6 flex flex-col gap-2 bg-slate-50/50 dark:bg-white/[0.01]">
                                                               {[
                                                                      { icon: <BarChart3 size={14} />, label: 'Analytics' },
                                                                      { icon: <Calendar size={14} />, label: 'Agenda', active: true },
                                                                      { icon: <Receipt size={14} />, label: 'Kiosko Hub' },
                                                                      { icon: <Users size={14} />, label: 'Clientes' }
                                                               ].map((it, i) => (
                                                                      <div key={i} className={cn(
                                                                             "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
                                                                             it.active ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-emerald-400 border border-slate-200 dark:border-white/10 shadow-sm" : "text-slate-400"
                                                                      )}>
                                                                             <div className={cn("p-1.5 rounded-lg", it.active ? "bg-emerald-500/10" : "bg-slate-100 dark:bg-white/5")}>{it.icon}</div>
                                                                             <span className="text-[9px] font-bold uppercase tracking-widest">{it.label}</span>
                                                                      </div>
                                                               ))}
                                                        </div>

                                                        {/* Main Content Area */}
                                                        <div className="flex-1 p-4 md:p-8 relative overflow-hidden flex flex-col gap-4 md:gap-6 bg-white dark:bg-transparent">
                                                               <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 flex-1">
                                                                      {[1, 2, 3, 4, 5, 6].map((i) => {
                                                                             const isBooked = [1, 3, 4].includes(i);
                                                                             return (
                                                                                    <div key={i} className="border border-slate-100 dark:border-white/5 rounded-2xl md:rounded-[1.5rem] bg-slate-50 dark:bg-white/5 p-2 md:p-3 flex flex-col justify-end min-h-[80px] md:min-h-[120px]">
                                                                                           {isBooked ? (
                                                                                                  <div className="h-full w-full bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2 md:p-3 flex flex-col justify-between">
                                                                                                         <div className="flex justify-between items-center">
                                                                                                                <span className="text-[6px] md:text-[7px] font-bold text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded-full uppercase">Socio</span>
                                                                                                                <Check size={8} className="text-emerald-500" />
                                                                                                         </div>
                                                                                                         <div className="h-1.5 md:h-2 w-10 md:w-12 bg-emerald-500/20 rounded-full" />
                                                                                                  </div>
                                                                                           ) : (
                                                                                                  <div className="space-y-1.5 md:space-y-2 opacity-20">
                                                                                                         <div className="h-1.5 md:h-2 w-12 md:w-16 bg-slate-300 dark:bg-white/10 rounded-full" />
                                                                                                         <div className="h-1.5 md:h-2 w-8 md:w-10 bg-slate-300 dark:bg-white/10 rounded-full" />
                                                                                                  </div>
                                                                                           )}
                                                                                    </div>
                                                                             )
                                                                      })}
                                                               </div>

                                                               {/* Cursor Animation - More compact on mobile */}
                                                               <motion.div
                                                                      animate={{ left: cursorState.x, top: cursorState.y }}
                                                                      transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
                                                                      className="absolute z-50 pointer-events-none"
                                                               >
                                                                      <div className="relative">
                                                                             <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center backdrop-blur-sm shadow-xl">
                                                                                    <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-emerald-500" />
                                                                             </div>
                                                                             <div className="absolute top-5 md:top-6 left-2 md:left-3 bg-slate-900 text-white px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[7px] md:text-[8px] font-bold uppercase tracking-widest whitespace-nowrap shadow-2xl border border-white/10">
                                                                                    {cursorState.label}
                                                                             </div>
                                                                      </div>
                                                               </motion.div>
                                                        </div>
                                                 </div>
                                          </div>
                                   </div>

                                   {/* --- STATS / ACCENT SIDE --- */}
                                   <div className="col-span-12 lg:col-span-4 space-y-8">
                                          <div className="space-y-4">
                                                 <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white uppercase transition-opacity duration-300">
                                                        Experiencia <br />
                                                        <span className="text-slate-400 dark:text-zinc-600">Enterprise.</span>
                                                 </h3>
                                                 <p className="text-slate-500 dark:text-zinc-400 text-sm leading-relaxed">
                                                        No es solo software, es la infraestructura que tu club necesita para escalar sin límites técnicos.
                                                 </p>
                                          </div>

                                          <div className="grid grid-cols-1 gap-4">
                                                 {[
                                                        { label: 'Cloud Uptime', value: '99.9%', color: 'text-emerald-500' },
                                                        { label: 'Latencia', value: '<45ms', color: 'text-indigo-500' }
                                                 ].map((stat, i) => (
                                                        <div key={i} className="p-6 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-white/5 flex justify-between items-center transition-all hover:border-emerald-500/20 group">
                                                               <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-500 uppercase tracking-widest">{stat.label}</span>
                                                               <span className={cn("text-xl font-bold transition-transform group-hover:scale-110", stat.color)}>{stat.value}</span>
                                                        </div>
                                                 ))}
                                          </div>

                                          <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                                                 <div className="flex items-center gap-3 mb-4 text-emerald-500">
                                                        <Sparkles size={18} />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">IA Engine</span>
                                                 </div>
                                                 <div className="space-y-3">
                                                        <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400">
                                                               <span>Optimizando Agenda</span>
                                                               <span>74%</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                                               <motion.div
                                                                      initial={{ width: 0 }}
                                                                      whileInView={{ width: '74%' }}
                                                                      className="h-full bg-emerald-500"
                                                               />
                                                        </div>
                                                 </div>
                                          </div>
                                   </div>
                            </div>
                     </motion.div>
              </section>
       )
}
