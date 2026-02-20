
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, DollarSign, Users, ChevronRight, BarChart3 } from 'lucide-react'

export default function LandingMockup() {
       return (
              <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: 40 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     transition={{ delay: 0.4, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                     className="mt-16 w-full max-w-6xl mx-auto hidden md:block group relative z-20 perspective-[2000px]"
                     aria-hidden="true"
              >
                     {/* Powerful Glow Behind Mockup */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-emerald-500/20 dark:bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />

                     {/* The Floating Window Container */}
                     <div className="relative rounded-[2rem] border border-slate-200/50 dark:border-white/10 bg-slate-50/50 dark:bg-[#050B14]/80 backdrop-blur-3xl shadow-[0_30px_100px_-20px_rgba(0,0,0,0.15)] dark:shadow-[0_0_80px_rgba(16,185,129,0.1)] overflow-hidden h-[700px] flex flex-col transition-colors group-hover:shadow-[0_40px_120px_-20px_rgba(16,185,129,0.2)] dark:group-hover:shadow-[0_0_120px_rgba(16,185,129,0.15)] group-hover:-translate-y-2 duration-700">

                            {/* MacOS Style Header Overlay */}
                            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/80 to-transparent dark:from-[#050B14]/80 pointer-events-none z-10" />

                            {/* App Header (Glass) */}
                            <div className="h-16 px-6 relative z-20 flex items-center justify-between border-b border-slate-200/50 dark:border-white/5 bg-white/40 dark:bg-white/[0.02] backdrop-blur-md">
                                   <div className="flex items-center gap-3">
                                          <div className="flex gap-1.5 mr-6">
                                                 <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-zinc-700 hover:bg-red-400 transition-colors" />
                                                 <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-zinc-700 hover:bg-yellow-400 transition-colors" />
                                                 <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-zinc-700 hover:bg-green-400 transition-colors" />
                                          </div>
                                          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 dark:bg-white/5 rounded-lg border border-slate-200/50 dark:border-white/5">
                                                 <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                                                 <span className="font-bold text-slate-800 dark:text-white text-xs">Agenda Hoy</span>
                                          </div>
                                   </div>
                                   <div className="flex items-center gap-4">
                                          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer hover:scale-105 transition-transform">
                                                 <span className="text-xs font-bold text-white uppercase tracking-wider">+ Nueva Reserva</span>
                                          </div>
                                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 dark:from-zinc-800 dark:to-zinc-700 p-0.5">
                                                 <div className="w-full h-full bg-white dark:bg-[#050B14] rounded-full" />
                                          </div>
                                   </div>
                            </div>

                            {/* Main Dashboard Layout */}
                            <div className="flex-1 flex overflow-hidden bg-transparent relative z-0">

                                   {/* Sidebar Mock */}
                                   <div className="w-56 border-r border-slate-200/50 dark:border-white/5 bg-white/20 dark:bg-[#050B14]/40 p-4 flex flex-col gap-2">
                                          {[
                                                 { label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" />, active: false },
                                                 { label: 'Agenda', icon: <Calendar className="w-4 h-4" />, active: true },
                                                 { label: 'Caja', icon: <DollarSign className="w-4 h-4" />, active: false },
                                                 { label: 'Clientes', icon: <Users className="w-4 h-4" />, active: false }
                                          ].map((item, i) => (
                                                 <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-colors ${item.active ? 'bg-white dark:bg-white/10 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/50 dark:border-white/5' : 'text-slate-500 dark:text-zinc-500 hover:bg-white/50 dark:hover:bg-white/5'}`}>
                                                        {item.icon}
                                                        {item.label}
                                                 </div>
                                          ))}
                                   </div>

                                   {/* Content Area */}
                                   <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden relative">

                                          {/* KPI Cards */}
                                          <div className="grid grid-cols-4 gap-4">
                                                 <div className="bg-white/60 dark:bg-white/5 p-5 rounded-2xl border border-slate-200/50 dark:border-white/10 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                                                        <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-20 group-hover:scale-110 transition-transform"><DollarSign className="w-12 h-12 text-emerald-600" /></div>
                                                        <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest relative z-10">Ingresos Hoy</p>
                                                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mt-2 relative z-10">$184.500</h3>
                                                 </div>
                                                 <div className="bg-white/60 dark:bg-white/5 p-5 rounded-2xl border border-slate-200/50 dark:border-white/10 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                                                        <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-20 group-hover:scale-110 transition-transform"><Calendar className="w-12 h-12 text-blue-600" /></div>
                                                        <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest relative z-10">Reservas</p>
                                                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mt-2 relative z-10">24</h3>
                                                 </div>
                                                 <div className="bg-white/60 dark:bg-white/5 p-5 rounded-2xl border border-slate-200/50 dark:border-white/10 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                                                        <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-20 group-hover:scale-110 transition-transform"><Users className="w-12 h-12 text-orange-600" /></div>
                                                        <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest relative z-10">Ocupación</p>
                                                        <div className="mt-2 relative z-10">
                                                               <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">92%</h3>
                                                               <div className="w-full h-1.5 bg-slate-200/50 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                                      <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full w-[92%]" />
                                                               </div>
                                                        </div>
                                                 </div>
                                          </div>

                                          {/* Turnero Grid Container */}
                                          <div className="flex-1 bg-white dark:bg-[#0A101A] border border-slate-200/80 dark:border-white/10 rounded-2xl overflow-hidden flex flex-col relative shadow-md">
                                                 {/* Grid Header */}
                                                 <div className="flex border-b border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-[#050B14]">
                                                        <div className="w-16 border-r border-slate-200/80 dark:border-white/10" />
                                                        {['Cancha 1', 'Cancha 2', 'Cancha 3', 'Cancha 4'].map((name, i) => (
                                                               <div key={i} className="flex-1 py-3 text-center border-r border-slate-200/80 dark:border-white/10 last:border-r-0">
                                                                      <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-widest">{name}</span>
                                                               </div>
                                                        ))}
                                                 </div>

                                                 {/* Grid Content */}
                                                 <div className="flex-1 overflow-hidden relative">
                                                        {/* Gradient Fade for Mockup */}
                                                        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-[#0A101A] dark:via-[#0A101A]/80 z-20 pointer-events-none" />

                                                        {[16, 17, 18, 19, 20].map((hour) => (
                                                               <div key={hour} className="flex border-b border-slate-200/50 dark:border-white/5 h-[88px]">
                                                                      {/* Time Col */}
                                                                      <div className="w-16 border-r border-slate-200/50 dark:border-white/5 flex items-center justify-center bg-slate-50 dark:bg-[#050B14]">
                                                                             <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-500">{hour}:00</span>
                                                                      </div>

                                                                      {/* Slots */}
                                                                      {[0, 1, 2, 3].map((colIndex) => {
                                                                             let content = null
                                                                             if (hour === 17 && colIndex === 1) content = { type: 'sena', name: 'Martín C.' }
                                                                             if (hour === 18 && colIndex === 0) content = { type: 'pagado', name: 'Leo Messi' }
                                                                             if (hour === 18 && colIndex === 3) content = { type: 'pagado', name: 'Carlos T.' }
                                                                             if (hour === 19 && colIndex === 2) content = { type: 'sena', name: 'Juan P.' }
                                                                             if (hour === 20 && colIndex === 1) content = { type: 'pagado', name: 'Nico O.' }
                                                                             if (hour === 16 && colIndex === 2) content = { type: 'pagado', name: 'Fede C.' }

                                                                             return (
                                                                                    <div key={colIndex} className="flex-1 border-r border-slate-200/50 dark:border-white/5 p-1.5 relative group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors last:border-r-0 cursor-pointer">
                                                                                           {content && (
                                                                                                  <div className={`w-full h-full rounded-[10px] p-3 flex flex-col justify-between border ${content.type === 'pagado'
                                                                                                         ? 'bg-gradient-to-br from-emerald-100 to-emerald-50 border-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/20 dark:border-emerald-500/30'
                                                                                                         : 'bg-gradient-to-br from-orange-100 to-orange-50 border-orange-200 dark:from-orange-900/40 dark:to-orange-800/20 dark:border-orange-500/30'
                                                                                                         } shadow-sm group-hover:shadow-md transition-shadow relative overflow-hidden`}>
                                                                                                         <div className="absolute top-0 right-0 w-8 h-8 bg-white/40 dark:bg-white/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2" />

                                                                                                         <div className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${content.type === 'pagado' ? 'text-emerald-700 dark:text-emerald-400' : 'text-orange-700 dark:text-orange-400'}`}>
                                                                                                                <span className={`w-1.5 h-1.5 rounded-full ${content.type === 'pagado' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                                                                                                                {content.type === 'pagado' ? 'Abonado' : 'Señado'}
                                                                                                         </div>

                                                                                                         <div className="flex items-center justify-between mt-auto">
                                                                                                                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                                                                                       {content.name}
                                                                                                                </span>
                                                                                                                <span className="text-[10px] font-medium text-slate-500 dark:text-white/50 bg-white/50 dark:bg-black/20 px-1.5 rounded">90'</span>
                                                                                                         </div>
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
                     </div>
              </motion.div>
       )
}
