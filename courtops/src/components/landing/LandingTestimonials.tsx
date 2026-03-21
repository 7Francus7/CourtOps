'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Quote, Star } from 'lucide-react'

interface Testimonial {
  quote: string
  name: string
  role: string
  club: string
  initial: string
}

const testimonials: Testimonial[] = [
  {
    quote: 'CourtOps nos cambió la vida. Pasamos de planillas de Excel a gestionar 6 canchas en un click.',
    name: 'Martín Rodríguez',
    role: 'Dueño',
    club: 'Arena Padel Club',
    initial: 'M',
  },
  {
    quote: 'Desde que implementamos el sistema, la ocupación subió un 30%. Los clientes reservan solos a cualquier hora.',
    name: 'Lucía Fernández',
    role: 'Gerente',
    club: 'Smash Padel Center',
    initial: 'L',
  },
  {
    quote: 'La caja y los reportes me dan tranquilidad total. Sé exactamente cuánto facturé cada día sin preguntar a nadie.',
    name: 'Diego Morales',
    role: 'Propietario',
    club: 'Punto Set Padel',
    initial: 'D',
  },
]

const StarRating = () => (
  <div className="flex items-center gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
    ))}
  </div>
)

export default function LandingTestimonials() {
  return (
    <section className="py-24 md:py-32 px-4 md:px-6 bg-transparent relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[400px] bg-emerald-500/[0.06] blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-16 md:mb-20 space-y-4 px-2"
        >
          <h2 className="text-xs md:text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">
            Testimonios
          </h2>
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-slate-900 dark:text-white tracking-[-0.03em] leading-[1.15]">
            Lo que dicen nuestros clientes.
          </h3>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.15 },
            },
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 30, scale: 0.95 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { type: 'spring', stiffness: 100, damping: 15 },
                },
              }}
              className="relative p-8 rounded-2xl backdrop-blur-xl bg-white dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.07] transition-all duration-500 hover:border-emerald-500/40 dark:hover:border-emerald-500/25 hover:bg-slate-50 dark:hover:bg-white/[0.05] group overflow-hidden flex flex-col shadow-sm dark:shadow-none"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              {/* Quote icon */}
              <div className="relative z-10 mb-6">
                <Quote size={28} className="text-emerald-500/30" />
              </div>

              {/* Stars */}
              <div className="relative z-10 mb-4">
                <StarRating />
              </div>

              {/* Quote text */}
              <p className="relative z-10 text-slate-600 dark:text-zinc-300 text-sm md:text-base leading-relaxed font-medium flex-1 mb-8">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="relative z-10 flex items-center gap-4 pt-6 border-t border-slate-200/70 dark:border-white/[0.06]">
                <div className="w-11 h-11 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm shrink-0">
                  {testimonial.initial}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {testimonial.role}, {testimonial.club}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
