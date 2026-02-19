
'use client'

import React, { useEffect, useState } from 'react'
import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion'
import { TrendingUp, Users, Calendar, Clock } from 'lucide-react'

function Counter({ from, to, suffix = "", prefix = "" }: { from: number; to: number; suffix?: string; prefix?: string }) {
       const count = useMotionValue(from)
       const rounded = useTransform(count, (latest) => Math.round(latest))
       const ref = React.useRef(null)
       const inView = useInView(ref, { once: true })

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
              value: 1200,
              suffix: "+",
              label: "Reservas Gestionadas",
              color: "text-blue-600 dark:text-blue-400",
              bg: "bg-blue-500/10 dark:bg-blue-500/20"
       },
       {
              icon: Users,
              value: 50,
              suffix: "+",
              label: "Clubes en Espera",
              color: "text-emerald-600 dark:text-emerald-400",
              bg: "bg-emerald-500/10 dark:bg-emerald-500/20"
       },
       {
              icon: TrendingUp,
              value: 99,
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
              <section className="py-20 px-6 bg-slate-50 dark:bg-black border-y border-slate-100 dark:border-white/5">
                     <div className="max-w-6xl mx-auto">
                            <motion.div
                                   initial={{ opacity: 0, y: 30 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   transition={{ duration: 0.8 }}
                                   className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 divide-x divide-slate-200 dark:divide-white/5"
                            >
                                   {stats.map((stat, idx) => (
                                          <div key={idx} className={`text-center group pl-4 md:pl-0 ${idx === 0 ? 'border-none' : ''}`}>
                                                 <div className={`w-14 h-14 mx-auto mb-6 rounded-2xl ${stat.bg} flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shadow-lg shadow-black/5`}>
                                                        <stat.icon size={26} className={stat.color} strokeWidth={2} />
                                                 </div>
                                                 <div className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">
                                                        <Counter from={0} to={stat.value} suffix={stat.suffix} />
                                                 </div>
                                                 <div className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500">
                                                        {stat.label}
                                                 </div>
                                          </div>
                                   ))}
                            </motion.div>
                     </div>
              </section>
       )
}
