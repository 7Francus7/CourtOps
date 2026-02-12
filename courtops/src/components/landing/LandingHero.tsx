
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Play, CheckCircle2, Star } from 'lucide-react'
import Link from 'next/link'

export default function LandingHero() {
       return (
              <section className="relative min-h-[95vh] flex flex-col items-center justify-center p-6 overflow-hidden bg-[#0a0a0a]">

                     {/* Dynamic Background */}
                     <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/10 via-black to-black" />
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none opacity-30 animate-pulse" />
                     <div className="absolute bottom-0 right-0 w-[800px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none opacity-30" />

                     {/* Grid Pattern */}
                     <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

                     <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="relative z-10 text-center space-y-8 max-w-5xl mx-auto px-4"
                     >
                            {/* Badge */}
                            <motion.div
                                   initial={{ opacity: 0, scale: 0.8 }}
                                   animate={{ opacity: 1, scale: 1 }}
                                   transition={{ delay: 0.2 }}
                                   className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-sm font-bold uppercase tracking-widest backdrop-blur-sm shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                            >
                                   <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                                   CourtOps v3.0 Is Live
                            </motion.div>

                            {/* Headline */}
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[0.9] drop-shadow-2xl">
                                   Tu club, <br />
                                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-200 to-blue-400">
                                          en piloto automático.
                                   </span>
                            </h1>

                            <p className="text-lg md:text-2xl text-zinc-400 font-medium max-w-3xl mx-auto leading-relaxed">
                                   La plataforma definitiva para clubes deportivos. <br className="hidden md:block" />
                                   <span className="text-white">Reservas, Pagos, Kiosco y Métricas</span> en un solo lugar.
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

                            {/* Trust Badge */}
                            <div className="pt-12 flex flex-col items-center gap-4 opacity-70">
                                   <div className="flex -space-x-3">
                                          {[1, 2, 3, 4].map((i) => (
                                                 <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">
                                                        {i}
                                                 </div>
                                          ))}
                                          <div className="w-10 h-10 rounded-full border-2 border-black bg-emerald-500 flex items-center justify-center text-xs font-bold text-black">
                                                 +50
                                          </div>
                                   </div>
                                   <div className="flex items-center gap-2 text-sm text-zinc-400 font-medium">
                                          <div className="flex text-amber-500"><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /></div>
                                          <span className="text-white font-bold">4.9/5</span> de valoración de clubes
                                   </div>
                            </div>

                     </motion.div>

                     {/* 3D Mockup Container (Conceptual) */}
                     <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotateX: 20 }}
                            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                            transition={{ delay: 0.4, duration: 1.2, type: "spring" }}
                            className="mt-20 w-full max-w-6xl mx-auto perspective-1000 hidden md:block"
                     >
                            <div className="relative rounded-t-3xl border-t border-l border-r border-white/10 bg-[#09090b]/80 backdrop-blur-xl shadow-[0_-20px_60px_-15px_rgba(16,185,129,0.1)] overflow-hidden h-[600px] mask-image-gradient">
                                   <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-20 pointer-events-none" />

                                   {/* Abstract Grid Representation */}
                                   <div className="p-8 grid grid-cols-12 gap-6 h-full opacity-60 transform scale-[0.98]">
                                          {/* Sidebar */}
                                          <div className="col-span-2 space-y-4">
                                                 <div className="h-12 w-12 bg-emerald-500 rounded-xl mb-8" />
                                                 <div className="h-10 w-full bg-white/10 rounded-lg" />
                                                 <div className="h-10 w-full bg-white/5 rounded-lg" />
                                                 <div className="h-10 w-full bg-white/5 rounded-lg" />
                                                 <div className="h-10 w-full bg-white/5 rounded-lg" />
                                          </div>

                                          {/* Main Content */}
                                          <div className="col-span-10 space-y-6">
                                                 <div className="flex justify-between">
                                                        <div className="h-14 w-1/3 bg-white/5 rounded-xl" />
                                                        <div className="h-14 w-40 bg-emerald-500/20 rounded-xl" />
                                                 </div>

                                                 <div className="grid grid-cols-4 gap-4 h-full">
                                                        {[1, 2, 3, 4].map(i => (
                                                               <div key={i} className="bg-white/5 rounded-2xl h-96 border border-white/5 relative overflow-hidden">
                                                                      <div className="absolute top-4 left-4 right-4 h-32 bg-white/5 rounded-xl" />
                                                                      <div className="absolute bottom-4 left-4 right-4 h-12 bg-emerald-500/10 rounded-xl border border-emerald-500/20" />
                                                               </div>
                                                        ))}
                                                 </div>
                                          </div>
                                   </div>
                            </div>
                     </motion.div>

              </section>
       )
}
