
'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, DollarSign, Users, ChevronRight, BarChart3, Receipt, MousePointer2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function LandingMockup() {
       const [cursorState, setCursorState] = useState({ x: '20%', y: '30%', label: 'Explorando...' })
       const [activeSlot, setActiveSlot] = useState<number | null>(null)

       // Simulation Logic
       useEffect(() => {
              const sequence = [
                     { x: '15%', y: '25%', label: 'Revisando Agenda', delay: 2000 },
                     { x: '45%', y: '45%', label: 'Cancha 2 - 18:00', delay: 1500, highlight: 1 },
                     { x: '85%', y: '15%', label: 'Nueva Reserva', delay: 1000, click: true },
                     { x: '35%', y: '75%', label: 'Confirmando Pago', delay: 2000, highlight: 2 },
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
       }, [])

       return (
              <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: 40 }}
                     whileInView={{ opacity: 1, scale: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ delay: 0.2, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                     className="mt-16 w-full max-w-7xl mx-auto hidden md:block group relative z-20 perspective-[2000px]"
                     aria-hidden="true"
              >
                     {/* Cinematic Glow Behind Mockup */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />

                     {/* The Main Container */}
                     <div className="relative rounded-[3rem] border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#030712]/90 backdrop-blur-3xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden h-[750px] flex flex-col transition-all duration-1000 group-hover:shadow-[0_60px_120px_-20px_rgba(16,185,129,0.2)]">

                            {/* App Header (Glass) */}
                            <div className="h-20 px-8 relative z-20 flex items-center justify-between border-b border-slate-200/50 dark:border-white/5 bg-white/40 dark:bg-white/[0.02] backdrop-blur-xl">
                                   <div className="flex items-center gap-4">
                                          <div className="flex gap-2 mr-8">
                                                 <div className="w-3.5 h-3.5 rounded-full bg-red-500/20 dark:bg-red-500/10 border border-red-500/20" />
                                                 <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/20 dark:bg-yellow-500/10 border border-yellow-500/20" />
                                                 <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 dark:bg-emerald-500/10 border border-emerald-500/20" />
                                          </div>
                                          <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                                                 <Calendar className="w-4 h-4 text-emerald-500" />
                                                 <span className="font-black text-slate-800 dark:text-white text-[10px] uppercase tracking-widest">Dashboard Operativo</span>
                                          </div>
                                   </div>
                                   <div className="flex items-center gap-6">
                                          <motion.div
                                                 whileHover={{ scale: 1.05 }}
                                                 className="bg-emerald-500 px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-xl shadow-emerald-500/30 cursor-pointer"
                                          >
                                                 <Plus className="w-4 h-4 text-white" strokeWidth={3} />
                                                 <span className="text-[10px] font-black text-white uppercase tracking-widest">Nueva Reserva</span>
                                          </motion.div>
                                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-200 to-slate-300 dark:from-zinc-800 dark:to-zinc-700 p-0.5">
                                                 <div className="w-full h-full bg-white dark:bg-[#030712] rounded-[9px]" />
                                          </div>
                                   </div>
                            </div>

                            {/* Main Body */}
                            <div className="flex-1 flex overflow-hidden">

                                   {/* Sidebar */}
                                   <div className="w-64 border-r border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 p-6 flex flex-col gap-3">
                                          {[
                                                 { label: 'Visión General', icon: <BarChart3 className="w-4 h-4" />, active: false },
                                                 { label: 'Agenda Central', icon: <Calendar className="w-4 h-4" />, active: true },
                                                 { label: 'Terminal de Venta', icon: <Receipt className="w-4 h-4" />, active: false },
                                                 { label: 'Base de Clientes', icon: <Users className="w-4 h-4" />, active: false }
                                          ].map((item, i) => (
                                                 <div key={i} className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${item.active ? 'bg-white dark:bg-white/5 text-emerald-500 shadow-xl shadow-emerald-500/5 border border-slate-200 dark:border-white/10' : 'text-slate-500 dark:text-zinc-600 hover:text-slate-900 dark:hover:text-zinc-300 hover:bg-white/50 dark:hover:bg-white/2'}`}>
                                                        {item.icon}
                                                        {item.label}
                                                 </div>
                                          ))}
                                   </div>

                                   {/* Content */}
                                   <div className="flex-1 p-8 flex flex-col gap-8 overflow-hidden relative">

                                          {/* Floating Simulation Cursor */}
                                          <motion.div
                                                 animate={{ left: cursorState.x, top: cursorState.y }}
                                                 transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                                 className="absolute z-50 pointer-events-none"
                                          >
                                                 <div className="relative">
                                                        <MousePointer2 className="w-6 h-6 text-emerald-500 fill-emerald-500 group-hover:scale-110 transition-transform" />
                                                        <motion.div
                                                               initial={{ opacity: 0, scale: 0.8 }}
                                                               animate={{ opacity: 1, scale: 1 }}
                                                               className="absolute top-8 left-4 px-4 py-2 bg-black/90 dark:bg-white text-white dark:text-black rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap shadow-2xl border border-white/10"
                                                        >
                                                               {cursorState.label}
                                                        </motion.div>
                                                        <motion.div
                                                               animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                                                               transition={{ duration: 2, repeat: Infinity }}
                                                               className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-xl"
                                                        />
                                                 </div>
                                          </motion.div>

                                          {/* Stats Header */}
                                          <div className="grid grid-cols-3 gap-6">
                                                 {[
                                                        { label: 'Ingresos Mensuales', val: '$1.420.000', color: 'emerald', icon: <DollarSign size={20} /> },
                                                        { label: 'Ocupación Media', val: '86%', color: 'indigo', icon: <BarChart3 size={20} /> },
                                                        { label: 'Nuevos Clientes', val: '+42', color: 'orange', icon: <Users size={20} /> }
                                                 ].map((stat, i) => (
                                                        <div key={i} className="bg-white/50 dark:bg-white/[0.02] p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 flex flex-col justify-between group/stat">
                                                               <div className="flex justify-between items-start mb-4">
                                                                      <div className={`p-3 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-500 border border-${stat.color}-500/20`}>
                                                                             {stat.icon}
                                                                      </div>
                                                                      <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">+12.4%</span>
                                                               </div>
                                                               <p className="text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.2em]">{stat.label}</p>
                                                               <h4 className="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tighter">{stat.val}</h4>
                                                        </div>
                                                 ))}
                                          </div>

                                          {/* Main View Grid */}
                                          <div className="flex-1 bg-white dark:bg-[#050B14] border border-slate-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col relative shadow-inner">

                                                 {/* Grid Header */}
                                                 <div className="flex border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/20">
                                                        <div className="w-20 border-r border-slate-200 dark:border-white/10" />
                                                        {['Cancha 1', 'Cancha 2', 'Cancha 3', 'Cancha 4'].map((n) => (
                                                               <div key={n} className="flex-1 py-4 text-center border-r border-slate-200 dark:border-white/10 last:border-r-0">
                                                                      <span className="text-[10px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-[0.2em]">{n}</span>
                                                               </div>
                                                        ))}
                                                 </div>

                                                 {/* Grid Rows */}
                                                 <div className="flex-1 overflow-hidden relative">
                                                        {[16, 17, 18, 19, 20].map((hour, rowIdx) => (
                                                               <div key={hour} className="flex border-b border-slate-200/50 dark:border-white/5 h-[100px]">
                                                                      <div className="w-20 border-r border-slate-200 dark:border-white/10 flex items-center justify-center bg-slate-50/30 dark:bg-black/10">
                                                                             <span className="text-[10px] font-black text-slate-400 dark:text-zinc-600">{hour}:00</span>
                                                                      </div>
                                                                      {[0, 1, 2, 3].map((colIdx) => {
                                                                             const isActive = (hour === 18 && colIdx === 1) || (hour === 19 && colIdx === 0)
                                                                             const isSimulated = (hour === 18 && colIdx === activeSlot)

                                                                             return (
                                                                                    <div
                                                                                           key={colIdx}
                                                                                           className={cn(
                                                                                                  "flex-1 border-r border-slate-200/50 dark:border-white/5 p-2 transition-all duration-500 last:border-r-0",
                                                                                                  isSimulated && "bg-emerald-500/5 scale-[0.98]"
                                                                                           )}
                                                                                    >
                                                                                           {isActive && (
                                                                                                  <motion.div
                                                                                                         layoutId={`res-${rowIdx}-${colIdx}`}
                                                                                                         className="w-full h-full rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 p-4 flex flex-col justify-between shadow-lg shadow-emerald-500/5"
                                                                                                  >
                                                                                                         <div className="flex justify-between items-center">
                                                                                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                                                                                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Confirmado</span>
                                                                                                         </div>
                                                                                                         <span className="text-xs font-black text-slate-900 dark:text-white uppercase truncate">Rodrigo D.</span>
                                                                                                  </motion.div>
                                                                                           )}
                                                                                    </div>
                                                                             )
                                                                      })}
                                                               </div>
                                                        ))}

                                                        {/* Visual Fade */}
                                                        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white dark:from-[#050B14] to-transparent pointer-events-none" />
                                                 </div>

                                          </div>
                                   </div>

                            </div>

                            {/* Decorative Floating Cards Outside */}
                            <motion.div
                                   animate={{ y: [0, -15, 0] }}
                                   transition={{ duration: 4, repeat: Infinity }}
                                   className="absolute -right-12 top-1/4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl z-30 hidden lg:block"
                            >
                                   <div className="flex items-center gap-4">
                                          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-500">
                                                 <Receipt size={24} />
                                          </div>
                                          <div>
                                                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Última Venta</p>
                                                 <p className="text-lg font-black text-slate-900 dark:text-white">$12.500 <span className="text-[10px] text-zinc-500 ml-1">Kiosco</span></p>
                                          </div>
                                   </div>
                            </motion.div>

                     </div>
              </motion.div>
       )
}
