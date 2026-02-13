
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'
import Link from 'next/link'

export default function LandingHero() {
       return (
              <section className="relative min-h-[95vh] flex flex-col items-center justify-start pt-32 md:pt-48 p-6 overflow-hidden bg-white dark:bg-[#0a0a0a]">

                     {/* Dynamic Background */}
                     <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-white to-white dark:from-zinc-900 dark:via-black dark:to-black" />
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none opacity-60 animate-pulse" />
                     <div className="absolute bottom-0 right-0 w-[800px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none opacity-60" />
                     <div className="absolute top-1/4 left-1/4 w-[400px] h-[300px] bg-emerald-400/10 rounded-full blur-[80px] pointer-events-none" />

                     {/* Grid Pattern */}
                     <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,black,rgba(255,255,255,0))]" style={{ opacity: 0.03 }} />

                     <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="relative z-10 text-center space-y-8 max-w-5xl mx-auto px-4"
                     >


                            {/* Headline */}
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-slate-900 dark:text-white leading-none drop-shadow-sm mb-6">
                                   Tu club, <br />
                                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-500 to-blue-600 dark:from-emerald-400 dark:via-emerald-500 dark:to-blue-500">
                                          en piloto automático.
                                   </span>
                            </h1>

                            <p className="text-lg md:text-2xl text-slate-500 dark:text-zinc-400 font-medium max-w-3xl mx-auto leading-relaxed">
                                   La plataforma definitiva para clubes deportivos. <br className="hidden md:block" />
                                   <span className="text-slate-900 dark:text-white font-bold">Reservas, Pagos, Kiosco y Métricas</span> en un solo lugar.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mt-10">
                                   <Link href="/register" className="group relative w-full sm:w-auto">
                                          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-200" />
                                          <button className="relative w-full sm:w-auto px-8 py-5 bg-slate-900 text-white dark:bg-white dark:text-black rounded-xl font-black text-lg transition-transform active:scale-95 flex items-center justify-center gap-3">
                                                 Prueba Gratis 14 Días
                                                 <ArrowRight className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                                          </button>
                                   </Link>

                                   <Link href="/login" className="w-full sm:w-auto px-8 py-5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white dark:hover:border-white/20 rounded-xl font-bold transition-all flex items-center justify-center gap-3 active:scale-95 group shadow-sm">
                                          <Play size={18} fill="currentColor" className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                                          Ver Demo
                                   </Link>
                            </div>



                     </motion.div>

                     {/* 3D Mockup Container */}
                     <motion.div
                            initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
                            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                            transition={{ delay: 0.4, duration: 1.2, type: "spring" }}
                            className="mt-16 w-full max-w-6xl mx-auto perspective-1000 hidden md:block group"
                     >
                            <div className="relative rounded-t-2xl border-t border-l border-r border-slate-200 bg-white shadow-2xl shadow-slate-200/50 dark:bg-[#1a1b1e] dark:border-white/10 dark:shadow-black/50 overflow-hidden h-[650px]">
                                   {/* Glow Effect */}
                                   <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                   {/* UI Layout */}
                                   <div className="flex h-full gap-0 text-slate-500 dark:text-zinc-500 font-sans text-xs">

                                          {/* Sidebar */}
                                          <div className="w-16 flex flex-col items-center py-4 gap-6 border-r border-slate-100 bg-slate-50/50 dark:bg-zinc-900/50 dark:border-white/5">
                                                 <div className="w-8 h-8 bg-emerald-500 rounded-lg shadow-lg shadow-emerald-500/20 flex items-center justify-center text-white font-bold">C</div>
                                                 <div className="space-y-4 w-full flex flex-col items-center">
                                                        {[1, 2, 3, 4, 5].map(i => (
                                                               <div key={i} className={`w-8 h-8 rounded-md flex items-center justify-center ${i === 1 ? 'bg-white shadow-sm text-emerald-600 border border-slate-100 dark:bg-white/10 dark:border-white/10 dark:text-emerald-400' : 'hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-slate-400 dark:text-zinc-600'}`}>
                                                                      <div className={`w-4 h-4 rounded-sm ${i === 1 ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-zinc-700'}`} />
                                                               </div>
                                                        ))}
                                                 </div>
                                          </div>

                                          {/* Content Area */}
                                          <div className="flex-1 flex flex-col bg-white dark:bg-[#09090b]">
                                                 {/* Header */}
                                                 <div className="h-14 border-b border-slate-100 dark:border-white/5 flex items-center justify-between px-6 bg-white dark:bg-[#09090b]">
                                                        <div className="flex items-center gap-4">
                                                               <span className="font-bold text-slate-900 dark:text-zinc-200">Dashboard</span>
                                                               <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10" />
                                                               <span className="text-slate-400 dark:text-zinc-500 font-medium">Vista General</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                               <div className="w-28 h-8 bg-emerald-50 border border-emerald-100 rounded-md flex items-center justify-center text-emerald-600 text-[10px] font-bold tracking-wider shadow-sm dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400">
                                                                      + NUEVA RESERVA
                                                               </div>
                                                               <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 dark:bg-white/5 dark:border-white/10" />
                                                        </div>
                                                 </div>

                                                 <div className="p-4 flex flex-col gap-4 h-full bg-slate-50/30 dark:bg-black/20">
                                                        {/* Stats Row */}
                                                        <div className="grid grid-cols-4 gap-4">
                                                               {['Ingresos Hoy', 'Reservas Activas', 'Clientes Nuevos', 'Ocupación'].map((label, i) => (
                                                                      <div key={i} className="bg-white dark:bg-zinc-900/50 border border-slate-100 dark:border-white/5 p-4 rounded-xl flex flex-col gap-1 shadow-sm hover:shadow-md transition-all group/card">
                                                                             <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-bold">{label}</span>
                                                                             <div className="flex items-end justify-between">
                                                                                    <span className="text-xl font-black text-slate-900 dark:text-white group-hover/card:text-emerald-600 dark:group-hover/card:text-emerald-400 transition-colors">
                                                                                           {i === 0 ? '$124.500' : i === 1 ? '18' : i === 2 ? '+5' : '85%'}
                                                                                    </span>
                                                                                    {i === 3 && <div className="w-12 h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden"><div className="h-full w-[85%] bg-emerald-500" /></div>}
                                                                             </div>
                                                                      </div>
                                                               ))}
                                                        </div>

                                                        {/* Main Grid: Courts */}
                                                        <div className="flex-1 bg-white dark:bg-zinc-900/30 border border-slate-100 dark:border-white/5 rounded-xl p-5 shadow-sm relative overflow-hidden">
                                                               <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent dark:from-black/50 pointer-events-none z-10" />

                                                               <div className="flex gap-4 mb-4 border-b border-slate-100 dark:border-white/5 pb-3">
                                                                      {['Cancha 1 (Cristal)', 'Cancha 2 (Panorámica)', 'Cancha 3', 'Cancha 4'].map((c, i) => (
                                                                             <div key={i} className="flex-1 text-center font-bold text-xs text-slate-600 dark:text-zinc-400 pb-2 border-b-2 border-transparent hover:border-emerald-500/50 transition-colors cursor-default">
                                                                                    {c}
                                                                             </div>
                                                                      ))}
                                                               </div>

                                                               {/* Time Slots Mockup */}
                                                               <div className="space-y-3">
                                                                      {[1, 2, 3, 4, 5, 6].map((row) => (
                                                                             <div key={row} className="flex gap-4">
                                                                                    <div className="w-12 text-right text-slate-400 dark:text-zinc-600 font-medium text-[10px] pt-3">{16 + row}:00</div>
                                                                                    <div className="flex-1 grid grid-cols-4 gap-4">
                                                                                           {[1, 2, 3, 4].map((col) => {
                                                                                                  // Randomly fill some slots
                                                                                                  const isBooked = (row + col) % 3 === 0;
                                                                                                  const isPaid = (row + col) % 2 === 0;
                                                                                                  return (
                                                                                                         <div key={col} className={`h-14 rounded-xl border flex flex-col justify-center px-4 relative overflow-hidden transition-all duration-300 ${isBooked
                                                                                                                ? (isPaid ? 'bg-emerald-50 border-emerald-100 shadow-sm dark:bg-emerald-500/20 dark:border-emerald-500/30' : 'bg-blue-50 border-blue-100 shadow-sm dark:bg-blue-500/20 dark:border-blue-500/30')
                                                                                                                : 'border-slate-100 bg-slate-50/50 border-dashed hover:border-emerald-200 dark:border-white/5 dark:bg-white/5 dark:hover:border-white/20'}`}>
                                                                                                                {isBooked && (
                                                                                                                       <>
                                                                                                                              <span className={`text-[10px] font-black uppercase tracking-tight ${isPaid ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                                                                                                                     {isPaid ? 'Pagado' : 'Seña 50%'}
                                                                                                                              </span>
                                                                                                                              <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium truncate">Juan Pérez</span>
                                                                                                                       </>
                                                                                                                )}
                                                                                                         </div>
                                                                                                  )
                                                                                           })}
                                                                                    </div>
                                                                             </div>
                                                                      ))}
                                                               </div>
                                                        </div>
                                                 </div>
                                          </div>
                                   </div>
                            </div>
                     </motion.div>

              </section>
       )
}
