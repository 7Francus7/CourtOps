
'use client'

import React, { useEffect, useState } from 'react'
import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion'
import { TrendingUp, Users, Calendar, Clock, Zap } from 'lucide-react'
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

       // Use state to force re-render with the transformed value
       const [displayValue, setDisplayValue] = useState(from)

       useEffect(() => {
              return rounded.on("change", (v) => setDisplayValue(v))
       }, [rounded])

       return <span ref={ref}>{prefix}{displayValue.toLocaleString('es-AR')}{suffix}</span>
}

const stats = [
       {
              icon: Calendar,
              value: 12000,
              suffix: "+",
              label: "Reservas Gestionadas",
              color: "text-emerald-500",
              bg: "bg-emerald-500/10",
              glow: "group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
       },
       {
              icon: Users,
              value: 150,
              suffix: "+",
              label: "Clubes Activos",
              color: "text-teal-500",
              bg: "bg-teal-500/10",
              glow: "group-hover:shadow-[0_0_30px_rgba(20,184,166,0.3)]"
       },
       {
              icon: TrendingUp,
              value: 99,
              suffix: ".9%",
              label: "Uptime Garantizado",
              color: "text-emerald-400",
              bg: "bg-emerald-400/10",
              glow: "group-hover:shadow-[0_0_30px_rgba(52,211,153,0.3)]"
       },
       {
              icon: Zap,
              value: 10,
              suffix: " min",
              label: "Setup Inicial Real",
              color: "text-teal-400",
              bg: "bg-teal-400/10",
              glow: "group-hover:shadow-[0_0_30px_rgba(45,212,191,0.3)]"
       }
]

export default function LandingStats() {
       return (
              <section className="py-20 md:py-28 px-4 md:px-6 bg-white dark:bg-[#030712] relative overflow-hidden">
                     {/* Cinematic Background Lines/Gradients */}
                     <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                     <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-teal-500/20 to-transparent" />

                     <div className="max-w-7xl mx-auto relative z-10">
                            <motion.div
                                   initial={{ opacity: 0, y: 40 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   transition={{ duration: 0.8 }}
                                   className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8"
                            >
                                   {stats.map((stat, idx) => (
                                          <div
                                                 key={idx}
                                                 className={cn(
                                                        "relative bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl md:rounded-[2rem] p-6 md:p-10 text-center group cursor-pointer overflow-hidden transition-all duration-500 backdrop-blur-xl hover:-translate-y-2",
                                                        stat.glow
                                                 )}
                                          >
                                                 {/* Card inner subtle glow on hover */}
                                                 <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/0 via-transparent to-transparent opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-500" />

                                                 <div className={cn("w-14 h-14 md:w-16 md:h-16 mx-auto mb-6 md:mb-8 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3", stat.bg)}>
                                                        <stat.icon size={26} className={cn("md:w-8 md:h-8", stat.color)} strokeWidth={2.5} />
                                                 </div>

                                                 <div className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-3 transition-transform duration-500 group-hover:scale-105">
                                                        <Counter from={0} to={stat.value} suffix={stat.suffix} />
                                                 </div>

                                                 <div className="text-xs md:text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500 line-clamp-2 leading-tight">
                                                        {stat.label}
                                                 </div>
                                          </div>
                                   ))}
                            </motion.div>
                     </div>
              </section>
       )
}
