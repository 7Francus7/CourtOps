'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, CalendarCheck, Zap } from 'lucide-react'

const metrics = [
  { value: '150+', label: 'Clubes Activos', icon: TrendingUp, color: 'text-emerald-500' },
  { value: '50k+', label: 'Turnos Gestionados', icon: CalendarCheck, color: 'text-violet-500' },
  { value: '99.9%', label: 'Uptime Garantizado', icon: Zap, color: 'text-amber-500' },
]

export default function SocialProofMetrics() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.12 } },
      }}
      className="flex flex-wrap items-stretch justify-center gap-4 w-full max-w-2xl mx-auto"
    >
      {metrics.map((metric, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, y: 16 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
          }}
          className="flex-1 min-w-[140px] flex flex-col items-center gap-3 px-6 py-5 rounded-2xl backdrop-blur-xl bg-white dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.07] shadow-sm dark:shadow-none hover:border-slate-300 dark:hover:border-white/15 transition-colors group"
        >
          <div className={`${metric.color} opacity-70 group-hover:opacity-100 transition-opacity`}>
            <metric.icon size={18} strokeWidth={2} />
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              {metric.value}
            </div>
            <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.18em] mt-2">
              {metric.label}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
