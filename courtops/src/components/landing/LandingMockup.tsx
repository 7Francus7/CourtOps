
'use client'

import React from 'react'
import { motion } from 'framer-motion'

export default function LandingMockup() {
       return (
              <motion.div
                     initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
                     animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                     transition={{ delay: 0.4, duration: 1.2, type: "spring" }}
                     className="mt-16 w-full max-w-6xl mx-auto perspective-1000 hidden md:block group relative z-20"
                     aria-hidden="true"
              >
                     {/* Glow Behind */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

                     <div className="relative rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#09090b] shadow-2xl shadow-slate-200/50 dark:shadow-black/80 overflow-hidden h-[650px] flex flex-col transition-colors">

                            {/* Dashboard Header */}
                            <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200 dark:border-white/5 bg-white dark:bg-[#09090b]">
                                   <div className="flex items-center gap-6">
                                          <span className="font-bold text-slate-800 dark:text-white text-sm">Dashboard</span>
                                          <span className="font-medium text-slate-500 dark:text-zinc-500 text-sm">Vista General</span>
                                   </div>
                                   <div className="flex items-center gap-4">
                                          <div className="bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm shadow-primary/10">
                                                 <span className="text-[10px] font-black text-primary uppercase tracking-wider">+ Nueva Reserva</span>
                                          </div>
                                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-zinc-800" />
                                   </div>
                            </div>

                            {/* Dashboard Content */}
                            <div className="p-6 flex flex-col gap-6 h-full bg-slate-50 dark:bg-[#09090b]">

                                   {/* Stats Row */}
                                   <div className="grid grid-cols-4 gap-4">
                                          {/* Ingresos - Card */}
                                          <div className="bg-white dark:bg-[#121212] p-4 rounded-xl border border-slate-200 dark:border-white/5 flex flex-col gap-1 shadow-sm dark:shadow-lg relative overflow-hidden">
                                                 <p className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest">Ingresos Hoy</p>
                                                 <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">$124.500</h3>
                                          </div>

                                          {/* Reservas Activas */}
                                          <div className="bg-white dark:bg-[#121212] p-4 rounded-xl border border-slate-200 dark:border-white/5 flex flex-col gap-1 shadow-sm dark:shadow-lg relative overflow-hidden">
                                                 <p className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest">Reservas Activas</p>
                                                 <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">18</h3>
                                          </div>

                                          {/* Clientes Nuevos */}
                                          <div className="bg-white dark:bg-[#121212] p-4 rounded-xl border border-slate-200 dark:border-white/5 flex flex-col gap-1 shadow-sm dark:shadow-lg relative overflow-hidden">
                                                 <p className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest">Clientes Nuevos</p>
                                                 <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">+5</h3>
                                          </div>

                                          {/* Ocupación */}
                                          <div className="bg-white dark:bg-[#121212] p-4 rounded-xl border border-slate-200 dark:border-white/5 flex flex-col gap-1 shadow-sm dark:shadow-lg relative overflow-hidden justify-center">
                                                 <div className="flex justify-between items-end mb-2">
                                                        <div>
                                                               <p className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest">Ocupación</p>
                                                               <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">85%</h3>
                                                        </div>
                                                 </div>
                                                 <div className="w-full h-1 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary rounded-full w-[85%]" />
                                                 </div>
                                          </div>
                                   </div>

                                   {/* Turnero Grid Container */}
                                   <div className="flex-1 bg-white dark:bg-[#121212]/50 border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden flex flex-col relative shadow-sm">
                                          {/* Grid Header */}
                                          <div className="flex border-b border-slate-200 dark:border-white/5 bg-white dark:bg-[#09090b]">
                                                 <div className="w-12 border-r border-slate-200 dark:border-white/5" /> {/* Time Col Header */}
                                                 {['Cancha 1 (Cristal)', 'Cancha 2 (Panorámica)', 'Cancha 3', 'Cancha 4'].map((name, i) => (
                                                        <div key={i} className={`flex-1 py-3 text-center border-r border-slate-200 dark:border-white/5 last:border-r-0`}>
                                                               <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{name}</span>
                                                        </div>
                                                 ))}
                                          </div>

                                          {/* Grid Content */}
                                          <div className="flex-1 overflow-hidden relative bg-slate-50 dark:bg-[#09090b]">
                                                 {/* Gradient Fade at bottom */}
                                                 <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-50 dark:from-[#09090b] to-transparent z-10 pointer-events-none" />

                                                 {[17, 18, 19, 20, 21, 22].map((hour, rowIndex) => (
                                                        <div key={hour} className="flex border-b border-slate-200 dark:border-white/5 h-20">
                                                               {/* Time Column */}
                                                               <div className="w-12 border-r border-slate-200 dark:border-white/5 flex items-center justify-center bg-white dark:bg-[#09090b]">
                                                                      <span className="text-[10px] font-medium text-slate-500 dark:text-zinc-600">{hour}:00</span>
                                                               </div>

                                                               {/* Slots */}
                                                               {[0, 1, 2, 3].map((colIndex) => {
                                                                      // Mock Data Logic
                                                                      let content = null
                                                                      if (hour === 17 && colIndex === 1) content = { type: 'sena', name: 'Juan Pérez' }
                                                                      if (hour === 18 && colIndex === 0) content = { type: 'sena', name: 'Juan Pérez' }
                                                                      if (hour === 18 && colIndex === 3) content = { type: 'pagado', name: 'Juan Pérez' }
                                                                      if (hour === 19 && colIndex === 2) content = { type: 'pagado', name: 'Juan Pérez' }
                                                                      if (hour === 20 && colIndex === 1) content = { type: 'pagado', name: 'Juan Pérez' }
                                                                      if (hour === 21 && colIndex === 0) content = { type: 'pagado', name: 'Juan Pérez' }
                                                                      if (hour === 21 && colIndex === 3) content = { type: 'sena', name: 'Juan Pérez' }
                                                                      if (hour === 22 && colIndex === 2) content = { type: 'sena', name: 'Juan Pérez' }

                                                                      return (
                                                                             <div key={colIndex} className="flex-1 border-r border-slate-200 dark:border-white/5 p-1 relative group hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors last:border-r-0">
                                                                                    {content && (
                                                                                           <div className={`w-full h-full rounded-lg p-3 flex flex-col justify-between shadow-sm border ${content.type === 'pagado'
                                                                                                  ? 'bg-emerald-100 border-emerald-200 dark:bg-primary/20 dark:border-primary/20'
                                                                                                  : 'bg-blue-100 border-blue-200 dark:bg-secondary/20 dark:border-secondary/20'
                                                                                                  }`}>
                                                                                                  <span className={`text-[9px] font-black uppercase tracking-wider ${content.type === 'pagado' ? 'text-primary' : 'text-blue-600 dark:text-secondary'
                                                                                                         }`}>
                                                                                                         {content.type === 'pagado' ? 'PAGADO' : 'SEÑA 50%'}
                                                                                                  </span>
                                                                                                  <span className="text-[10px] font-bold text-slate-900 dark:text-white/90 truncate">
                                                                                                         {content.name}
                                                                                                  </span>
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
                     </div>
              </motion.div>
       )
}
