'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Settings, Rocket, Check, Clock, Calendar, DollarSign, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

// --- Mini illustrations per step ---

function MiniRegister() {
  return (
    <div className="space-y-2.5">
      {[
        { label: 'Nombre del club', value: 'Arena Padel Club', done: true },
        { label: 'Canchas', value: '4 canchas', done: true },
        { label: 'Plan', value: 'Élite — 7 días gratis', done: true },
      ].map((field, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
          className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-100 dark:border-white/[0.06]"
        >
          <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500">{field.label}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-700 dark:text-zinc-200">{field.value}</span>
            <div className="w-4 h-4 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <Check size={8} className="text-emerald-500" strokeWidth={3} />
            </div>
          </div>
        </motion.div>
      ))}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="w-full py-2.5 rounded-xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest text-center shadow-lg shadow-emerald-500/25"
      >
        Crear cuenta gratis
      </motion.div>
    </div>
  )
}

function MiniConfig() {
  const slots = [
    { time: '09:00', price: '$3.200', on: true },
    { time: '10:30', price: '$3.200', on: true },
    { time: '12:00', price: '$2.800', on: false },
    { time: '19:00', price: '$4.500', on: true },
    { time: '20:30', price: '$4.500', on: true },
    { time: '22:00', price: '$3.800', on: false },
  ]
  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Cancha 1 — Lun a Vie</span>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          <span className="text-[8px] font-bold text-indigo-500 uppercase">Guardado</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {slots.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 * i, duration: 0.3 }}
            className={cn(
              'rounded-lg p-2 border text-center',
              s.on
                ? 'bg-indigo-500/8 dark:bg-indigo-500/12 border-indigo-500/20'
                : 'bg-slate-50 dark:bg-white/[0.02] border-slate-100 dark:border-white/5 opacity-40'
            )}
          >
            <div className="text-[9px] font-bold text-slate-600 dark:text-zinc-300">{s.time}</div>
            <div className={cn('text-[8px] font-black', s.on ? 'text-indigo-500' : 'text-slate-300 dark:text-zinc-600')}>{s.price}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function MiniLaunch() {
  return (
    <div className="space-y-2.5">
      {/* URL badge */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-teal-500/8 dark:bg-teal-500/10 border border-teal-500/20"
      >
        <Globe size={12} className="text-teal-500 shrink-0" />
        <span className="text-[10px] font-black text-teal-600 dark:text-teal-400 font-mono truncate">tuclub.courtops.net</span>
      </motion.div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { icon: Calendar, value: '12', label: 'Reservas hoy', color: 'text-emerald-500', bg: 'bg-emerald-500/8 dark:bg-emerald-500/10 border-emerald-500/20' },
          { icon: DollarSign, value: '$38k', label: 'Facturado', color: 'text-violet-500', bg: 'bg-violet-500/8 dark:bg-violet-500/10 border-violet-500/20' },
          { icon: UserPlus, value: '+3', label: 'Nuevos', color: 'text-sky-500', bg: 'bg-sky-500/8 dark:bg-sky-500/10 border-sky-500/20' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.07, duration: 0.4 }}
            className={cn('p-2 rounded-xl border text-center', stat.bg)}
          >
            <stat.icon size={10} className={cn('mx-auto mb-0.5', stat.color)} />
            <div className={cn('text-xs font-black tabular-nums leading-none', stat.color)}>{stat.value}</div>
            <div className="text-[7px] font-bold text-slate-400 dark:text-zinc-600 mt-0.5 leading-none">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// --- Step data ---

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Registrá tu Club',
    time: '60 segundos',
    description: 'Creá tu cuenta, elegí tu plan y accedé al panel al instante. Sin formularios kilométricos.',
    accentBg: 'bg-emerald-500',
    accentText: 'text-emerald-600 dark:text-emerald-400',
    accentBgSoft: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    accentBorder: 'border-emerald-500/25',
    ringColor: 'ring-emerald-500/30',
    mini: <MiniRegister />,
  },
  {
    number: '02',
    icon: Settings,
    title: 'Configurá la Agenda',
    time: '5 minutos',
    description: 'Definí canchas, horarios y precios con el asistente guiado. Sin conocimiento técnico.',
    accentBg: 'bg-indigo-500',
    accentText: 'text-indigo-600 dark:text-indigo-400',
    accentBgSoft: 'bg-indigo-500/10 dark:bg-indigo-500/15',
    accentBorder: 'border-indigo-500/25',
    ringColor: 'ring-indigo-500/30',
    mini: <MiniConfig />,
  },
  {
    number: '03',
    icon: Rocket,
    title: 'Lanzá y Crecé',
    time: 'Listo!',
    description: 'Compartí tu link, empezá a recibir reservas 24/7 y gestioná todo desde tu panel.',
    accentBg: 'bg-teal-500',
    accentText: 'text-teal-600 dark:text-teal-400',
    accentBgSoft: 'bg-teal-500/10 dark:bg-teal-500/15',
    accentBorder: 'border-teal-500/25',
    ringColor: 'ring-teal-500/30',
    mini: <MiniLaunch />,
  },
]

export default function LandingHowItWorks() {
  return (
    <section
      className="py-10 md:py-24 px-4 sm:px-6 relative overflow-hidden border-t border-slate-100 dark:border-white/[0.05]"
      id="how-it-works"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[500px] bg-emerald-500/[0.04] blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-8 md:mb-16 space-y-3"
        >
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.25em]">
            Cómo funciona
          </p>
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
            De cero a operativo{' '}
            <span className="text-slate-400 dark:text-zinc-500 font-normal">en menos de una hora.</span>
          </h3>
        </motion.div>

        {/* Stepper header — desktop only */}
        <div className="hidden md:flex items-center justify-center mb-8 relative px-8">
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                className="flex flex-col items-center gap-2 relative z-10"
              >
                <div className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ring-4',
                  step.accentBg,
                  step.ringColor
                )}>
                  <step.icon size={22} className="text-white" strokeWidth={1.5} />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border bg-white dark:bg-white/[0.05] backdrop-blur-sm">
                  <Clock size={9} className={step.accentText} />
                  <span className={cn('text-[9px] font-black uppercase tracking-wider', step.accentText)}>{step.time}</span>
                </div>
              </motion.div>

              {i < steps.length - 1 && (
                <div className="flex-1 mx-4 relative">
                  <div className="h-px bg-slate-200 dark:bg-white/[0.06]" />
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.2, duration: 0.7, ease: 'easeOut' }}
                    style={{ transformOrigin: 'left' }}
                    className="absolute inset-0 h-px bg-gradient-to-r from-emerald-500/60 to-indigo-500/40"
                  />
                  <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 rounded-full bg-slate-200 dark:bg-white/10" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.12, duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
              className={cn(
                'rounded-3xl border p-6 bg-white dark:bg-white/[0.03] shadow-sm dark:shadow-none',
                step.accentBorder
              )}
            >
              {/* Mobile step indicator */}
              <div className="flex items-center gap-3 mb-5 md:hidden">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shadow-lg', step.accentBg)}>
                  <step.icon size={18} className="text-white" strokeWidth={1.5} />
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-slate-50 dark:bg-white/[0.04]" style={{ borderColor: 'inherit' }}>
                  <Clock size={9} className={step.accentText} />
                  <span className={cn('text-[9px] font-black uppercase tracking-wider', step.accentText)}>{step.time}</span>
                </div>
              </div>

              {/* Step number pill */}
              <div className="flex items-center justify-between mb-3">
                <span className={cn('text-[10px] font-black uppercase tracking-[0.25em]', step.accentText)}>
                  PASO {step.number}
                </span>
                <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center text-white text-[9px] font-black', step.accentBg)}>
                  {step.number.slice(1)}
                </div>
              </div>

              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5 tracking-tight">{step.title}</h4>
              <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed mb-5">{step.description}</p>

              {/* Mini UI illustration */}
              <div className={cn('p-4 rounded-2xl border', step.accentBgSoft, step.accentBorder)}>
                {step.mini}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom quick stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-8 sm:mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-16"
        >
          {[
            { value: '< 1 hora', label: 'Tiempo total de configuración' },
            { value: '7 días', label: 'Prueba gratuita incluida' },
            { value: '0 código', label: 'Sin programación necesaria' },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{item.value}</div>
              <div className="text-xs font-medium text-slate-400 dark:text-zinc-500 mt-0.5">{item.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
