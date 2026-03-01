'use client'

import React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Zap, ShieldCheck, Activity, Globe } from 'lucide-react'
import Link from 'next/link'

export default function LandingHero() {
       const { scrollY } = useScroll()
       const opacity = useTransform(scrollY, [0, 300], [1, 0])

       return (
              <section
                     className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 md:pt-32 p-4 md:p-6 overflow-hidden bg-black antialiased"
              >
                     {/* Clean Background Glow */}
                     <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#0a192f_0%,_#000000_100%)] opacity-60" />
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_20%,_rgba(16,185,129,0.05)_0%,_transparent_70%)] pointer-events-none" />

                     <div className="relative z-10 text-center max-w-5xl mx-auto px-4 w-full flex flex-col items-center">

                            {/* Minimal Badge */}
                            <motion.div
                                   initial={{ opacity: 0, y: -10 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   className="mb-10"
                            >
                                   <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-xl">
                                          <Zap size={10} fill="currentColor" />
                                          Gestión de Elite
                                   </div>
                            </motion.div>

                            {/* Simple, Powerful Headline */}
                            <div className="space-y-8 mb-16">
                                   <motion.h1
                                          initial={{ opacity: 0, y: 20 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ duration: 0.8 }}
                                          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[1.1] uppercase italic"
                                   >
                                          Redefine la gestión <br />
                                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-500">de tu club.</span>
                                   </motion.h1>

                                   <motion.p
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          transition={{ delay: 0.2, duration: 0.8 }}
                                          className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed opacity-80"
                                   >
                                          La plataforma definitiva para automatizar cada centímetro de tu operación deportiva con elegancia y precisión.
                                   </motion.p>
                            </div>

                            {/* Action Buttons */}
                            <motion.div
                                   initial={{ opacity: 0, y: 10 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   transition={{ delay: 0.4 }}
                                   className="flex flex-col sm:flex-row items-center gap-6"
                            >
                                   <Link href="/register" className="px-10 py-5 rounded-2xl bg-white text-black font-black text-sm uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center gap-2 active:scale-95 shadow-xl">
                                          Empezar Gratis <ArrowRight size={16} />
                                   </Link>

                                   <a
                                          href="https://wa.me/5493524421497"
                                          className="px-8 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
                                   >
                                          Ver Demo
                                   </a>
                            </motion.div>

                            {/* Minimal Trust Indicators */}
                            <motion.div
                                   initial={{ opacity: 0 }}
                                   animate={{ opacity: 1 }}
                                   transition={{ delay: 0.6 }}
                                   className="mt-24 flex flex-wrap justify-center items-center gap-x-12 gap-y-6 text-zinc-600"
                            >
                                   <div className="flex items-center gap-2">
                                          <ShieldCheck size={14} className="text-emerald-500/50" />
                                          <span className="text-[10px] font-black uppercase tracking-widest">Seguridad 256-bit</span>
                                   </div>
                                   <div className="flex items-center gap-2">
                                          <Activity size={14} className="text-indigo-500/50" />
                                          <span className="text-[10px] font-black uppercase tracking-widest">99.9% Uptime</span>
                                   </div>
                                   <div className="flex items-center gap-2">
                                          <Globe size={14} className="text-teal-500/50" />
                                          <span className="text-[10px] font-black uppercase tracking-widest">Multi-Sede</span>
                                   </div>
                            </motion.div>
                     </div>

                     {/* Subtle Scroll Indicator */}
                     <motion.div
                            style={{ opacity }}
                            className="absolute bottom-8 left-1/2 -translate-x-1/2"
                     >
                            <div className="w-px h-12 bg-gradient-to-b from-emerald-500/50 to-transparent" />
                     </motion.div>
              </section>
       )
}
