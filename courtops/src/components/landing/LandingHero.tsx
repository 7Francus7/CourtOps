
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

                     {/* 3D Mockup Container (Conceptual) */}
                     <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotateX: 20 }}
                            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                            transition={{ delay: 0.4, duration: 1.2, type: "spring" }}
                            className="mt-16 w-full max-w-6xl mx-auto perspective-1000 hidden md:block"
                     >
                            <div className="relative rounded-t-3xl border-t border-l border-r border-white/20 bg-zinc-900/40 backdrop-blur-2xl shadow-[0_-20px_60px_-15px_rgba(16,185,129,0.2)] overflow-hidden h-[600px] mask-image-gradient group">
                                   <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-black/80 z-20 pointer-events-none" />

                                   {/* Abstract Grid Representation */}
                                   <div className="p-8 grid grid-cols-12 gap-6 h-full opacity-80 transform scale-[0.98] group-hover:scale-100 transition-transform duration-700">
                                          {/* Sidebar */}
                                          <div className="col-span-2 space-y-4">
                                                 <div className="h-12 w-12 bg-emerald-500 rounded-xl mb-8 shadow-lg shadow-emerald-500/20" />
                                                 <div className="h-10 w-full bg-white/10 rounded-lg" />
                                                 <div className="h-10 w-full bg-white/5 rounded-lg" />
                                                 <div className="h-10 w-full bg-white/5 rounded-lg" />
                                                 <div className="h-10 w-full bg-white/5 rounded-lg" />
                                          </div>

                                          {/* Main Content */}
                                          <div className="col-span-10 space-y-6">
                                                 <div className="flex justify-between">
                                                        <div className="h-14 w-1/3 bg-white/5 rounded-xl border border-white/5" />
                                                        <div className="h-14 w-40 bg-emerald-500/10 border border-emerald-500/20 rounded-xl" />
                                                 </div>

                                                 <div className="grid grid-cols-4 gap-4 h-full">
                                                        {[1, 2, 3, 4].map(i => (
                                                               <div key={i} className="bg-white/5 rounded-2xl h-80 border border-white/5 relative overflow-hidden group-hover:border-white/10 transition-colors">
                                                                      <div className="absolute top-4 left-4 right-4 h-32 bg-gradient-to-br from-white/10 to-white/5 rounded-xl" />
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
