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
                     setTimeout(runStep, s.delay)
              }

              const timeout = setTimeout(runStep, 1000)
              return () => clearTimeout(timeout)
       }, [isLowEnd])

       return (
              <section className="relative py-24 px-4 overflow-hidden bg-[#020617]">
                     <motion.div
                            initial={isLowEnd ? { opacity: 0 } : { opacity: 0, y: 100 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: isLowEnd ? 0.5 : 1.5, ease: [0.16, 1, 0.3, 1] }}
                            className="max-w-[1400px] mx-auto relative px-4 md:px-12"
                     >
                            {/* Glow behind overall section */}
                            {!isLowEnd && (
                                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-emerald-500/10 blur-[180px] pointer-events-none" />
                            )}

                            <div className="relative grid grid-cols-12 gap-8 items-center pt-20">

                                   {/* --- DESKTOP MOCKUP (Root) --- */}
                                   <div className="col-span-12 lg:col-span-9 relative">
                                          <div className={cn(
                                                 "relative rounded-[3rem] border border-white/10 bg-[#030712]/80 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden h-[700px] flex flex-col transition-all duration-1000 border-t-white/20",
                                                 isLowEnd ? "" : "backdrop-blur-3xl"
                                          )}>

                                                 {/* Header Bar */}
                                                 <div className="h-16 px-8 flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
                                                        <div className="flex items-center gap-6">
                                                               <div className="flex gap-1.5 grayscale opacity-50">
                                                                      <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                                                                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                                                                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                                               </div>
                                                               <div className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
                                                                      Dashboard Pro v2.1
                                                               </div>
                                                        </div>
                                                        <div className="flex gap-4">
                                                               <div className="w-32 h-6 bg-white/5 rounded-full border border-white/5" />
                                                               <div className="w-8 h-8 rounded-lg bg-emerald-500 shadow-lg shadow-emerald-500/20" />
                                                        </div>
                                                 </div>

                                                 <div className="flex-1 flex overflow-hidden">
                                                        {/* Sidebar */}
                                                        <div className="w-60 border-r border-white/5 p-6 flex flex-col gap-2">
                                                               {[
                                                                      { icon: <BarChart3 size={14} />, label: 'Analytics' },
                                                                      { icon: <Calendar size={14} />, label: 'Agenda', active: true },
                                                                      { icon: <Receipt size={14} />, label: 'Kiosko Hub' },
                                                                      { icon: <Users size={14} />, label: 'Clientes' }
                                                               ].map((it, i) => (
                                                                      <div key={i} className={cn(
                                                                             "flex items-center gap-4 px-4 py-3 rounded-xl transition-all cursor-default",
                                                                             it.active ? "bg-white/5 text-emerald-400 border border-white/10 shadow-xl shadow-black/50" : "text-slate-500"
                                                                      )}>
                                                                             <div className={cn("p-1.5 rounded-lg", it.active ? "bg-emerald-500/20" : "bg-white/5")}>{it.icon}</div>
                                                                             <span className="text-[9px] font-black uppercase tracking-widest">{it.label}</span>
                                                                      </div>
                                                               ))}
                                                        </div>

                                                        {/* Main Content Area */}
                                                        <div className="flex-1 p-8 relative overflow-hidden flex flex-col gap-6">
                                                               {/* Mock Turnero Cards */}
                                                               <div className="grid grid-cols-4 gap-4 flex-1">
                                                                      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
                                                                             const isBooked = [1, 3, 4, 6, 7].includes(i);
                                                                             return (
                                                                                    <div key={i} className="border border-white/5 rounded-[2rem] bg-white/[0.01] overflow-hidden p-2">
                                                                                           {isBooked && (
                                                                                                  <motion.div
                                                                                                         layoutId={`card-${i}`}
                                                                                                         className="w-full h-full bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex flex-col justify-between"
                                                                                                  >
                                                                                                         <div className="flex justify-between items-center">
                                                                                                                <span className="text-[8px] font-black text-emerald-400 border border-emerald-400/20 px-2 py-0.5 rounded-full uppercase">Pagado</span>
                                                                                                                <Check size={10} className="text-emerald-500" />
                                                                                                         </div>
                                                                                                         <div>
                                                                                                                <p className="text-[10px] font-black text-white uppercase tracking-tighter">Socio #{i + 14}</p>
                                                                                                                <div className="flex items-center gap-1 mt-1 opacity-50">
                                                                                                                       <Clock size={8} className="text-white" />
                                                                                                                       <p className="text-[8px] font-bold text-white">18:30hs</p>
                                                                                                                </div>
                                                                                                         </div>
                                                                                                  </motion.div>
                                                                                           )}
                                                                                    </div>
                                                                             )
                                                                      })}
                                                               </div>

                                                               {/* Interactive Cursor Simulation */}
                                                               <motion.div
                                                                      animate={{ left: cursorState.x, top: cursorState.y }}
                                                                      transition={{ duration: 1.2, ease: "circOut" }}
                                                                      className="absolute z-50 pointer-events-none"
                                                               >
                                                                      <div className="relative">
                                                                             <MousePointer2 className="w-5 h-5 text-emerald-400 fill-emerald-400 drop-shadow-lg" />
                                                                             <div className="absolute top-6 left-3 bg-black border border-white/20 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap shadow-2xl">
                                                                                    {cursorState.label}
                                                                             </div>
                                                                      </div>
                                                               </motion.div>
                                                        </div>
                                                 </div>
                                          </div>
                                   </div>

                                   {/* --- MOBILE MOCKUP (Floating Accent) --- */}
                                   <div className="hidden lg:block lg:col-span-3 h-full pt-12">
                                          <motion.div
                                                 animate={{ y: [0, -20, 0] }}
                                                 transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                                 className="relative w-full max-w-[280px] aspect-[9/19.5] rounded-[3rem] border-[8px] border-slate-900 bg-[#030712] shadow-2xl shadow-indigo-500/20 overflow-hidden ring-1 ring-white/10"
                                          >
                                                 {/* Speaker/Camera Notch */}
                                                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-900 rounded-b-2xl z-20" />

                                                 {/* Mobile Screen Content (Kiosco Layout) */}
                                                 <div className="h-full flex flex-col p-4 pt-10">
                                                        <div className="flex justify-between items-center mb-6">
                                                               <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                                                                      <Receipt size={18} className="text-black" />
                                                               </div>
                                                               <div className="text-right">
                                                                      <p className="text-[8px] font-black text-emerald-500 uppercase">Kiosko Hub</p>
                                                                      <p className="text-xs font-black text-white">$45.200</p>
                                                               </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3 mb-6">
                                                               {[1, 2, 3, 4].map(i => (
                                                                      <div key={i} className="bg-white/5 border border-white/10 rounded-2xl h-24 p-2 flex flex-col justify-end">
                                                                             <div className="w-full h-1 bg-white/5 rounded-full mb-1" />
                                                                             <div className="w-2/3 h-1 bg-white/5 rounded-full" />
                                                                      </div>
                                                               ))}
                                                        </div>

                                                        <div className="mt-auto bg-emerald-500 p-4 rounded-2xl text-center">
                                                               <span className="text-[10px] font-black text-black uppercase tracking-[0.2em]">Finalizar Venta</span>
                                                        </div>
                                                 </div>

                                                 {/* Ambient Screen Light */}
                                                 <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-indigo-500/10 pointer-events-none" />
                                          </motion.div>

                                          {/* Stats Overlay next to Mobile */}
                                          <motion.div
                                                 initial={{ x: 50, opacity: 0 }}
                                                 whileInView={{ x: 0, opacity: 1 }}
                                                 className="mt-12 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl"
                                          >
                                                 <div className="flex items-center gap-4 mb-4 text-indigo-400">
                                                        <Sparkles size={20} />
                                                        <p className="text-[10px] font-black uppercase tracking-widest">IA Predictiva</p>
                                                 </div>
                                                 <p className="text-sm font-medium text-slate-400 leading-relaxed mb-6">
                                                        Nuestro sistema optimiza el stock y los turnos basándose en el historial de tu club.
                                                 </p>
                                                 <div className="flex items-end justify-between">
                                                        <div className="h-12 w-3 bg-indigo-500/20 rounded-full" />
                                                        <div className="h-16 w-3 bg-indigo-500/40 rounded-full" />
                                                        <div className="h-24 w-3 bg-indigo-500/60 rounded-full" />
                                                        <div className="h-20 w-3 bg-emerald-500 rounded-full" />
                                                 </div>
                                          </motion.div>
                                   </div>

                            </div>
                     </motion.div>
              </section>
       )
}
