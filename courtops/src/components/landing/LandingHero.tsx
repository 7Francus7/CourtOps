
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Play, CheckCircle2, Star } from 'lucide-react'
import Link from 'next/link'

export default function LandingHero() {
       return (
              <section className="relative min-h-[95vh] flex flex-col items-center justify-center p-6 overflow-hidden bg-[#0a0a0a]">

                     {/* Dynamic Background */}
                     {/* Dynamic Background */}
                     <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#0a0a0a] to-[#050505]" />
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none opacity-40 animate-pulse" />
                     <div className="absolute bottom-0 right-0 w-[800px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none opacity-40" />
                     <div className="absolute top-1/4 left-1/4 w-[400px] h-[300px] bg-emerald-400/5 rounded-full blur-[80px] pointer-events-none" />

                     {/* Grid Pattern */}
                     <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

                     <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="relative z-10 text-center space-y-8 max-w-5xl mx-auto px-4"
                     >


                            {/* Headline */}
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-none drop-shadow-2xl mb-6">
                                   Tu club, <br />
                                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-200 to-blue-400">
                                          en piloto automático.
                                   </span>
                            </h1>

                            <p className="text-lg md:text-2xl text-zinc-400 font-medium max-w-3xl mx-auto leading-relaxed">
                                   La plataforma definitiva para clubes deportivos. <br className="hidden md:block" />
                                   <span className="text-white font-semibold">Reservas, Pagos, Kiosco y Métricas</span> en un solo lugar.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mt-10">
                                   <Link href="/register" className="group relative w-full sm:w-auto">
                                          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-200" />
                                          <button className="relative w-full sm:w-auto px-8 py-5 bg-white rounded-xl font-black text-black text-lg transition-transform active:scale-95 flex items-center justify-center gap-3">
                                                 Prueba Gratis 14 Días
                                                 <ArrowRight className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                                          </button>
                                   </Link>

                                   <Link href="/login" className="w-full sm:w-auto px-8 py-5 bg-white/5 border border-white/10 rounded-xl font-bold text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-3 active:scale-95 group">
                                          <Play size={18} fill="currentColor" className="text-white/80 group-hover:text-white" />
                                          Ver Demo
                                   </Link>
                            </div>



                     </motion.div>

                     {/* 3D Mockup Container (High Fidelity) */}
                     <motion.div
                            initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
                            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                            transition={{ delay: 0.4, duration: 1.2, type: "spring" }}
                            className="mt-16 w-full max-w-6xl mx-auto perspective-1000 hidden md:block group"
                     >
                            <div className="relative rounded-t-2xl border-t border-l border-r border-white/10 bg-[#0c0c0c]/90 backdrop-blur-2xl shadow-[0_-20px_60px_-15px_rgba(16,185,129,0.15)] overflow-hidden h-[650px]">
                                   {/* Glow Effect */}
                                   <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                   {/* UI Layout */}
                                   <div className="flex h-full p-2 gap-2 text-zinc-400 font-sans text-xs">

                                          {/* Sidebar */}
                                          <div className="w-16 flex flex-col items-center py-4 gap-6 border-r border-white/5 bg-white/5 rounded-l-xl">
                                                 <div className="w-8 h-8 bg-emerald-500 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center justify-center text-black font-bold">C</div>
                                                 <div className="space-y-4 w-full flex flex-col items-center">
                                                        {[1, 2, 3, 4, 5].map(i => (
                                                               <div key={i} className={`w-8 h-8 rounded-md flex items-center justify-center ${i === 1 ? 'bg-white/10 text-white' : 'hover:bg-white/5 transition-colors'}`}>
                                                                      <div className={`w-4 h-4 rounded-sm ${i === 1 ? 'bg-white' : 'bg-zinc-600'}`} />
                                                               </div>
                                                        ))}
                                                 </div>
                                          </div>

                                          {/* Content Area */}
                                          <div className="flex-1 flex flex-col gap-2">
                                                 {/* Header */}
                                                 <div className="h-12 border-b border-white/5 flex items-center justify-between px-6 bg-white/5 rounded-t-xl">
                                                        <div className="flex items-center gap-4">
                                                               <span className="font-semibold text-white">Dashboard</span>
                                                               <div className="h-4 w-[1px] bg-white/10" />
                                                               <span className="text-zinc-500">Vista General</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                               <div className="w-24 h-8 bg-emerald-500/10 border border-emerald-500/20 rounded-md flex items-center justify-center text-emerald-400 text-[10px] font-bold tracking-wider">
                                                                      + NUEVA RESERVA
                                                               </div>
                                                               <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10" />
                                                        </div>
                                                 </div>

                                                 {/* Stats Row */}
                                                 <div className="grid grid-cols-4 gap-2">
                                                        {['Ingresos Hoy', 'Reservas Activas', 'Clientes Nuevos', 'Ocupación'].map((label, i) => (
                                                               <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-xl flex flex-col gap-1 hover:bg-white/10 transition-colors group/card">
                                                                      <span className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</span>
                                                                      <div className="flex items-end justify-between">
                                                                             <span className="text-xl font-bold text-white group-hover/card:text-emerald-400 transition-colors">
                                                                                    {i === 0 ? '$124.500' : i === 1 ? '18' : i === 2 ? '+5' : '85%'}
                                                                             </span>
                                                                             {i === 3 && <div className="w-12 h-1 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full w-[85%] bg-emerald-500" /></div>}
                                                                      </div>
                                                               </div>
                                                        ))}
                                                 </div>

                                                 {/* Main Grid: Courts */}
                                                 <div className="flex-1 bg-white/5 border border-white/5 rounded-xl p-4 overflow-hidden relative">
                                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0c0c0c]/80 pointer-events-none z-10" />

                                                        <div className="flex gap-4 mb-4 border-b border-white/5 pb-2">
                                                               {['Cancha 1 (Cristal)', 'Cancha 2 (Panorámica)', 'Cancha 3', 'Cancha 4'].map((c, i) => (
                                                                      <div key={i} className="flex-1 text-center font-medium text-zinc-300 pb-2 border-b-2 border-transparent hover:border-emerald-500/50 transition-colors cursor-default">
                                                                             {c}
                                                                      </div>
                                                               ))}
                                                        </div>

                                                        {/* Time Slots Mockup */}
                                                        <div className="space-y-2 opacity-80">
                                                               {[1, 2, 3, 4, 5].map((row) => (
                                                                      <div key={row} className="flex gap-4">
                                                                             <div className="w-12 text-right text-zinc-600 text-[10px] pt-2">{16 + row}:00</div>
                                                                             <div className="flex-1 grid grid-cols-4 gap-4">
                                                                                    {[1, 2, 3, 4].map((col) => {
                                                                                           // Randomly fill some slots
                                                                                           const isBooked = (row + col) % 3 === 0;
                                                                                           const isPaid = (row + col) % 2 === 0;
                                                                                           return (
                                                                                                  <div key={col} className={`h-12 rounded-lg border flex flex-col justify-center px-3 relative overflow-hidden ${isBooked
                                                                                                         ? (isPaid ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-blue-500/10 border-blue-500/20')
                                                                                                         : 'border-white/5 bg-zinc-900/50 border-dashed'}`}>
                                                                                                         {isBooked && (
                                                                                                                <>
                                                                                                                       <span className={`text-[10px] font-bold ${isPaid ? 'text-emerald-400' : 'text-blue-400'}`}>
                                                                                                                              {isPaid ? 'Pagado' : 'Seña 50%'}
                                                                                                                       </span>
                                                                                                                       <span className="text-[9px] text-zinc-500">Juan Pérez</span>
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
                     </motion.div>

              </section>
       )
}
