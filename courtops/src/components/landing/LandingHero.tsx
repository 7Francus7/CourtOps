'use client'

import React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, ChevronRight, ShieldCheck, Zap, Globe } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { usePerformance } from '@/contexts/PerformanceContext'

export default function LandingHero() {
       const { scrollY } = useScroll()
       const { isLowEnd } = usePerformance()

       const opacity = useTransform(scrollY, [0, 300], [1, 0])
       const y = useTransform(scrollY, [0, 300], [0, 40])

       return (
              <section className="relative min-h-[85vh] md:min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-12 overflow-hidden bg-white dark:bg-[#050505] transition-colors duration-700">
                     {/* Clean Background */}
                     <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(16,185,129,0.05),transparent_70%)]" />
                            {!isLowEnd && (
                                   <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] md:bg-[size:60px_60px]" />
                            )}
                     </div>

                     <motion.div
                            style={{ opacity, y }}
                            className="relative z-10 text-center max-w-5xl mx-auto px-6 flex flex-col items-center"
                     >
                            {/* Refined Badge */}
                            <motion.div
                                   initial={{ opacity: 0, scale: 0.9 }}
                                   animate={{ opacity: 1, scale: 1 }}
                                   className="mb-6 md:mb-8"
                            >
                                   <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                          Nueva Versión 3.0 • Sistema Pro
                                   </div>
                            </motion.div>

                            {/* Balanced Typography */}
                            <div className="space-y-4 md:space-y-6 mb-10 md:mb-12">
                                   <motion.h1
                                          initial={{ opacity: 0, y: 20 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                                          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-medium tracking-tight text-slate-900 dark:text-white leading-[1.1] px-2 break-words"
                                   >
                                          Gestión de Canchas <br className="hidden md:block" />
                                          <span className="text-slate-400 dark:text-zinc-600">Sin Complicaciones.</span>
                                   </motion.h1>

                                   <motion.p
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          transition={{ delay: 0.2, duration: 1 }}
                                          className="text-slate-500 dark:text-zinc-400 text-base md:text-xl max-w-2xl mx-auto leading-relaxed px-4"
                                   >
                                          La herramienta definitiva para complejos que buscan <span className="text-slate-900 dark:text-white font-medium">automatizar su operación</span> con tecnología de punta.
                                   </motion.p>
                            </div>

                            {/* Minimal Action Buttons */}
                            <motion.div
                                   initial={{ opacity: 0, y: 10 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   transition={{ delay: 0.4 }}
                                   className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-6 sm:px-0"
                            >
                                   <Link href="/register" className="w-full sm:w-auto px-10 py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg dark:shadow-white/5 flex items-center justify-center gap-2">
                                          Empezar Prueba <ArrowRight size={16} />
                                   </Link>

                                   <Link href="/demo" className="w-full sm:w-auto px-10 py-4 rounded-xl bg-white dark:bg-transparent text-slate-600 dark:text-zinc-400 font-bold text-sm border border-slate-200 dark:border-white/10 transition-all hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-center">
                                          Ver Demo
                                   </Link>
                            </motion.div>

                            {/* Subtle Trust Bar */}
                            <motion.div
                                   initial={{ opacity: 0 }}
                                   animate={{ opacity: 1 }}
                                   transition={{ delay: 0.6 }}
                                   className="mt-16 md:mt-24 pt-12 border-t border-slate-100 dark:border-white/5 w-full flex flex-wrap justify-center gap-6 md:gap-12"
                            >
                                   {[
                                          { icon: ShieldCheck, text: "Seguridad Bancaria" },
                                          { icon: Zap, text: "Acceso Instantáneo" },
                                          { icon: Globe, text: "Multi-Sede" }
                                   ].map((item, i) => (
                                          <div key={i} className="flex items-center gap-2 text-slate-400 dark:text-zinc-600">
                                                 <item.icon size={14} className="md:w-4 md:h-4" strokeWidth={1.5} />
                                                 <span className="text-[10px] sm:text-xs font-bold tracking-wide uppercase">{item.text}</span>
                                          </div>
                                   ))}
                            </motion.div>
                     </motion.div>
              </section>
       )
}
