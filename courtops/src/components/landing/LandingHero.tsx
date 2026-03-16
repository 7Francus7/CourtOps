'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { ArrowRight, ShieldCheck, Zap, Globe, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { usePerformance } from '@/contexts/PerformanceContext'

// Premium Staggered Text Reveal Component
const StaggeredText = ({ text, delayOffset = 0 }: { text: string, delayOffset?: number }) => {
       const words = text.split(" ");
       return (
              <span className="inline-flex flex-wrap justify-center overflow-hidden">
                     {words.map((word, i) => (
                            <motion.span
                                   key={i}
                                   initial={{ y: "150%", rotate: 5, opacity: 0 }}
                                   animate={{ y: "0%", rotate: 0, opacity: 1 }}
                                   transition={{
                                          duration: 0.8,
                                          ease: [0.19, 1, 0.22, 1], // Custom Apple-like spring cubic-bezier
                                          delay: delayOffset + (i * 0.05)
                                   }}
                                   className="inline-block mr-[0.25em]"
                            >
                                   {word}
                            </motion.span>
                     ))}
              </span>
       );
};

export default function LandingHero() {
       const { scrollY } = useScroll()
       const { isLowEnd } = usePerformance()

       // Parallax & Fade on Scroll
       const opacity = useTransform(scrollY, [0, 400], [1, 0])
       const y = useTransform(scrollY, [0, 400], [0, 100])
       const scale = useTransform(scrollY, [0, 400], [1, 0.95])

       return (
              <section className="relative min-h-[90vh] md:min-h-[95vh] flex flex-col items-center justify-center pt-24 pb-12 overflow-hidden bg-white dark:bg-zinc-950 transition-colors duration-700">
                     {/* Cinematic Backgrounds (Aurora & Grid) */}
                     <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
                            {/* Animated Aurora Glow behind text */}
                            {!isLowEnd && (
                                   <>
                                          <motion.div
                                                 initial={{ opacity: 0, scale: 0.8 }}
                                                 animate={{ opacity: 0.3, scale: 1.1 }}
                                                 transition={{ duration: 4, ease: "easeOut" }}
                                                 className="absolute w-[800px] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] rounded-full top-[-10%]"
                                          />
                                          {/* Subtle neutral sheen to break the darkness without adding color */}
                                          <motion.div
                                                 initial={{ opacity: 0 }}
                                                 animate={{ opacity: 1 }}
                                                 transition={{ duration: 4, ease: "easeOut", delay: 0.5 }}
                                                 className="absolute w-[600px] h-[400px] bg-zinc-300/20 dark:bg-zinc-400/5 blur-[100px] rounded-full top-[10%]"
                                          />
                                   </>
                            )}

                            {/* Modern subtle grid - Always visible (zero performance impact CSS) */}
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_30%,#000_80%,transparent_100%)]" />
                     </div>

                     <motion.div
                            style={{ opacity, y, scale }}
                            className="relative z-10 text-center max-w-6xl mx-auto px-6 flex flex-col items-center"
                     >
                            {/* Free Trial Badge */}
                            <motion.div
                                   initial={{ opacity: 0, y: -10, scale: 0.9 }}
                                   animate={{ opacity: 1, y: 0, scale: 1 }}
                                   transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
                                   className="mb-6 md:mb-8"
                            >
                                   <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 text-white text-xs md:text-sm font-bold uppercase tracking-wide shadow-lg shadow-emerald-500/25 animate-pulse">
                                          <Sparkles size={14} className="fill-white" />
                                          14 días gratis — Sin tarjeta de crédito
                                   </span>
                            </motion.div>

                            {/* CourtReserve-style Hero Typography — Benefit-focused */}
                            <div className="space-y-4 md:space-y-6 mb-10 md:mb-14">
                                   <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-zinc-900 dark:text-white leading-[1.15] md:leading-[1.05] px-2 flex flex-col items-center flex-wrap">
                                          <StaggeredText text="Reservas, Cobros" delayOffset={0.2} />
                                          <StaggeredText text="y Gestión" delayOffset={0.4} />
                                          <span className="text-zinc-400 dark:text-zinc-500 bg-clip-text">
                                                 <StaggeredText text="en un solo lugar." delayOffset={0.6} />
                                          </span>
                                   </h1>

                                   <motion.p
                                          initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
                                          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                                          transition={{ delay: 1, duration: 1, ease: "easeOut" }}
                                          className="text-zinc-500 dark:text-zinc-400 text-base md:text-xl max-w-3xl mx-auto leading-relaxed px-4 font-medium"
                                   >
                                          La plataforma all-in-one para clubes de pádel y deportes. Tus jugadores reservan en segundos, vos gestionás todo desde un solo panel — <span className="text-zinc-900 dark:text-white">turnos, pagos, kiosco, torneos y más.</span>
                                   </motion.p>
                            </div>

                            {/* High-Converting Magnetic CTA */}
                            <motion.div
                                   initial={{ opacity: 0, y: 20 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
                                   className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto px-6 sm:px-0"
                            >
                                   <Link href="/register" className="group relative w-full sm:w-auto px-10 py-4 sm:py-5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-sm sm:text-base transition-all hover:scale-105 active:scale-95 shadow-2xl flex items-center justify-center gap-3 overflow-hidden">
                                          {/* Shine effect on hover */}
                                          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                                          <span className="relative z-10 hidden sm:inline">Comenzar Prueba Gratuita</span>
                                          <span className="relative z-10 sm:hidden">Probar Gratis</span>
                                          <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1.5 transition-transform" />
                                   </Link>

                                   <Link href="#features" className="w-full sm:w-auto px-10 py-4 sm:py-5 rounded-2xl bg-white/50 dark:bg-white/5 text-zinc-700 dark:text-white font-bold text-sm sm:text-base border border-zinc-200 dark:border-white/10 transition-all hover:bg-zinc-100 dark:hover:bg-white/10 hover:border-zinc-300 dark:hover:border-white/20 flex items-center justify-center backdrop-blur-xl">
                                          Ver Demo
                                   </Link>
                            </motion.div>

                            {/* Social Proof Stats — CourtReserve-style */}
                            <motion.div
                                   initial={{ opacity: 0, y: 20 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   transition={{ delay: 1.5, duration: 0.8 }}
                                   className="mt-14 md:mt-24 flex items-center gap-6 sm:gap-10 md:gap-16 justify-center flex-wrap"
                            >
                                   {[
                                          { value: "150+", label: "Clubes Activos" },
                                          { value: "50k+", label: "Turnos Gestionados" },
                                          { value: "99.9%", label: "Uptime" },
                                   ].map((stat, i) => (
                                          <div key={i} className="text-center">
                                                 <p className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">{stat.value}</p>
                                                 <p className="text-[10px] sm:text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.15em] mt-1">{stat.label}</p>
                                          </div>
                                   ))}
                            </motion.div>

                            {/* Subtle Trust Bar */}
                            <motion.div
                                   initial="hidden"
                                   animate="visible"
                                   variants={{
                                          hidden: { opacity: 0 },
                                          visible: {
                                                 opacity: 1,
                                                 transition: { delayChildren: 1.8, staggerChildren: 0.1 }
                                          }
                                   }}
                                   className="mt-8 md:mt-12 flex flex-wrap justify-center gap-4 sm:gap-8 md:gap-14"
                            >
                                   {[
                                          { icon: ShieldCheck, text: "Seguridad Bancaria" },
                                          { icon: Zap, text: "Acceso Instantáneo" },
                                          { icon: Globe, text: "Multi-Sede Global" }
                                   ].map((item, i) => (
                                          <motion.div
                                                 key={i}
                                                 variants={{
                                                        hidden: { opacity: 0, y: 10 },
                                                        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
                                                 }}
                                                 className="flex items-center gap-3 text-zinc-400 dark:text-zinc-500 group"
                                          >
                                                 <div className="p-2 rounded-lg bg-zinc-50 dark:bg-white/5 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors">
                                                        <item.icon size={16} strokeWidth={2} />
                                                 </div>
                                                 <span className="text-[10px] sm:text-xs font-bold tracking-[0.15em] uppercase">{item.text}</span>
                                          </motion.div>
                                   ))}
                            </motion.div>
                     </motion.div>
              </section>
       )
}
