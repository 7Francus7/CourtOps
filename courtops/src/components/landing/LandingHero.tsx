'use client'

import React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Zap, ShieldCheck, Activity, Globe, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { usePerformance } from '@/contexts/PerformanceContext'

export default function LandingHero() {
       const { scrollY } = useScroll()
       const { isLowEnd } = usePerformance()
       const opacity = useTransform(scrollY, [0, 400], [1, 0])
       const scale = useTransform(scrollY, [0, 400], [1, 0.95])
       const y = useTransform(scrollY, [0, 400], [0, 50])

       return (
              <section
                     className={cn(
                            "relative min-h-screen flex flex-col items-center justify-center pt-20 overflow-hidden antialiased transition-colors duration-1000",
                            "bg-white dark:bg-[#02040A]"
                     )}
              >
                     {/* Cinematic Background Elements */}
                     <div className="absolute inset-0 pointer-events-none">
                            {/* Light Mode Mesh */}
                            <div className="absolute inset-0 bg-[radial-gradient(at_top_left,rgba(16,185,129,0.05)_0%,transparent_50%),radial-gradient(at_top_right,rgba(99,102,241,0.05)_0%,transparent_50%)] dark:hidden" />

                            {/* Dark Mode Glows */}
                            {!isLowEnd && (
                                   <>
                                          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] hidden dark:block" />
                                          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] hidden dark:block" />
                                          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] dark:opacity-100 opacity-50" />
                                   </>
                            )}
                     </div>

                     <motion.div
                            style={{ opacity, scale, y }}
                            className="relative z-10 text-center max-w-6xl mx-auto px-6 w-full flex flex-col items-center"
                     >
                            {/* Floating Badge */}
                            <motion.div
                                   initial={{ opacity: 0, y: -20 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   transition={{ duration: 0.6 }}
                                   className="mb-10"
                            >
                                   <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em] backdrop-blur-xl shadow-sm">
                                          <Sparkles size={12} className="fill-current" />
                                          V3.0 • Sistema de Gestión de Elite
                                   </div>
                            </motion.div>

                            {/* Ultra-Modern Headline */}
                            <div className="space-y-10 mb-20 max-w-5xl">
                                   <motion.h1
                                          initial={{ opacity: 0, y: 30 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                          className="text-6xl md:text-8xl lg:text-[110px] font-black tracking-tighter text-slate-950 dark:text-white leading-[0.95] uppercase italic"
                                   >
                                          Redefine el <br />
                                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-600 dark:from-emerald-400 dark:to-indigo-500 pb-2">
                                                 Futuro del Padel.
                                          </span>
                                   </motion.h1>

                                   <motion.p
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          transition={{ delay: 0.2, duration: 1 }}
                                          className="text-slate-500 dark:text-zinc-500 text-xl md:text-2xl font-bold max-w-2xl mx-auto leading-relaxed italic"
                                   >
                                          La ingeniería definitiva para automatizar cada centímetro de tu complejo deportivo. <span className="text-slate-900 dark:text-white underline decoration-emerald-500/50 decoration-4">Rápido. Preciso. Escalamiento Puro.</span>
                                   </motion.p>
                            </div>

                            {/* Action Cluster */}
                            <motion.div
                                   initial={{ opacity: 0, scale: 0.9 }}
                                   animate={{ opacity: 1, scale: 1 }}
                                   transition={{ delay: 0.4 }}
                                   className="flex flex-col sm:flex-row items-center gap-8"
                            >
                                   <Link href="/register" className="group relative px-12 py-7 rounded-[2.5rem] bg-emerald-500 text-white font-black text-xs uppercase tracking-[0.3em] overflow-hidden transition-all active:scale-95 shadow-[0_25px_50px_-12px_rgba(16,185,129,0.4)]">
                                          <span className="relative z-10 flex items-center gap-3">
                                                 Empezar Ahora <ArrowRight size={20} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
                                          </span>
                                          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                   </Link>

                                   <Link href="/demo" className="px-10 py-7 rounded-[2.5rem] bg-slate-900/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 text-slate-900 dark:text-white font-black text-xs uppercase tracking-[0.3em] hover:bg-slate-900/10 dark:hover:bg-white/10 transition-all active:scale-95 backdrop-blur-xl">
                                          Ver Tour Visual
                                   </Link>
                            </motion.div>

                            {/* Trust Pulse */}
                            <motion.div
                                   initial={{ opacity: 0 }}
                                   animate={{ opacity: 1 }}
                                   transition={{ delay: 0.6 }}
                                   className="mt-32 flex flex-wrap justify-center items-center gap-x-16 gap-y-8"
                            >
                                   {[
                                          { icon: ShieldCheck, text: "Seguridad Bancaria", color: "text-emerald-500" },
                                          { icon: Activity, text: "99.9% Disponibilidad", color: "text-indigo-500" },
                                          { icon: Globe, text: "Edición Multisede", color: "text-teal-500" }
                                   ].map((item, i) => (
                                          <div key={i} className="flex items-center gap-4 group cursor-default">
                                                 <div className={cn("w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center transition-all group-hover:scale-110", item.color)}>
                                                        <item.icon size={18} />
                                                 </div>
                                                 <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-zinc-600 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{item.text}</span>
                                          </div>
                                   ))}
                            </motion.div>
                     </motion.div>

                     {/* Cinematic Scroll Indicator */}
                     {!isLowEnd && (
                            <motion.div
                                   style={{ opacity }}
                                   className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
                            >
                                   <span className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-400 dark:text-zinc-700">Explorar Sistema</span>
                                   <div className="w-px h-16 bg-gradient-to-b from-emerald-500/50 via-emerald-500/20 to-transparent" />
                            </motion.div>
                     )}
              </section>
       )
}
