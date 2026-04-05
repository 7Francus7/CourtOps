'use client'

import React, { useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, TrendingUp, Calendar, DollarSign, MessageSquare, Check } from 'lucide-react'
import Link from 'next/link'
import { usePerformance } from '@/contexts/PerformanceContext'

const TRIAL_DAYS = 7
const features = ['Reservas', 'Cobros', 'Torneos', 'Kiosco', 'WhatsApp']

const floatingCards = [
  {
    icon: DollarSign,
    value: '$84.500',
    label: 'Facturado hoy',
    sub: '+12% vs ayer',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
    subColor: 'text-emerald-500',
  },
  {
    icon: Calendar,
    value: '7/8',
    label: 'Canchas activas',
    sub: '87% ocupación',
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-500',
    subColor: 'text-violet-400',
  },
  {
    icon: MessageSquare,
    value: '-40%',
    label: 'No-shows',
    sub: 'WhatsApp auto',
    iconBg: 'bg-sky-500/10',
    iconColor: 'text-sky-500',
    subColor: 'text-sky-400',
  },
  {
    icon: TrendingUp,
    value: '+143',
    label: 'Jugadores activos',
    sub: '+5 esta semana',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
    subColor: 'text-amber-400',
  },
]

export default function LandingHero() {
  const { scrollY } = useScroll()
  const { isLowEnd } = usePerformance()
  const opacity = useTransform(scrollY, [0, 500], [1, 0])
  const yAnim = useTransform(scrollY, [0, 500], [0, 60])
  const [featureIndex, setFeatureIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setFeatureIndex(i => (i + 1) % features.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-[88vh] sm:min-h-screen flex flex-col items-center justify-center pt-36 sm:pt-40 pb-10 sm:pb-16 overflow-hidden">

      {/* Grid background — light */}
      <div
        className="absolute inset-0 pointer-events-none dark:hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(16,185,129,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.07) 1px, transparent 1px)`,
          backgroundSize: '56px 56px',
          WebkitMaskImage: 'radial-gradient(ellipse 85% 75% at 50% 35%, black 40%, transparent 100%)',
          maskImage: 'radial-gradient(ellipse 85% 75% at 50% 35%, black 40%, transparent 100%)',
        }}
      />
      {/* Grid background — dark */}
      <div
        className="absolute inset-0 pointer-events-none hidden dark:block"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)`,
          backgroundSize: '56px 56px',
          WebkitMaskImage: 'radial-gradient(ellipse 85% 75% at 50% 35%, black 40%, transparent 100%)',
          maskImage: 'radial-gradient(ellipse 85% 75% at 50% 35%, black 40%, transparent 100%)',
        }}
      />

      {/* Ambient orbs */}
      {!isLowEnd && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[10%] left-1/2 -translate-x-[55%] w-[900px] h-[700px] bg-emerald-400/15 dark:bg-emerald-500/8 blur-[180px] rounded-full" />
          <div className="absolute top-[55%] right-0 w-[500px] h-[500px] bg-violet-500/10 dark:bg-violet-500/5 blur-[140px] rounded-full" />
          <div className="absolute bottom-[5%] left-[5%] w-[350px] h-[350px] bg-teal-400/10 dark:bg-teal-500/5 blur-[120px] rounded-full" />
        </div>
      )}

      <motion.div
        style={isLowEnd ? {} : { opacity, y: yAnim }}
        className="relative z-10 text-center max-w-5xl mx-auto px-6 flex flex-col items-center w-full"
      >
        {/* Live badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
          className="mb-5 sm:mb-8"
        >
          <span className="inline-flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] sm:text-[11px] font-bold uppercase tracking-tight sm:tracking-widest text-center whitespace-nowrap">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            {TRIAL_DAYS} días gratis — <span className="hidden md:inline">Sin tarjeta de crédito</span><span className="md:hidden">Sin tarjeta</span>
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1], delay: 0.05 }}
          className="text-[2.8rem] sm:text-[4rem] md:text-[5.5rem] lg:text-[7rem] font-black tracking-tighter leading-[0.9] mb-5 px-2"
        >
          <span className="block text-slate-900 dark:text-white">Tu club.</span>
          <span className="block bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 bg-clip-text text-transparent pb-2">
            En piloto automático.
          </span>
        </motion.h1>

        {/* Feature pills cycling */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center justify-center gap-2 mb-5 sm:mb-8 flex-wrap"
        >
          {features.map((f, i) => (
            <motion.span
              key={f}
              animate={{
                opacity: i === featureIndex ? 1 : 0.3,
                scale: i === featureIndex ? 1.05 : 0.95,
              }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-colors cursor-default select-none ${
                i === featureIndex
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-transparent border-slate-200 dark:border-white/[0.06] text-slate-400 dark:text-zinc-600'
              }`}
            >
              {f}
            </motion.span>
          ))}
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.25 }}
          className="text-slate-500 dark:text-zinc-400 text-base md:text-xl max-w-2xl mx-auto leading-relaxed px-4 mb-7 sm:mb-10"
        >
          La plataforma all-in-one para clubes de pádel y deportes.{' '}
          <span className="text-slate-800 dark:text-zinc-200 font-semibold">
            Tus jugadores reservan solos. Vos ganás tiempo.
          </span>
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.35 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-6 sm:px-0 mb-4"
        >
          <Link
            href="/register"
            className="group relative w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-base transition-all hover:scale-[1.03] active:scale-[0.97] shadow-2xl shadow-emerald-500/40 flex items-center justify-center gap-2.5 overflow-hidden"
          >
            {/* Shimmer sweep */}
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            <span className="relative text-sm sm:text-base">Comenzar {TRIAL_DAYS} días gratis</span>
            <ArrowRight size={17} className="relative group-hover:translate-x-1.5 transition-transform" />
          </Link>
          <Link
            href="#features"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/60 dark:bg-white/[0.05] text-slate-700 dark:text-white font-semibold text-base border border-slate-200 dark:border-white/10 backdrop-blur-xl transition-all hover:bg-white dark:hover:bg-white/10 flex items-center justify-center gap-2"
          >
            Ver funciones
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[10px] sm:text-xs text-slate-400 dark:text-zinc-500 font-medium tracking-tight"
        >
          0% Comisiones · Sin tarjeta · Configuración express · Cancelá cuando quieras
        </motion.p>

        {/* Floating metric cards */}
        {!isLowEnd && (
          <div className="mt-8 sm:mt-16 flex flex-wrap justify-center gap-3 md:gap-4">
            {floatingCards.map((card, i) => (
              <motion.div
                key={i}
                className={i >= 2 ? 'hidden sm:block' : ''}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.15, duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
              >
                <motion.div
                  animate={{ y: [0, -7, 0] }}
                  transition={{
                    duration: 3 + i * 0.6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.5,
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/90 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.09] shadow-lg backdrop-blur-xl"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg}`}>
                    <card.icon size={16} className={card.iconColor} />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900 dark:text-white tabular-nums leading-none mb-0.5">
                      {card.value}
                    </div>
                    <div className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                      {card.label}
                    </div>
                    <div className={`text-[8px] font-semibold flex items-center gap-0.5 mt-0.5 ${card.subColor}`}>
                      <Check size={7} strokeWidth={3} /> {card.sub}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  )
}
