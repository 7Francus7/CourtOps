'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Zap, Shield, Clock, Star } from 'lucide-react'

interface CountUpProps {
  end: number
  duration?: number
  prefix?: string
  suffix?: string
}

function CountUp({ end, duration = 1.8, prefix = '', suffix = '' }: CountUpProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const totalFrames = Math.round(duration * 60)
    const step = end / totalFrames
    const timer = setInterval(() => {
      start += step
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [inView, end, duration])

  return (
    <span ref={ref}>
      {prefix}{inView ? count.toLocaleString('es-AR') : 0}{suffix}
    </span>
  )
}

const stats = [
  {
    value: 143,
    prefix: '+',
    suffix: '',
    label: 'Clubes activos',
    sub: 'En todo Argentina',
    color: 'text-emerald-500',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/5',
  },
  {
    value: 1200000,
    prefix: '$',
    suffix: '+',
    label: 'Facturado por clubes',
    sub: 'Este mes en la plataforma',
    color: 'text-violet-500',
    border: 'border-violet-500/20',
    bg: 'bg-violet-500/5',
  },
  {
    value: 40,
    prefix: '-',
    suffix: '%',
    label: 'Menos no-shows',
    sub: 'Con WhatsApp automático',
    color: 'text-sky-500',
    border: 'border-sky-500/20',
    bg: 'bg-sky-500/5',
  },
]

export default function LandingCTA() {
  return (
    <section className="py-20 md:py-32 px-4 sm:px-6 bg-transparent">
      <div className="max-w-5xl mx-auto">

        {/* Stats strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.55, ease: [0.19, 1, 0.22, 1] }}
              className={`text-center p-6 rounded-2xl border ${stat.bg} ${stat.border} backdrop-blur-xl`}
            >
              <div className={`text-4xl md:text-5xl font-black tabular-nums tracking-tighter mb-1.5 ${stat.color}`}>
                <CountUp end={stat.value} prefix={stat.prefix} suffix={stat.suffix} duration={1.8} />
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">{stat.label}</div>
              <div className="text-xs text-slate-400 dark:text-zinc-500">{stat.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Main CTA card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
          className="relative overflow-hidden rounded-[2.5rem] md:rounded-[3rem] bg-slate-900 dark:bg-zinc-950 border border-slate-800 dark:border-white/[0.07] p-8 md:p-20 text-center"
        >
          {/* Background glows */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-25%] left-[-10%] w-[55%] h-[60%] bg-emerald-500/15 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-25%] right-[-10%] w-[55%] h-[60%] bg-violet-500/12 blur-[120px] rounded-full" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
          </div>

          {/* Beam sweep */}
          <motion.div
            animate={{ x: ['-130%', '230%'] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.06) 50%, transparent 65%)',
            }}
          />

          <div className="relative z-10 space-y-6 md:space-y-8 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
              <Zap size={10} fill="currentColor" /> Empezá hoy gratis
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white tracking-tighter leading-[0.95]">
              Listo para llevar tu club al{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                siguiente nivel?
              </span>
            </h2>

            <p className="text-zinc-400 text-base md:text-xl font-medium max-w-xl mx-auto leading-relaxed">
              Digitalizá tu complejo hoy. 7 días gratis, sin tarjeta de crédito, configuración express en menos de 1 hora.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 px-4 sm:px-0">
              <Link
                href="/register"
                className="group relative w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl bg-white text-slate-900 font-bold text-sm shadow-2xl shadow-white/10 hover:scale-[1.04] active:scale-95 transition-all flex items-center justify-center gap-2 overflow-hidden"
              >
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                <span className="relative">Prueba Gratuita de 7 Días</span>
                <ArrowRight size={18} className="relative group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="#pricing"
                className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl backdrop-blur-xl text-white font-bold text-sm border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                Ver Planes
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 pt-10 md:pt-12 border-t border-white/[0.06]">
              {[
                { icon: Shield, text: 'Sin contratos' },
                { icon: Clock, text: 'Config. express' },
                { icon: Star, text: '4.9/5 promedio' },
                { icon: Zap, text: 'Soporte 24/7' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                  <item.icon size={12} className="text-emerald-500 shrink-0" /> {item.text}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
