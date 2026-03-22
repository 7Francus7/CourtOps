'use client'

import React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, ShieldCheck, Zap, Globe, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { usePerformance } from '@/contexts/PerformanceContext'

const TRIAL_DAYS = 7

export default function LandingHero() {
       const { scrollY } = useScroll()
       const { isLowEnd } = usePerformance()

       const opacity = useTransform(scrollY, [0, 500], [1, 0])
       const y = useTransform(scrollY, [0, 500], [0, 60])

       return (
              <section className="relative min-h-[92vh] flex flex-col items-center justify-center pt-24 pb-16 overflow-hidden">
                     {/* Ambient orbs — dark mode only (page bg handles light mode) */}
                     {!isLowEnd && (
                            <div className="absolute inset-0 pointer-events-none overflow-hidden hidden dark:block">
                                   <div className="absolute w-[700px] h-[500px] bg-emerald-500/[0.12] blur-[160px] rounded-full top-[-15%] left-1/2 -translate-x-1/2" />
                                   <div className="absolute w-[400px] h-[300px] bg-violet-500/[0.08] blur-[120px] rounded-full top-[30%] right-[5%]" />
                            </div>
                     )}
                     {/* Light mode subtle gradient */}
                     <div className="absolute inset-0 pointer-events-none overflow-hidden dark:hidden">
                            <div className="absolute w-[600px] h-[400px] bg-emerald-400/[0.06] blur-[120px] rounded-full top-0 left-1/2 -translate-x-1/2" />
                     </div>

                     <motion.div
                            style={isLowEnd ? {} : { opacity, y }}
                            className="relative z-10 text-center max-w-5xl mx-auto px-6 flex flex-col items-center w-full"
                     >
                            {/* Badge */}
                            <motion.div
                                   initial={{ opacity: 0, y: -8 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   transition={{ duration: 0.5, ease: 'easeOut' }}
                                   className="mb-7"
                            >
                                   <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest">
                                          <Sparkles size={12} className="fill-current" />
                                          {TRIAL_DAYS} días gratis — Sin tarjeta de crédito
                                   </span>
                            </motion.div>

                            {/* Headline */}
                            <motion.h1
                                   initial={{ opacity: 0, y: 20 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1], delay: 0.05 }}
                                   className="text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] font-bold tracking-tight leading-[1.08] mb-6 px-2"
                            >
                                   <span className="text-slate-900 dark:text-white block">Reservas, Cobros</span>
                                   <span className="block bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                                          y Gestión
                                   </span>
                                   <span className="text-slate-400 dark:text-zinc-500 block">en un solo lugar.</span>
                            </motion.h1>

                            {/* Description */}
                            <motion.p
                                   initial={{ opacity: 0, y: 12 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
                                   className="text-slate-500 dark:text-zinc-400 text-base md:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed px-4 mb-10"
                            >
                                   La plataforma all-in-one para clubes de pádel y deportes. Tus jugadores reservan en segundos, vos gestionás todo —{" "}
                                   <span className="text-slate-800 dark:text-white font-semibold">turnos, cobros, kiosco, torneos y más.</span>
                            </motion.p>

                            {/* CTAs */}
                            <motion.div
                                   initial={{ opacity: 0, y: 12 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   transition={{ duration: 0.6, ease: "easeOut", delay: 0.25 }}
                                   className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-6 sm:px-0"
                            >
                                   <Link
                                          href="/register"
                                          className="group relative w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm sm:text-base transition-all hover:scale-[1.03] active:scale-95 shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2.5"
                                   >
                                          Comenzar {TRIAL_DAYS} días gratis
                                          <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
                                   </Link>

                                   <Link
                                          href="#features"
                                          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-white font-semibold text-sm sm:text-base border border-slate-200 dark:border-white/10 transition-all hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center"
                                   >
                                          Ver características
                                   </Link>
                            </motion.div>

                            {/* Microcopy */}
                            <motion.p
                                   initial={{ opacity: 0 }}
                                   animate={{ opacity: 1 }}
                                   transition={{ delay: 0.4, duration: 0.5 }}
                                   className="mt-3 text-xs text-slate-400 dark:text-zinc-600 font-medium"
                            >
                                   Sin tarjeta · Configuración en 5 minutos · Cancelá cuando quieras
                            </motion.p>

                            {/* Trust bar */}
                            <motion.div
                                   initial={{ opacity: 0 }}
                                   animate={{ opacity: 1 }}
                                   transition={{ delay: 0.5, duration: 0.6 }}
                                   className="mt-8 flex flex-wrap justify-center gap-6 sm:gap-12"
                            >
                                   {[
                                          { icon: ShieldCheck, text: "Datos seguros" },
                                          { icon: Zap, text: "Acceso instantáneo" },
                                          { icon: Globe, text: "Multi-sede" }
                                   ].map((item, i) => (
                                          <div key={i} className="flex items-center gap-2 text-slate-400 dark:text-zinc-500 group hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                                                 <item.icon size={14} strokeWidth={2} />
                                                 <span className="text-[10px] sm:text-xs font-semibold tracking-[0.1em] uppercase">{item.text}</span>
                                          </div>
                                   ))}
                            </motion.div>
                     </motion.div>
              </section>
       )
}
