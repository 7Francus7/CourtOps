
'use client'

import React, { useEffect, useState } from 'react'
import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion'
import { TrendingUp, Users, Calendar, Clock, Zap, Target, Star, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

function Counter({ from, to, suffix = "", prefix = "" }: { from: number; to: number; suffix?: string; prefix?: string }) {
       const count = useMotionValue(from)
       const rounded = useTransform(count, (latest) => Math.round(latest))
       const ref = React.useRef(null)
       const inView = useInView(ref, { once: true, margin: "0px 0px -100px 0px" })

       useEffect(() => {
              if (inView) {
                     const controls = animate(count, to, { duration: 2.5, ease: "circOut" })
                     return controls.stop
              }
       }, [count, inView, to])

       const [displayValue, setDisplayValue] = useState(from)

       useEffect(() => {
              return rounded.on("change", (v) => setDisplayValue(v))
       }, [rounded])

       return <span ref={ref}>{prefix}{displayValue.toLocaleString('es-AR')}{suffix}</span>
}

const stats = [
       {
              icon: Target,
              value: 12000,
              suffix: "+",
              label: "Reservas este mes",
              color: "text-violet-500",
              bg: "bg-violet-500/10",
              glow: "group-hover:shadow-[0_0_40px_rgba(139,92,246,0.4)]"
       },
       {
              icon: Users,
              value: 150,
              suffix: "+",
              label: "Clubes nos eligen",
              color: "text-indigo-500",
              bg: "bg-indigo-500/10",
              glow: "group-hover:shadow-[0_0_40px_rgba(99,102,241,0.4)]"
       },
       {
              icon: ShieldCheck,
              value: 99,
              suffix: ".9%",
              label: "Uptime de Plataforma",
              color: "text-orange-500",
              bg: "bg-orange-500/10",
              glow: "group-hover:shadow-[0_0_40px_rgba(249,115,22,0.4)]"
       },
       {
              icon: Zap,
              value: 10,
              suffix: " min",
              label: "Tiempo de on-boarding",
              color: "text-violet-400",
              bg: "bg-violet-400/10",
              glow: "group-hover:shadow-[0_0_40px_rgba(167,139,250,0.4)]"
       }
]

export default function LandingStats() {
       return (
              <section className="py-24 md:py-32 px-4 md:px-6 bg-[#fbfaff] dark:bg-[#030712] relative overflow-hidden">
                     {/* Cinematic Background Elements */}
                     <div className="absolute inset-0 z-0">
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
                            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-violet-500/5 via-transparent to-transparent opacity-50" />

                            {/* Animated Background Dots */}
                            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />
                     </div>

                     <div className="max-w-7xl mx-auto relative z-10">
                            <motion.div
                                   initial={{ opacity: 0 }}
                                   whileInView={{ opacity: 1 }}
                                   viewport={{ once: true }}
                                   className="text-center mb-16 md:mb-24"
                            >
                                   <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-widest mb-6 border border-orange-500/20">
                                          <Star size={12} fill="currentColor" /> Resultados Probados
                                   </div>
                                   <h3 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                                          Impulsando el crecimiento <br className="hidden md:block" />
                                          de los <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-500">mejores complejos deportivos.</span>
                                   </h3>
                            </motion.div>

                            <motion.div
                                   initial={{ opacity: 0, y: 40 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   transition={{ duration: 0.8 }}
                                   className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
                            >
                                   {stats.map((stat, idx) => (
                                          <div
                                                 key={idx}
                                                 className={cn(
                                                        "relative bg-white dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/5 rounded-3xl md:rounded-[3rem] p-8 md:p-12 text-center group cursor-default overflow-hidden transition-all duration-700 backdrop-blur-3xl shadow-xl hover:-translate-y-3",
                                                        stat.glow
                                                 )}
                                          >
                                                 {/* High Tech Corner Design */}
                                                 <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/20 to-transparent dark:from-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                                                 <div className={cn("w-16 h-16 md:w-20 md:h-20 mx-auto mb-8 md:mb-10 rounded-2xl md:rounded-3xl flex items-center justify-center transition-all duration-700 group-hover:scale-110 group-hover:rotate-[10deg] shadow-lg", stat.bg)}>
                                                        <stat.icon size={32} className={cn("md:w-10 md:h-10", stat.color)} strokeWidth={2.5} />
                                                 </div>

                                                 <div className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 transition-transform duration-700 group-hover:scale-110">
                                                        <Counter from={0} to={stat.value} suffix={stat.suffix} />
                                                 </div>

                                                 <div className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-500 leading-tight">
                                                        {stat.label}
                                                 </div>

                                                 {/* Subtle highlight line */}
                                                 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent group-hover:w-32 transition-all duration-700" />
                                          </div>
                                   ))}
                            </motion.div>
                     </div>
              </section>
       )
}
