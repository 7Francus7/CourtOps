
'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { TrendingUp, Users, Calendar, Clock } from 'lucide-react'

function AnimatedCounter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
       const [count, setCount] = useState(0)
       const ref = useRef<HTMLSpanElement>(null)
       const isInView = useInView(ref, { once: true })

       useEffect(() => {
              if (!isInView) return

              let start = 0
              const duration = 2000
              const increment = target / (duration / 16)
              const timer = setInterval(() => {
                     start += increment
                     if (start >= target) {
                            setCount(target)
                            clearInterval(timer)
                     } else {
                            setCount(Math.floor(start))
                     }
              }, 16)

              return () => clearInterval(timer)
       }, [isInView, target])

       return (
              <span ref={ref}>
                     {prefix}{count.toLocaleString('es-AR')}{suffix}
              </span>
       )
}

const stats = [
       {
              icon: Calendar,
              value: 1200,
              suffix: "+",
              label: "Reservas Gestionadas",
              color: "text-blue-600 dark:text-blue-400",
              bg: "bg-blue-500/10 dark:bg-blue-500/20"
       },
       {
              icon: Users,
              value: 15,
              suffix: "+",
              label: "Clubes Activos",
              color: "text-emerald-600 dark:text-emerald-400",
              bg: "bg-emerald-500/10 dark:bg-emerald-500/20"
       },
       {
              icon: TrendingUp,
              value: 98,
              suffix: "%",
              label: "Uptime Garantizado",
              color: "text-orange-600 dark:text-orange-400",
              bg: "bg-orange-500/10 dark:bg-orange-500/20"
       },
       {
              icon: Clock,
              value: 10,
              suffix: " min",
              label: "Setup Inicial",
              color: "text-pink-600 dark:text-pink-400",
              bg: "bg-pink-500/10 dark:bg-pink-500/20"
       }
]

export default function LandingStats() {
       return (
              <section className="py-16 px-6 bg-slate-50 dark:bg-black border-y border-slate-100 dark:border-white/5">
                     <div className="max-w-6xl mx-auto">
                            <motion.div
                                   initial={{ opacity: 0, y: 20 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   transition={{ duration: 0.5 }}
                                   className="grid grid-cols-2 md:grid-cols-4 gap-8"
                            >
                                   {stats.map((stat, idx) => (
                                          <div key={idx} className="text-center group">
                                                 <div className={`w-12 h-12 mx-auto mb-4 rounded-xl ${stat.bg} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                                                        <stat.icon size={22} className={stat.color} strokeWidth={2} />
                                                 </div>
                                                 <div className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
                                                        <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                                                 </div>
                                                 <div className="text-sm text-slate-500 dark:text-zinc-500 font-medium">
                                                        {stat.label}
                                                 </div>
                                          </div>
                                   ))}
                            </motion.div>
                     </div>
              </section>
       )
}
