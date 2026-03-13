'use client'

import React from 'react'
import { motion } from 'framer-motion'

const metrics = [
  { value: '150+', label: 'Clubes Activos' },
  { value: '50,000+', label: 'Turnos Gestionados' },
  { value: '99.9%', label: 'Uptime' },
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
      className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mb-10"
    >
      {metrics.map((metric, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
          }}
          className="text-center"
        >
          <div className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
            {metric.value}
          </div>
          <div className="text-[10px] md:text-xs font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.15em] mt-1">
            {metric.label}
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
