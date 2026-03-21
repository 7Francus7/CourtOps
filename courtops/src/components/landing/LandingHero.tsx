'use client'

import React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, ShieldCheck, Zap, Globe, Sparkles, Calendar, DollarSign, Users, Trophy } from 'lucide-react'
import Link from 'next/link'
import { usePerformance } from '@/contexts/PerformanceContext'

const TRIAL_DAYS = 7

// Premium Staggered Text Reveal Component
const StaggeredText = ({ text, delayOffset = 0 }: { text: string, delayOffset?: number }) => {
       const words = text.split(" ");
       return (
              <span className="inline-flex flex-wrap justify-center overflow-hidden py-[0.15em]">
                     {words.map((word, i) => (
                            <motion.span
                                   key={i}
                                   initial={{ y: "150%", rotate: 5, opacity: 0 }}
                                   animate={{ y: "0%", rotate: 0, opacity: 1 }}
                                   transition={{
                                          duration: 0.8,
                                          ease: [0.19, 1, 0.22, 1],
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

// Mini dashboard mockup
const DashboardPreview = () => (
       <div className="relative w-full max-w-3xl mx-auto mt-14 md:mt-20 px-4">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40 bg-zinc-900/80 backdrop-blur-xl">
                     {/* Window chrome */}
                     <div className="flex items-center gap-1.5 px-4 py-3 bg-zinc-800/60 border-b border-white/[0.06]">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                            <span className="ml-3 text-[10px] text-zinc-500 font-mono">dashboard · courtops.net</span>
                     </div>
                     {/* Mock content */}
                     <div className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                   { icon: Calendar, label: "Reservas hoy", value: "24", color: "text-emerald-400", bg: "bg-emerald-500/10" },
                                   { icon: DollarSign, label: "Ingresos hoy", value: "$148k", color: "text-blue-400", bg: "bg-blue-500/10" },
                                   { icon: Users, label: "Clientes", value: "312", color: "text-violet-400", bg: "bg-violet-500/10" },
                                   { icon: Trophy, label: "Torneos", value: "3", color: "text-amber-400", bg: "bg-amber-500/10" },
                            ].map((card, i) => (
                                   <motion.div
                                          key={i}
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ delay: 2 + i * 0.1, duration: 0.5 }}
                                          className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3 flex flex-col gap-2"
                                   >
                                          <div className={`w-7 h-7 rounded-lg ${card.bg} flex items-center justify-center`}>
                                                 <card.icon size={14} className={card.color} />
                                          </div>
                                          <p className="text-white font-bold text-lg leading-none">{card.value}</p>
                                          <p className="text-zinc-500 text-[10px] leading-tight">{card.label}</p>
                                   </motion.div>
                            ))}
                     </div>
                     {/* Shimmer bar */}
                     <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                            <div className="h-28 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center gap-1 overflow-hidden px-4">
                                   {Array.from({ length: 12 }).map((_, i) => (
                                          <motion.div
                                                 key={i}
                                                 className="flex-1 rounded-sm bg-emerald-500/30"
                                                 initial={{ height: "20%" }}
                                                 animate={{ height: `${20 + Math.sin(i * 0.9) * 40 + 30}%` }}
                                                 transition={{ delay: 2.2 + i * 0.06, duration: 0.6, ease: "easeOut" }}
                                          />
                                   ))}
                            </div>
                     </div>
              </div>
              {/* Glow under preview */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-emerald-500/20 blur-3xl rounded-full pointer-events-none" />
       </div>
)

export default function LandingHero() {
       const { scrollY } = useScroll()
       const { isLowEnd } = usePerformance()

       const opacity = useTransform(scrollY, [0, 400], [1, 0])
       const y = useTransform(scrollY, [0, 400], [0, 80])
       const scale = useTransform(scrollY, [0, 400], [1, 0.97])

       return (
              <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-20 overflow-hidden bg-transparent">
                     {/* Ambient orbs */}
                     {!isLowEnd && (
                            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                   <motion.div
                                          initial={{ opacity: 0, scale: 0.8 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          transition={{ duration: 3, ease: "easeOut" }}
                                          className="absolute w-[800px] h-[500px] bg-emerald-500/[0.10] blur-[160px] rounded-full top-[-10%] left-1/2 -translate-x-1/2"
                                   />
                                   <motion.div
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          transition={{ duration: 3, ease: "easeOut", delay: 0.8 }}
                                          className="absolute w-[400px] h-[300px] bg-violet-500/[0.07] blur-[120px] rounded-full top-[30%] right-[5%]"
                                   />
                                   <motion.div
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          transition={{ duration: 3, ease: "easeOut", delay: 1.2 }}
                                          className="absolute w-[300px] h-[200px] bg-blue-500/[0.06] blur-[100px] rounded-full top-[20%] left-[5%]"
                                   />
                            </div>
                     )}

                     <motion.div
                            style={{ opacity, y, scale }}
                            className="relative z-10 text-center max-w-6xl mx-auto px-6 flex flex-col items-center w-full"
                     >
                            {/* Free Trial Badge */}
                            <motion.div
                                   initial={{ opacity: 0, y: -12, scale: 0.9 }}
                                   animate={{ opacity: 1, y: 0, scale: 1 }}
                                   transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
                                   className="mb-7 md:mb-9"
                            >
                                   <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full backdrop-blur-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs md:text-sm font-bold uppercase tracking-widest shadow-lg shadow-emerald-500/10">
                                          <Sparkles size={13} className="fill-emerald-400" />
                                          {TRIAL_DAYS} días gratis — Sin tarjeta de crédito
                                   </span>
                            </motion.div>

                            {/* Headline */}
                            <div className="space-y-3 md:space-y-5 mb-8 md:mb-12">
                                   <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight text-white leading-[1.1] md:leading-[1.05] px-2 flex flex-col items-center">
                                          <StaggeredText text="Reservas, Cobros" delayOffset={0.2} />
                                          <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
                                                 <StaggeredText text="y Gestión" delayOffset={0.4} />
                                          </span>
                                          <span className="text-zinc-500">
                                                 <StaggeredText text="en un solo lugar." delayOffset={0.6} />
                                          </span>
                                   </h1>

                                   <motion.p
                                          initial={{ opacity: 0, filter: "blur(8px)", y: 16 }}
                                          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                                          transition={{ delay: 0.9, duration: 0.9, ease: "easeOut" }}
                                          className="text-zinc-400 text-base md:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed px-4"
                                   >
                                          La plataforma all-in-one para clubes de pádel y deportes. Tus jugadores reservan en segundos, vos gestionás todo —{" "}
                                          <span className="text-white font-medium">turnos, cobros, kiosco, torneos y más.</span>
                                   </motion.p>
                            </div>

                            {/* CTAs */}
                            <motion.div
                                   initial={{ opacity: 0, y: 20 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   transition={{ delay: 1.1, duration: 0.7, ease: "easeOut" }}
                                   className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-6 sm:px-0"
                            >
                                   <Link
                                          href="/register"
                                          className="group relative w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-900 font-bold text-sm sm:text-base transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2.5 overflow-hidden"
                                   >
                                          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                                          <span className="relative z-10">Comenzar {TRIAL_DAYS} días gratis</span>
                                          <ArrowRight size={17} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                                   </Link>

                                   <Link
                                          href="#features"
                                          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/[0.06] text-white font-semibold text-sm sm:text-base border border-white/10 transition-all hover:bg-white/10 hover:border-white/20 flex items-center justify-center"
                                   >
                                          Ver características
                                   </Link>
                            </motion.div>

                            {/* Microcopy below CTA */}
                            <motion.p
                                   initial={{ opacity: 0 }}
                                   animate={{ opacity: 1 }}
                                   transition={{ delay: 1.4, duration: 0.6 }}
                                   className="mt-3 text-xs text-zinc-600 font-medium"
                            >
                                   Sin tarjeta · Configuración en 5 minutos · Cancelá cuando quieras
                            </motion.p>

                            {/* Stats */}
                            <motion.div
                                   initial={{ opacity: 0, y: 20 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   transition={{ delay: 1.6, duration: 0.7 }}
                                   className="mt-12 md:mt-16 flex items-center gap-4 sm:gap-6 md:gap-10 justify-center flex-wrap"
                            >
                                   {[
                                          { value: "150+", label: "Clubes Activos" },
                                          { value: "50k+", label: "Turnos Gestionados" },
                                          { value: "99.9%", label: "Uptime garantizado" },
                                   ].map((stat, i) => (
                                          <div key={i} className="text-center px-5 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.07]">
                                                 <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">{stat.value}</p>
                                                 <p className="text-[10px] sm:text-xs font-semibold text-zinc-500 uppercase tracking-[0.12em] mt-0.5">{stat.label}</p>
                                          </div>
                                   ))}
                            </motion.div>

                            {/* Trust bar */}
                            <motion.div
                                   initial="hidden"
                                   animate="visible"
                                   variants={{
                                          hidden: { opacity: 0 },
                                          visible: {
                                                 opacity: 1,
                                                 transition: { delayChildren: 1.9, staggerChildren: 0.1 }
                                          }
                                   }}
                                   className="mt-7 md:mt-10 flex flex-wrap justify-center gap-5 sm:gap-10 md:gap-14"
                            >
                                   {[
                                          { icon: ShieldCheck, text: "Datos seguros" },
                                          { icon: Zap, text: "Acceso instantáneo" },
                                          { icon: Globe, text: "Multi-sede" }
                                   ].map((item, i) => (
                                          <motion.div
                                                 key={i}
                                                 variants={{
                                                        hidden: { opacity: 0, y: 8 },
                                                        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
                                                 }}
                                                 className="flex items-center gap-2.5 text-zinc-500 group"
                                          >
                                                 <div className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 group-hover:text-emerald-400 transition-all">
                                                        <item.icon size={14} strokeWidth={2} />
                                                 </div>
                                                 <span className="text-[10px] sm:text-xs font-semibold tracking-[0.12em] uppercase">{item.text}</span>
                                          </motion.div>
                                   ))}
                            </motion.div>

                            {/* Dashboard Preview */}
                            <DashboardPreview />
                     </motion.div>
              </section>
       )
}
