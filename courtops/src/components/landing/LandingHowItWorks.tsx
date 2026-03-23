'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Settings, Rocket, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Registrá tu Club',
    description: 'Crea tu cuenta en 60 segundos. Elegí tu plan y accedé al panel de administración inmediatamente, sin complicaciones técnicas.',
    iconClass: 'bg-emerald-500/10 text-emerald-500',
    borderClass: 'border-emerald-500/20',
    numberColor: 'text-emerald-500',
    dotClass: 'bg-emerald-500',
    details: ['Nombre del club y canchas', 'Horarios y precios flexibles', 'Método de pago integrado'],
  },
  {
    number: '02',
    icon: Settings,
    title: 'Configurá la Agenda',
    description: 'Definí canchas, horarios disponibles y precios con nuestro asistente de configuración. Listo en minutos, sin conocimiento técnico.',
    iconClass: 'bg-indigo-500/10 text-indigo-500',
    borderClass: 'border-indigo-500/20',
    numberColor: 'text-indigo-500',
    dotClass: 'bg-indigo-500',
    details: ['Reglas de disponibilidad', 'Precios dinámicos por horario', 'Integración MercadoPago'],
  },
  {
    number: '03',
    icon: Rocket,
    title: 'Lanzá y Crecé',
    description: 'Compartí tu link público. Tus jugadores empiezan a reservar 24/7 y vos gestionás todo desde un solo lugar — en cualquier dispositivo.',
    iconClass: 'bg-teal-500/10 text-teal-500',
    borderClass: 'border-teal-500/20',
    numberColor: 'text-teal-500',
    dotClass: 'bg-teal-500',
    details: ['Link personalizado del club', 'Reservas y cobros automáticos', 'WhatsApp y notificaciones'],
  },
]

export default function LandingHowItWorks() {
  return (
    <section
      className="py-24 md:py-32 px-4 sm:px-6 relative overflow-hidden border-t border-slate-100 dark:border-white/[0.05]"
      id="how-it-works"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[500px] bg-emerald-500/[0.04] blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-16 md:mb-20 space-y-4"
        >
          <h2 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.25em]">
            Cómo funciona
          </h2>
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-slate-900 dark:text-white tracking-tight leading-tight">
            Operativo en{' '}
            <span className="text-slate-400 dark:text-zinc-500">menos de una hora.</span>
          </h3>
          <p className="text-slate-500 dark:text-zinc-400 text-base md:text-lg leading-relaxed">
            Diseñamos el proceso para que cualquier club pueda digitalizarse sin complicaciones técnicas.
          </p>
        </motion.div>

        {/* Steps grid */}
        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="absolute top-[4.5rem] left-[16.6%] right-[16.6%] h-px bg-gradient-to-r from-emerald-500/30 via-indigo-500/20 to-teal-500/30 hidden lg:block" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.15, duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
                className="relative"
              >
                {/* Step dot on connector (desktop) */}
                <div className={cn(
                  'hidden lg:flex absolute top-[3.85rem] left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full z-10 items-center justify-center border-4 border-white dark:border-zinc-950',
                  step.dotClass
                )} />

                <div className={cn(
                  'p-6 md:p-8 rounded-3xl border bg-white dark:bg-white/[0.03] shadow-sm dark:shadow-none transition-all duration-300 hover:-translate-y-1 lg:mt-6',
                  step.borderClass
                )}>
                  {/* Large ghost number */}
                  <div className={cn('text-7xl font-black opacity-[0.05] leading-none mb-3 tabular-nums select-none', step.numberColor)}>
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center mb-5 border', step.iconClass, step.borderClass)}>
                    <step.icon size={22} strokeWidth={1.5} />
                  </div>

                  {/* Content */}
                  <h4 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">{step.title}</h4>
                  <p className="text-slate-500 dark:text-zinc-400 text-sm leading-relaxed mb-5">
                    {step.description}
                  </p>

                  {/* Checklist */}
                  <div className="space-y-2">
                    {step.details.map((d, j) => (
                      <motion.div
                        key={j}
                        initial={{ opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 + j * 0.06 + 0.2, duration: 0.4 }}
                        className="flex items-center gap-2.5"
                      >
                        <div className={cn('w-4 h-4 rounded-full flex items-center justify-center shrink-0', step.iconClass, step.borderClass, 'border')}>
                          <Check size={8} strokeWidth={3} />
                        </div>
                        <span className="text-xs font-semibold text-slate-600 dark:text-zinc-300">{d}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom quick stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="mt-14 flex flex-wrap items-center justify-center gap-8 sm:gap-16"
        >
          {[
            { value: '< 1 hora', label: 'Tiempo de configuración' },
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
