'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const allTestimonials = [
  {
    quote: 'CourtOps nos cambió la vida. Pasamos de planillas de Excel a gestionar 6 canchas en un click.',
    name: 'Martín Rodríguez', role: 'Dueño', club: 'Arena Padel Club',
    initial: 'M', avatarBg: 'bg-emerald-500',
  },
  {
    quote: 'La ocupación subió un 30% desde que implementamos el sistema. Los clientes reservan solos a cualquier hora.',
    name: 'Lucía Fernández', role: 'Gerente', club: 'Smash Padel Center',
    initial: 'L', avatarBg: 'bg-violet-500',
  },
  {
    quote: 'La caja y los reportes me dan tranquilidad total. Sé exactamente cuánto facturé cada día sin preguntarle a nadie.',
    name: 'Diego Morales', role: 'Propietario', club: 'Punto Set Padel',
    initial: 'D', avatarBg: 'bg-sky-500',
  },
  {
    quote: 'El WhatsApp automático eliminó casi todos los no-shows. El impacto en la facturación mensual fue inmediato.',
    name: 'Carolina Méndez', role: 'Administradora', club: 'Top Court Club',
    initial: 'C', avatarBg: 'bg-rose-500',
  },
  {
    quote: 'Mis jugadores adoran poder reservar desde el celular a las 3am. Yo duermo tranquilo sabiendo que todo funciona solo.',
    name: 'Federico Álvarez', role: 'Dueño', club: 'Volea Pro Padel',
    initial: 'F', avatarBg: 'bg-amber-500',
  },
  {
    quote: 'El kiosco integrado con la caja es un game changer. Todo queda registrado automáticamente, cero errores.',
    name: 'Valentina Torres', role: 'Socia', club: 'Ace Sports Club',
    initial: 'V', avatarBg: 'bg-teal-500',
  },
  {
    quote: 'Los torneos digitales trajeron un 40% más de participantes. El sistema de brackets es increíblemente fácil.',
    name: 'Pablo Gutiérrez', role: 'Director', club: 'Central Arena Padel',
    initial: 'P', avatarBg: 'bg-indigo-500',
  },
  {
    quote: 'Antes tardaba 2 horas en cerrar la caja. Ahora son 5 minutos. El sistema hace todo solo, es una locura.',
    name: 'Sofía Ramírez', role: 'Gerente', club: 'Net & Ball Club',
    initial: 'S', avatarBg: 'bg-pink-500',
  },
]

const row1 = allTestimonials.slice(0, 4)
const row2 = allTestimonials.slice(4, 8)

function TestimonialCard({ t }: { t: typeof allTestimonials[0] }) {
  return (
    <div className="w-[320px] md:w-[380px] shrink-0 p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.07] shadow-sm dark:shadow-none">
      <div className="flex items-center gap-0.5 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
        ))}
      </div>
      <p className="text-slate-600 dark:text-zinc-300 text-sm leading-relaxed mb-5">
        &ldquo;{t.quote}&rdquo;
      </p>
      <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-white/[0.05]">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${t.avatarBg}`}>
          {t.initial}
        </div>
        <div>
          <div className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-0.5">{t.name}</div>
          <div className="text-[10px] text-zinc-500 font-medium">{t.role}, {t.club}</div>
        </div>
      </div>
    </div>
  )
}

export default function LandingTestimonials() {
  const fadeEdges = {
    WebkitMaskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
    maskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
  }

  return (
    <section className="py-10 md:py-24 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[400px] bg-emerald-500/[0.05] blur-[140px] rounded-full pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-8 md:mb-12 px-4 space-y-2"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-widest">
            <Star size={11} fill="currentColor" /> +143 clubes activos en Argentina
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Lo que dicen los clubes.
          </h2>
          <p className="text-slate-500 dark:text-zinc-400 text-base max-w-xl mx-auto">
            Gestores de todo Argentina ya digitalizaron sus complejos con CourtOps.
          </p>
        </motion.div>

        {/* Row 1 — scrolls left */}
        <div className="overflow-hidden mb-4" style={fadeEdges}>
          <div className="flex gap-4 animate-marquee w-max px-4">
            {[...row1, ...row1].map((t, i) => (
              <TestimonialCard key={i} t={t} />
            ))}
          </div>
        </div>

        {/* Row 2 — scrolls right */}
        <div className="overflow-hidden" style={fadeEdges}>
          <div
            className="flex gap-4 animate-marquee w-max px-4"
            style={{ animationDirection: 'reverse' }}
          >
            {[...row2, ...row2].map((t, i) => (
              <TestimonialCard key={i} t={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
